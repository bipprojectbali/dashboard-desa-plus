import {
	Button as MantineButton,
	type ButtonProps as MantineButtonProps,
} from "@mantine/core";
import { cn } from "./utils";

interface ButtonProps extends MantineButtonProps {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	className?: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	type?: "button" | "submit" | "reset";
}

const Button = ({ children, className, variant, ...props }: ButtonProps) => {
	let mantineVariant: MantineButtonProps["variant"];
	let mantineColor: MantineButtonProps["color"];

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
		default:
			mantineVariant = "filled";
			mantineColor = "blue"; // Assuming primary maps to blue in Mantine for now
			break;
	}

	return (
		<MantineButton
			variant={mantineVariant}
			color={mantineColor}
			className={cn(className)}
			{...props}
		>
			{children}
		</MantineButton>
	);
};

export { Button };
