import {
	Button,
	Card,
	Container,
	Divider,
	Group,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconChevronLeft, IconEdit } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSnapshot } from "valtio";
import { protectedRouteMiddleware } from "@/middleware/authMiddleware";
import { apiClient } from "@/utils/api-client";
import { authStore } from "../../store/auth";

export const Route = createFileRoute("/profile/edit")({
	component: EditProfile,
	beforeLoad: protectedRouteMiddleware,
});

function EditProfile() {
	const snap = useSnapshot(authStore);
	const navigate = useNavigate();
	const [isUpdating, setIsUpdating] = useState(false);

	const form = useForm({
		initialValues: {
			name: snap.user?.name || "",
			image: snap.user?.image || "",
		},
		validate: {
			name: (value) =>
				value.length < 2 ? "Name must have at least 2 letters" : null,
		},
	});

	const handleUpdateProfile = async (values: typeof form.values) => {
		try {
			setIsUpdating(true);
			const { data, error } = await apiClient.POST("/api/profile/update", {
				body: values,
			});

			if (data?.user) {
				authStore.user = {
					...authStore.user,
					...data.user,
				} as any;
				navigate({ to: "/profile" });
			} else if (error) {
				console.error("Update error:", error);
			}
		} catch (err) {
			console.error("Failed to update profile:", err);
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<Container size="sm" py={50}>
			<Stack gap="xl">
				<Group justify="space-between" align="center">
					<Box>
						<Title order={1} c="orange.6">
							Edit Profil
						</Title>
						<Text c="dimmed" size="sm">
							Perbarui informasi profil publik Anda
						</Text>
					</Box>
					<Button
						variant="subtle"
						color="gray"
						leftSection={<IconChevronLeft size={18} />}
						onClick={() => navigate({ to: "/profile" })}
					>
						Kembali
					</Button>
				</Group>

				<Divider style={{ opacity: 0.1 }} />

				<Card
					withBorder
					radius="md"
					p="xl"
					style={{ border: "1px solid var(--mantine-color-default-border)" }}
				>
					<form onSubmit={form.onSubmit(handleUpdateProfile)}>
						<Stack gap="md">
							<TextInput
								label="Nama Lengkap"
								placeholder="Masukkan nama lengkap Anda"
								{...form.getInputProps("name")}
								styles={{
									label: { marginBottom: 8 },
									input: {
										backgroundColor: "var(--mantine-color-default-soft)",
									},
								}}
							/>
							<TextInput
								label="URL Foto Profil"
								placeholder="https://example.com/photo.jpg"
								{...form.getInputProps("image")}
								styles={{
									label: { marginBottom: 8 },
									input: {
										backgroundColor: "var(--mantine-color-default-soft)",
									},
								}}
							/>
							<Button
								type="submit"
								fullWidth
								mt="lg"
								size="md"
								color="orange"
								loading={isUpdating}
								leftSection={<IconEdit size={18} />}
							>
								Simpan Perubahan
							</Button>
						</Stack>
					</form>
				</Card>
			</Stack>
		</Container>
	);
}

// Need Box from @mantine/core
import { Box } from "@mantine/core";
