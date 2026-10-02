import {
	Anchor,
	Blockquote,
	Box,
	Code,
	Divider,
	List,
	Stack,
	Table,
	Text,
	Title,
} from "@mantine/core";
import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface HastNode {
	value?: string;
	children?: HastNode[];
}

const nodeText = (n: HastNode | undefined): string =>
	n ? (n.value ?? (n.children ?? []).map(nodeText).join("")) : "";

const heading = (order: 4 | 5 | 6) =>
	function Heading({ children }: { children?: ReactNode }) {
		return (
			<Title order={order} fz="sm">
				{children}
			</Title>
		);
	};

/**
 * Komponen Mantine untuk tiap elemen markdown. Tanpa `rehype-raw` (HTML mentah
 * tidak pernah menjadi elemen) dan gambar dibuang jadi teks alt, agar jawaban
 * model tidak bisa memuat sumber luar / pelacak.
 */
const COMPONENTS: Components = {
	p: ({ children }) => <Text size="sm">{children}</Text>,
	h1: heading(4),
	h2: heading(4),
	h3: heading(5),
	h4: heading(5),
	h5: heading(6),
	h6: heading(6),
	ul: ({ children }) => (
		<List size="sm" spacing={2} withPadding>
			{children}
		</List>
	),
	ol: ({ children }) => (
		<List type="ordered" size="sm" spacing={2} withPadding>
			{children}
		</List>
	),
	li: ({ children }) => <List.Item>{children}</List.Item>,
	a: ({ href, children }) =>
		href ? (
			<Anchor
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				size="sm"
				style={{ wordBreak: "break-all" }}
			>
				{children}
			</Anchor>
		) : (
			<span>{children}</span>
		),
	img: ({ alt }) => <span>{alt}</span>,
	code: ({ children }) => <Code>{children}</Code>,
	pre: ({ node }) => (
		<Code block style={{ overflowX: "auto" }}>
			{nodeText(node as HastNode | undefined).replace(/\n$/, "")}
		</Code>
	),
	blockquote: ({ children }) => (
		<Blockquote p="xs" fz="sm" color="gray">
			{children}
		</Blockquote>
	),
	hr: () => <Divider />,
	table: ({ children }) => (
		<Box style={{ overflowX: "auto", maxWidth: "100%" }}>
			<Table fz="xs" withTableBorder withColumnBorders>
				{children}
			</Table>
		</Box>
	),
	thead: ({ children }) => <Table.Thead>{children}</Table.Thead>,
	tbody: ({ children }) => <Table.Tbody>{children}</Table.Tbody>,
	tr: ({ children }) => <Table.Tr>{children}</Table.Tr>,
	th: ({ children, style }) => <Table.Th style={style}>{children}</Table.Th>,
	td: ({ children, style }) => <Table.Td style={style}>{children}</Table.Td>,
};

/** Render markdown (GFM) balasan asisten dengan komponen Mantine; HTML mentah tidak dirender. */
export function AssistantMarkdown({ source }: { source: string }) {
	return (
		<Stack gap={6} style={{ wordBreak: "break-word" }}>
			<ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
				{source}
			</ReactMarkdown>
		</Stack>
	);
}
