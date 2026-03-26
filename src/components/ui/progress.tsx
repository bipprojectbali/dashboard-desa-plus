import {
	Progress as MantineProgress,
	type ProgressProps as MantineProgressProps,
} from "@mantine/core";
import { cn } from "./utils";

// Original ProgressProps likely had 'value' and 'max'.
// Mantine's Progress typically takes a value from 0-100.
interface ProgressComponentProps extends Omit<MantineProgressProps, "value"> {
	value: number; // Current progress value
	max?: number; // Max value for calculation, defaults to 100
}

const Progress = ({
	className,
	value,
	max = 100,
	...props
}: ProgressComponentProps) => {
	const percentage = Math.min(100, Math.max(0, (value / max) * 100));

	return (
		<MantineProgress
			value={percentage} // Pass the calculated percentage to Mantine's Progress
			className={cn(className)}
			color="blue" // Placeholder, should align with primary color
			{...props}
		/>
	);
};

export { Progress };
