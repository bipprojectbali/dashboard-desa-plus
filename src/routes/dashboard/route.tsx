import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/app/components/header";
import { Sidebar } from "@/app/components/sidebar";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
			{/* Sidebar */}
			<Sidebar />

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Header */}
				<Header />

				{/* Dashboard Content */}
				<main className="flex-1 overflow-y-auto p-8">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
