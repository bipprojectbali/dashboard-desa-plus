import { describe, expect, it } from "bun:test";
import { parse } from "@babel/parser";
import { injectInspectorAttributes } from "@/utils/dev-inspector-plugin";

const FILE = "src/components/example.tsx"; // test-only

const parseTsx = (code: string) =>
	parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });

// Plugin dev ini berjalan sebelum Babel (enforce: "pre"); bila salah
// menganggap generic arrow sebagai tag JSX, Vite gagal mem-parse file.
describe("injectInspectorAttributes", () => {
	it("menyisipkan atribut inspector ke tag JSX", () => {
		const out = injectInspectorAttributes("const a = <div>hi</div>;", FILE);
		expect(out).toContain(
			`<div data-inspector-line="1" data-inspector-column="11" data-inspector-relative-path="${FILE}">`,
		);
	});

	it("menyisipkan atribut ke tag komponen bertitik", () => {
		const out = injectInspectorAttributes(
			"return <item.icon size={16} />;",
			FILE,
		);
		expect(out).toContain('<item.icon data-inspector-line="1"');
	});

	it("tidak mengubah generic arrow dengan constraint extends", () => {
		const code = [
			"const set = <K extends keyof Dto>(",
			"\tkey: K,",
			"\tvalue: Dto[K],",
			") => {",
			"\tsetSaved(false);",
			"};",
		].join("\n");
		expect(injectInspectorAttributes(code, FILE)).toBeNull();
	});

	it("tidak mengubah generic arrow bentuk trailing comma <T,>", () => {
		expect(
			injectInspectorAttributes("const id = <T,>(v: T) => v;", FILE),
		).toBeNull();
	});

	it("tidak mengubah generic pada pemanggilan fungsi", () => {
		expect(
			injectInspectorAttributes(
				"const [a] = useState<string | null>(null);",
				FILE,
			),
		).toBeNull();
	});

	it("hasil transform komponen dengan generic arrow + JSX tetap valid TSX", () => {
		const code = [
			"export function Form() {",
			"\tconst set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {",
			"\t\tsetMessage(null);",
			"\t};",
			"\treturn <Button onClick={() => set('a', 1)}>Simpan</Button>;",
			"}",
		].join("\n");
		const out = injectInspectorAttributes(code, FILE);
		expect(out).not.toBeNull();
		expect(out).toContain('<Button data-inspector-line="5"');
		expect(out).toContain("const set = <K extends keyof typeof form>(");
		expect(() => parseTsx(out ?? "")).not.toThrow();
	});
});
