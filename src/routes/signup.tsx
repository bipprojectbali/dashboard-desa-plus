import {
	Anchor,
	Button,
	Container,
	Paper,
	PasswordInput,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signUp } from "../utils/auth-client";

export const Route = createFileRoute("/signup")({
	component: SignupComponent,
});

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
			const { error } = await signUp.email({
				name,
				email,
				password,
			});

			if (error) {
				setError(error.message || "Failed to sign up");
			} else {
				navigate({ to: "/admin" });
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container size={420} my={40}>
			<Title ta="center">Create an account</Title>
			<Text c="dimmed" size="sm" ta="center" mt={5}>
				Already have an account?{" "}
				<Anchor
					size="sm"
					component="button"
					onClick={() => navigate({ to: "/signin" })}
				>
					Sign in
				</Anchor>
			</Text>

			<Paper withBorder shadow="md" p={30} mt={30} radius="md">
				<form onSubmit={handleSubmit}>
					<TextInput
						label="Name"
						placeholder="Your name"
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<TextInput
						label="Email"
						placeholder="your@email.com"
						required
						mt="md"
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
					{error && (
						<Text c="red" size="sm" mt="md">
							{error}
						</Text>
					)}
					<Button fullWidth mt="xl" type="submit" loading={loading}>
						Create account
					</Button>
				</form>
			</Paper>
		</Container>
	);
}
