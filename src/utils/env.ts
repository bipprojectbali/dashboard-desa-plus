/**
 * Safely access environment variables across different runtimes and builders.
 * Supports Vite's import.meta.env and Bun's process.env (used in bun build).
 */
export const getEnv = (key: string, defaultValue = ""): string => {
	// 1. Try Vite's import.meta.env
	try {
		if (import.meta.env?.[key]) {
			return import.meta.env[key];
		}
	} catch {}

	// 2. Try process.env (injected by bun build --env)
	try {
		if (typeof process !== "undefined" && process.env[key]) {
			return process.env[key];
		}
	} catch {}

	return defaultValue;
};

export const VITE_PUBLIC_URL = (() => {
	// Priority: 
	// 1. BETTER_AUTH_URL (standard for better-auth)
	// 2. VITE_PUBLIC_URL (our app standard)
	// 3. window.location.origin (browser fallback)
	const envUrl = getEnv("BETTER_AUTH_URL") || getEnv("VITE_PUBLIC_URL");
	if (envUrl) return envUrl;

	// Fallback for browser
	if (typeof window !== "undefined") {
		return window.location.origin;
	}

	return "http://localhost:3000";
})();

export const IS_DEV = (() => {
	try {
		return import.meta.env?.DEV;
	} catch {
		return false;
	}
})();
