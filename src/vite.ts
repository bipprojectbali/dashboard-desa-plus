import path from "node:path";
import { inspectorServer } from "@react-dev-inspector/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { createServer as createViteServer } from "vite";

export async function createVite() {
	return createViteServer({
		root: process.cwd(),
		resolve: {
			alias: {
				"@": path.resolve(process.cwd(), "./src"),
			},
		},
		plugins: [
			tailwindcss(),
			react({
				babel: {
					plugins: [
						[
							"@react-dev-inspector/babel-plugin",
							{
								relativePath: true,
							},
						],
					],
				},
			}),
			inspectorServer(),
			tanstackRouter(),
		],
		server: {
			middlewareMode: true,
			hmr: true,
		},
		appType: "custom",
		optimizeDeps: {
			include: [
				"react",
				"react-dom",
				"@mantine/core",


			],
		},
	});
}
