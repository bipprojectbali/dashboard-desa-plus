#!/bin/bash

set -e

: "${PORTAINER_URL:?PORTAINER_URL tidak di-set}"
: "${PORTAINER_USERNAME:?PORTAINER_USERNAME tidak di-set}"
: "${PORTAINER_PASSWORD:?PORTAINER_PASSWORD tidak di-set}"
: "${STACK_NAME:?STACK_NAME tidak di-set}"

MAX_RETRY=30
SLEEP_INTERVAL=5

echo "🔐 Autentikasi ke Portainer..."
TOKEN=$(curl -s -X POST "https://${PORTAINER_URL}/api/auth" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"${PORTAINER_USERNAME}\", \"password\": \"${PORTAINER_PASSWORD}\"}" \
  | jq -r .jwt)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Autentikasi gagal!"
  exit 1
fi

echo "🔍 Mencari stack: $STACK_NAME..."
STACK=$(curl -s -X GET "https://${PORTAINER_URL}/api/stacks" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq ".[] | select(.Name == \"$STACK_NAME\")")

if [ -z "$STACK" ]; then
  echo "❌ Stack '$STACK_NAME' tidak ditemukan!"
  exit 1
fi

STACK_ID=$(echo "$STACK" | jq -r .Id)
ENDPOINT_ID=$(echo "$STACK" | jq -r .EndpointId)
ENV=$(echo "$STACK" | jq '.Env // []')

echo "📸 Snapshot container sebelum deploy..."
OLD_IDS=$(curl -s -X GET \
  "https://${PORTAINER_URL}/api/endpoints/${ENDPOINT_ID}/docker/containers/json?all=true&filters=%7B%22label%22%3A%5B%22com.docker.compose.project%3D${STACK_NAME}%22%5D%7D" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq -r '[.[] | .Id] | join(",")')

echo "📄 Mengambil compose file..."
STACK_FILE=$(curl -s -X GET "https://${PORTAINER_URL}/api/stacks/${STACK_ID}/file" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq -r .StackFileContent)

PAYLOAD=$(jq -n \
  --arg content "$STACK_FILE" \
  --argjson env "$ENV" \
  '{stackFileContent: $content, env: $env, pullImage: true}')

echo "🚀 Redeploying $STACK_NAME..."
HTTP_STATUS=$(curl -s -o /tmp/portainer_response.json -w "%{http_code}" \
  -X PUT "https://${PORTAINER_URL}/api/stacks/${STACK_ID}?endpointId=${ENDPOINT_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

if [ "$HTTP_STATUS" != "200" ]; then
  echo "❌ Redeploy gagal! HTTP Status: $HTTP_STATUS"
  cat /tmp/portainer_response.json | jq .
  exit 1
fi

echo "⏳ Menunggu container baru running..."

COUNT=0
while [ $COUNT -lt $MAX_RETRY ]; do
  sleep $SLEEP_INTERVAL
  COUNT=$((COUNT + 1))

  CONTAINERS=$(curl -s -X GET \
    "https://${PORTAINER_URL}/api/endpoints/${ENDPOINT_ID}/docker/containers/json?all=true&filters=%7B%22label%22%3A%5B%22com.docker.compose.project%3D${STACK_NAME}%22%5D%7D" \
    -H "Authorization: Bearer ${TOKEN}")

  NEW_RUNNING=$(echo "$CONTAINERS" | jq \
    --arg old "$OLD_IDS" \
    '[.[] | select(.State == "running" and ((.Id) as $id | ($old | split(",") | index($id)) == null))] | length')

  FAILED=$(echo "$CONTAINERS" | jq \
    '[.[] | select(.State == "exited" and (.Status | test("Exited \\(0\\)") | not))] | length')

  echo "🔄 [$COUNT/$MAX_RETRY] New running: $NEW_RUNNING | Failed: $FAILED"

  if [ "$FAILED" -gt 0 ]; then
    echo "❌ Ada container crash!"
    echo "$CONTAINERS" | jq -r '.[] | select(.State == "exited") | "   → \(.Names[0]) | \(.Status)"'
    exit 1
  fi

  if [ "$NEW_RUNNING" -gt 0 ]; then
    echo "✅ Deploy sukses! Container baru sudah running."
    exit 0
  fi
done

echo "❌ Timeout! Container baru tidak muncul."
exit 1