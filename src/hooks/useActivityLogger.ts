import { useCallback } from "react";

export function useActivityLogger() {
	const log = useCallback(async (action: string, detail?: string) => {
		try {
			await fetch("/api/activity-log", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action, detail }),
			});
		} catch {
			// non-critical — logging failure must not break the main action
		}
	}, []);

	return { log };
}
