"use client";

import { Tooltip as MantineTooltip, type TooltipProps } from "@mantine/core";
import React from "react";
import { cn } from "./utils";

interface CustomTooltipProps extends TooltipProps {
	position?: "top" | "right" | "bottom" | "left"; // Corresponds to Mantine's position
	offset?: number; // Corresponds to Mantine's offset
}

function Tooltip({
	children,
	label, // Now using Mantine's 'label' prop directly
	position,
	offset,
	className,
	...props
}: CustomTooltipProps) {
	return (
		<MantineTooltip
			label={label} // Pass label to Mantine Tooltip
			position={position} // Pass position to Mantine Tooltip
			offset={offset} // Pass offset to Mantine Tooltip
			classNames={{
				tooltip: cn(
					"bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-[var(--radix-tooltip-content-transform-origin)] rounded-md px-3 py-1.5 text-xs text-balance",
					className,
				),
				arrow:
					"bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
			}}
			{...props}
		>
			{children}
		</MantineTooltip>
	);
}

// Export for direct use
export { Tooltip };

// These exports are not directly used in Mantine's simpler Tooltip
// and will be handled by the single Tooltip component.
// function TooltipProvider() {}
// function TooltipTrigger() {}
// function TooltipContent() {}
// export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
