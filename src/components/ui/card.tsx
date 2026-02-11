import {
	Box,
	Card as MantineCard,
	type CardProps as MantineCardProps,

	Title,
} from "@mantine/core";
import type React from "react";
import { cn } from "./utils";

interface CardComponentProps extends MantineCardProps {
	// Add any specific props you had in your custom Card component
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = ({ className, children, ...props }: CardComponentProps) => (
	<MantineCard
		className={cn(
			"rounded-xl border bg-white dark:bg-gray-800 p-6 shadow",
			className,
		)}
		{...props}
	>
		{children}
	</MantineCard>
);

const CardHeader = ({ className, children, ...props }: CardHeaderProps) => (
	<Box className={cn("flex flex-col space-y-1.5", className)} {...props}>
		{children}
	</Box>
);

const CardTitle = ({ className, children, ...props }: CardTitleProps) => (
	<Title
		order={3}
		className={cn(
			"font-semibold leading-none tracking-tight text-gray-900 dark:text-white",
			className,
		)}
		{...props}
	>
		{children}
	</Title>
);

const CardContent = ({ className, children, ...props }: CardContentProps) => (
	<Box className={cn("p-6 pt-0", className)} {...props}>
		{children}
	</Box>
);

export { Card, CardHeader, CardTitle, CardContent };
