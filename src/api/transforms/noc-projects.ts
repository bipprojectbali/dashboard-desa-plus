/** Transform murni latest-projects → list kegiatan untuk wall widget. */

export interface NocProjectRaw {
	id: string;
	title: string;
	status: number | string;
	progress?: number;
	group?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface MappedWallProject {
	id: string;
	title: string;
	status: string;
	progress: number;
	divisi: string;
	date: string;
}

/** Map raw NOC latest-projects response → MappedWallProject[]. */
export function mapWallProjects(raw: NocProjectRaw[]): MappedWallProject[] {
	return raw.map((p) => ({
		id: p.id,
		title: p.title,
		status: p.status === 2 || p.status === "2" ? "SELESAI" : "BERJALAN",
		progress: p.progress ?? (p.status === 2 || p.status === "2" ? 100 : 50),
		divisi: p.group || "Umum",
		date: p.updatedAt || p.createdAt || "",
	}));
}
