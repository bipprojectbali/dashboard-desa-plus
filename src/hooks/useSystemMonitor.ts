import { useCallback, useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { notifStore } from "@/store/notif";
import { useNotification } from "./useNotification";

const THRESHOLDS = {
	mem: 80,
	cpu: 90,
	diskFree: 10,
} as const;

const POLL_INTERVAL_MS = 60_000;

export function useSystemMonitor() {
	const { tresholdMemori, tresholdCpu, tresholdDisk } = useSnapshot(notifStore);
	const { notify } = useNotification();
	const alerted = useRef<Record<string, number>>({});

	const check = useCallback(async () => {
		try {
			const res = await fetch("/api/system/stats");
			if (!res.ok) return;
			const { data } = (await res.json()) as {
				data: { memPct: number; cpuPct: number; diskFreePct: number };
			};

			const now = Date.now();
			const cooldown = 10 * 60 * 1000; // 10 menit antar alert yang sama

			if (tresholdMemori && data.memPct >= THRESHOLDS.mem) {
				if (!alerted.current.mem || now - alerted.current.mem > cooldown) {
					notify(
						"⚠️ RAM Tinggi",
						`Penggunaan RAM mencapai ${data.memPct}% (batas: ${THRESHOLDS.mem}%)`,
						"kritis",
					);
					alerted.current.mem = now;
				}
			}

			if (tresholdCpu && data.cpuPct >= THRESHOLDS.cpu) {
				if (!alerted.current.cpu || now - alerted.current.cpu > cooldown) {
					notify(
						"⚠️ CPU Tinggi",
						`Beban CPU mencapai ${data.cpuPct}% (batas: ${THRESHOLDS.cpu}%)`,
						"kritis",
					);
					alerted.current.cpu = now;
				}
			}

			if (tresholdDisk && data.diskFreePct <= THRESHOLDS.diskFree) {
				if (!alerted.current.disk || now - alerted.current.disk > cooldown) {
					notify(
						"⚠️ Disk Hampir Penuh",
						`Sisa disk hanya ${data.diskFreePct}% (batas minimum: ${THRESHOLDS.diskFree}%)`,
						"kritis",
					);
					alerted.current.disk = now;
				}
			}
		} catch {
			// network error — silent
		}
	}, [tresholdMemori, tresholdCpu, tresholdDisk, notify]);

	useEffect(() => {
		if (!tresholdMemori && !tresholdCpu && !tresholdDisk) return;
		check();
		const id = setInterval(check, POLL_INTERVAL_MS);
		return () => clearInterval(id);
	}, [tresholdMemori, tresholdCpu, tresholdDisk, check]);
}
