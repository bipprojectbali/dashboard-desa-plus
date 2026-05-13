import { proxy } from "valtio";
import en from "../locales/en";
import id from "../locales/id";

type Lang = "id" | "en";

export type FormatTanggal = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

// interval values: "1"=30s "2"=1m "3"=5m "4"=15m
const INTERVAL_MS: Record<string, number> = {
	"1": 30_000,
	"2": 60_000,
	"3": 300_000,
	"4": 900_000,
};
export function intervalToMs(v: string): number {
	return INTERVAL_MS[v] ?? 60_000;
}

interface I18nState {
	lang: Lang;
	zonaWaktu: string;
	formatTanggal: FormatTanggal;
	refreshOtomatis: boolean;
	intervalRefresh: string;
	tampilkanGrid: boolean;
	animasiTransisi: boolean;
}

export const i18nStore = proxy<I18nState>({
	lang: "id",
	zonaWaktu: "Asia/Jakarta",
	formatTanggal: "DD/MM/YYYY",
	refreshOtomatis: true,
	intervalRefresh: "1",
	tampilkanGrid: true,
	animasiTransisi: true,
});

export const translations = { id, en };

export function setLang(lang: Lang) {
	i18nStore.lang = lang;
}

export function setZonaWaktu(zona: string) {
	i18nStore.zonaWaktu = zona;
}

export function setFormatTanggal(fmt: FormatTanggal) {
	i18nStore.formatTanggal = fmt;
}

export function setDashboardPrefs(prefs: {
	refreshOtomatis: boolean;
	intervalRefresh: string;
	tampilkanGrid: boolean;
	animasiTransisi: boolean;
}) {
	i18nStore.refreshOtomatis = prefs.refreshOtomatis;
	i18nStore.intervalRefresh = prefs.intervalRefresh;
	i18nStore.tampilkanGrid = prefs.tampilkanGrid;
	i18nStore.animasiTransisi = prefs.animasiTransisi;
}
