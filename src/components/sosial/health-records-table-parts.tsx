import {
	Center,
	Group,
	Pagination,
	Skeleton,
	Stack,
	Table,
	Text,
} from "@mantine/core";
import type { ReactNode } from "react";

/** Placeholder tabel saat data riwayat kesehatan dimuat. */
export function TableSkeleton() {
	return (
		<Stack gap="xs">
			{Array.from({ length: 6 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static list
				<Skeleton key={i} height={40} radius="md" />
			))}
		</Stack>
	);
}

/** Ikon + pesan saat tab tidak punya data. */
export function EmptyState({
	icon,
	message,
}: {
	icon: ReactNode;
	message: string;
}) {
	return (
		<Center py="xl">
			<Stack align="center" gap="xs">
				{icon}
				<Text c="dimmed" size="sm">
					{message}
				</Text>
			</Stack>
		</Center>
	);
}

function tableStyles(dark: boolean) {
	return {
		th: {
			color: dark ? "#94A3B8" : "#64748B",
			fontSize: 12,
			fontWeight: 600,
			textTransform: "uppercase" as const,
			letterSpacing: "0.05em",
			borderBottom: "1px solid var(--app-border)",
			paddingBottom: 8,
		},
		td: {
			borderBottom: "1px solid var(--app-card)",
			color: "var(--app-text)",
		},
	};
}

/** Tabel ber-scroll horizontal dengan gaya standar riwayat kesehatan. */
export function HealthTable({
	minWidth,
	dark,
	children,
}: {
	minWidth: number;
	dark: boolean;
	children: ReactNode;
}) {
	return (
		<Table.ScrollContainer minWidth={minWidth}>
			<Table
				highlightOnHover
				withTableBorder={false}
				withColumnBorders={false}
				styles={tableStyles(dark)}
			>
				{children}
			</Table>
		</Table.ScrollContainer>
	);
}

/** Jumlah data + paginasi (disembunyikan bila hanya satu halaman). */
export function PagerFooter({
	total,
	totalPages,
	page,
	onChange,
}: {
	total: number;
	totalPages: number;
	page: number;
	onChange: (p: number) => void;
}) {
	return (
		<Group justify="space-between" align="center">
			<Text size="xs" c="dimmed">
				{total} data ditemukan
			</Text>
			{totalPages > 1 && (
				<Pagination
					value={page}
					onChange={onChange}
					total={totalPages}
					size="sm"
					radius="md"
				/>
			)}
		</Group>
	);
}
