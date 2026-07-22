export interface NocDiscussionRaw {
	id: string;
	title: string;
	desc: string;
	date: string;
	user: string;
	group: string;
}

export interface MappedDiscussion {
	id: string;
	message: string;
	senderName: string;
	senderImage: string | null;
	divisionName: string;
	createdAt: string;
}

/** Map raw NOC latest-discussion response → MappedDiscussion[]. */
export function mapDiscussions(raw: NocDiscussionRaw[]): MappedDiscussion[] {
	return raw.map((d) => ({
		id: d.id,
		message: d.desc || d.title,
		senderName: d.user || "Anonymous",
		senderImage: null,
		divisionName: d.group || "General",
		createdAt: d.date,
	}));
}

export interface WallDiscussion {
	id: string;
	message: string;
	divisi: string;
	date: string;
}

/** Map raw NOC latest-discussion → wall slice (tanpa PII senderName/user). */
export function mapWallDiscussions(raw: NocDiscussionRaw[]): WallDiscussion[] {
	return raw.map((d) => ({
		id: d.id,
		message: d.desc || d.title,
		divisi: d.group || "General",
		date: d.date,
	}));
}
