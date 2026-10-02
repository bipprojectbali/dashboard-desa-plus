import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MantineProvider } from "@mantine/core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AssistantMarkdown } from "@/components/assistant/assistant-markdown";

/** Render markdown balasan asisten: format tampil, HTML mentah & tautan berbahaya tidak lolos. */

const render = (source: string) =>
	renderToStaticMarkup(
		createElement(
			MantineProvider,
			null,
			createElement(AssistantMarkdown, { source }),
		),
	);

describe("AssistantMarkdown — format", () => {
	it("**tebal** → <strong>", () => {
		expect(render("halo **penting** ya")).toContain("<strong>penting</strong>");
	});

	it("daftar - → <li> dalam <ul>, daftar angka → <ol>", () => {
		const ul = render("- satu\n- dua");
		expect(ul).toContain("<ul");
		expect(ul.match(/<li/g)?.length).toBe(2);
		expect(render("1. a\n2. b")).toContain("<ol");
	});

	it("tabel GFM → <table> dibungkus wadah yang bisa digulir horizontal", () => {
		const html = render("| a | b |\n|---|---|\n| 1 | 2 |");
		expect(html).toContain("<table");
		expect(html).toContain("<th");
		expect(html).toContain("<td");
		expect(html).toMatch(/overflow-x:\s*auto[^>]*><table/);
	});

	it("kode inline dan blok kode", () => {
		expect(render("pakai `x` saja")).toContain("<code");
		const block = render("```\nbaris 1\nbaris 2\n```");
		expect(block).toContain("<pre");
		expect(block).toContain("baris 1\nbaris 2");
	});

	it("judul markdown → judul kecil (bukan h1 halaman)", () => {
		const html = render("# Judul");
		expect(html).not.toContain("<h1");
		expect(html).toContain("Judul");
	});
});

describe("AssistantMarkdown — keamanan", () => {
	it("<script> dan HTML mentah tidak menjadi elemen", () => {
		const html = render(
			'<script>alert(1)</script> <img src=x onerror="alert(2)"> <b>x</b>',
		);
		expect(html).not.toContain("<script");
		expect(html).not.toContain("<img");
		expect(html).not.toContain("<b>");
	});

	it("tautan javascript: dinetralkan (tanpa href berbahaya, bukan <a>)", () => {
		const html = render("[klik](javascript:alert(1))");
		expect(html).not.toContain("javascript:");
		expect(html).not.toContain("<a");
		expect(html).toContain("klik");
	});

	it("tautan https dibuka di tab baru dengan rel aman", () => {
		const html = render("[desa](https://example.com/x)");
		expect(html).toContain('href="https://example.com/x"');
		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener noreferrer"');
	});

	it("gambar markdown tidak dimuat (hanya teks alt)", () => {
		const html = render("![logo](https://evil.test/p.png)");
		expect(html).not.toContain("<img");
		expect(html).not.toContain("evil.test");
		expect(html).toContain("logo");
	});
});

describe("bubble pesan memakai renderer", () => {
	const list = readFileSync(
		join(
			import.meta.dir,
			"../../../src/components/assistant/assistant-message-list.tsx",
		),
		"utf8",
	);

	it("hanya bubble asisten yang dirender markdown; user tetap teks biasa", () => {
		expect(list).toContain("<AssistantMarkdown source={bubble.content} />");
		expect(list).toMatch(/mine \? \(\s*<Text/);
	});

	it("tombol salin tetap menyalin teks asli (markdown)", () => {
		expect(list).toContain("<CopyButton value={bubble.content}>");
	});
});
