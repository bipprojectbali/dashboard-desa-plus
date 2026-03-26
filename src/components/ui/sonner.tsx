"use client";

import { useMantineColorScheme } from "@mantine/core";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { colorScheme } = useMantineColorScheme();

	return (
		<Sonner
			theme={
				colorScheme === "auto"
					? "system"
					: (colorScheme as ToasterProps["theme"])
			}
			className="toaster group"
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
