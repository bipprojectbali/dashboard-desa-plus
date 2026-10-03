import { useState } from "react";
import { bytesToBase64, hasRequiredTicketFields } from "./support-ticket.logic";

export type TicketStatus = "idle" | "ok" | "error";

/** State form tiket dukungan + kirim ke `/api/bantuan/kirim-tiket`; sukses → form dikosongkan. */
export function useSupportTicket() {
	const [nama, setNama] = useState("");
	const [email, setEmail] = useState("");
	const [kategori, setKategori] = useState<string | null>(null);
	const [deskripsi, setDeskripsi] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [sending, setSending] = useState(false);
	const [status, setStatus] = useState<TicketStatus>("idle");

	const submit = async () => {
		if (!hasRequiredTicketFields({ nama, email, kategori, deskripsi })) return;

		setSending(true);
		setStatus("idle");

		let screenshotBase64: string | undefined;
		let screenshotMime: string | undefined;

		if (file) {
			screenshotBase64 = bytesToBase64(
				new Uint8Array(await file.arrayBuffer()),
			);
			screenshotMime = file.type;
		}

		try {
			const res = await fetch("/api/bantuan/kirim-tiket", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nama,
					email,
					kategori,
					deskripsi,
					screenshotBase64,
					screenshotMime,
				}),
			});
			if (res.ok) {
				setStatus("ok");
				setNama("");
				setEmail("");
				setKategori(null);
				setDeskripsi("");
				setFile(null);
			} else {
				setStatus("error");
			}
		} catch {
			setStatus("error");
		} finally {
			setSending(false);
		}
	};

	return {
		fields: { nama, email, kategori, deskripsi },
		setNama,
		setEmail,
		setKategori,
		setDeskripsi,
		file,
		setFile,
		sending,
		status,
		setStatus,
		submit,
	};
}

export type SupportTicket = ReturnType<typeof useSupportTicket>;
