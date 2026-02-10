/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */
/** biome-ignore-all lint/style/noNonNullAssertion: <explanation */
/** biome-ignore-all lint/suspicious/noAssignInExpressions: <explanation */

import { createTheme, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Inspector } from "react-dev-inspector";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import { IS_DEV, VITE_PUBLIC_URL } from "./utils/env";
import { ThemeProvider } from "next-themes";

// Create a new router instance
export const router = createRouter({
	routeTree,
	defaultPreload: "intent",
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const theme = createTheme({
	fontFamily: "Inter, Poppins, system-ui, sans-serif",
	headings: {
		fontFamily: "Inter, Poppins, system-ui, sans-serif",
	},
	colors: {
		// Defined shades from 0-9 (lightest to darkest)
		"darmasaba-navy": [
			"#E1E4F2",
			"#B9C2DD",
			"#91A0C9",
			"#697EBA",
			"#4C6CAE",
			"#3B5B97",
			"#2C497F",
			"#1E3766",
			"#12264D",
			"#071833",
		],
		"darmasaba-blue": [
			"#E3F0FF",
			"#B6D9FF",
			"#89C2FF",
			"#5CA9FF",
			"#3B8FFF",
			"#237AE0",
			"#1C6BBF",
			"#155BA0",
			"#0E4980",
			"#073260",
		],
		"darmasaba-success": [
			"#E3F9E7",
			"#BFEEC7",
			"#9BD8A7",
			"#77C387",
			"#5DB572",
			"#499A5D",
			"#3C7F4A",
			"#2F6438",
			"#234926",
			"#17301B",
		],
		"darmasaba-warning": [
			"#FFF8E1",
			"#FEE7B3",
			"#FDD785",
			"#FDC757",
			"#FBBF3B",
			"#E1AC23",
			"#C2981D",
			"#A38418",
			"#856F12",
			"#675A0D",
		],
		"darmasaba-danger": [
			"#FFE3E3",
			"#FFBABA",
			"#FF9191",
			"#FF6868",
			"#FA4B4B",
			"#E03333",
			"#C22A2A",
			"#A32020",
			"#851616",
			"#670C0C",
		],
	},
	primaryColor: "darmasaba-blue",
});

const InspectorWrapper = IS_DEV
	? Inspector
	: ({ children }: { children: React.ReactNode }) => <>{children}</>;

const elem = document.getElementById("root")!;
const app = (
	<InspectorWrapper
		keys={["shift", "a"]}
		onClickElement={(e) => {
			if (!e.codeInfo) return;

			const url = VITE_PUBLIC_URL;
			fetch(`${url}/__open-in-editor`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					relativePath: e.codeInfo.relativePath,
					lineNumber: e.codeInfo.lineNumber,
					columnNumber: e.codeInfo.columnNumber,
				}),
			});
		}}
	>
		<ThemeProvider attribute="class" defaultTheme="system">
			<MantineProvider theme={theme} defaultColorScheme="auto">
				<ModalsProvider>
					<RouterProvider router={router} />
				</ModalsProvider>
			</MantineProvider>
		</ThemeProvider>
	</InspectorWrapper>
);

if (import.meta.hot) {
	// With hot module reloading, `import.meta.hot.data` is persisted.
	const root = (import.meta.hot.data.root ??= createRoot(elem));
	root.render(app);
} else {
	// The hot module reloading API is not available in production.
	createRoot(elem).render(app);
}
