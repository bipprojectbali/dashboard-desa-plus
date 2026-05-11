import { useSnapshot } from "valtio";
import { i18nStore, translations } from "../store/i18n";

export function useTranslate() {
	const { lang } = useSnapshot(i18nStore);
	return translations[lang];
}
