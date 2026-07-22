/** Transform murni diagram-progres-kegiatan → array %-native (shape DonutBody). */

export interface NocProgresRaw {
	text: string;
	value: string | number;
	color: string;
	label?: string;
}

export interface MappedProgres {
	name: string;
	value: number;
	color: string;
}

/** Map raw NOC diagram-progres-kegiatan response → MappedProgres[]. */
export function mapProgres(raw: NocProgresRaw[]): MappedProgres[] {
	return raw.map((d) => ({
		name: d.label || d.text,
		value: Number(d.value),
		color: d.color,
	}));
}
