import path from "node:path";
import type { Plugin } from "vite";

/**
 * Vite Plugin to inject data-inspector-* attributes into JSX elements.
 * This enables click-to-source functionality in the browser.
 */
export function inspectorPlugin(): Plugin {
	const rootDir = process.cwd();

	return {
		name: "inspector-inject",
		enforce: "pre",
		transform(code, id) {
			// Only process .tsx and .jsx files, skip node_modules
			if (!/\.[jt]sx(\?|$)/.test(id) || id.includes("node_modules"))
				return null;
			if (!code.includes("<")) return null;

			const relativePath = path.relative(rootDir, id);
			let modified = false;
			const lines = code.split("\n");
			const result: string[] = [];

			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];
				if (line === undefined) {
					continue;
				}
				// Match JSX opening tags: <Component, <div, or <item.icon
				// Allow dots and hyphens in the tag name
				const jsxPattern = /(<(?:[A-Za-z][a-zA-Z0-9.-]*))\b/g;
				let match: RegExpExecArray | null = null;

				// biome-ignore lint/suspicious/noAssignInExpressions: match loop
				while ((match = jsxPattern.exec(line)) !== null) {
					// Skip if character before `<` is an identifier char (likely a TypeScript generic)
					const charBefore =
						match.index > 0 ? (line[match.index - 1] ?? "") : "";
					if (/[a-zA-Z0-9_$.]/.test(charBefore)) continue;

					const col = match.index + 1;
					const attr = ` data-inspector-line="${i + 1}" data-inspector-column="${col}" data-inspector-relative-path="${relativePath}"`;
					const insertPos = match.index + match[0].length;
					line = line.slice(0, insertPos) + attr + line.slice(insertPos);
					modified = true;
					jsxPattern.lastIndex += attr.length;
				}

				result.push(line);
			}

			if (!modified) return null;
			return result.join("\n");
		},
	};
}
