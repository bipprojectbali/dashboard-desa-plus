#!/usr/bin/env bun
import { readFileSync } from "node:fs";

// Fungsi untuk mencari string terpanjang dalam objek (biasanya balasan AI)
function findLongestString(obj: unknown): string {
	let longest = "";
	const search = (item: unknown) => {
		if (typeof item === "string") {
			if (item.length > longest.length) {
				longest = item;
			}
		} else if (Array.isArray(item)) {
			for (const child of item) {
				search(child);
			}
		} else if (item !== null && typeof item === "object") {
			for (const value of Object.values(item)) {
				search(value);
			}
		}
	};
	search(obj);
	return longest;
}

async function run() {
	try {
		const inputRaw = readFileSync(0, "utf-8");
		if (!inputRaw) return;
		const input = JSON.parse(inputRaw);

		// DEBUG: Lihat struktur asli di console terminal (stderr)
		console.error("DEBUG KEYS:", Object.keys(input));

		const BOT_TOKEN = process.env.BOT_TOKEN;
		const CHAT_ID = process.env.CHAT_ID;

		const sessionId = input.session_id || "unknown";

		// Cari teks secara otomatis di seluruh objek JSON
		let finalText = findLongestString(input.response || input);

		if (!finalText || finalText.length < 5) {
			finalText =
				"Teks masih gagal diekstraksi. Struktur: " +
				Object.keys(input).join(", ");
		}

		const message =
			`✅ *Gemini Task Selesai*\n\n` +
			`🆔 Session: \`${sessionId}\` \n\n` +
			`🧠 Output:\n${finalText.substring(0, 3500)}`;

		await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				chat_id: CHAT_ID,
				text: message,
				parse_mode: "Markdown",
			}),
		});

		process.stdout.write(JSON.stringify({ status: "continue" }));
	} catch (err) {
		console.error("Hook Error:", err);
		process.stdout.write(JSON.stringify({ status: "continue" }));
	}
}

run();
