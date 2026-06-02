import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	Alert,
	Badge,
	Box,
	Button,
	Card,
	Checkbox,
	Container,
	Divider,
	Group,
	LoadingOverlay,
	Modal,
	Paper,
	SimpleGrid,
	Skeleton,
	Stack,
	Table,
	Text,
	Textarea,
	TextInput,
	ThemeIcon,
	Title,
	Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
	IconAlertCircle,
	IconBrandGithub,
	IconDatabase,
	IconEdit,
	IconEye,
	IconEyeOff,
	IconGripVertical,
	IconKey,
	IconMail,
	IconPlus,
	IconServer,
	IconSettings,
	IconShield,
	IconTrash,
	IconUsers,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { protectedRouteMiddleware } from "../../middleware/authMiddleware";

export const Route = createFileRoute("/admin/settings")({
	beforeLoad: protectedRouteMiddleware,
	component: DashboardSettingsComponent,
});

interface SystemStats {
	userCount: number;
	adminCount: number;
	version: string;
	appName: string;
	environment: string;
}

interface FaqRow {
	id: string;
	question: string;
	answer: string;
	category: string;
	order: number;
	isPublished: boolean;
}

function StatCard({
	icon,
	label,
	value,
	color = "orange",
}: {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
	color?: string;
}) {
	return (
		<Card withBorder p="md" radius="md">
			<Group>
				<ThemeIcon size={40} radius="md" color={color} variant="light">
					{icon}
				</ThemeIcon>
				<Box>
					<Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
						{label}
					</Text>
					<Text component="div" fz="lg" fw={700}>
						{value}
					</Text>
				</Box>
			</Group>
		</Card>
	);
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<Group justify="space-between" py="xs">
			<Text size="sm" c="dimmed">
				{label}
			</Text>
			<Box
				component="span"
				style={{ fontSize: "var(--mantine-font-size-sm)", fontWeight: 500 }}
			>
				{value}
			</Box>
		</Group>
	);
}

function SortableFaqRow({
	faq,
	onEdit,
	onToggle,
	onDelete,
}: {
	faq: FaqRow;
	onEdit: (faq: FaqRow) => void;
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: faq.id });

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		background: isDragging ? "var(--mantine-color-blue-light)" : undefined,
	};

	return (
		<Table.Tr ref={setNodeRef} style={style}>
			<Table.Td>
				<Box
					{...attributes}
					{...listeners}
					style={{
						cursor: "grab",
						display: "inline-flex",
						color: "var(--mantine-color-dimmed)",
					}}
				>
					<IconGripVertical size={16} />
				</Box>
			</Table.Td>
			<Table.Td>
				<Text size="sm" fw={500} lineClamp={2} maw={280}>
					{faq.question}
				</Text>
			</Table.Td>
			<Table.Td>
				<Badge variant="light" color="blue" size="sm">
					{faq.category}
				</Badge>
			</Table.Td>
			<Table.Td>
				<Badge
					variant="light"
					color={faq.isPublished ? "green" : "gray"}
					size="sm"
				>
					{faq.isPublished ? "Dipublikasi" : "Draft"}
				</Badge>
			</Table.Td>
			<Table.Td>
				<Group gap="xs" wrap="nowrap">
					<Tooltip label="Edit">
						<Button
							size="xs"
							variant="subtle"
							color="blue"
							px={6}
							onClick={() => onEdit(faq)}
						>
							<IconEdit size={14} />
						</Button>
					</Tooltip>
					<Tooltip label={faq.isPublished ? "Unpublish" : "Publish"}>
						<Button
							size="xs"
							variant="subtle"
							color={faq.isPublished ? "orange" : "green"}
							px={6}
							onClick={() => onToggle(faq.id)}
						>
							{faq.isPublished ? (
								<IconEyeOff size={14} />
							) : (
								<IconEye size={14} />
							)}
						</Button>
					</Tooltip>
					<Tooltip label="Hapus">
						<Button
							size="xs"
							variant="subtle"
							color="red"
							px={6}
							onClick={() => onDelete(faq.id)}
						>
							<IconTrash size={14} />
						</Button>
					</Tooltip>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
}

function FaqSection() {
	const [faqs, setFaqs] = useState<FaqRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<FaqRow | null>(null);

	const form = useForm({
		initialValues: {
			question: "",
			answer: "",
			category: "Umum",
			isPublished: true,
		},
		validate: {
			question: (v) => (v.trim() ? null : "Pertanyaan wajib diisi"),
			answer: (v) => (v.trim() ? null : "Jawaban wajib diisi"),
			category: (v) => (v.trim() ? null : "Kategori wajib diisi"),
		},
	});

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const fetchFaqs = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/admin/faq", { credentials: "include" });
			const json = (await res.json()) as { data?: FaqRow[]; error?: string };
			if (!res.ok) throw new Error(json.error ?? "Gagal memuat FAQ");
			setFaqs(json.data ?? []);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Gagal memuat FAQ");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchFaqs();
	}, [fetchFaqs]);

	const openAdd = () => {
		setEditTarget(null);
		form.reset();
		setModalOpen(true);
	};

	const openEdit = (faq: FaqRow) => {
		setEditTarget(faq);
		form.setValues({
			question: faq.question,
			answer: faq.answer,
			category: faq.category,
			isPublished: faq.isPublished,
		});
		setModalOpen(true);
	};

	const handleSubmit = async (values: typeof form.values) => {
		setSaving(true);
		setError(null);
		try {
			const url = editTarget
				? `/api/admin/faq/${editTarget.id}`
				: "/api/admin/faq";
			const method = editTarget ? "PUT" : "POST";
			const res = await fetch(url, {
				method,
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});
			const json = (await res.json()) as { error?: string };
			if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan FAQ");
			setModalOpen(false);
			fetchFaqs();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Gagal menyimpan FAQ");
		} finally {
			setSaving(false);
		}
	};

	const handleToggle = async (id: string) => {
		try {
			const res = await fetch(`/api/admin/faq/${id}/toggle`, {
				method: "PATCH",
				credentials: "include",
			});
			if (!res.ok) throw new Error("Gagal mengubah status");
			setFaqs((prev) =>
				prev.map((f) =>
					f.id === id ? { ...f, isPublished: !f.isPublished } : f,
				),
			);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Gagal mengubah status FAQ");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Hapus FAQ ini?")) return;
		try {
			const res = await fetch(`/api/admin/faq/${id}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!res.ok) throw new Error("Gagal menghapus FAQ");
			setFaqs((prev) => prev.filter((f) => f.id !== id));
		} catch (e) {
			setError(e instanceof Error ? e.message : "Gagal menghapus FAQ");
		}
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = faqs.findIndex((f) => f.id === active.id);
		const newIndex = faqs.findIndex((f) => f.id === over.id);
		const reordered = arrayMove(faqs, oldIndex, newIndex).map((f, i) => ({
			...f,
			order: i,
		}));
		setFaqs(reordered);

		try {
			await fetch("/api/admin/faq/reorder", {
				method: "PUT",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					items: reordered.map(({ id, order }) => ({ id, order })),
				}),
			});
		} catch {
			setError("Gagal menyimpan urutan FAQ");
			fetchFaqs();
		}
	};

	return (
		<Card withBorder p="lg" radius="md" mt="md">
			<Group justify="space-between" mb="md">
				<Group gap="xs">
					<ThemeIcon size={32} radius="md" color="violet" variant="light">
						<IconSettings size={18} />
					</ThemeIcon>
					<Title order={4}>Manajemen FAQ</Title>
				</Group>
				<Button
					size="xs"
					leftSection={<IconPlus size={14} />}
					onClick={openAdd}
					variant="light"
					color="violet"
				>
					Tambah FAQ
				</Button>
			</Group>
			<Divider mb="md" />

			{error && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color="red"
					mb="md"
					withCloseButton
					onClose={() => setError(null)}
				>
					{error}
				</Alert>
			)}

			<Box style={{ position: "relative" }}>
				<LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
				{!loading && faqs.length === 0 ? (
					<Stack align="center" py="xl" gap="xs">
						<Text c="dimmed" size="sm">
							Belum ada FAQ. Klik "Tambah FAQ" untuk membuat yang pertama.
						</Text>
					</Stack>
				) : (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={faqs.map((f) => f.id)}
							strategy={verticalListSortingStrategy}
						>
							<Paper withBorder radius="md" style={{ overflow: "hidden" }}>
								<Table striped highlightOnHover verticalSpacing="sm">
									<Table.Thead>
										<Table.Tr>
											<Table.Th w={36} />
											<Table.Th>Pertanyaan</Table.Th>
											<Table.Th w={120}>Kategori</Table.Th>
											<Table.Th w={120}>Status</Table.Th>
											<Table.Th w={120}>Aksi</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{faqs.map((faq) => (
											<SortableFaqRow
												key={faq.id}
												faq={faq}
												onEdit={openEdit}
												onToggle={handleToggle}
												onDelete={handleDelete}
											/>
										))}
									</Table.Tbody>
								</Table>
							</Paper>
						</SortableContext>
					</DndContext>
				)}
			</Box>

			<Modal
				opened={modalOpen}
				onClose={() => setModalOpen(false)}
				title={editTarget ? "Edit FAQ" : "Tambah FAQ"}
				size="lg"
				centered
			>
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<Stack gap="sm">
						<TextInput
							label="Kategori"
							placeholder="Umum, Teknis, Akun, ..."
							required
							{...form.getInputProps("category")}
						/>
						<TextInput
							label="Pertanyaan"
							placeholder="Apa yang ingin ditanyakan?"
							required
							{...form.getInputProps("question")}
						/>
						<Textarea
							label="Jawaban"
							placeholder="Tuliskan jawaban lengkap..."
							required
							autosize
							minRows={4}
							maxRows={10}
							{...form.getInputProps("answer")}
						/>
						<Checkbox
							label="Publikasikan langsung"
							{...form.getInputProps("isPublished", { type: "checkbox" })}
						/>
						<Group justify="flex-end" mt="xs">
							<Button
								variant="subtle"
								onClick={() => setModalOpen(false)}
								disabled={saving}
							>
								Batal
							</Button>
							<Button type="submit" loading={saving} color="violet">
								{editTarget ? "Simpan Perubahan" : "Tambah FAQ"}
							</Button>
						</Group>
					</Stack>
				</form>
			</Modal>
		</Card>
	);
}

function DashboardSettingsComponent() {
	const [stats, setStats] = useState<SystemStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/admin/stats", { credentials: "include" });
				if (!res.ok) throw new Error("Gagal memuat data sistem");
				const data = await res.json();
				setStats(data);
			} catch {
				setError("Gagal memuat informasi sistem");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<Container size="lg" py="xl">
			<Stack gap={2} mb="xl">
				<Title order={2}>Pengaturan Sistem</Title>
				<Text size="sm" c="dimmed">
					Informasi konfigurasi, status aplikasi, dan manajemen FAQ
				</Text>
			</Stack>

			{error && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color="red"
					mb="md"
					withCloseButton
					onClose={() => setError(null)}
				>
					{error}
				</Alert>
			)}

			{/* Stats cards */}
			<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="xl">
				{loading ? (
					Array.from({ length: 4 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
						<Skeleton key={i} height={80} radius="md" />
					))
				) : (
					<>
						<StatCard
							icon={<IconUsers size={20} />}
							label="Total Pengguna"
							value={stats?.userCount ?? 0}
							color="blue"
						/>
						<StatCard
							icon={<IconShield size={20} />}
							label="Administrator"
							value={stats?.adminCount ?? 0}
							color="orange"
						/>
						<StatCard
							icon={<IconServer size={20} />}
							label="Versi Aplikasi"
							value={`v${stats?.version ?? "-"}`}
							color="teal"
						/>
						<StatCard
							icon={<IconDatabase size={20} />}
							label="Environment"
							value={
								<Badge
									color={
										stats?.environment === "production" ? "green" : "yellow"
									}
									variant="light"
								>
									{stats?.environment ?? "-"}
								</Badge>
							}
							color="violet"
						/>
					</>
				)}
			</SimpleGrid>

			{/* App info */}
			<Card withBorder p="lg" radius="md" mb="md">
				<Group mb="md">
					<ThemeIcon size={32} radius="md" color="orange" variant="light">
						<IconSettings size={18} />
					</ThemeIcon>
					<Title order={4}>Informasi Aplikasi</Title>
				</Group>
				<Divider mb="sm" />
				{loading ? (
					<Stack gap="xs">
						{Array.from({ length: 3 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
							<Skeleton key={i} height={24} />
						))}
					</Stack>
				) : (
					<>
						<InfoRow label="Nama Aplikasi" value={stats?.appName ?? "-"} />
						<Divider variant="dashed" />
						<InfoRow label="Versi" value={`v${stats?.version ?? "-"}`} />
						<Divider variant="dashed" />
						<InfoRow
							label="Environment"
							value={
								<Badge
									color={
										stats?.environment === "production" ? "green" : "yellow"
									}
									variant="light"
								>
									{stats?.environment ?? "-"}
								</Badge>
							}
						/>
					</>
				)}
			</Card>

			{/* Auth providers */}
			<Card withBorder p="lg" radius="md" mb="md">
				<Group mb="md">
					<ThemeIcon size={32} radius="md" color="blue" variant="light">
						<IconKey size={18} />
					</ThemeIcon>
					<Title order={4}>Provider Autentikasi</Title>
				</Group>
				<Divider mb="sm" />
				<InfoRow
					label="Email & Password"
					value={
						<Group gap="xs">
							<IconMail size={14} />
							<Badge color="green" variant="light">
								Aktif
							</Badge>
						</Group>
					}
				/>
				<Divider variant="dashed" />
				<InfoRow
					label="GitHub OAuth"
					value={
						<Group gap="xs">
							<IconBrandGithub size={14} />
							<Badge color="green" variant="light">
								Aktif
							</Badge>
						</Group>
					}
				/>
			</Card>

			{/* Session config */}
			<Card withBorder p="lg" radius="md" mb="md">
				<Group mb="md">
					<ThemeIcon size={32} radius="md" color="teal" variant="light">
						<IconShield size={18} />
					</ThemeIcon>
					<Title order={4}>Konfigurasi Sesi</Title>
				</Group>
				<Divider mb="sm" />
				<InfoRow label="Durasi Sesi" value="7 hari" />
				<Divider variant="dashed" />
				<InfoRow label="Cookie Cache" value="Aktif (1 jam)" />
				<Divider variant="dashed" />
				<InfoRow label="Trust Proxy" value="Aktif" />
			</Card>

			{/* FAQ Management */}
			<FaqSection />
		</Container>
	);
}
