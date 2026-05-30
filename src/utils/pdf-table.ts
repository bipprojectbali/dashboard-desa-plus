import PDFDocument from "pdfkit";

export interface PdfColumn {
	header: string;
	key: string;
	width: number;
}

export interface PdfSection {
	heading: string;
	columns: PdfColumn[];
	rows: Record<string, string | number>[];
}

export interface PdfReportOptions {
	title: string;
	subtitle?: string;
	sections: PdfSection[];
}

// Kept for backward compatibility (single-section)
export interface PdfTableOptions {
	title: string;
	subtitle?: string;
	columns: PdfColumn[];
	rows: Record<string, string | number>[];
}

export async function buildPdfTable(opts: PdfTableOptions): Promise<Buffer> {
	return buildPdfReport({
		title: opts.title,
		subtitle: opts.subtitle,
		sections: [{ heading: "", columns: opts.columns, rows: opts.rows }],
	});
}

export async function buildPdfReport(
	opts: PdfReportOptions,
): Promise<Buffer> {
	const { title, subtitle, sections } = opts;

	const doc = new PDFDocument({ margin: 40, size: "A4" });
	const chunks: Buffer[] = [];
	doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

	const buffer = await new Promise<Buffer>((resolve) => {
		doc.on("end", () => resolve(Buffer.concat(chunks)));

		const pageWidth = doc.page.width - 80;
		const ROW_H = 22;
		const HDR_H = 26;
		const COL_GRAY = "#F1F5F9";
		const BORDER = "#CBD5E1";
		const TEXT_DARK = "#1E293B";
		const HEADER_BG = "#1E3A5F";
		const SECTION_BG = "#E2E8F0";

		const now = new Date().toLocaleString("id-ID", {
			dateStyle: "long",
			timeStyle: "short",
		});

		// ── Judul laporan ──
		doc
			.fontSize(16)
			.fillColor(TEXT_DARK)
			.font("Helvetica-Bold")
			.text(title, 40, 40);

		doc
			.fontSize(9)
			.fillColor("#64748B")
			.font("Helvetica")
			.text(subtitle ?? `Diekspor pada: ${now}`, 40, doc.y + 2);

		doc.moveDown(0.8);

		const PADDING_V = 6; // padding atas+bawah per sel

		// Hitung tinggi row berdasarkan sel terpanjang
		const calcRowHeight = (
			columns: PdfColumn[],
			row: Record<string, string | number>,
		): number => {
			doc.fontSize(8).font("Helvetica");
			let maxH = ROW_H;
			for (const col of columns) {
				const val = String(row[col.key] ?? "");
				const h = doc.heightOfString(val, { width: col.width - 8 });
				maxH = Math.max(maxH, h + PADDING_V * 2);
			}
			return Math.ceil(maxH);
		};

		// ── Helper: gambar satu tabel ──
		const drawTable = (
			columns: PdfColumn[],
			rows: Record<string, string | number>[],
		) => {
			const tableTop = doc.y;

			// header row
			let x = 40;
			doc.rect(40, tableTop, pageWidth, HDR_H).fill(HEADER_BG);
			for (const col of columns) {
				doc
					.fontSize(9)
					.fillColor("white")
					.font("Helvetica-Bold")
					.text(col.header, x + 4, tableTop + 7, {
						width: col.width - 8,
						lineBreak: false,
						ellipsis: true,
					});
				x += col.width;
			}

			// data rows — tinggi dinamis per baris
			let y = tableTop + HDR_H;
			for (let i = 0; i < rows.length; i++) {
				const row = rows[i]!;
				const rowH = calcRowHeight(columns, row);

				// Pindah halaman sebelum menggambar jika tidak cukup ruang
				if (y + rowH > doc.page.height - 60) {
					doc.addPage();
					y = 40;
				}

				const bg = i % 2 === 0 ? "white" : COL_GRAY;
				doc.rect(40, y, pageWidth, rowH).fill(bg).stroke(BORDER);

				x = 40;
				for (const col of columns) {
					doc
						.fontSize(8)
						.fillColor(TEXT_DARK)
						.font("Helvetica")
						.text(String(row[col.key] ?? ""), x + 4, y + PADDING_V, {
							width: col.width - 8,
							lineBreak: true,
						});
					x += col.width;
				}
				y += rowH;
			}

			doc.y = y + 4;
		};

		// ── Render tiap seksi ──
		for (const section of sections) {
			if (section.heading) {
				// Sub-heading bar
				doc.rect(40, doc.y, pageWidth, 20).fill(SECTION_BG);
				doc
					.fontSize(10)
					.fillColor(TEXT_DARK)
					.font("Helvetica-Bold")
					.text(section.heading, 44, doc.y + 4, { width: pageWidth - 8 });
				doc.y += 20;
				doc.moveDown(0.3);
			}

			if (section.rows.length === 0) {
				doc
					.fontSize(8)
					.fillColor("#94A3B8")
					.font("Helvetica")
					.text("Tidak ada data.", 44, doc.y);
				doc.moveDown(1);
			} else {
				drawTable(section.columns, section.rows);
				doc.moveDown(0.8);
			}
		}

		// ── Footer ──
		doc
			.fontSize(8)
			.fillColor("#94A3B8")
			.text("Dashboard Desa Plus", 40, doc.page.height - 40, {
				align: "center",
				width: pageWidth,
			});

		doc.end();
	});

	return buffer;
}
