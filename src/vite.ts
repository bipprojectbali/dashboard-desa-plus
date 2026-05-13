import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { createServer as createViteServer } from "vite";
import { inspectorPlugin } from "./utils/dev-inspector-plugin";

export async function createVite() {
	return createViteServer({
		root: process.cwd(),
		publicDir: "public",
		resolve: {
			alias: {
				"@": path.resolve(process.cwd(), "./src"),
			},
		},
		plugins: [tailwindcss(), inspectorPlugin(), react(), tanstackRouter()],
		server: {
			middlewareMode: true,
			hmr: {
				port: 24678,
			},
		},
		appType: "custom",
		optimizeDeps: {
			include: ["react", "react-dom", "@mantine/core"],
		},
	});
}
