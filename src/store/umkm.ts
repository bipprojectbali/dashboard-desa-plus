import { proxy } from "valtio";

type TimeRange = "minggu" | "bulan";

interface UmkmState {
	selectedRange: TimeRange;
	filters: {
		kategori: string | null;
		umkm: string | null;
	};
}

export const umkmStore = proxy<UmkmState>({
	selectedRange: "bulan",
	filters: {
		kategori: null,
		umkm: null,
	},
});

export const setRange = (range: TimeRange) => {
	umkmStore.selectedRange = range;
};

export const setFilter = (
	key: keyof UmkmState["filters"],
	value: string | null,
) => {
	umkmStore.filters[key] = value;
};
