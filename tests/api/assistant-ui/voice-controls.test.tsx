import { afterEach, describe, expect, it } from "bun:test";
import { MantineProvider } from "@mantine/core";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { VoiceConsentBanner } from "@/components/assistant/voice/voice-consent-banner";
import {
	VoiceControlsView,
	type VoiceControlsViewProps,
} from "@/components/assistant/voice/voice-controls";
import { assistantVoiceTexts } from "@/locales/assistant-voice";

/** Tampilan mode suara panel Jenna: tombol On/Off, status, mute, perpanjang, persetujuan mikrofon. */

const t = assistantVoiceTexts.id;
let root: Root | null = null;

afterEach(() => {
	root?.unmount();
	root = null;
	document.body.innerHTML = "";
});

function render(node: React.ReactNode) {
	const host = document.createElement("div");
	document.body.append(host);
	root = createRoot(host);
	flushSync(() => root?.render(<MantineProvider>{node}</MantineProvider>));
	return host;
}

function controls(over: Partial<VoiceControlsViewProps> = {}) {
	const calls: string[] = [];
	const props: VoiceControlsViewProps = {
		t,
		name: "Jenna",
		status: "off",
		supported: true,
		transcript: "",
		remaining: null,
		inviteExtend: false,
		answerMuted: false,
		micMuted: false,
		notice: null,
		onStart: () => calls.push("start"),
		onStop: () => calls.push("stop"),
		onExtend: () => calls.push("extend"),
		onToggleAnswer: () => calls.push("answer"),
		onToggleMic: () => calls.push("mic"),
		onDismissNotice: () => calls.push("dismiss"),
		...over,
	};
	return { host: render(<VoiceControlsView {...props} />), calls };
}

const q = (host: HTMLElement, sel: string) =>
	host.querySelector<HTMLElement>(sel);

describe("VoiceControlsView — off", () => {
	it("tombol On memakai nama asisten dan memanggil onStart", () => {
		const { host, calls } = controls();
		const btn = q(host, "[data-voice-start]") as HTMLButtonElement;
		expect(btn.textContent).toContain("Jenna");
		expect(btn.disabled).toBe(false);
		btn.click();
		expect(calls).toEqual(["start"]);
		expect(q(host, "[data-voice-status]")).toBeNull();
	});

	it("browser tidak didukung: tombol nonaktif dengan alasan tertulis", () => {
		const { host, calls } = controls({ supported: false });
		const btn = q(host, "[data-voice-start]") as HTMLButtonElement;
		expect(btn.disabled).toBe(true);
		expect(host.textContent).toContain(t.unsupported);
		btn.click();
		expect(calls).toEqual([]);
	});

	it("pesan galat tampil dan bisa ditutup", () => {
		const { host, calls } = controls({ notice: t.errors.micDenied });
		expect(host.textContent).toContain(t.errors.micDenied);
		(q(host, `[aria-label="${t.dismiss}"]`) as HTMLButtonElement).click();
		expect(calls).toEqual(["dismiss"]);
	});
});

describe("VoiceControlsView — aktif", () => {
	it.each([
		["connecting", t.status.connecting],
		["ready", t.status.ready],
		["listening", t.status.listening],
		["answering", t.status.answering],
	] as const)("status %s ditampilkan dengan ikon mikrofon permanen", (status, label) => {
		const { host } = controls({ status });
		expect(q(host, "[data-voice-status]")?.textContent).toBe(label);
		expect(q(host, "[data-voice-status]")?.getAttribute("aria-live")).toBe(
			"polite",
		);
		expect(q(host, "[data-voice-mic-indicator]")).not.toBeNull();
		expect(q(host, "[data-voice-start]")).toBeNull();
	});

	it("sisa waktu & transkrip user", () => {
		const { host } = controls({
			status: "listening",
			remaining: 125,
			transcript: "berapa jumlah penduduk",
		});
		expect(q(host, "[data-voice-remaining]")?.textContent).toContain("2:05");
		expect(host.textContent).toContain("berapa jumlah penduduk");
	});

	it("tombol Off, mute jawaban, dan mute mikrofon", () => {
		const { host, calls } = controls({ status: "ready" });
		(q(host, "[data-voice-stop]") as HTMLButtonElement).click();
		(q(host, `[aria-label="${t.muteAnswer}"]`) as HTMLButtonElement).click();
		(q(host, `[aria-label="${t.muteMic}"]`) as HTMLButtonElement).click();
		expect(calls).toEqual(["stop", "answer", "mic"]);
	});

	it("status mute tercermin di aria-pressed dan label", () => {
		const { host } = controls({
			status: "ready",
			answerMuted: true,
			micMuted: true,
		});
		const answer = q(host, `[aria-label="${t.unmuteAnswer}"]`);
		const mic = q(host, `button[aria-label="${t.unmuteMic}"]`);
		expect(answer?.getAttribute("aria-pressed")).toBe("true");
		expect(mic?.getAttribute("aria-pressed")).toBe("true");
	});

	it("ajakan perpanjang 1 menit sebelum habis", () => {
		const off = controls({ status: "ready" });
		expect(off.host.textContent).not.toContain(t.extendInvite);
		root?.unmount();
		const { host, calls } = controls({ status: "ready", inviteExtend: true });
		expect(host.textContent).toContain(t.extendInvite);
		const btn = Array.from(host.querySelectorAll("button")).find(
			(b) => b.textContent === t.extend,
		);
		btn?.click();
		expect(calls).toEqual(["extend"]);
	});
});

describe("VoiceConsentBanner", () => {
	it("menjelaskan mikrofon, OpenAI, suara AI; setuju/tolak", () => {
		const calls: string[] = [];
		const host = render(
			<VoiceConsentBanner
				t={t}
				name="Jenna"
				onAccept={() => calls.push("accept")}
				onDecline={() => calls.push("decline")}
			/>,
		);
		const dialog = q(host, "[data-voice-consent]");
		expect(dialog?.getAttribute("role")).toBe("dialog");
		expect(dialog?.textContent).toContain("OpenAI");
		(q(host, "[data-voice-consent-accept]") as HTMLButtonElement).click();
		const decline = Array.from(host.querySelectorAll("button")).find(
			(b) => b.textContent === t.consent.decline,
		);
		decline?.click();
		expect(calls).toEqual(["accept", "decline"]);
	});
});
