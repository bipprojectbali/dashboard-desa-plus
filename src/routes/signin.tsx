import {
	Anchor,
	Box,
	Button,
	Checkbox,
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
import {
	IconArrowRight,
	IconBrandGithub,
	IconBrandGoogle,
	IconChartBar,
	IconClock,
	IconLock,
	IconMail,
	IconMapPin,
	IconShieldCheck,
	IconUsers,
} from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../utils/auth-client";

export const Route = createFileRoute("/signin")({
	validateSearch: (search: Record<string, unknown>) => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
	component: SigninComponent,
});

const FEATURES = [
	{
		icon: IconChartBar,
		title: "Data Real-Time",
		desc: "APBDes, kinerja divisi, dan laporan tersedia kapan saja",
		accent: "#60A5FA",
	},
	{
		icon: IconUsers,
		title: "Layanan Publik Terintegrasi",
		desc: "Pengaduan warga dan surat keterangan dalam satu platform",
		accent: "#34D399",
	},
	{
		icon: IconShieldCheck,
		title: "Keamanan Data Terjamin",
		desc: "Sistem enkripsi berlapis untuk perlindungan informasi desa",
		accent: "#FBBF3B",
	},
];

function SigninComponent() {
	const navigate = useNavigate();
	const { redirect } = Route.useSearch();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [pendingModal, setPendingModal] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const result = await authClient.signIn.email(
				{ email, password },
				{
					onSuccess: async () => {
						const res = await fetch("/api/session");
						const json = await res.json();
						const user = json?.data?.user;

						if (user && user.emailVerified === false) {
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
		<Box
			style={{
				minHeight: "100vh",
				display: "flex",
				fontFamily: "'Inter', 'Poppins', sans-serif",
			}}
		>
			{/* ── PENDING VERIFICATION MODAL ───────────────────────────────── */}
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
							<IconShieldCheck
								size={16}
								color="var(--mantine-color-orange-6)"
							/>
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

			{/* ── LEFT PANEL ───────────────────────────────────────────────── */}
			<Box
				visibleFrom="md"
				style={{
					flex: "0 0 58%",
					position: "relative",
					background:
						"linear-gradient(155deg, #040d1a 0%, #071833 35%, #0b2246 65%, #0e2f60 100%)",
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "44px 52px",
				}}
			>
				{/* Dot-grid texture */}
				<Box
					style={{
						position: "absolute",
						inset: 0,
						backgroundImage:
							"radial-gradient(circle, rgba(59,143,255,0.11) 1px, transparent 1px)",
						backgroundSize: "30px 30px",
						pointerEvents: "none",
					}}
				/>
				{/* Ambient glow top-right */}
				<Box
					style={{
						position: "absolute",
						top: "-80px",
						right: "-80px",
						width: "460px",
						height: "460px",
						background:
							"radial-gradient(circle, rgba(59,143,255,0.09) 0%, transparent 65%)",
						pointerEvents: "none",
					}}
				/>
				{/* Ambient glow bottom-left */}
				<Box
					style={{
						position: "absolute",
						bottom: "40px",
						left: "-60px",
						width: "320px",
						height: "320px",
						background:
							"radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)",
						pointerEvents: "none",
					}}
				/>

				{/* Brand mark */}
				<Box style={{ position: "relative", zIndex: 1 }}>
					<Group gap={12} align="center">
						<Box
							style={{
								width: 42,
								height: 42,
								borderRadius: 11,
								background: "rgba(59,143,255,0.14)",
								border: "1px solid rgba(59,143,255,0.28)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0,
							}}
						>
							<img
								src="/white-1.png"
								alt="Logo Desa Plus"
								style={{ width: 26, height: 26, objectFit: "contain" }}
							/>
						</Box>
						<Box>
							<Text
								style={{
									color: "#fff",
									fontWeight: 700,
									fontSize: 15,
									lineHeight: 1.2,
								}}
							>
								Dashboard Desa Plus
							</Text>
							<Text
								style={{
									color: "rgba(255,255,255,0.4)",
									fontSize: 10,
									fontWeight: 600,
									letterSpacing: "0.1em",
									textTransform: "uppercase",
								}}
							>
								Desa Darmasaba
							</Text>
						</Box>
					</Group>
				</Box>

				{/* Hero content */}
				<Box
					style={{
						position: "relative",
						zIndex: 1,
						flex: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						maxWidth: 500,
						paddingTop: 32,
						paddingBottom: 32,
					}}
				>
					{/* Badge */}
					<Box
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 8,
							background: "rgba(59,143,255,0.1)",
							border: "1px solid rgba(59,143,255,0.22)",
							borderRadius: 999,
							padding: "5px 14px",
							marginBottom: 22,
							width: "fit-content",
						}}
					>
						<Box
							style={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								background: "#60A5FA",
								flexShrink: 0,
								boxShadow: "0 0 6px #60A5FA",
							}}
						/>
						<Text
							style={{
								color: "#60A5FA",
								fontSize: 11,
								fontWeight: 600,
								letterSpacing: "0.07em",
								textTransform: "uppercase",
							}}
						>
							Sistem Administrasi Desa Terintegrasi
						</Text>
					</Box>

					{/* Headline */}
					<Title
						order={1}
						style={{
							color: "#fff",
							fontSize: 40,
							fontWeight: 800,
							lineHeight: 1.18,
							letterSpacing: "-0.025em",
							marginBottom: 18,
						}}
					>
						Kelola Desa
						<br />
						<span style={{ color: "#3B8FFF" }}>Lebih Cerdas</span>
						<br />& Transparan
					</Title>

					{/* Sub-copy */}
					<Text
						style={{
							color: "rgba(255,255,255,0.52)",
							fontSize: 15,
							lineHeight: 1.72,
							marginBottom: 40,
							maxWidth: 420,
						}}
					>
						Platform digital untuk administrasi Desa Darmasaba. Pantau APBDes,
						kinerja divisi, data demografi, dan layanan warga dalam satu
						dashboard terpadu.
					</Text>

					{/* Feature list */}
					<Stack gap={18}>
						{FEATURES.map((f) => (
							<Group key={f.title} gap={14} align="flex-start" wrap="nowrap">
								<Box
									style={{
										width: 38,
										height: 38,
										borderRadius: 10,
										background: `${f.accent}16`,
										border: `1px solid ${f.accent}28`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0,
									}}
								>
									<f.icon size={18} color={f.accent} />
								</Box>
								<Box>
									<Text
										style={{
											color: "#fff",
											fontWeight: 600,
											fontSize: 13,
											marginBottom: 2,
										}}
									>
										{f.title}
									</Text>
									<Text
										style={{
											color: "rgba(255,255,255,0.42)",
											fontSize: 12,
											lineHeight: 1.55,
										}}
									>
										{f.desc}
									</Text>
								</Box>
							</Group>
						))}
					</Stack>
				</Box>

				{/* Footer location */}
				<Box
					style={{
						position: "relative",
						zIndex: 1,
						borderTop: "1px solid rgba(255,255,255,0.07)",
						paddingTop: 20,
					}}
				>
					<Group gap={8} align="center">
						<IconMapPin size={13} color="rgba(255,255,255,0.28)" />
						<Text style={{ color: "rgba(255,255,255,0.28)", fontSize: 11 }}>
							Desa Darmasaba, Kec. Abiansemal, Kab. Badung, Bali
						</Text>
					</Group>
				</Box>
			</Box>

			{/* ── RIGHT PANEL ──────────────────────────────────────────────── */}
			<Box
				style={{
					flex: "1 1 42%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "var(--mantine-color-body)",
					padding: "48px 32px",
					position: "relative",
				}}
			>
				{/* Layered background: glow + subtle grid */}
				<Box
					style={{
						position: "absolute",
						inset: 0,
						backgroundImage:
							"radial-gradient(ellipse at 70% 8%, rgba(59,143,255,0.07) 0%, transparent 50%), " +
							"radial-gradient(ellipse at 20% 90%, rgba(52,211,153,0.04) 0%, transparent 45%)",
						pointerEvents: "none",
					}}
				/>
				<Box
					style={{
						position: "absolute",
						inset: 0,
						backgroundImage:
							"linear-gradient(rgba(59,143,255,0.03) 1px, transparent 1px), " +
							"linear-gradient(90deg, rgba(59,143,255,0.03) 1px, transparent 1px)",
						backgroundSize: "44px 44px",
						pointerEvents: "none",
					}}
				/>

				<Box
					style={{
						width: "100%",
						maxWidth: 356,
						position: "relative",
						zIndex: 1,
					}}
				>
					{/* Header */}
					<Box mb={24}>
						<Group gap={8} mb={10}>
							<Box
								style={{
									width: 28,
									height: 28,
									borderRadius: 8,
									background: "rgba(59,143,255,0.12)",
									border: "1px solid rgba(59,143,255,0.2)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<IconLock size={13} color="#3B8FFF" />
							</Box>
							<Text
								style={{
									fontSize: 11,
									fontWeight: 700,
									letterSpacing: "0.1em",
									textTransform: "uppercase",
									color: "#3B8FFF",
								}}
							>
								Selamat datang kembali
							</Text>
						</Group>
						<Title
							order={2}
							style={{
								fontSize: 27,
								fontWeight: 800,
								letterSpacing: "-0.025em",
								marginBottom: 6,
								lineHeight: 1.2,
							}}
						>
							Masuk ke Dashboard
						</Title>
						<Text fz="sm" c="dimmed">
							Belum punya akun?{" "}
							<Anchor
								component="button"
								fz="sm"
								fw={600}
								c="blue"
								onClick={() => navigate({ to: "/signup" })}
							>
								Daftar sekarang →
							</Anchor>
						</Text>
					</Box>

					{/* Form Card */}
					<Paper
						radius="xl"
						p={24}
						style={{
							border: "1px solid var(--mantine-color-default-border)",
							boxShadow:
								"0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.07)",
						}}
					>
						<form onSubmit={handleSubmit}>
							<Stack gap={18}>
								{/* Email */}
								<Box>
									<Text
										component="label"
										htmlFor="signin-email"
										fz="xs"
										fw={600}
										style={{
											display: "block",
											marginBottom: 7,
											letterSpacing: "0.02em",
											textTransform: "uppercase",
											color: "var(--mantine-color-dimmed)",
										}}
									>
										Alamat Email
									</Text>
									<TextInput
										id="signin-email"
										leftSection={<IconMail size={15} />}
										placeholder="nama@desa.go.id"
										required
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										size="sm"
										radius="md"
										styles={{
											input: {
												height: 42,
												fontSize: 13.5,
												paddingLeft: 38,
											},
										}}
									/>
								</Box>

								{/* Password */}
								<Box>
									<Group justify="space-between" mb={7}>
										<Text
											fz="xs"
											fw={600}
											style={{
												letterSpacing: "0.02em",
												textTransform: "uppercase",
												color: "var(--mantine-color-dimmed)",
											}}
										>
											Password
										</Text>
										<Anchor
											component="button"
											fz="xs"
											fw={500}
											c="blue"
											type="button"
										>
											Lupa password?
										</Anchor>
									</Group>
									<PasswordInput
										leftSection={<IconLock size={15} />}
										placeholder="••••••••"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										size="sm"
										radius="md"
										styles={{
											input: { height: 42, fontSize: 13.5 },
										}}
									/>
								</Box>

								{/* Remember me */}
								<Checkbox
									label={
										<Text fz="xs" fw={500} c="dimmed">
											Ingat saya selama 30 hari
										</Text>
									}
									size="xs"
									radius="sm"
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.currentTarget.checked)}
								/>

								{/* Error */}
								{error && (
									<Box
										style={{
											padding: "10px 14px",
											background: "var(--mantine-color-red-0)",
											border: "1px solid var(--mantine-color-red-2)",
											borderLeft: "3px solid var(--mantine-color-red-5)",
											borderRadius: 10,
										}}
									>
										<Text fz="xs" c="red.7" fw={500}>
											{error}
										</Text>
									</Box>
								)}

								{/* Submit */}
								<Button
									type="submit"
									loading={loading}
									fullWidth
									size="md"
									radius="xl"
									rightSection={
										!loading ? <IconArrowRight size={16} /> : undefined
									}
									style={{
										background:
											"linear-gradient(135deg, #1560b0 0%, #2272d8 45%, #3B8FFF 100%)",
										border: "none",
										height: 46,
										fontWeight: 700,
										fontSize: 14,
										letterSpacing: "0.01em",
										boxShadow:
											"0 4px 18px rgba(59,143,255,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
									}}
								>
									Masuk ke Dashboard
								</Button>
							</Stack>
						</form>
					</Paper>

					{/* Divider */}
					<Box
						style={{
							position: "relative",
							margin: "16px 0",
							textAlign: "center",
						}}
					>
						<Box
							style={{
								height: 1,
								background: "var(--mantine-color-default-border)",
								position: "absolute",
								top: "50%",
								left: 0,
								right: 0,
							}}
						/>
						<Text
							fz={11}
							fw={500}
							c="dimmed"
							style={{
								position: "relative",
								display: "inline-block",
								background: "var(--mantine-color-body)",
								padding: "0 14px",
								letterSpacing: "0.04em",
								textTransform: "uppercase",
							}}
						>
							atau lanjutkan dengan
						</Text>
					</Box>

					<Stack gap={"xs"}>
						{/* GitHub */}
						<Button
							variant="default"
							fullWidth
							size="sm"
							radius="xl"
							leftSection={<IconBrandGithub size={17} />}
							style={{
								height: 44,
								fontWeight: 500,
								fontSize: 13.5,
								border: "1.5px solid var(--mantine-color-default-border)",
								boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
							}}
							onClick={async () => {
								await authClient.signIn.social({
									provider: "github",
									callbackURL: redirect
										? new URL(redirect, window.location.origin).pathname
										: "/",
								});
							}}
						>
							Lanjutkan dengan GitHub
						</Button>

						{/* Google */}
						<Button
							variant="default"
							fullWidth
							size="sm"
							radius="xl"
							leftSection={<IconBrandGoogle size={17} />}
							style={{
								height: 44,
								fontWeight: 500,
								fontSize: 13.5,
								border: "1.5px solid var(--mantine-color-default-border)",
								boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
							}}
							onClick={async () => {
								await authClient.signIn.social({
									provider: "google",
									callbackURL: redirect
										? new URL(redirect, window.location.origin).pathname
										: "/",
								});
							}}
						>
							Lanjutkan dengan Google
						</Button>
					</Stack>

					{/* Security badge */}
					<Group gap={6} justify="center" mt={20} mb={4}>
						<IconLock size={11} color="var(--mantine-color-dimmed)" />
						<Text fz={11} c="dimmed">
							Koneksi aman · Enkripsi SSL 256-bit
						</Text>
					</Group>

					{/* Footer */}
					<Text ta="center" fz={11} c="dimmed" style={{ lineHeight: 1.65 }}>
						Dengan masuk, kamu menyetujui{" "}
						<Anchor fz={11} c="dimmed" style={{ textDecoration: "underline" }}>
							kebijakan privasi
						</Anchor>{" "}
						&{" "}
						<Anchor fz={11} c="dimmed" style={{ textDecoration: "underline" }}>
							ketentuan layanan
						</Anchor>
						.
					</Text>
				</Box>
			</Box>
		</Box>
	);
}
