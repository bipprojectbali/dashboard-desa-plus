import { createFileRoute } from "@tanstack/react-router";
import KeuanganAnggaran from "@/components/keuangan-anggaran";

export const Route = createFileRoute("/keuangan-anggaran")({
	component: KeuanganAnggaran,
});
