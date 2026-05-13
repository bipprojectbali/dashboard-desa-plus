import {
	Anchor,
	Box,
	Button,
	Checkbox,
	Container,
	Group,
	Modal,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { IconBrandGithub, IconClock, IconShieldCheck } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../utils/auth-client";

export const Route = createFileRoute("/signin")({
	validateSearch: (search: Record<string, unknown>) => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
	component: SigninComponent,
});

function SigninComponent() {
	const navigate = useNavigate();
	const { redirect } = Route.useSearch();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [pendingModal, setPendingModal] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const result = await authClient.signIn.email(
				{ email, password },
				{
					onSuccess: async () => {
						// Cek status verifikasi sebelum redirect
						const res = await fetch("/api/session");
						const json = await res.json();
						const user = json?.data?.user;

						if (user && user.emailVerified === false) {
							// Sign out dulu agar session tidak aktif
							await authClient.signOut();
							setPendingModal(true);
							return;
						}

						const destination = redirect
							? new URL(redirect, window.location.origin).pathname
							: "/";
						navigate({ to: destination, replace: true });
					},
					onError: (ctx) => {
						setError(ctx.error.message || "Gagal masuk");
					},
				},
			);

			if (result?.error) {
				setError(result.error.message || "Gagal masuk");
			}
		} catch {
			setError("Terjadi kesalahan yang tidak terduga");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container size={420} my={40}>
			<Modal
				opened={pendingModal}
				onClose={() => setPendingModal(false)}
				centered
				withCloseButton={false}
				radius="lg"
				padding="xl"
			>
				<Stack align="center" gap="md">
					<ThemeIcon size={64} radius="xl" variant="light" color="orange">
						<IconClock size={32} />
					</ThemeIcon>
					<Title order={3} ta="center">
						Menunggu Verifikasi Admin
					</Title>
					<Text c="dimmed" ta="center" fz="sm">
						Akun kamu sudah terdaftar, tetapi belum diverifikasi oleh
						administrator. Silakan hubungi admin untuk mengaktifkan akun kamu.
					</Text>
					<Box
						p="sm"
						style={{
							background: "var(--mantine-color-orange-0)",
							borderRadius: "var(--mantine-radius-md)",
							border: "1px solid var(--mantine-color-orange-3)",
							width: "100%",
						}}
					>
						<Group gap="xs" justify="center">
							<IconShieldCheck size={16} color="var(--mantine-color-orange-6)" />
							<Text fz="xs" c="orange.7" fw={500}>
								Admin akan memverifikasi akun kamu secepatnya
							</Text>
						</Group>
					</Box>
					<Button
						fullWidth
						radius="md"
						variant="light"
						color="orange"
						onClick={() => setPendingModal(false)}
					>
						Mengerti
					</Button>
				</Stack>
			</Modal>

			<Title ta="center" c="dimmed">
				Welcome back!
			</Title>
			<Text c="dimmed" size="sm" ta="center" mt={5}>
				Do not have an account yet?{" "}
				<Anchor
					size="sm"
					component="button"
					onClick={() => navigate({ to: "/signup" })}
				>
					Create account
				</Anchor>
			</Text>

			<Paper withBorder shadow="md" p={30} mt={30} radius="md">
				<form onSubmit={handleSubmit}>
					<TextInput
						label="Email"
						placeholder="your@email.com"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<PasswordInput
						label="Password"
						placeholder="Your password"
						required
						mt="md"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<Checkbox label="Remember me" mt="md" />
					{error && (
						<Text c="red" size="sm" mt="md">
							{error}
						</Text>
					)}
					<Button fullWidth mt="xl" type="submit" loading={loading}>
						Sign in
					</Button>
				</form>

				<Button
					variant="outline"
					fullWidth
					mt="md"
					leftSection={<IconBrandGithub size={18} />}
					onClick={async () => {
						await authClient.signIn.social({
							provider: "github",
							callbackURL: redirect
								? new URL(redirect, window.location.origin).pathname
								: "/",
						});
					}}
				>
					Continue with GitHub
				</Button>
			</Paper>
		</Container>
	);
}
