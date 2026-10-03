import {
	ActionIcon,
	Alert,
	Button,
	FileButton,
	Grid,
	Group,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
} from "@mantine/core";
import { IconCheck, IconPaperclip, IconSend, IconX } from "@tabler/icons-react";
import { useTranslate } from "@/hooks/useTranslate";
import { HelpSectionLabel } from "./help-section-label";
import {
	canSubmitTicket,
	isScreenshotAccepted,
	TICKET_CATEGORY_OPTIONS,
} from "./support-ticket.logic";
import { useSupportTicket } from "./use-support-ticket";

/** Form kirim tiket dukungan (nama, email, kategori, deskripsi, screenshot opsional). */
export function HelpTicketForm({ dark }: { dark: boolean }) {
	const t = useTranslate();
	const ticket = useSupportTicket();
	const { fields, file, status } = ticket;

	return (
		<>
			<HelpSectionLabel dark={dark} mb="sm">
				Kirim Tiket Dukungan
			</HelpSectionLabel>

			<Stack gap="xs">
				{status === "ok" && (
					<Alert
						color="green"
						icon={<IconCheck size={14} />}
						withCloseButton
						onClose={() => ticket.setStatus("idle")}
						py="xs"
						radius="md"
					>
						{t.help.tiketTerkirim}
					</Alert>
				)}
				{status === "error" && (
					<Alert
						color="red"
						icon={<IconX size={14} />}
						withCloseButton
						onClose={() => ticket.setStatus("idle")}
						py="xs"
						radius="md"
					>
						{t.help.tiketGagal}
					</Alert>
				)}

				<Grid gutter="xs">
					<Grid.Col span={6}>
						<TextInput
							label={t.help.formNama}
							placeholder="Nama Anda"
							value={fields.nama}
							onChange={(e) => ticket.setNama(e.target.value)}
							size="sm"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<TextInput
							label={t.help.formEmail}
							placeholder="email@contoh.com"
							type="email"
							value={fields.email}
							onChange={(e) => ticket.setEmail(e.target.value)}
							size="sm"
						/>
					</Grid.Col>
				</Grid>

				<Select
					label={t.help.formKategori}
					placeholder="Pilih kategori masalah"
					data={TICKET_CATEGORY_OPTIONS}
					value={fields.kategori}
					onChange={ticket.setKategori}
					size="sm"
				/>

				<Textarea
					label={t.help.formDeskripsi}
					placeholder="Jelaskan masalah yang Anda alami secara detail..."
					minRows={3}
					maxRows={5}
					value={fields.deskripsi}
					onChange={(e) => ticket.setDeskripsi(e.target.value)}
					size="sm"
				/>

				<Group gap="xs" align="center" wrap="nowrap">
					<FileButton
						onChange={(picked) => {
							if (!isScreenshotAccepted(picked)) return;
							ticket.setFile(picked);
						}}
						accept="image/png,image/jpeg"
					>
						{(props) => (
							<Button
								{...props}
								variant="default"
								size="xs"
								leftSection={<IconPaperclip size={13} />}
								style={{ flexShrink: 0 }}
							>
								{file ? file.name : t.help.formScreenshot}
							</Button>
						)}
					</FileButton>
					{file && (
						<ActionIcon
							size="sm"
							variant="subtle"
							color="red"
							onClick={() => ticket.setFile(null)}
							aria-label="Hapus file"
						>
							<IconX size={12} />
						</ActionIcon>
					)}
					<Text size="xs" c="dimmed">
						{t.help.formScreenshotHint}
					</Text>
				</Group>

				<Button
					fullWidth
					leftSection={<IconSend size={15} />}
					loading={ticket.sending}
					disabled={!canSubmitTicket(fields)}
					onClick={() => void ticket.submit()}
					size="sm"
					mt={4}
					style={{
						background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
					}}
				>
					{t.help.kirimTiket}
				</Button>
			</Stack>
		</>
	);
}
