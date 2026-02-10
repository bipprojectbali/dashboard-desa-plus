import { createFileRoute } from "@tanstack/react-router";
import PengaduanLayananPublik from "../../app/components/pengaduan-layanan-publik";
export const Route = createFileRoute("/dashboard/pengaduan-layanan-publik")({
	component: PengaduanLayananPublik,
});
