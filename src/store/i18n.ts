import { proxy } from "valtio";
import en from "../locales/en";
import id from "../locales/id";

type Lang = "id" | "en";

interface I18nState {
	lang: Lang;
	zonaWaktu: string;
}

export const i18nStore = proxy<I18nState>({
	lang: "id",
	zonaWaktu: "Asia/Jakarta",
});

export const translations = { id, en };

export function setLang(lang: Lang) {
	i18nStore.lang = lang;
}

export function setZonaWaktu(zona: string) {
	i18nStore.zonaWaktu = zona;
}
