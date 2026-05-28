import { Stack } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText, MessageSquare, Search, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type SearchResult = {
	module: string;
	id: string;
	title: string;
	snippet: string;
	url: string;
};

type SearchResponse = {
	results: SearchResult[];
	total: number;
};

const MODULE_CONFIG: Record<
	string,
	{
		label: string;
		Icon: React.ElementType;
		accentCls: string;
		iconCls: string;
		iconBg: string;
		badgeCls: string;
	}
> = {
	complaint: {
		label: "Pengaduan",
		Icon: MessageSquare,
		accentCls: "border-l-rose-400 dark:border-l-rose-500",
		iconCls: "text-rose-500 dark:text-rose-400",
		iconBg: "bg-rose-50 dark:bg-rose-950/40",
		badgeCls:
			"bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-800",
	},
	activity: {
		label: "Kegiatan",
		Icon: Zap,
		accentCls: "border-l-blue-400 dark:border-l-blue-500",
		iconCls: "text-blue-500 dark:text-blue-400",
		iconBg: "bg-blue-50 dark:bg-blue-950/40",
		badgeCls:
			"bg-blue-50 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-800",
	},
	document: {
		label: "Dokumen",
		Icon: FileText,
		accentCls: "border-l-emerald-400 dark:border-l-emerald-500",
		iconCls: "text-emerald-500 dark:text-emerald-400",
		iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
		badgeCls:
			"bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800",
	},
};

function highlightMatch(text: string, query: string): React.ReactNode {
	const q = query.trim();
	if (q.length < 2) return text;
	const idx = text.toLowerCase().indexOf(q.toLowerCase());
	if (idx === -1) return text;
	return (
		<>
			{text.slice(0, idx)}
			<span className="bg-amber-100 dark:bg-amber-900/50 text-inherit rounded px-0.5 font-semibold">
				{text.slice(idx, idx + q.length)}
			</span>
			{text.slice(idx + q.length)}
		</>
	);
}

function LoadingDots() {
	return (
		<div className="flex items-center justify-center gap-1.5 py-10">
			{[0, 1, 2].map((i) => (
				<span
					key={i}
					className="block size-2 rounded-full bg-blue-400 dark:bg-blue-500"
					style={{
						animation: "bounce 1.2s ease-in-out infinite",
						animationDelay: `${i * 0.16}s`,
					}}
				/>
			))}
		</div>
	);
}

function KbdHint({ children }: { children: React.ReactNode }) {
	return (
		<kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 leading-none">
			{children}
		</kbd>
	);
}

interface GlobalSearchProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);

		if (query.trim().length < 2) {
			setResults([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		debounceRef.current = setTimeout(async () => {
			try {
				const params = new URLSearchParams({ q: query.trim() });
				const res = await fetch(`/api/search?${params}`);
				if (!res.ok) throw new Error("Search failed");
				const data: SearchResponse = await res.json();
				setResults(data.results);
			} catch {
				setResults([]);
			} finally {
				setLoading(false);
			}
		}, 300);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query]);

	useEffect(() => {
		if (!open) {
			setQuery("");
			setResults([]);
			setLoading(false);
		}
	}, [open]);

	const handleSelect = (url: string) => {
		onOpenChange(false);
		navigate({ to: url });
	};

	const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
		if (!acc[r.module]) acc[r.module] = [];
		(acc[r.module] as SearchResult[]).push(r);
		return acc;
	}, {});

	const groupEntries = Object.entries(grouped);
	const hasResults = results.length > 0;
	const isQuerying = query.trim().length >= 2;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogHeader className="sr-only">
				<DialogTitle>Pencarian Global</DialogTitle>
				<DialogDescription>
					Cari pengaduan, kegiatan, dan dokumen
				</DialogDescription>
			</DialogHeader>

			{/* Posisi atas (Spotlight-style), lebih lebar */}
			<DialogContent className="top-[10%] translate-y-0 sm:max-w-2xl p-0 gap-0 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
				<Command
					shouldFilter={false}
					className="rounded-2xl bg-white dark:bg-slate-900 [&_[data-slot=command-input-wrapper]]:h-14 [&_[data-slot=command-input-wrapper]]:px-4 [&_[data-slot=command-input-wrapper]]:gap-3 [&_[data-slot=command-input-wrapper]]:border-slate-100 [&_[data-slot=command-input-wrapper]]:dark:border-slate-800 [&_[data-slot=command-input-wrapper]_svg]:size-5 [&_[data-slot=command-input-wrapper]_svg]:opacity-40"
				>
					{/* Input */}
					<CommandInput
						placeholder="Cari pengaduan, kegiatan, dokumen..."
						value={query}
						onValueChange={setQuery}
						className="text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
					/>

					{/* Body */}
					<CommandList className="max-h-[420px] overflow-y-auto scrollbar-thin">
						{loading && <LoadingDots />}

						{/* Idle — belum mengetik */}
						{!loading && !isQuerying && (
							<div className="flex flex-col items-center justify-center py-12 gap-4">
								<div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
									<Search className="size-7 text-slate-400 dark:text-slate-500" />
								</div>
								<div className="text-center space-y-1">
									<p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
										Cari di seluruh data desa
									</p>
									<p className="text-xs text-slate-400 dark:text-slate-500">
										Pengaduan warga · Kegiatan divisi · Dokumen
									</p>
								</div>
								<div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
									<span>Ketik minimal</span>
									<span className="font-semibold text-slate-600 dark:text-slate-300">
										2 karakter
									</span>
									<span>untuk mulai mencari</span>
								</div>
							</div>
						)}

						{/* Tidak ada hasil */}
						{!loading && isQuerying && !hasResults && (
							<div className="flex flex-col items-center justify-center py-12 gap-4">
								<div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
									<Search className="size-7 text-slate-300 dark:text-slate-600" />
								</div>
								<div className="text-center space-y-1">
									<p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
										Tidak ada hasil
									</p>
									<p className="text-xs text-slate-400 dark:text-slate-500">
										Tidak ada yang cocok dengan{" "}
										<span className="font-semibold text-slate-700 dark:text-slate-300">
											&ldquo;{query}&rdquo;
										</span>
									</p>
								</div>
							</div>
						)}

						{/* Hasil pencarian */}
						{!loading && hasResults && (
							<div className="py-2">
								{groupEntries.map(([module, items], idx) => {
									const cfg = MODULE_CONFIG[module];
									if (!cfg) return null;
									const { Icon } = cfg;
									return (
										<div key={module}>
											<CommandGroup
												className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-inherit"
												heading={
													<div className="flex items-center justify-between w-full">
														<span
															className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${cfg.badgeCls}`}
														>
															<Icon className="size-3" />
															{cfg.label}
														</span>
														<span className="text-[10px] tabular-nums text-slate-400 dark:text-slate-600">
															{items.length} hasil
														</span>
													</div>
												}
											>
												{items.map((item) => (
													<CommandItem
														key={`${module}-${item.id}`}
														value={`${module}-${item.id}`}
														onSelect={() => handleSelect(item.url)}
														className={[
															"group mx-2 mb-0.5 rounded-xl border-l-[3px] pl-3 pr-3 py-2.5 cursor-pointer transition-colors",
															cfg.accentCls,
															"data-[selected=true]:bg-slate-50 dark:data-[selected=true]:bg-slate-800/60",
															"hover:bg-slate-50 dark:hover:bg-slate-800/60",
														].join(" ")}
													>
														<div
															className={`shrink-0 size-8 rounded-lg ${cfg.iconBg} flex items-center justify-center mr-3`}
														>
															<Icon className={`size-4 ${cfg.iconCls}`} />
														</div>
														<div className="flex flex-col min-w-0 flex-1">
															<span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
																{highlightMatch(item.title, query)}
															</span>
															{item.snippet && (
																<span className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-relaxed">
																	{item.snippet}
																</span>
															)}
														</div>
														<ArrowRight className="size-3.5 text-slate-300 dark:text-slate-600 shrink-0 ml-2 opacity-0 group-data-[selected=true]:opacity-100 transition-opacity" />
													</CommandItem>
												))}
											</CommandGroup>

											{idx < groupEntries.length - 1 && (
												<div className="my-2 mx-4 h-px bg-slate-100 dark:bg-slate-800" />
											)}
										</div>
									);
								})}
							</div>
						)}
					</CommandList>

					{/* Footer keyboard hints */}
					<div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50">
						<div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
							<span className="flex items-center gap-1">
								<KbdHint>↑↓</KbdHint> navigasi
							</span>
							<span className="flex items-center gap-1">
								<KbdHint>↵</KbdHint> buka
							</span>
							<span className="flex items-center gap-1">
								<KbdHint>Esc</KbdHint> tutup
							</span>
						</div>
						{hasResults && (
							<span className="text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
								{results.length} hasil ditemukan
							</span>
						)}
					</div>
				</Command>
			</DialogContent>
		</Dialog>
	);
}

export function useGlobalSearch() {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "k") {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	return { open, setOpen };
}
