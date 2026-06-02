import Elysia, { t } from "elysia";
import { supportConfig } from "../config/support";
import { prisma } from "../utils/db";
import logger from "../utils/logger";
import { sendSupportTicketEmail } from "../utils/mailer";

const KATEGORI_VALID = [
	"Akses & Login",
	"Data & Sinkronisasi",
	"Fitur & Navigasi",
	"Laporan & Ekspor",
	"Lainnya",
];

export const bantuanApi = new Elysia({ prefix: "/bantuan" })
	.get("/faq", async ({ set }) => {
		try {
			const faqs = await prisma.faq.findMany({
				where: { isPublished: true },
				orderBy: [{ category: "asc" }, { order: "asc" }],
				select: {
					id: true,
					question: true,
					answer: true,
					category: true,
					order: true,
				},
			});
			return { data: faqs };
		} catch (error) {
			logger.error({ error }, "Failed to fetch public FAQs");
			set.status = 500;
			return { error: "Gagal memuat FAQ" };
		}
	})
	.post(
		"/kirim-tiket",
		async ({ body, set }) => {
			const {
				nama,
				email,
				kategori,
				deskripsi,
				screenshotBase64,
				screenshotMime,
			} = body;

			if (!KATEGORI_VALID.includes(kategori)) {
				set.status = 400;
				return { error: "Kategori tidak valid" };
			}

			try {
				await sendSupportTicketEmail({
					nama,
					email,
					kategori,
					deskripsi,
					screenshotBase64: screenshotBase64 ?? undefined,
					screenshotMime: screenshotMime ?? undefined,
					adminEmail: supportConfig.adminEmail,
				});
				logger.info({ nama, email, kategori }, "Support ticket sent");
				return { ok: true };
			} catch (error) {
				logger.error({ error }, "Failed to send support ticket");
				set.status = 500;
				return { error: "Gagal mengirim tiket. Coba lagi nanti." };
			}
		},
		{
			body: t.Object({
				nama: t.String({ minLength: 2, maxLength: 100 }),
				email: t.String({ format: "email" }),
				kategori: t.String({ minLength: 1 }),
				deskripsi: t.String({ minLength: 10, maxLength: 2000 }),
				screenshotBase64: t.Optional(t.String()),
				screenshotMime: t.Optional(t.String()),
			}),
		},
	);
