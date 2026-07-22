import type { WallDivisi } from "@/types/wall";
import { TTL, withCache } from "@/utils/cache";
import { getEnv } from "@/utils/env";
import { nocExternalClient } from "@/utils/noc-external-client";
import {
	mapWallDiscussions,
	type NocDiscussionRaw,
} from "../transforms/noc-discussions";
import { mapDocuments, type NocDocumentRaw } from "../transforms/noc-documents";
import { mapProgres, type NocProgresRaw } from "../transforms/noc-progres";
import {
	mapWallProjects,
	type NocProjectRaw,
} from "../transforms/noc-projects";

const DEFAULT_VILLAGE_ID = getEnv("NOC_VILLAGE_ID", "desa1");

async function fetchProgres(): Promise<WallDivisi["activities"]> {
	return withCache(
		`dashboard:divisi:progres:${DEFAULT_VILLAGE_ID}`,
		TTL.DASHBOARD,
		async () => {
			const { data: extData, error } = await nocExternalClient.GET(
				"/api/noc/diagram-progres-kegiatan",
				{ params: { query: { idDesa: DEFAULT_VILLAGE_ID } } },
			);
			if (error || !extData)
				throw new Error("NOC API error: diagram-progres-kegiatan");
			const raw = (extData as any)?.data as NocProgresRaw[];
			if (!Array.isArray(raw))
				throw new Error("Invalid NOC response: diagram-progres-kegiatan");
			return mapProgres(raw);
		},
	);
}

async function fetchDocuments(): Promise<WallDivisi["documents"]> {
	return withCache(
		`dashboard:divisi:documents:${DEFAULT_VILLAGE_ID}`,
		TTL.DASHBOARD,
		async () => {
			const { data: extData, error } = await nocExternalClient.GET(
				"/api/noc/diagram-jumlah-document",
				{ params: { query: { idDesa: DEFAULT_VILLAGE_ID } } },
			);
			if (error || !extData)
				throw new Error("NOC API error: diagram-jumlah-document");
			const raw = (extData as any)?.data as NocDocumentRaw[];
			if (!Array.isArray(raw))
				throw new Error("Invalid NOC response: diagram-jumlah-document");
			return mapDocuments(raw);
		},
	);
}

async function fetchProjects(): Promise<WallDivisi["projects"]> {
	return withCache(
		`dashboard:divisi:projects:${DEFAULT_VILLAGE_ID}`,
		TTL.DASHBOARD,
		async () => {
			const { data: extData, error } = await nocExternalClient.GET(
				"/api/noc/latest-projects",
				{ params: { query: { idDesa: DEFAULT_VILLAGE_ID, limit: "3" } } },
			);
			if (error || !extData) throw new Error("NOC API error: latest-projects");
			const res = extData as any;
			const raw = (res?.data?.projects ?? res?.data) as NocProjectRaw[];
			if (!Array.isArray(raw))
				throw new Error("Invalid NOC response: latest-projects");
			return mapWallProjects(raw);
		},
	);
}

async function fetchDiscussions(): Promise<WallDivisi["discussions"]> {
	return withCache(
		`dashboard:divisi:discussions:${DEFAULT_VILLAGE_ID}`,
		TTL.DASHBOARD,
		async () => {
			const { data: extData, error } = await nocExternalClient.GET(
				"/api/noc/latest-discussion",
				{ params: { query: { idDesa: DEFAULT_VILLAGE_ID, limit: "3" } } },
			);
			if (error || !extData)
				throw new Error("NOC API error: latest-discussion");
			const raw = (extData as any)?.data as NocDiscussionRaw[];
			if (!Array.isArray(raw))
				throw new Error("Invalid NOC response: latest-discussion");
			return mapWallDiscussions(raw);
		},
	);
}

/**
 * Rakit slice Divisi dari 4 endpoint NOC secara paralel.
 * Satu endpoint mati → satu field [] (panel kosong), bukan matikan 4.
 */
export async function buildDivisi(): Promise<WallDivisi> {
	const [activities, documents, projects, discussions] = await Promise.all([
		fetchProgres().catch(() => [] as WallDivisi["activities"]),
		fetchDocuments().catch(() => [] as WallDivisi["documents"]),
		fetchProjects().catch(() => [] as WallDivisi["projects"]),
		fetchDiscussions().catch(() => [] as WallDivisi["discussions"]),
	]);

	return { activities, documents, projects, discussions };
}
