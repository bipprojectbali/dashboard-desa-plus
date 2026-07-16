import { Group, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { LiveClock } from "./live-clock";
import { WALL_THEME } from "./wall-theme";

interface WallHeaderProps {
	live: boolean;
	/** Kontrol opsional di kanan (mis. tombol Atur/Simpan untuk admin). */
	actions?: ReactNode;
}

/** Header wall: judul + indikator LIVE berdenyut + jam (atau actions admin). */
export function WallHeader({ live, actions }: WallHeaderProps) {
	return (
		<Group justify="space-between" align="center" wrap="nowrap">
			<div>
				<Text fw={800} style={{ fontSize: 28, color: WALL_THEME.TEXT }}>
					Dashboard Desa Darmasaba
				</Text>
				<Group gap={8} align="center" mt={2}>
					<span
						className="wall-live-dot"
						style={{
							width: 10,
							height: 10,
							borderRadius: "50%",
							background: live ? WALL_THEME.DANGER : WALL_THEME.TEXT_DIM,
						}}
					/>
					<Text
						size="sm"
						fw={700}
						style={{
							letterSpacing: 2,
							color: live ? WALL_THEME.DANGER : WALL_THEME.TEXT_DIM,
						}}
					>
						{live ? "LIVE" : "OFFLINE"}
					</Text>
				</Group>
			</div>
			{actions ?? <LiveClock />}
		</Group>
	);
}
