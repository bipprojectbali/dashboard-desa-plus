import { useCallback, useEffect, useRef, useState } from "react";
import type {
	AiAssistantAdminOverviewDto,
	AssistantSettingsDto,
	ProviderSlotDto,
} from "@/types/ai-assistant-admin";
import {
	AdminEndpointUnavailableError,
	fetchOverview,
} from "./ai-assistant.api";
import { defaultOverview } from "./ai-assistant.logic";

/** Muat & simpan state halaman admin AI Assistant; jatuh ke nilai default bila endpoint belum ada. */
export function useAiAssistantAdmin() {
	const [overview, setOverview] =
		useState<AiAssistantAdminOverviewDto>(defaultOverview);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [unavailable, setUnavailable] = useState(false);
	const abortRef = useRef<AbortController | null>(null);

	const refresh = useCallback(async () => {
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		setLoading(true);
		setError(null);
		try {
			setOverview(await fetchOverview(controller.signal));
			setUnavailable(false);
		} catch (err) {
			if (err instanceof Error && err.name === "AbortError") return;
			if (err instanceof AdminEndpointUnavailableError) {
				setOverview(defaultOverview());
				setUnavailable(true);
			} else {
				setError(err instanceof Error ? err.message : "Terjadi kesalahan");
			}
		} finally {
			if (!controller.signal.aborted) setLoading(false);
		}
	}, []);

	useEffect(() => {
		refresh();
		return () => abortRef.current?.abort();
	}, [refresh]);

	const applySettings = useCallback((settings: AssistantSettingsDto) => {
		setOverview((prev) => ({ ...prev, settings }));
	}, []);

	const applyProvider = useCallback((slot: ProviderSlotDto) => {
		setOverview((prev) => ({
			...prev,
			providers: prev.providers.map((p) =>
				p.feature === slot.feature ? slot : p,
			),
		}));
	}, []);

	return {
		overview,
		loading,
		error,
		unavailable,
		refresh,
		applySettings,
		applyProvider,
	};
}
