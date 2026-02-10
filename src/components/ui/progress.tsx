import {
	Progress as MantineProgress,
	type ProgressProps as MantineProgressProps,
} from "@mantine/core";
import { cn } from "./utils";

interface ProgressProps extends MantineProgressProps {
	max?: number;
}

const Progress = ({ className, value, max, ...props }: ProgressProps) => {
	return (
		<MantineProgress
			value={value}
			max={max as any}
			className={cn(className)}
			color="blue" // Placeholder, should align with primary color
			{...props}
		/>
	);
};

export { Progress };
