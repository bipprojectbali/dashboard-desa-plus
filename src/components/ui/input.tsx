import { TextInput, type TextInputProps } from "@mantine/core";
import React from "react";
import { cn } from "./utils"; // Assuming cn is still useful for merging classNames

interface InputProps extends TextInputProps {
	// Add any specific props you had in your custom Input component
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<TextInput
				ref={ref}
				type={type}
				className={cn(className)} // Apply custom classNames if any
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
