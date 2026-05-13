import { modals } from "@mantine/modals";
import { useSnapshot } from "valtio";
import { aksesStore } from "@/store/akses";

export function useApprovalGuard() {
	const { requireApprovalPerubahan } = useSnapshot(aksesStore);

	const withApproval = (action: () => void, label = "perubahan ini") => {
		if (!requireApprovalPerubahan) {
			action();
			return;
		}
		modals.openConfirmModal({
			title: "Konfirmasi Perubahan",
			children: `Kebijakan persetujuan aktif. Yakin ingin menyimpan ${label}?`,
			labels: { confirm: "Ya, Simpan", cancel: "Batal" },
			confirmProps: { color: "violet" },
			onConfirm: action,
		});
	};

	return { withApproval, requireApprovalPerubahan };
}
