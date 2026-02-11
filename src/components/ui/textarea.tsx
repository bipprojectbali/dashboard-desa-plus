import {
	Textarea as MantineTextarea,
	type TextareaProps as MantineTextareaProps,
} from "@mantine/core";
import React from "react";
import { cn } from "./utils";

interface TextareaProps extends MantineTextareaProps {
	// Add any specific props you had in your custom Textarea component
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<MantineTextarea
				ref={ref}
				className={cn(className)} // Apply custom classNames if any
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea };
