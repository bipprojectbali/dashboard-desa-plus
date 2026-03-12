#!/usr/bin/env bun

/**
 * Build script for production
 * 1. Build CSS with PostCSS/Tailwind
 * 2. Bundle JS with Bun (without CSS)
 * 3. Replace CSS reference in HTML
 */

import { $ } from "bun";
import fs from "node:fs";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

console.log("🔨 Starting production build...");

// Ensure dist directory exists
if (!fs.existsSync("./dist")) {
	fs.mkdirSync("./dist", { recursive: true });
}

// Step 1: Build CSS with PostCSS
console.log("🎨 Building CSS...");
const cssInput = fs.readFileSync("./src/index.css", "utf-8");
const cssResult = await postcss([tailwindcss(), autoprefixer()]).process(
	cssInput,
	{
		from: "./src/index.css",
		to: "./dist/index.css",
	},
);

fs.writeFileSync("./dist/index.css", cssResult.css);
console.log("✅ CSS built successfully!");

// Step 2: Build JS with Bun (build HTML too, we'll fix CSS link later)
console.log("📦 Bundling JavaScript...");
await $`bun build ./src/index.html --outdir=dist --sourcemap --target=browser --minify --define:process.env.NODE_ENV='"production"' --env='VITE_*'`;

// Step 3: Copy public assets
console.log("📁 Copying public assets...");
if (fs.existsSync("./public")) {
	await $`cp -r public/* dist/ 2>/dev/null || true`;
}

// Step 4: Ensure HTML references the correct CSS
// Bun build might have renamed the CSS, we want to use our own index.css
console.log("🔧 Fixing HTML CSS reference...");
const htmlPath = "./dist/index.html";
if (fs.existsSync(htmlPath)) {
	let html = fs.readFileSync(htmlPath, "utf-8");
	// Replace any bundled CSS reference with our index.css
	html = html.replace(/href="[^"]*\.css"/g, 'href="/index.css"');
	fs.writeFileSync(htmlPath, html);
}

console.log("✅ Build completed successfully!");
