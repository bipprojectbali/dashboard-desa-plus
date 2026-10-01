import { useRouterState } from "@tanstack/react-router";
import { useSnapshot } from "valtio";
import { useApiQuery } from "@/hooks/useApiQuery";
import { assistantTexts } from "@/locales/assistant";
import { authStore } from "@/store/auth";
import { i18nStore } from "@/store/i18n";
import { permissionStore } from "@/store/permission";
import {
	AssistantApiError,
	fetchAssistantStatus,
	fetchMyPermissions,
} from "./assistant.api";
import {
	embeddedState,
	shouldFetchStatus,
	shouldShowFab,
	toAssistantLang,
} from "./assistant.logic";

const STATUS_STALE_MS = 60_000;
const PERMISSIONS_STALE_MS = 5 * 60_000;

/** Teks panel sesuai bahasa UI. */
export function useAssistantText() {
	const { lang } = useSnapshot(i18nStore);
	return assistantTexts[toAssistantLang(lang)];
}

/**
 * Siapa boleh melihat asisten di rute ini. Status hanya diminta untuk user
 * login terverifikasi; izin dari permissionStore (MainLayout) atau, di
 * /profile, /wall, & /admin yang tidak memuatnya, dari /api/my-permissions.
 * `embedded` = panel tertanam di halaman Bantuan (tidak terikat aturan rute FAB).
 */
export function useAssistantAccess({ embedded = false } = {}) {
	const { user } = useSnapshot(authStore);
	const { allowed: storeAllowed } = useSnapshot(permissionStore);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const enabled = shouldFetchStatus({ pathname, user, embedded });

	const status = useApiQuery(
		["assistant", "status", user?.id],
		fetchAssistantStatus,
		{ enabled, staleTime: STATUS_STALE_MS, retry: false },
	);
	const permissions = useApiQuery(
		["assistant", "permissions", user?.id],
		fetchMyPermissions,
		{
			enabled: enabled && storeAllowed === null,
			staleTime: PERMISSIONS_STALE_MS,
			retry: false,
		},
	);

	const allowed = storeAllowed ?? permissions.data ?? null;
	const statusError = status.isError
		? status.error instanceof AssistantApiError
			? status.error.status
			: null
		: undefined;
	return {
		pathname,
		status: status.data,
		allowed: allowed ?? [],
		visible: shouldShowFab({ pathname, user, status: status.data, allowed }),
		embeddedState: embeddedState({
			user,
			status: status.data,
			statusError,
			allowed,
		}),
	};
}
