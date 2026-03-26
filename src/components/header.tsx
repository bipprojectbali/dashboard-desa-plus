import {
	ActionIcon,
	Avatar,
	Badge,
	Box,
	Divider,
	Group,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconLayoutSidebarLeftCollapse,
	IconUserShield,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, Moon, Sun, User as UserIcon } from "lucide-react";

interface HeaderProps {
	onSidebarToggle?: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
	const _location = useLocation();
	const navigate = useNavigate();
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<Group justify="space-between" w="100%">
			{/* Title */}
			<Group gap="md">
				<ActionIcon
					onClick={onSidebarToggle}
					variant="subtle"
					size="lg"
					radius="xl"
					visibleFrom="sm"
					aria-label="Toggle sidebar"
				>
					<IconLayoutSidebarLeftCollapse
						color="white"
						style={{ width: "70%", height: "70%" }}
					/>
				</ActionIcon>
			</Group>

			{/* Right Section */}
			<Group gap="md">
				{/* User Info */}
				<Group gap="sm">
					<Box ta="right">
						<Text c={"white"} size="sm" fw={500}>
							I. B. Surya Prabhawa M...
						</Text>
						<Text c={"white"} size="xs">
							Kepala Desa
						</Text>
					</Box>
					<Avatar color="blue" radius="xl">
						<UserIcon color="white" style={{ width: "70%", height: "70%" }} />
					</Avatar>
				</Group>

				{/* Divider */}
				<Divider orientation="vertical" h={30} />

				{/* Icons */}
				<Group gap="sm">
					<ActionIcon
						onClick={() => toggleColorScheme()}
						variant="subtle"
						size="lg"
						radius="xl"
						aria-label="Toggle color scheme"
					>
						{dark ? (
							<Sun color="white" style={{ width: "70%", height: "70%" }} />
						) : (
							<Moon color="white" style={{ width: "70%", height: "70%" }} />
						)}
					</ActionIcon>
					<ActionIcon variant="subtle" size="lg" radius="xl" pos="relative">
						<Bell color="white" style={{ width: "70%", height: "70%" }} />
						<Badge
							size="xs"
							color="red"
							variant="filled"
							style={{ position: "absolute", top: 0, right: 0 }}
							radius={"xl"}
						>
							10
						</Badge>
					</ActionIcon>
					<ActionIcon variant="subtle" size="lg" radius="xl">
						<IconUserShield
							color="white"
							style={{ width: "70%", height: "70%" }}
							onClick={() => navigate({ to: "/signin" })}
						/>
					</ActionIcon>
				</Group>
			</Group>
		</Group>
	);
}
