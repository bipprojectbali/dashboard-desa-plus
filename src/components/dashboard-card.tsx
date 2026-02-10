import type { ReactNode } from "react";
import { Card } from "./ui/card";

interface DashboardCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	change?: string;
	icon: ReactNode;
	badge?: string;
}

export function DashboardCard({
	title,
	value,
	subtitle,
	change,
	icon,
	badge,
}: DashboardCardProps) {
	return (
		<Card className="p-6 bg-gray-50 border-none relative">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<p className="text-sm text-gray-600 mb-2">{title}</p>
					<div className="flex items-baseline gap-2">
						<h3 className="text-4xl font-bold text-gray-900">{value}</h3>
						{badge && (
							<div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 text-sm font-semibold">
								{badge}
							</div>
						)}
					</div>
					{subtitle && <p className="text-sm text-gray-600 mt-2">{subtitle}</p>}
					{change && <p className="text-sm text-red-500 mt-1">↗ {change}</p>}
				</div>
				<div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-800 text-white">
					{icon}
				</div>
			</div>
		</Card>
	);
}
