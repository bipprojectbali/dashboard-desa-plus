/** Transform murni diagram-jumlah-document → array dokumen per jenis. */

export interface NocDocumentRaw {
	label: string;
	value: number;
	color: string;
}

export interface MappedDocument {
	name: string;
	jumlah: number;
	color: string;
}

/** Map raw NOC diagram-jumlah-document response → MappedDocument[]. */
export function mapDocuments(raw: NocDocumentRaw[]): MappedDocument[] {
	return raw.map((d) => ({
		name: d.label,
		jumlah: d.value,
		color: d.color,
	}));
}
