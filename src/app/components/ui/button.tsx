import {
	Button as MantineButton,
	type ButtonProps as MantineButtonCoreProps,
} from "@mantine/core";
import React from "react";
import { cn } from "./utils";

// Define the props for our custom Button component
// We want to allow all MantineButtonProps and also our custom variant and className.
// Native HTML button attributes are generally passed through MantineButtonProps.
interface ButtonProps extends MantineButtonCoreProps {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	className?: string;
	// Explicitly add common HTML button attributes if they are causing issues
	type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, className, variant, type, onClick, ...props }, ref) => {
		// Destructure type and onClick
		let mantineVariant: MantineButtonCoreProps["variant"];
		let mantineColor: MantineButtonCoreProps["color"];

		switch (variant) {
			case "destructive":
				mantineVariant = "filled";
				mantineColor = "red";
				break;
			case "outline":
				mantineVariant = "outline";
				break;
			case "secondary":
				mantineVariant = "default";
				break;
			case "ghost":
				mantineVariant = "subtle";
				break;
			case "link":
				mantineVariant = "transparent";
				mantineColor = "blue"; // Assuming primary maps to blue in Mantine for now
				break;
			case "default":
			default:
				mantineVariant = "filled";
				mantineColor = "blue"; // Assuming primary maps to blue in Mantine for now
				break;
		}

		return (
			<MantineButton
				ref={ref}
				variant={mantineVariant}
				color={mantineColor}
				className={cn(className)}
				type={type} // Pass type explicitly
				onClick={onClick} // Pass onClick explicitly
				{...props}
			>
				{children}
			</MantineButton>
		);
	},
);
Button.displayName = "Button";

export { Button };
