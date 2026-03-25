import { proxy } from "valtio";

type SelectedYear = string;

interface SosialState {
	selectedYear: SelectedYear;
	filters: {
		dusun: string | null;
		kategori: string | null;
	};
}

export const sosialStore = proxy<SosialState>({
	selectedYear: new Date().getFullYear().toString(),
	filters: {
		dusun: null,
		kategori: null,
	},
});

export const setYear = (year: SelectedYear) => {
	sosialStore.selectedYear = year;
};

export const setFilter = (
	key: keyof SosialState["filters"],
	value: string | null,
) => {
	sosialStore.filters[key] = value;
};
