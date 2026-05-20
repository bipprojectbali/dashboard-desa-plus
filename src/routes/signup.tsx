import {
	Anchor,
	Box,
	Button,
	Group,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import {
	IconArrowRight,
	IconBrandGithub,
	IconChartBar,
	IconLock,
	IconMail,
	IconMapPin,
	IconShieldCheck,
	IconStar,
	IconUser,
	IconUsers,
} from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient, signUp } from "../utils/auth-client";

export const Route = createFileRoute("/signup")({
	component: SignupComponent,
});

const FEATURES = [
	{
		icon: IconChartBar,
		title: "APBDes & Keuangan",
		desc: "Pantau anggaran desa dan realisasi belanja secara real-time",
		accent: "#60A5FA",
	},
	{
		icon: IconUsers,
		title: "Data Demografi",
		desc: "Kelola data penduduk, KK, dan kegiatan sosial desa",
		accent: "#34D399",
	},
	{
		icon: IconShieldCheck,
		title: "Layanan & Pengaduan",
		desc: "Proses surat keterangan dan pengaduan warga lebih cepat",
		accent: "#FBBF3B",
	},
];

function SignupComponent() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const { error } = await signUp.email({ name, email, password });
			if (error) {
				setError(error.message || "Gagal mendaftar");
			} else {
				navigate({ to: "/admin" });
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
			{/* ── LEFT PANEL ───────────────────────────────────────────────── */}
			<Box
				visibleFrom="md"
				style={{
					flex: "0 0 58%",
					position: "relative",
					background:
						"linear-gradient(160deg, #040d1a 0%, #071833 30%, #081e3d 60%, #0a2850 100%)",
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
				{/* Glow top-left */}
				<Box
					style={{
						position: "absolute",
						top: "-60px",
						left: "-60px",
						width: "420px",
						height: "420px",
						background:
							"radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 65%)",
						pointerEvents: "none",
					}}
				/>
				{/* Glow bottom-right */}
				<Box
					style={{
						position: "absolute",
						bottom: "20px",
						right: "-80px",
						width: "380px",
						height: "380px",
						background:
							"radial-gradient(circle, rgba(59,143,255,0.08) 0%, transparent 65%)",
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
								src="/logo-desa-plus.png"
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
							background: "rgba(52,211,153,0.1)",
							border: "1px solid rgba(52,211,153,0.22)",
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
								background: "#34D399",
								flexShrink: 0,
								boxShadow: "0 0 6px #34D399",
							}}
						/>
						<Text
							style={{
								color: "#34D399",
								fontSize: 11,
								fontWeight: 600,
								letterSpacing: "0.07em",
								textTransform: "uppercase",
							}}
						>
							Platform Resmi Desa Darmasaba
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
						Satu Platform
						<br />
						Untuk <span style={{ color: "#34D399" }}>Semua</span>
						<br />
						Kebutuhan Desa
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
						Bergabunglah dan kelola semua aspek administrasi desa — dari APBDes,
						kinerja divisi, hingga layanan warga — secara digital dan
						transparan.
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
				{/* Layered background */}
				<Box
					style={{
						position: "absolute",
						inset: 0,
						backgroundImage:
							"radial-gradient(ellipse at 30% 10%, rgba(52,211,153,0.05) 0%, transparent 50%), " +
							"radial-gradient(ellipse at 80% 85%, rgba(59,143,255,0.04) 0%, transparent 45%)",
						pointerEvents: "none",
					}}
				/>
				<Box
					style={{
						position: "absolute",
						inset: 0,
						backgroundImage:
							"linear-gradient(rgba(52,211,153,0.025) 1px, transparent 1px), " +
							"linear-gradient(90deg, rgba(52,211,153,0.025) 1px, transparent 1px)",
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
									background: "rgba(52,211,153,0.12)",
									border: "1px solid rgba(52,211,153,0.22)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<IconStar size={13} color="#34D399" />
							</Box>
							<Text
								style={{
									fontSize: 11,
									fontWeight: 700,
									letterSpacing: "0.1em",
									textTransform: "uppercase",
									color: "#34D399",
								}}
							>
								Buat akun baru
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
							Daftar ke Dashboard
						</Title>
						<Text fz="sm" c="dimmed">
							Sudah punya akun?{" "}
							<Anchor
								component="button"
								fz="sm"
								fw={600}
								c="teal"
								onClick={() => navigate({ to: "/signin", search: { redirect: undefined } })}
							>
								Masuk di sini →
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
								{/* Name */}
								<Box>
									<Text
										component="label"
										htmlFor="signup-name"
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
										Nama Lengkap
									</Text>
									<TextInput
										id="signup-name"
										leftSection={<IconUser size={15} />}
										placeholder="Nama lengkap kamu"
										required
										value={name}
										onChange={(e) => setName(e.target.value)}
										size="sm"
										radius="md"
										styles={{
											input: { height: 42, fontSize: 13.5 },
										}}
									/>
								</Box>

								{/* Email */}
								<Box>
									<Text
										component="label"
										htmlFor="signup-email"
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
										id="signup-email"
										leftSection={<IconMail size={15} />}
										placeholder="nama@desa.go.id"
										required
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										size="sm"
										radius="md"
										styles={{
											input: { height: 42, fontSize: 13.5 },
										}}
									/>
								</Box>

								{/* Password */}
								<Box>
									<Text
										component="label"
										htmlFor="signup-password"
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
										Password
									</Text>
									<PasswordInput
										id="signup-password"
										leftSection={<IconLock size={15} />}
										placeholder="Min. 8 karakter"
										required
										minLength={8}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										size="sm"
										radius="md"
										styles={{
											input: { height: 42, fontSize: 13.5 },
										}}
									/>
									{password.length > 0 && <PasswordStrength value={password} />}
								</Box>

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
									mt={2}
									style={{
										background:
											"linear-gradient(135deg, #1a8a5a 0%, #22b573 45%, #34D399 100%)",
										border: "none",
										height: 46,
										fontWeight: 700,
										fontSize: 14,
										letterSpacing: "0.01em",
										boxShadow:
											"0 4px 18px rgba(52,211,153,0.38), inset 0 1px 0 rgba(255,255,255,0.18)",
									}}
								>
									Buat Akun Sekarang
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
							atau daftar dengan
						</Text>
					</Box>

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
								callbackURL: "/",
							});
						}}
					>
						Daftar dengan GitHub
					</Button>

					{/* Security badge */}
					<Group gap={6} justify="center" mt={20} mb={4}>
						<IconLock size={11} color="var(--mantine-color-dimmed)" />
						<Text fz={11} c="dimmed">
							Koneksi aman · Enkripsi SSL 256-bit
						</Text>
					</Group>

					{/* Footer */}
					<Text ta="center" fz={11} c="dimmed" style={{ lineHeight: 1.65 }}>
						Dengan mendaftar, kamu menyetujui{" "}
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

function PasswordStrength({ value }: { value: string }) {
	const checks = [
		value.length >= 8,
		/[A-Z]/.test(value),
		/[0-9]/.test(value),
		/[^A-Za-z0-9]/.test(value),
	];
	const score = checks.filter(Boolean).length;
	const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
	const labels = ["Lemah", "Cukup", "Baik", "Kuat"];

	return (
		<Box mt={8}>
			<Group gap={4} mb={4}>
				{checks.map((ok, i) => (
					<Box
						key={i}
						style={{
							flex: 1,
							height: 3,
							borderRadius: 99,
							background:
								i < score
									? colors[score - 1]
									: "var(--mantine-color-default-border)",
							transition: "background 0.2s",
						}}
					/>
				))}
			</Group>
			<Text
				fz={11}
				fw={500}
				style={{
					color: score > 0 ? colors[score - 1] : "var(--mantine-color-dimmed)",
				}}
			>
				{score > 0 ? `Password ${labels[score - 1]}` : ""}
			</Text>
		</Box>
	);
}
