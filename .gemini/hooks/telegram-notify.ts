#!/usr/bin/env bun
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Function to manually load .env from project root if process.env is missing keys
function loadEnv() {
	const envPath = join(process.cwd(), ".env");
	if (existsSync(envPath)) {
		const envContent = readFileSync(envPath, "utf-8");
		const lines = envContent.split("\n");
		for (const line of lines) {
			if (line && !line.startsWith("#")) {
				const [key, ...valueParts] = line.split("=");
				if (key && valueParts.length > 0) {
					const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
					process.env[key.trim()] = value;
				}
			}
		}
	}
}

async function run() {
	try {
		// Ensure environment variables are loaded
		loadEnv();

		const inputRaw = readFileSync(0, "utf-8");
		if (!inputRaw) return;

		let finalText = "";
		let sessionId = "dashboard-desa-plus";

		try {
			// Try parsing as JSON first
			const input = JSON.parse(inputRaw);
			sessionId = input.session_id || "dashboard-desa-plus";
			finalText = typeof input === "string" ? input : (input.response || input.text || JSON.stringify(input));
		} catch {
			// If not JSON, use raw text
			finalText = inputRaw;
		}

		const BOT_TOKEN = process.env.BOT_TOKEN;
		const CHAT_ID = process.env.CHAT_ID;

		if (!BOT_TOKEN || !CHAT_ID) {
			console.error("Missing BOT_TOKEN or CHAT_ID in environment variables");
			return;
		}

		const message =
			`✅ *Gemini Task Selesai*\n\n` +
			`🆔 Session: \`${sessionId}\` \n\n` +
			`🧠 Output:\n${finalText.substring(0, 3500)}`;

		const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				chat_id: CHAT_ID,
				text: message,
				parse_mode: "Markdown",
			}),
		});

		if (!res.ok) {
			const errorData = await res.json();
			console.error("Telegram API Error:", errorData);
		} else {
			console.log("Notification sent successfully!");
		}

		process.stdout.write(JSON.stringify({ status: "continue" }));
	} catch (err) {
		console.error("Hook Error:", err);
		process.stdout.write(JSON.stringify({ status: "continue" }));
	}
}

run();
