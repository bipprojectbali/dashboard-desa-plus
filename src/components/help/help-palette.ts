import type { TextProps } from "@mantine/core";
import type { CSSProperties } from "react";

/** Skema warna kartu & modal halaman Bantuan; pengguna dan admin punya skema sendiri. */
export interface HelpPalette {
	cardBg: string;
	cardBorder: string;
	codeBg: string;
	codeBorder: string;
	faqItemBg: string;
	/** Props teks sekunder; halaman pengguna memakai `color`, admin `c` (dipertahankan apa adanya). */
	dimmedText: TextProps;
}

const ADMIN_AMBER = {
	cardBg: "rgba(251, 240, 223, 0.05)",
	border: "rgba(251, 240, 223, 0.1)",
	subtleBg: "rgba(251, 240, 223, 0.02)",
	innerBg: "rgba(251, 240, 223, 0.03)",
};

/** Skema halaman `/bantuan`. */
export function userHelpPalette(dark: boolean): HelpPalette {
	return {
		cardBg: dark ? "#1E293B" : "white",
		cardBorder: dark ? "#334155" : "white",
		codeBg: dark ? "#0f172a" : "#f8fafc",
		codeBorder: dark ? "#334155" : "#e2e8f0",
		faqItemBg: dark ? "#263852ff" : "#F1F5F9",
		dimmedText: { color: "dimmed" },
	};
}

/** Skema halaman `/admin/help` (aksen amber di mode gelap). */
export function adminHelpPalette(dark: boolean): HelpPalette {
	return {
		cardBg: dark ? ADMIN_AMBER.cardBg : "white",
		cardBorder: dark ? ADMIN_AMBER.border : "white",
		codeBg: dark ? ADMIN_AMBER.subtleBg : "#f8fafc",
		codeBorder: dark ? ADMIN_AMBER.border : "#e2e8f0",
		faqItemBg: dark ? ADMIN_AMBER.innerBg : "#F1F5F9",
		dimmedText: { c: "dimmed" },
	};
}

/** Gaya dasar setiap kartu bantuan. */
export function helpCardStyle(palette: HelpPalette): CSSProperties {
	return {
		borderColor: palette.cardBorder,
		boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
		transition: "transform 0.15s ease, box-shadow 0.15s ease",
	};
}
