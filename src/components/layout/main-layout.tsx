import {
	AppShell,
	Burger,
	Group,
	Tooltip,
	UnstyledButton,
	useMantineColorScheme,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { useSidebarFullscreen } from "@/hooks/use-sidebar-fullscreen";
import { useSystemMonitor } from "@/hooks/useSystemMonitor";
import { useTranslate } from "@/hooks/useTranslate";
import { setAksesPrefs } from "@/store/akses";
import { i18nStore } from "@/store/i18n";

interface MainLayoutProps {
	children: React.ReactNode;
	routeKey?: string;
}

function PageTransition({
	children,
	routeKey,
	enabled,
}: {
	children: React.ReactNode;
	routeKey: string;
	enabled: boolean;
}) {
	const [displayChildren, setDisplayChildren] = useState(children);
	const [displayKey, setDisplayKey] = useState(routeKey);
	const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
	const pendingRef = useRef<{ children: React.ReactNode; key: string } | null>(
		null,
	);

	useEffect(() => {
		if (routeKey === displayKey) return;

		if (!enabled) {
			setDisplayChildren(children);
			setDisplayKey(routeKey);
			return;
		}

		pendingRef.current = { children, key: routeKey };
		setPhase("exit");

		// enterTimer is declared outside so the cleanup closure can cancel it even
		// if exitTimer has already fired before the component unmounts.
		let enterTimer: ReturnType<typeof setTimeout> | null = null;
		const exitTimer = setTimeout(() => {
			if (pendingRef.current) {
				setDisplayChildren(pendingRef.current.children);
				setDisplayKey(pendingRef.current.key);
				pendingRef.current = null;
			}
			setPhase("enter");
			enterTimer = setTimeout(() => setPhase("idle"), 250);
		}, 180);

		return () => {
			clearTimeout(exitTimer);
			if (enterTimer !== null) clearTimeout(enterTimer);
		};
		// displayKey and children intentionally excluded: adding displayKey would
		// cancel enterTimer on every setDisplayKey call; children changes on the
		// same route don't need to trigger the transition animation.
		// biome-ignore lint/correctness/useExhaustiveDependencies: see above
	}, [routeKey, enabled]);

	const style: React.CSSProperties = enabled
		? {
				opacity: phase === "exit" ? 0 : 1,
				transform:
					phase === "exit"
						? "translateY(8px)"
						: phase === "enter"
							? "translateY(-4px)"
							: "translateY(0)",
				transition:
					phase === "idle"
						? "none"
						: "opacity 0.18s ease, transform 0.18s ease",
			}
		: {};

	return <div style={style}>{displayChildren}</div>;
}

export function MainLayout({ children, routeKey = "" }: MainLayoutProps) {
	const {
		opened,
		toggleMobile,
		sidebarCollapsed,
		toggleSidebar,
		handleMainClick,
	} = useSidebarFullscreen();
	const { colorScheme } = useMantineColorScheme();
	const { animasiTransisi } = useSnapshot(i18nStore);
	const t = useTranslate();
	useSystemMonitor();

	useEffect(() => {
		fetch("/api/akses-preferences")
			.then((r) => (r.ok ? r.json() : null))
			.then((json) => {
				if (json?.data) setAksesPrefs(json.data);
			})
			.catch(() => {});
	}, []);

	const headerBgColor = colorScheme === "dark" ? "#11192D" : "#19355E";
	const navbarBgColor = colorScheme === "dark" ? "#11192D" : "white";
	const mainBgColor = colorScheme === "dark" ? "#11192D" : "#edf3f8ff";

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{
				width: 300,
				breakpoint: "sm",
				collapsed: { mobile: !opened, desktop: sidebarCollapsed },
			}}
			padding="md"
		>
			<AppShell.Header bg={headerBgColor}>
				<Group h="100%" px="md" wrap="nowrap">
					<Burger
						opened={opened}
						onClick={toggleMobile}
						hiddenFrom="sm"
						size="sm"
					/>
					<Header onSidebarToggle={toggleSidebar} />
				</Group>
			</AppShell.Header>

			<AppShell.Navbar
				p="md"
				bg={navbarBgColor}
				style={{ display: "flex", flexDirection: "column" }}
			>
				<div style={{ flex: 1, overflowY: "auto" }}>
					<Sidebar />
				</div>
			</AppShell.Navbar>

			<AppShell.Main
				bg={mainBgColor}
				onClick={handleMainClick}
				style={{
					transition: animasiTransisi ? "background-color 0.3s ease" : "none",
				}}
			>
				<PageTransition routeKey={routeKey} enabled={animasiTransisi}>
					{children}
				</PageTransition>

				{/* Floating bantuan button */}
				<Tooltip label={t.help.bantuanShortcut} position="left" withArrow>
					<UnstyledButton
						component={Link}
						to="/bantuan"
						style={{
							position: "fixed",
							bottom: 24,
							right: 24,
							zIndex: 200,
							background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
							color: "white",
							borderRadius: 24,
							padding: "8px 16px",
							fontSize: 13,
							fontWeight: 600,
							boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
							display: "flex",
							alignItems: "center",
							gap: 6,
							letterSpacing: 0.2,
							transition: "box-shadow 0.2s ease, transform 0.2s ease",
						}}
						onMouseEnter={(e) => {
							(e.currentTarget as HTMLElement).style.boxShadow =
								"0 6px 24px rgba(37,99,235,0.5)";
							(e.currentTarget as HTMLElement).style.transform =
								"translateY(-2px)";
						}}
						onMouseLeave={(e) => {
							(e.currentTarget as HTMLElement).style.boxShadow =
								"0 4px 16px rgba(37,99,235,0.35)";
							(e.currentTarget as HTMLElement).style.transform =
								"translateY(0)";
						}}
					>
						{t.help.bantuanShortcut}
					</UnstyledButton>
				</Tooltip>
			</AppShell.Main>
		</AppShell>
	);
}
