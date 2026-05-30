/** biome-ignore-all lint/suspicious/noExplicitAny: penjelasannya */

import fs from "node:fs";
import path from "node:path";
import { Elysia } from "elysia";
import api from "./api";
import { openInEditor } from "./utils/open-in-editor";

const PORT = Number(process.env.PORT || 3000);

const isProduction = process.env.NODE_ENV === "production";

// Auto-seed database in production (ensure admin user exists)
if (isProduction && process.env.ADMIN_EMAIL) {
	try {
		console.log("🌱 Running database seed in production...");
		const { runSeed } = await import("../prisma/seed.ts");
		await runSeed();
	} catch (error) {
		console.error("⚠️ Production seed failed:", error);
		// Don't crash the server if seed fails
	}
}

const app = new Elysia().use(api);

// Proxy Jenna analytics — registered directly on app to bypass plugin composition issues
app.get("/api/jenna/analytics", async ({ set }) => {
	const apiUrl = process.env.VITE_JENNA_API_URL ?? "";
	const apiToken = process.env.VITE_JENNA_API_TOKEN ?? "";
	if (!apiUrl || !apiToken) {
		set.status = 503;
		return { message: "Jenna API not configured" };
	}
	try {
		const res = await fetch(`${apiUrl}/api/noc/jenna/analytics`, {
			headers: { Authorization: `Bearer ${apiToken}` },
		});
		set.status = res.status;
		const text = await res.text();
		return JSON.parse(text);
	} catch {
		set.status = 502;
		return { message: "Failed to fetch Jenna analytics" };
	}
});

if (!isProduction) {
	// Development: Use Vite middleware
	const { createVite } = await import("./vite");
	const vite = await createVite();

	// Serve PWA/TWA assets in dev (root and nested path support)
	const _servePwaAsset = (srcPath: string) => () => Bun.file(srcPath);

	app.post("/__open-in-editor", ({ body }) => {
		const { relativePath, lineNumber, columnNumber } = body as {
			relativePath: string;
			lineNumber: string;
			columnNumber: string;
		};

		const editor = (process.env.REACT_EDITOR || "code") as any;

		openInEditor(relativePath, {
			line: Number(lineNumber),
			column: Number(columnNumber),
			editor: editor,
		});

		return { ok: true };
	});

	// Vite middleware for other requests
	app.all("*", async ({ request }) => {
		const url = new URL(request.url);
		const pathname = url.pathname;

		// Serve Vite pre-bundled deps directly from disk — bypass middleware mock
		// to avoid 504 on large files like @mantine/core chunks
		if (pathname.startsWith("/node_modules/.vite/")) {
			const filePath = path.resolve(pathname.slice(1)); // strip leading /
			const file = Bun.file(filePath);
			if (await file.exists()) {
				const ext = path.extname(filePath);
				const mime =
					ext === ".js"
						? "application/javascript"
						: ext === ".map"
							? "application/json"
							: "application/octet-stream";
				return new Response(file, {
					headers: {
						"Content-Type": mime,
						"Cache-Control": "max-age=31536000,immutable",
					},
				});
			}
		}

		// Serve transformed index.html for root or any path that should be handled by the SPA
		if (
			pathname === "/" ||
			(!pathname.includes(".") &&
				!pathname.startsWith("/@") &&
				!pathname.startsWith("/inspector") &&
				!pathname.startsWith("/__open-stack-frame-in-editor") &&
				!pathname.startsWith("/api"))
		) {
			try {
				const htmlPath = path.resolve("src/index.html");
				let html = fs.readFileSync(htmlPath, "utf-8");
				html = await vite.transformIndexHtml(pathname, html);

				return new Response(html, {
					headers: { "Content-Type": "text/html" },
				});
			} catch (e) {
				console.error(e);
			}
		}

		return new Promise<Response>((resolve) => {
			let resolved = false;
			const done = (r: Response) => {
				if (!resolved) {
					resolved = true;
					resolve(r);
				}
			};

			const headersObj = Object.fromEntries(request.headers as any);
			const chunks: Buffer[] = [];
			const resHeaders: Record<string, string | string[]> = {};
			let statusCode = 200;

			// Mock Node.js ServerResponse
			const res: any = {
				get statusCode() {
					return statusCode;
				},
				set statusCode(v: number) {
					statusCode = v;
				},
				setHeader(name: string, value: string | string[]) {
					resHeaders[name.toLowerCase()] = value;
				},
				getHeader(name: string) {
					return resHeaders[name.toLowerCase()];
				},
				getHeaders() {
					return resHeaders;
				},
				hasHeader(name: string) {
					return name.toLowerCase() in resHeaders;
				},
				removeHeader(name: string) {
					delete resHeaders[name.toLowerCase()];
				},
				writeHead(code: number, hdrs?: Record<string, string>) {
					statusCode = code;
					if (hdrs) Object.assign(resHeaders, hdrs);
				},
				write(chunk: any, _enc?: any, cb?: () => void) {
					if (chunk instanceof Uint8Array || Buffer.isBuffer(chunk)) {
						chunks.push(Buffer.from(chunk));
					} else if (typeof chunk === "string") {
						chunks.push(Buffer.from(chunk));
					}
					if (typeof _enc === "function") _enc();
					else if (typeof cb === "function") cb();
					return true;
				},
				end(data?: any, _enc?: any, cb?: () => void) {
					if (data != null && data !== "") {
						if (data instanceof Uint8Array || Buffer.isBuffer(data)) {
							chunks.push(Buffer.from(data));
						} else if (typeof data === "string") {
							chunks.push(Buffer.from(data));
						}
					}
					if (typeof _enc === "function") _enc();
					else if (typeof cb === "function") cb();
					const flat: Record<string, string> = {};
					for (const [k, v] of Object.entries(resHeaders)) {
						flat[k] = Array.isArray(v) ? v.join(", ") : v;
					}
					done(
						new Response(chunks.length > 0 ? Buffer.concat(chunks) : "", {
							status: statusCode,
							headers: flat,
						}),
					);
				},
				// EventEmitter stubs
				on() {
					return this;
				},
				once() {
					return this;
				},
				emit() {
					return false;
				},
				off() {
					return this;
				},
				removeListener() {
					return this;
				},
				addListener() {
					return this;
				},
				// Node.js response stubs
				writable: true,
				writableEnded: false,
				headersSent: false,
				finished: false,
				socket: { remoteAddress: "127.0.0.1", encrypted: false },
				connection: { remoteAddress: "127.0.0.1" },
				destroy() {},
				flushHeaders() {},
			};

			// Mock Node.js IncomingMessage
			const req: any = {
				url: pathname + url.search,
				method: request.method,
				headers: headersObj,
				httpVersion: "1.1",
				httpVersionMajor: 1,
				httpVersionMinor: 1,
				socket: { remoteAddress: "127.0.0.1", encrypted: false },
				connection: { remoteAddress: "127.0.0.1" },
				on() {
					return this;
				},
				once() {
					return this;
				},
				off() {
					return this;
				},
				removeListener() {
					return this;
				},
				addListener() {
					return this;
				},
				emit() {
					return false;
				},
				resume() {
					return this;
				},
				pipe() {
					return this;
				},
				destroy() {},
				readable: true,
				[Symbol.asyncIterator]() {
					let done = false;
					return {
						async next() {
							if (done) return { value: undefined, done: true };
							done = true;
							const buf = await request.arrayBuffer();
							return buf.byteLength > 0
								? { value: Buffer.from(buf), done: false }
								: { value: undefined, done: true };
						},
					};
				},
			};

			vite.middlewares(req, res, (err: any) => {
				if (err) {
					console.error("Vite middleware error:", err);
					done(new Response(err.stack || err.toString(), { status: 500 }));
					return;
				}
				done(new Response("Not Found", { status: 404 }));
			});

			// Safety timeout — prevent hanging if Vite doesn't call end()
			setTimeout(
				() => done(new Response("Gateway Timeout", { status: 504 })),
				10_000,
			);
		});
	});
} else {
	// Production: Final catch-all for static files and SPA fallback
	app.all("*", async ({ request }) => {
		const url = new URL(request.url);
		const pathname = url.pathname;

		// 1. Try exact match in dist
		let filePath = path.join(
			"dist",
			pathname === "/" ? "index.html" : pathname,
		);

		// 1.1 Special handling for PWA/TWA assets that might not be in dist (since we use custom bun build)
		if (isProduction) {
			const srcPath = path.join("src", pathname);
			if (fs.existsSync(srcPath)) {
				filePath = srcPath;
			}
			// Check public folder for static assets
			const publicPath = path.join("public", pathname);
			if (fs.existsSync(publicPath)) {
				filePath = publicPath;
			}
		}

		// 2. If not found and looks like an asset (has extension), try root of dist or src
		if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
			if (pathname.includes(".") && !pathname.endsWith("/")) {
				const filename = path.basename(pathname);

				// Try root of dist
				const fallbackDistPath = path.join("dist", filename);
				if (
					fs.existsSync(fallbackDistPath) &&
					fs.statSync(fallbackDistPath).isFile()
				) {
					filePath = fallbackDistPath;
				}
				// Try public folder
				else {
					const fallbackPublicPath = path.join("public", filename);
					if (
						fs.existsSync(fallbackPublicPath) &&
						fs.statSync(fallbackPublicPath).isFile()
					) {
						filePath = fallbackPublicPath;
					}
				}
				// Special handling for PWA files in src
				if (pathname.includes("assetlinks.json")) {
					const srcFilename = pathname.includes("assetlinks.json")
						? ".well-known/assetlinks.json"
						: filename;
					const fallbackSrcPath = path.join("src", srcFilename);
					if (
						fs.existsSync(fallbackSrcPath) &&
						fs.statSync(fallbackSrcPath).isFile()
					) {
						filePath = fallbackSrcPath;
					}
				}
			}
		}

		if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
			const file = Bun.file(filePath);
			return new Response(file, {
				headers: {
					Vary: "Accept-Encoding",
				},
			});
		}

		// 3. SPA Fallback: Serve index.html
		const indexHtml = path.join("dist", "index.html");
		if (fs.existsSync(indexHtml)) {
			return new Response(Bun.file(indexHtml), {
				headers: {
					Vary: "Accept-Encoding",
				},
			});
		}

		return new Response("Not Found", { status: 404 });
	});
}

app.listen(PORT);

console.log(
	`🚀 Server running at http://localhost:${PORT} in ${isProduction ? "production" : "development"} mode`,
);

// Start background sync scheduler
const { startSyncScheduler } = await import("./jobs/sync");
startSyncScheduler();

export type ApiApp = typeof app;
