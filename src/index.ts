/** biome-ignore-all lint/suspicious/noExplicitAny: penjelasannya */

import fs from "node:fs";
import path from "node:path";
import { Elysia } from "elysia";
import api from "./api";
import { openInEditor } from "./utils/open-in-editor";

const PORT = process.env.PORT || 3000;

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

if (!isProduction) {
	// Development: Use Vite middleware
	const { createVite } = await import("./vite");
	const vite = await createVite();

	// Serve PWA/TWA assets in dev (root and nested path support)
	const _servePwaAsset = (srcPath: string) => () => Bun.file(srcPath);

	app.post("/__open-in-editor", ({ body }) => {
		const { relativePath, lineNumber, columnNumber } = body as {
			relativePath: string;
			lineNumber: number;
			columnNumber: number;
		};

		openInEditor(relativePath, {
			line: lineNumber,
			column: columnNumber,
			editor: "antigravity",
		});

		return { ok: true };
	});

	// Vite middleware for other requests
	app.all("*", async ({ request }) => {
		const url = new URL(request.url);
		const pathname = url.pathname;

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
			// Use a Proxy to mock Node.js req because Bun's Request is read-only
			const req = new Proxy(request, {
				get(target, prop) {
					if (prop === "url") return pathname + url.search;
					if (prop === "method") return request.method;
					if (prop === "headers")
						return Object.fromEntries(request.headers as any);
					return (target as any)[prop];
				},
			}) as any;

			const res = {
				statusCode: 200,
				setHeader(name: string, value: string) {
					this.headers[name.toLowerCase()] = value;
				},
				getHeader(name: string) {
					return this.headers[name.toLowerCase()];
				},
				headers: {} as Record<string, string>,
				end(data: any) {
					// Handle potential Buffer or string data from Vite
					let body = data;
					if (data instanceof Uint8Array) {
						body = data;
					} else if (typeof data === "string") {
						body = data;
					} else if (data) {
						body = String(data);
					}

					resolve(
						new Response(body || "", {
							status: this.statusCode,
							headers: this.headers,
						}),
					);
				},
				// Minimal event emitter mock
				once() {
					return this;
				},
				on() {
					return this;
				},
				emit() {
					return this;
				},
				removeListener() {
					return this;
				},
			} as any;

			vite.middlewares(req, res, (err: any) => {
				if (err) {
					console.error("Vite middleware error:", err);
					resolve(new Response(err.stack || err.toString(), { status: 500 }));
					return;
				}
				// If Vite doesn't handle it, return 404
				resolve(new Response("Not Found", { status: 404 }));
			});
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
				// Special handling for PWA files in src
				else if (pathname.includes("assetlinks.json")) {
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

export type ApiApp = typeof app;

