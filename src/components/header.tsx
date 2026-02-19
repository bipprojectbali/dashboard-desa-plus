import {
	ActionIcon,
	Badge,
	Box,
	Group,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import { useLocation } from "@tanstack/react-router";
import { Bell, Moon, Sun } from "lucide-react";

export function Header() {
	const location = useLocation();
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const title =
		location.pathname === "/"
			? "Desa Darmasaba"
			: "Desa Darmasaba";

	return (
		<Box
			style={{
				display: "grid",
				gridTemplateColumns: "1fr auto 1fr",
				alignItems: "center",
				width: "100%",
			}}
		>
			{/* LEFT SPACER (burger sudah di luar) */}
			<Box />

			{/* CENTER TITLE */}
			<Text
				c="white"
				fw={600}
				size="md"
				style={{
					textAlign: "center",
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
				}}
			>
				{title}
			</Text>

			{/* RIGHT ICONS */}
			<Group gap="xs" justify="flex-end">
				<ActionIcon
					onClick={toggleColorScheme}
					variant="subtle"
					radius="xl"
				>
					{dark ? <Sun size={18} /> : <Moon size={18} />}
				</ActionIcon>

				<ActionIcon variant="subtle" radius="xl" pos="relative">
					<Bell size={18} />
					<Badge
						size="xs"
						color="red"
						style={{ position: "absolute", top: -4, right: -4 }}
					>
						10
					</Badge>
				</ActionIcon>
			</Group>
		</Box>
	);
}
