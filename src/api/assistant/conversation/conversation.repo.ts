import { prisma } from "@/utils/db";

/**
 * Akses percakapan assistant. SETIAP fungsi menerima `userId` dari sesi dan
 * memfilter dengannya — id percakapan milik user lain diperlakukan seperti
 * tidak ada (null/false), tidak pernah dibaca atau diubah.
 */

export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 50;
export const TITLE_MAX_CHARS = 60;
export const DEFAULT_TITLE = "Percakapan baru";

export type MessageRole = "user" | "assistant";
export type MessageStatus = "ok" | "error" | "limited";

export interface NewMessage {
	role: MessageRole;
	content: string;
	toolsUsed?: string[];
	pageRoute?: string | null;
	status?: MessageStatus;
	inputTokens?: number | null;
	outputTokens?: number | null;
	latencyMs?: number | null;
}

export interface PageOptions {
	limit?: number;
	/** id item terakhir dari halaman sebelumnya. */
	cursor?: string;
}

export interface Page<T> {
	items: T[];
	nextCursor: string | null;
}

const conversationSelect = {
	id: true,
	title: true,
	createdAt: true,
	updatedAt: true,
} as const;

const messageSelect = {
	id: true,
	role: true,
	content: true,
	toolsUsed: true,
	pageRoute: true,
	status: true,
	createdAt: true,
} as const;

function pageSize(limit: number | undefined): number {
	if (!limit || limit < 1) return PAGE_SIZE_DEFAULT;
	return Math.min(Math.floor(limit), PAGE_SIZE_MAX);
}

function toPage<T extends { id: string }>(rows: T[], size: number): Page<T> {
	const items = rows.slice(0, size);
	return {
		items,
		nextCursor:
			rows.length > size ? (items[items.length - 1]?.id ?? null) : null,
	};
}

/** Judul dari potongan pesan pertama (satu baris, maks 60 karakter). */
export function deriveTitle(firstMessage: string): string {
	const line = firstMessage.replace(/\s+/g, " ").trim();
	if (!line) return DEFAULT_TITLE;
	return line.length > TITLE_MAX_CHARS
		? `${line.slice(0, TITLE_MAX_CHARS - 1)}…`
		: line;
}

export function createConversation(userId: string, title?: string) {
	return prisma.assistantConversation.create({
		data: { userId, title: title ? deriveTitle(title) : DEFAULT_TITLE },
		select: conversationSelect,
	});
}

/** Percakapan milik user, terbaru dulu (updatedAt desc), berhalaman. */
export async function listConversations(
	userId: string,
	opts: PageOptions = {},
) {
	const size = pageSize(opts.limit);
	if (opts.cursor && !(await getConversation(userId, opts.cursor))) {
		return { items: [], nextCursor: null };
	}
	const rows = await prisma.assistantConversation.findMany({
		where: { userId },
		orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
		take: size + 1,
		...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
		select: conversationSelect,
	});
	return toPage(rows, size);
}

export function getConversation(userId: string, conversationId: string) {
	return prisma.assistantConversation.findFirst({
		where: { id: conversationId, userId },
		select: conversationSelect,
	});
}

/** Pesan percakapan untuk tampilan, terbaru dulu, berhalaman; null bila bukan milik user. */
export async function listMessages(
	userId: string,
	conversationId: string,
	opts: PageOptions = {},
) {
	if (!(await getConversation(userId, conversationId))) return null;
	const size = pageSize(opts.limit);
	const rows = await prisma.assistantMessage.findMany({
		where: { conversationId, userId },
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		take: size + 1,
		...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
		select: messageSelect,
	});
	return toPage(rows, size);
}

/** Riwayat untuk LLM: `take` pesan terakhir berstatus ok, urut lama → baru; undefined = semua. */
export async function getRecentMessages(
	userId: string,
	conversationId: string,
	take?: number,
): Promise<Array<{ role: MessageRole; content: string }>> {
	const rows = await prisma.assistantMessage.findMany({
		where: { conversationId, userId, status: "ok" },
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		take,
		select: { role: true, content: true },
	});
	return rows.reverse().map((r) => ({
		role: r.role === "assistant" ? "assistant" : "user",
		content: r.content,
	}));
}

/** Simpan pesan & sentuh updatedAt percakapan; false bila percakapan bukan milik user. */
export async function appendMessages(
	userId: string,
	conversationId: string,
	messages: NewMessage[],
): Promise<boolean> {
	// createdAt diisi eksplisit (+1 ms per pesan): now() Postgres konstan dalam
	// satu transaksi, padahal urutan user → assistant harus terjaga.
	const base = Date.now();
	return prisma.$transaction(async (tx) => {
		const touched = await tx.assistantConversation.updateMany({
			where: { id: conversationId, userId },
			data: { updatedAt: new Date(base) },
		});
		if (touched.count === 0) return false;
		await tx.assistantMessage.createMany({
			data: messages.map((m, i) => ({
				conversationId,
				userId,
				role: m.role,
				content: m.content,
				toolsUsed: m.toolsUsed ?? [],
				pageRoute: m.pageRoute ?? null,
				status: m.status ?? "ok",
				inputTokens: m.inputTokens ?? null,
				outputTokens: m.outputTokens ?? null,
				latencyMs: m.latencyMs ?? null,
				createdAt: new Date(base + i),
			})),
		});
		return true;
	});
}

export async function renameConversation(
	userId: string,
	conversationId: string,
	title: string,
): Promise<boolean> {
	const res = await prisma.assistantConversation.updateMany({
		where: { id: conversationId, userId },
		data: { title: deriveTitle(title) },
	});
	return res.count > 0;
}

/** Hapus percakapan (pesan ikut terhapus lewat cascade). */
export async function deleteConversation(
	userId: string,
	conversationId: string,
): Promise<boolean> {
	const res = await prisma.assistantConversation.deleteMany({
		where: { id: conversationId, userId },
	});
	return res.count > 0;
}
