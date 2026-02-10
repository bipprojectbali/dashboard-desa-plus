import {
	Badge as MantineBadge,
	type BadgeProps as MantineBadgeProps,
} from "@mantine/core";
import { cn } from "./utils";

interface BadgeProps extends MantineBadgeProps {
	variant?: "default" | "secondary" | "destructive" | "success";
}

const Badge = ({
	className,
	variant = "default",
	children,
	...props
}: BadgeProps) => {
	let mantineVariant: MantineBadgeProps["variant"];
	let mantineColor: MantineBadgeProps["color"];

	switch (variant) {
		case "secondary":
			mantineVariant = "light";
			mantineColor = "gray";
			break;
		case "destructive":
			mantineVariant = "filled";
			mantineColor = "red";
			break;
		case "success":
			mantineVariant = "filled";
			mantineColor = "green";
			break;
		default:
			mantineVariant = "filled";
			mantineColor = "blue"; // Placeholder, should align with primary color
			break;
	}

	return (
		<MantineBadge
			variant={mantineVariant}
			color={mantineColor}
			className={cn(className)}
			{...props}
		>
			{children}
		</MantineBadge>
	);
};

export { Badge };
