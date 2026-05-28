import {
	Alert,
	Button,
	Checkbox,
	Group,
	Modal,
	PasswordInput,
	Stack,
	Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { IconCheck, IconLock, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { authClient } from "@/utils/auth-client";

interface Props {
	opened: boolean;
	onClose: () => void;
}

export function UbahPasswordModal({ opened, onClose }: Props) {
	const isMobile = useMediaQuery("(max-width: 48em)");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const { log } = useActivityLogger();

	const form = useForm({
		initialValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
			revokeOtherSessions: true,
		},
		validate: {
			currentPassword: (v) =>
				v.length < 1 ? "Password saat ini wajib diisi" : null,
			newPassword: (v) =>
				v.length < 8 ? "Password baru minimal 8 karakter" : null,
			confirmPassword: (v, values) =>
				v !== values.newPassword ? "Konfirmasi password tidak cocok" : null,
		},
	});

	const handleClose = () => {
		form.reset();
		setResult(null);
		onClose();
	};

	const handleSubmit = form.onSubmit(async (values) => {
		setLoading(true);
		setResult(null);
		try {
			const res = await authClient.changePassword({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
				revokeOtherSessions: values.revokeOtherSessions,
			});
			if (res.error) {
				const msg =
					res.error.code === "INVALID_PASSWORD"
						? "Password saat ini salah"
						: (res.error.message ?? "Gagal mengubah password");
				setResult({ type: "error", message: msg });
			} else {
				setResult({ type: "success", message: "Password berhasil diubah" });
				log(
					"ubah-password",
					values.revokeOtherSessions ? "Revoke sesi lain aktif" : undefined,
				);
				form.reset();
			}
		} catch {
			setResult({ type: "error", message: "Terjadi kesalahan, coba lagi" });
		} finally {
			setLoading(false);
		}
	});

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap="xs">
					<IconLock size={18} />
					<Text fw={700}>Ubah Password</Text>
				</Group>
			}
			radius="lg"
			size="sm"
			fullScreen={!!isMobile}
		>
			<form onSubmit={handleSubmit}>
				<Stack gap="md">
					{result && (
						<Alert
							color={result.type === "success" ? "green" : "red"}
							icon={
								result.type === "success" ? (
									<IconCheck size={16} />
								) : (
									<IconX size={16} />
								)
							}
							radius="md"
							withCloseButton
							onClose={() => setResult(null)}
						>
							{result.message}
						</Alert>
					)}

					<PasswordInput
						label="Password Saat Ini"
						placeholder="Masukkan password saat ini"
						radius="md"
						styles={{ input: { minHeight: "44px" } }}
						{...form.getInputProps("currentPassword")}
					/>
					<PasswordInput
						label="Password Baru"
						placeholder="Minimal 8 karakter"
						radius="md"
						styles={{ input: { minHeight: "44px" } }}
						{...form.getInputProps("newPassword")}
					/>
					<PasswordInput
						label="Konfirmasi Password Baru"
						placeholder="Ulangi password baru"
						radius="md"
						styles={{ input: { minHeight: "44px" } }}
						{...form.getInputProps("confirmPassword")}
					/>
					<Checkbox
						label="Logout dari semua sesi lain setelah ganti password"
						{...form.getInputProps("revokeOtherSessions", { type: "checkbox" })}
					/>

					<Group justify="flex-end" gap="sm">
						<Button
							variant="default"
							radius="md"
							onClick={handleClose}
							disabled={loading}
						>
							Batal
						</Button>
						<Button
							type="submit"
							loading={loading}
							radius="md"
							variant="gradient"
							gradient={{ from: "blue", to: "cyan" }}
							leftSection={<IconLock size={16} />}
						>
							Simpan Password
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
