import { Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { WALL_THEME } from "./wall-theme";

/** Jam dinding live, update tiap detik. Format Indonesia. */
export function LiveClock() {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const time = now.toLocaleTimeString("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
	const date = now.toLocaleDateString("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	return (
		<div style={{ textAlign: "right" }}>
			<Text
				fw={700}
				style={{ fontSize: 32, lineHeight: 1.1, color: WALL_THEME.TEXT }}
				ff="monospace"
			>
				{time}
			</Text>
			<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
				{date}
			</Text>
		</div>
	);
}
