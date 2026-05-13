import { proxy } from "valtio";

interface NotifState {
	laporanHarian: boolean;
	alertSistem: boolean;
	updateKeamanan: boolean;
	newsletterBulan: boolean;
	alertKritis: boolean;
	aktivitasTim: boolean;
	komentarMention: boolean;
	bunyiNotifikasi: boolean;
	tresholdMemori: boolean;
	tresholdCpu: boolean;
	tresholdDisk: boolean;
}

export const notifStore = proxy<NotifState>({
	laporanHarian: true,
	alertSistem: true,
	updateKeamanan: true,
	newsletterBulan: true,
	alertKritis: true,
	aktivitasTim: true,
	komentarMention: true,
	bunyiNotifikasi: true,
	tresholdMemori: true,
	tresholdCpu: true,
	tresholdDisk: true,
});

export function setNotifPrefs(prefs: Partial<NotifState>) {
	Object.assign(notifStore, prefs);
}
