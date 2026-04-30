#!/usr/bin/env node
/**
 * MCP Server: GitHub Actions Workflow Tools + Deploy-STG Pre/Post Steps
 * Tools: trigger_publish, trigger_repull, get_workflow_runs, watch_workflow_run,
 *        check_migrations, create_migration, bump_version, commit_and_push_stg, check_stg_version
 */

import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const REPO = "bipprojectbali/dashboard-desa-plus";
const CWD = process.cwd();

// --- MCP Protocol Helpers ---

function send(obj) {
	process.stdout.write(JSON.stringify(obj) + "\n");
}

function respond(id, result) {
	send({ jsonrpc: "2.0", id, result });
}

function respondError(id, code, message) {
	send({ jsonrpc: "2.0", id, error: { code, message } });
}

// --- Shell Helper ---

function runCmd(cmd, opts = {}) {
	const r = spawnSync("sh", ["-c", cmd], {
		encoding: "utf-8",
		cwd: CWD,
		...opts,
	});
	if (r.error) return { ok: false, out: r.error.message };
	if (r.status !== 0)
		return { ok: false, out: (r.stderr || r.stdout || "").trim() };
	return { ok: true, out: (r.stdout || "").trim() };
}

function getLatestRunId(workflow, delaySecs = 3) {
	const r = runCmd(
		`sleep ${delaySecs} && gh run list --workflow=${workflow} --repo ${REPO} --limit 1 --json databaseId -q '.[0].databaseId'`,
	);
	return r.ok ? r.out.trim() : null;
}

// --- Tool Definitions ---

const TOOLS = [
	{
		name: "check_migrations",
		description:
			"Cek status Prisma migrations. Returns apakah ada pending migrations.",
		inputSchema: { type: "object", properties: {} },
	},
	{
		name: "create_migration",
		description:
			"Buat Prisma migration baru (prisma migrate dev). Jalankan hanya jika check_migrations mendeteksi pending/drift.",
		inputSchema: {
			type: "object",
			properties: {
				name: {
					type: "string",
					description: "Nama migration (e.g. bump-stg-0.1.26)",
				},
			},
			required: ["name"],
		},
	},
	{
		name: "bump_version",
		description:
			"Baca versi dari package.json, increment patch (+1), tulis kembali. Returns old_version dan new_version.",
		inputSchema: { type: "object", properties: {} },
	},
	{
		name: "commit_and_push_stg",
		description:
			"Stage package.json + prisma/migrations, commit, lalu push ke branch stg menggunakan GH_TOKEN.",
		inputSchema: {
			type: "object",
			properties: {
				message: {
					type: "string",
					description:
						"Commit message. Jika tidak diisi, auto-generate dari versi package.json.",
				},
			},
		},
	},
	{
		name: "check_stg_version",
		description:
			"Bandingkan versi lokal (package.json) dengan versi di STG (/api/version). Tunggu container siap jika perlu.",
		inputSchema: {
			type: "object",
			properties: {
				wait_seconds: {
					type: "number",
					description:
						"Detik tunggu sebelum fetch STG (default: 30, untuk memberi waktu container siap).",
				},
			},
		},
	},
	{
		name: "trigger_publish",
		description:
			"Trigger publish.yml workflow: build & push Docker image ke GHCR. Returns run ID.",
		inputSchema: {
			type: "object",
			properties: {
				stack_env: {
					type: "string",
					enum: ["dev", "stg", "prod"],
					description: "Target environment. Default: stg.",
				},
				tag: {
					type: "string",
					description:
						"Image tag — harus sama persis dengan versi di package.json (e.g. 0.1.25).",
				},
				stack_name: {
					type: "string",
					description: `Nama stack. Default: nilai env STACK_NAME (${process.env.STACK_NAME || "belum diset"}).`,
				},
			},
			required: ["stack_env", "tag"],
		},
	},
	{
		name: "trigger_repull",
		description:
			"Trigger re-pull.yml workflow: redeploy stack di Portainer. Jalankan HANYA setelah publish berhasil.",
		inputSchema: {
			type: "object",
			properties: {
				stack_name: {
					type: "string",
					description: `Nama stack (e.g. dashboard-desa-plus). Stack yang di-deploy: <stack_name>-<stack_env>. Default: nilai env STACK_NAME (${process.env.STACK_NAME || "belum diset"}).`,
				},
				stack_env: {
					type: "string",
					enum: ["dev", "stg", "prod"],
					description: "Target environment.",
				},
			},
			required: ["stack_env"],
		},
	},
	{
		name: "get_workflow_runs",
		description:
			"List run terbaru dari suatu workflow beserta status dan conclusion-nya.",
		inputSchema: {
			type: "object",
			properties: {
				workflow: {
					type: "string",
					description: "Nama file workflow (e.g. publish.yml, re-pull.yml)",
				},
				limit: {
					type: "number",
					description: "Jumlah run yang ditampilkan (default: 5)",
				},
			},
			required: ["workflow"],
		},
	},
	{
		name: "watch_workflow_run",
		description:
			"Lihat status detail sebuah workflow run: apakah in_progress, success, atau failure.",
		inputSchema: {
			type: "object",
			properties: {
				run_id: {
					type: "number",
					description:
						"ID workflow run (dapat dari trigger_publish / trigger_repull / get_workflow_runs)",
				},
			},
			required: ["run_id"],
		},
	},
];

// --- Tool Handlers ---

function handleCheckMigrations() {
	const r = runCmd("bunx prisma migrate status 2>&1", { timeout: 30000 });
	const out = r.out || "";
	const hasPending =
		out.includes("following migration(s) have not yet been applied") ||
		out.includes("drift") ||
		out.includes("pending");
	const isUpToDate =
		out.includes("Database schema is up to date") || out.includes("up to date");
	return {
		ok: true,
		needs_migration: hasPending && !isUpToDate,
		is_up_to_date: isUpToDate,
		output: out,
	};
}

function handleCreateMigration(args) {
	const { name } = args;
	const r = runCmd(
		`echo "" | bunx prisma migrate dev --name ${name} --skip-generate 2>&1`,
		{ timeout: 120000 },
	);
	return {
		ok: r.ok,
		output: r.out,
		error: r.ok ? undefined : r.out,
	};
}

function handleBumpVersion() {
	const pkgPath = join(CWD, "package.json");
	let pkg;
	try {
		pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
	} catch (e) {
		return { ok: false, error: `Gagal baca package.json: ${e.message}` };
	}
	const oldVersion = pkg.version;
	const [maj, min, pat] = oldVersion.split(".").map(Number);
	const newVersion = `${maj}.${min}.${pat + 1}`;
	pkg.version = newVersion;
	try {
		writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
	} catch (e) {
		return { ok: false, error: `Gagal tulis package.json: ${e.message}` };
	}
	return { ok: true, old_version: oldVersion, new_version: newVersion };
}

function handleCommitAndPushStg(args) {
	const { message } = args || {};

	// Baca versi untuk auto commit message
	let version = "unknown";
	try {
		const pkg = JSON.parse(readFileSync(join(CWD, "package.json"), "utf-8"));
		version = pkg.version;
	} catch {}

	const commitMsg =
		message || `chore: bump version to ${version} for stg deploy`;

	// Stage file
	runCmd("git add package.json 2>&1");
	runCmd("git add prisma/migrations/ 2>&1");

	// Cek apakah ada yang di-stage
	const statusR = runCmd("git diff --cached --name-only 2>&1");
	if (!statusR.out.trim()) {
		return {
			ok: false,
			error: "Tidak ada perubahan yang di-stage untuk di-commit.",
		};
	}

	// Commit
	const commitR = runCmd(`git commit -m "${commitMsg}" 2>&1`);
	if (!commitR.ok) return { ok: false, step: "commit", error: commitR.out };

	// Push ke stg menggunakan GH_TOKEN jika tersedia
	const token = process.env.GH_TOKEN;
	const pushCmd = token
		? `git push https://x-access-token:${token}@github.com/${REPO}.git HEAD:stg 2>&1`
		: `git push origin HEAD:stg 2>&1`;
	const pushR = runCmd(pushCmd, { timeout: 60000 });
	if (!pushR.ok) return { ok: false, step: "push", error: pushR.out };

	return {
		ok: true,
		message: `Berhasil commit "${commitMsg}" dan push ke stg`,
		version,
	};
}

function handleCheckStgVersion(args) {
	const waitSecs = (args && args.wait_seconds) || 30;
	const baseUrl = process.env.BASE_URL;
	if (!baseUrl) {
		return {
			ok: false,
			error: "BASE_URL tidak ada di environment — isi di .env",
		};
	}

	// Baca versi lokal
	let localVersion;
	try {
		const pkg = JSON.parse(readFileSync(join(CWD, "package.json"), "utf-8"));
		localVersion = pkg.version;
	} catch (e) {
		return { ok: false, error: `Gagal baca package.json: ${e.message}` };
	}

	// Tunggu container siap
	if (waitSecs > 0) {
		runCmd(`sleep ${waitSecs}`);
	}

	// Fetch versi dari STG
	const r = runCmd(`curl -sf --max-time 10 "${baseUrl}/api/version" 2>&1`);
	if (!r.ok) {
		return {
			ok: false,
			error: `Gagal fetch ${baseUrl}/api/version: ${r.out}`,
			local_version: localVersion,
		};
	}

	let stgVersion;
	try {
		stgVersion = JSON.parse(r.out).version;
	} catch {
		return {
			ok: false,
			error: `Gagal parse response: ${r.out}`,
			local_version: localVersion,
		};
	}

	const match = localVersion === stgVersion;
	return {
		ok: true,
		local_version: localVersion,
		stg_version: stgVersion,
		match,
		status: match
			? "✓ DEPLOY BERHASIL — versi STG sudah sesuai"
			: "✗ VERSI BERBEDA — cek container logs di Portainer",
	};
}

function handleTriggerPublish(args) {
	const { stack_env = "stg", tag, stack_name } = args;
	const resolvedStackName = stack_name || process.env.STACK_NAME;
	let triggerCmd = `gh workflow run publish.yml --repo ${REPO} --ref ${stack_env} -f stack_env=${stack_env} -f tag=${tag}`;
	if (resolvedStackName) triggerCmd += ` -f stack_name=${resolvedStackName}`;
	const r = runCmd(triggerCmd);
	if (!r.ok) return { ok: false, error: r.out };

	const runId = getLatestRunId("publish.yml");
	return {
		ok: true,
		message: `Workflow publish.yml di-trigger (env=${stack_env}, tag=${tag}${resolvedStackName ? `, stack=${resolvedStackName}` : ""})`,
		run_id: runId ? Number(runId) : null,
		monitor_hint: runId
			? `Gunakan watch_workflow_run dengan run_id: ${runId}`
			: "Gunakan get_workflow_runs untuk mendapatkan run_id terbaru",
	};
}

function handleTriggerRepull(args) {
	const resolvedStackName = args.stack_name || process.env.STACK_NAME;
	const { stack_env } = args;
	if (!resolvedStackName) {
		return {
			ok: false,
			error: "stack_name wajib diisi atau set env STACK_NAME di .mcp.json",
		};
	}
	const stack_name = resolvedStackName;
	const triggerCmd = `gh workflow run re-pull.yml --repo ${REPO} --ref main -f stack_name=${stack_name} -f stack_env=${stack_env}`;
	const r = runCmd(triggerCmd);
	if (!r.ok) return { ok: false, error: r.out };

	const runId = getLatestRunId("re-pull.yml");
	return {
		ok: true,
		message: `Workflow re-pull.yml di-trigger (stack=${stack_name}-${stack_env})`,
		run_id: runId ? Number(runId) : null,
		monitor_hint: runId
			? `Gunakan watch_workflow_run dengan run_id: ${runId}`
			: "Gunakan get_workflow_runs untuk mendapatkan run_id terbaru",
	};
}

function handleGetWorkflowRuns(args) {
	const limit = args.limit || 5;
	const r = runCmd(
		`gh run list --workflow=${args.workflow} --repo ${REPO} --limit ${limit} --json databaseId,status,conclusion,displayTitle,createdAt,headBranch`,
	);
	if (!r.ok) return { ok: false, error: r.out };
	try {
		return { ok: true, runs: JSON.parse(r.out) };
	} catch {
		return { ok: false, error: "Gagal parse output", raw: r.out };
	}
}

function handleWatchWorkflowRun(args) {
	const r = runCmd(
		`gh run view ${args.run_id} --repo ${REPO} --json status,conclusion,displayTitle,headBranch,createdAt,updatedAt,jobs`,
	);
	if (!r.ok) return { ok: false, error: r.out };
	try {
		const data = JSON.parse(r.out);
		return {
			ok: true,
			run_id: args.run_id,
			status: data.status,
			conclusion: data.conclusion,
			title: data.displayTitle,
			branch: data.headBranch,
			jobs: (data.jobs || []).map((j) => ({
				name: j.name,
				status: j.status,
				conclusion: j.conclusion,
			})),
		};
	} catch {
		return { ok: false, error: "Gagal parse output", raw: r.out };
	}
}

// --- Request Router ---

function handleMessage(msg) {
	const { id, method, params } = msg;

	if (method === "initialize") {
		respond(id, {
			protocolVersion: "2024-11-05",
			capabilities: { tools: {} },
			serverInfo: { name: "deploy-stg", version: "2.0.0" },
		});
		return;
	}

	if (method === "notifications/initialized") return;

	if (method === "ping") {
		respond(id, {});
		return;
	}

	if (method === "tools/list") {
		respond(id, { tools: TOOLS });
		return;
	}

	if (method === "tools/call") {
		const { name, arguments: args = {} } = params;
		let result;

		if (name === "check_migrations") result = handleCheckMigrations();
		else if (name === "create_migration") result = handleCreateMigration(args);
		else if (name === "bump_version") result = handleBumpVersion();
		else if (name === "commit_and_push_stg")
			result = handleCommitAndPushStg(args);
		else if (name === "check_stg_version") result = handleCheckStgVersion(args);
		else if (name === "trigger_publish") result = handleTriggerPublish(args);
		else if (name === "trigger_repull") result = handleTriggerRepull(args);
		else if (name === "get_workflow_runs") result = handleGetWorkflowRuns(args);
		else if (name === "watch_workflow_run")
			result = handleWatchWorkflowRun(args);
		else {
			respondError(id, -32601, `Tool tidak ditemukan: ${name}`);
			return;
		}

		respond(id, {
			content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
		});
		return;
	}

	respondError(id, -32601, `Method tidak dikenal: ${method}`);
}

// --- Stdin Loop ---

let buf = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => {
	buf += chunk;
	const lines = buf.split("\n");
	buf = lines.pop();
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		try {
			handleMessage(JSON.parse(trimmed));
		} catch {
			// ignore malformed JSON
		}
	}
});
