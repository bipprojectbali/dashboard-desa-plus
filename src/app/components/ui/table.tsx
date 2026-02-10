import {
	Table as MantineTable,
	type TableProps as MantineTableProps,
} from "@mantine/core";
import type React from "react";
import { cn } from "./utils";

interface TableComponentProps extends MantineTableProps {
	// Add any specific props you had in your custom Table component
}

interface TableHeaderProps
	extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TableBodyProps
	extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
interface TableHeadProps
	extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {}
interface TableCellProps
	extends React.TdHTMLAttributes<HTMLTableDataCellElement> {}

const Table = ({ className, children, ...props }: TableComponentProps) => (
	<div className="relative w-full overflow-auto">
		<MantineTable
			className={cn("w-full caption-bottom text-sm", className)}
			{...props}
		>
			{children}
		</MantineTable>
	</div>
);

const TableHeader = ({ className, children, ...props }: TableHeaderProps) => (
	<thead className={cn("[&_tr]:border-b", className)} {...props}>
		{children}
	</thead>
);

const TableBody = ({ className, children, ...props }: TableBodyProps) => (
	<tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
		{children}
	</tbody>
);

const TableRow = ({ className, children, ...props }: TableRowProps) => (
	<tr
		className={cn(
			"border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted dark:border-gray-700 dark:hover:bg-gray-800",
			className,
		)}
		{...props}
	>
		{children}
	</tr>
);

const TableHead = ({ className, children, ...props }: TableHeadProps) => (
	<th
		className={cn(
			"h-10 px-2 text-left align-middle font-medium text-muted-foreground dark:text-gray-400 [&:has([role=checkbox])]:pr-0",
			className,
		)}
		{...props}
	>
		{children}
	</th>
);

const TableCell = ({ className, children, ...props }: TableCellProps) => (
	<td
		className={cn(
			"p-2 align-middle [&:has([role=checkbox])]:pr-0 text-gray-900 dark:text-gray-300",
			className,
		)}
		{...props}
	>
		{children}
	</td>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
