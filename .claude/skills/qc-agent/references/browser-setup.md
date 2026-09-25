# Browser setup — console/network capture, screenshots, evidence collection

## One TaskSpace for the whole run

Per `ego-browser`'s own guidance: create the TaskSpace once, reuse it across every phase and every script invocation. Print `spaceId` in your first round and resume it (`await taskSpace(spaceId)`) in later rounds — don't create a new space to recover from a stuck page.

```js
const task = await taskSpace("qc-agent-run");
console.log({ spaceId: task.spaceId });
const page = task.page("p1");
```

## Console + network capture per route

`ego-browser` buffers CDP events via `page.events()` (not an EventEmitter — call it to read-and-clear). Enable the relevant CDP domains once per Page, then drain `page.events()` after each navigation to collect that route's errors.

```js
async function enableCapture(page) {
  await page.cdp("Runtime.enable");
  await page.cdp("Log.enable");
  await page.cdp("Network.enable");
}

async function visitAndCapture(page, url, label) {
  await page.events(); // drain anything stale before navigating
  const response = await page.goto(url, { waitUntil: "load", timeout: 20_000 });
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
  const events = await page.events();

  const consoleErrors = events.filter(
    (e) => e.method === "Runtime.exceptionThrown" ||
      (e.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(e.params?.type)),
  );
  const failedRequests = events.filter(
    (e) => e.method === "Network.responseReceived" && e.params?.response?.status >= 400,
  );
  const networkErrors = events.filter((e) => e.method === "Network.loadingFailed");

  return { label, url, httpStatus: response?.status, consoleErrors, failedRequests, networkErrors };
}
```

Call `enableCapture(page)` once right after creating/reusing the Page (CDP domain enables persist for the session), then call `visitAndCapture` per route. Summarize `consoleErrors`/`failedRequests`/`networkErrors` counts inline in the smoke-test pass; save the raw arrays to `qc-reports/<run>/console-network-log/<route>.json` only for routes that actually have findings (don't dump empty logs for every clean route — keeps the report scannable).

## Screenshots

Naming convention: `<route-slug>__<viewport>__<theme>.png`, e.g. `beranda__desktop__dark.png`, `demografi-pekerjaan__mobile__light.png`.

```js
async function shot(page, dir, route, viewport, theme, opts = {}) {
  const slug = route === "/" ? "beranda" : route.replace(/^\//, "").replace(/\//g, "-");
  const path = `${dir}/screenshots/${slug}__${viewport}__${theme}.png`;
  await page.screenshot({ path, fullPage: opts.fullPage ?? true });
  return path;
}
```

Use `fullPage: true` for the deep-dive pass (captures whitespace/overflow issues below the fold — directly relevant to the grid-whitespace checklist items). Use `fullPage: false` (viewport only) for the fast smoke-test pass.

For a specific suspected bug (e.g. a truncated Y-axis label), also grab a tight `clip` screenshot of just that chart region once you've located its bounding box via a snapshot — easier for a human reviewer to judge than a full-page shot.

## Per-route loop skeleton (deep-dive phase)

```js
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 },
];
const THEMES = ["light", "dark"];

async function ensureTheme(page, theme) {
  const current = await page.evaluate(() => localStorage.getItem("mantine-color-scheme-value"));
  if (current !== theme) {
    await page.click('[aria-label="Ganti tema"]', { label: `switch to ${theme} mode` });
    await page.waitForTimeout(300);
  }
}

const findings = [];
for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      await setViewport(page, vp.width, vp.height);
      await ensureTheme(page, theme);
      const result = await visitAndCapture(page, `${BASE_URL}${route.path}`, route.label);
      const shotPath = await shot(page, OUT_DIR, route.path, vp.name, theme);
      // Inspect result + snapshot/screenshot against checklist.md here,
      // push any deviation into `findings` with the report-template.md shape.
    }
  }
}
```

Don't try to do all of this in a single script invocation for every route — batch a handful of routes per round (per ego-browser's "keep the action sequence and next snapshot in the same invocation" guidance), inspect the output, then continue. A full 20+-route × 2-viewport × 2-theme sweep is many rounds; that's expected for a thorough QC run.

## Slow/failed network simulation (resiliency checklist)

```js
// Slow network (checklist §5.2 loading-state check)
await page.cdp("Network.emulateNetworkConditions", {
  offline: false, latency: 400, downloadThroughput: 50_000, uploadThroughput: 20_000,
});
// ... visit route, observe skeleton/loading behavior, screenshot ...
await page.cdp("Network.emulateNetworkConditions", {
  offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1,
}); // reset
```

For simulating a failed external API (401/500) without touching real staging data, prefer intercepting via `Fetch.enable`/`Fetch.fulfillRequest` CDP if precise control is needed; otherwise it's often simpler to just observe how the UI behaves on staging's real occasional slow responses, and note any silent-fail pattern in the report rather than force-inducing every failure mode.

## Cleanup

```js
await task.finish({ keep: [] });
```

Call this exactly once at the very end, after the report is written — not mid-run.
