import { useCallback } from "react";
import { useSnapshot } from "valtio";
import { notifStore } from "@/store/notif";

export function useNotification() {
	const { bunyiNotifikasi, alertKritis, aktivitasTim, komentarMention } =
		useSnapshot(notifStore);

	const requestPermission =
		useCallback(async (): Promise<NotificationPermission> => {
			if (!("Notification" in window)) return "denied";
			if (Notification.permission === "granted") return "granted";
			if (Notification.permission === "denied") return "denied";
			return Notification.requestPermission();
		}, []);

	const playSound = useCallback(() => {
		if (!bunyiNotifikasi) return;
		try {
			const ctx = new AudioContext();
			ctx.resume().then(() => {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.type = "sine";
				osc.frequency.setValueAtTime(880, ctx.currentTime);
				osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
				gain.gain.setValueAtTime(0.3, ctx.currentTime);
				gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + 0.3);
			});
		} catch {
			// AudioContext not available
		}
	}, [bunyiNotifikasi]);

	const notify = useCallback(
		(
			title: string,
			body: string,
			type: "kritis" | "aktivitas" | "mention" | "sistem" = "sistem",
		) => {
			if (!("Notification" in window)) return;
			if (Notification.permission !== "granted") return;

			const allowed =
				type === "kritis"
					? alertKritis
					: type === "aktivitas"
						? aktivitasTim
						: type === "mention"
							? komentarMention
							: true;

			if (!allowed) return;

			new Notification(title, {
				body,
				icon: "/favicon.ico",
				badge: "/favicon.ico",
				tag: type,
			});

			playSound();
		},
		[alertKritis, aktivitasTim, komentarMention, playSound],
	);

	return { requestPermission, notify, playSound };
}
