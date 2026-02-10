"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { ulid } from "ulid";

import { cn } from "./utils"; // Assuming cn is used and imported from ./utils

const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(
	(
		{ className, children, value, defaultValue, min = 0, max = 100, ...props },
		ref,
	) => {
		const _values = React.useMemo(
			() =>
				Array.isArray(value)
					? value
					: Array.isArray(defaultValue)
						? defaultValue
						: [min, max],
			[value, defaultValue, min, max],
		);

		return (
			<SliderPrimitive.Root
				ref={ref}
				defaultValue={defaultValue}
				value={value}
				min={min}
				max={max}
				className={cn(
					"relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
					"data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:py-2",
					"data-[orientation=vertical]:h-full data-[orientation=vertical]:w-4 data-[orientation=vertical]:px-2 data-[orientation=vertical]:flex-col",
					className,
				)}
				{...props}
			>
				<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
					<SliderPrimitive.Range className="absolute h-full bg-primary" />
				</SliderPrimitive.Track>
				{_values.map((_val, _index) => (
					<SliderPrimitive.Thumb
						key={ulid()} // Using ulid for unique keys
						className="block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					/>
				))}
				{children}
			</SliderPrimitive.Root>
		);
	},
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
