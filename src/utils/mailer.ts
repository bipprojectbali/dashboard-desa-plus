import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const MAILER_FROM =
	process.env.MAILER_FROM ?? "Dashboard Desa <noreply@wibudev.com>";

interface SupportTicketPayload {
	nama: string;
	email: string;
	kategori: string;
	deskripsi: string;
	screenshotBase64?: string;
	screenshotMime?: string;
	adminEmail: string;
}

export async function sendSupportTicketEmail(
	payload: SupportTicketPayload,
): Promise<void> {
	const {
		nama,
		email,
		kategori,
		deskripsi,
		screenshotBase64,
		screenshotMime,
		adminEmail,
	} = payload;

	const attachments =
		screenshotBase64 && screenshotMime
			? [
					{
						filename: `screenshot.${screenshotMime.split("/")[1] ?? "png"}`,
						content: screenshotBase64,
					},
				]
			: undefined;

	await resend.emails.send({
		from: MAILER_FROM,
		to: adminEmail,
		replyTo: email,
		subject: `[Tiket Dukungan] ${kategori} - ${nama}`,
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 24px; border-radius: 8px 8px 0 0;">
					<h2 style="color: white; margin: 0;">Tiket Dukungan Baru</h2>
					<p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Dashboard Desa Darmasaba</p>
				</div>
				<div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
					<table style="width: 100%; border-collapse: collapse;">
						<tr>
							<td style="padding: 8px 0; color: #64748b; width: 140px; font-size: 14px;">Nama</td>
							<td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${nama}</td>
						</tr>
						<tr>
							<td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
							<td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
						</tr>
						<tr>
							<td style="padding: 8px 0; color: #64748b; font-size: 14px;">Kategori</td>
							<td style="padding: 8px 0; font-size: 14px;"><span style="background: #dbeafe; color: #1d4ed8; padding: 2px 10px; border-radius: 12px; font-size: 13px;">${kategori}</span></td>
						</tr>
					</table>
					<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
					<p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">Deskripsi Masalah:</p>
					<div style="background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${deskripsi}</div>
					<p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0;">Diterima pada: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</p>
				</div>
			</div>
		`,
		attachments,
	});
}
