// Semantic palette tokens — TV-robust, light↔dark parity.
// Chroma diturunkan agar tidak "ngejreng" di TV Vivid mode.
// Dikonsumsi via CSS variables di index.css (preferred).
// Export ini untuk edge case yang butuh nilai JS (mis. chart library non-SVG).

export const palette = {
	light: {
		bg: "#F8F9FB",
		card: "#FFFFFF",
		cardAlt: "#F3F5F8",
		border: "#E3E7ED",
		track: "#E8EBF0",
		text: "#1E2733",
		textDim: "#5F6B7A",
		primary: "#2F6BC4",
		success: "#3E9B6B",
		successSubtle: "#EDF7F1",
		warning: "#D89A3C",
		danger: "#D14D4D",
		dangerSubtle: "#FEF2F2",
		info: "#3E8199",
		infoSubtle: "#E8F2FB",
		violet: "#7060B8",
	},
	dark: {
		bg: "#161D2E",
		card: "#1F2839",
		cardAlt: "#243044",
		border: "#364356",
		track: "#2A3446",
		text: "#DCE3EC",
		textDim: "#93A0B4",
		primary: "#5A8DD6",
		success: "#57A773",
		successSubtle: "#1B2C23",
		warning: "#DFA94E",
		danger: "#D46A6A",
		dangerSubtle: "#2C1E1E",
		info: "#5C9DB8",
		infoSubtle: "#1B2D3E",
		violet: "#9385D1",
	},
} as const;
