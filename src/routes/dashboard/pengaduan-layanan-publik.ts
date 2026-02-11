import { createFileRoute } from "@tanstack/react-router";
import PengaduanLayananPublik from "@/components/pengaduan-layanan-publik";
export const Route = createFileRoute("/dashboard/pengaduan-layanan-publik")({
	component: PengaduanLayananPublik,
});
