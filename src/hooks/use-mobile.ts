import { useMediaQuery } from "@mantine/hooks";

/**
 * Hook to check if viewport is mobile size
 * Returns true if screen width is <= 768px (Mantine sm breakpoint)
 */
export function useMobile() {
	const isMobile = useMediaQuery("(max-width: 768px)");
	return isMobile ?? false;
}

/**
 * Hook to check if viewport is tablet size or larger
 * Returns true if screen width is >= 768px
 */
export function useTabletAndUp() {
	const isTabletAndUp = useMediaQuery("(min-width: 768px)");
	return isTabletAndUp ?? true;
}

/**
 * Hook to check if viewport is desktop size or larger
 * Returns true if screen width is >= 992px (Mantine md breakpoint)
 */
export function useDesktop() {
	const isDesktop = useMediaQuery("(min-width: 992px)");
	return isDesktop ?? true;
}
