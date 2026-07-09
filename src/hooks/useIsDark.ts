import { useComputedColorScheme } from "@mantine/core";

/** Resolusi color-scheme aktif ("auto" → light/dark nyata). true jika dark. */
export function useIsDark() {
	return (
		useComputedColorScheme("light", { getInitialValueInEffect: true }) ===
		"dark"
	);
}
