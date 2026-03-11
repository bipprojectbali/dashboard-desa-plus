import { redirect } from "@tanstack/react-router";
import { VITE_PUBLIC_URL } from "../utils/env";

/* ================================
 * Types
 * ================================ */

type UserRole = "user" | "admin";

type SessionUser = {
	id: string;
	role: UserRole;
};

type SessionResponse = {
	user?: SessionUser;
};

/* ================================
 * Session Fetcher
 * ================================ */

async function fetchSession(): Promise<SessionResponse | null> {
	try {
		const baseURL = VITE_PUBLIC_URL || window.location.origin;
		const res = await fetch(`${baseURL}/api/session`, {
			method: "GET",
			credentials: "include",
		});

		if (!res.ok) return null;

		const { data } = await res.json();
		return data as SessionResponse;
	} catch {
		return null;
	}
}

/* ================================
 * Redirect Helper
 * ================================ */

function redirectToLogin(to: string, currentHref: string) {
	throw redirect({
		to,
		search: { redirect: currentHref },
	});
}

/* ================================
 * Route Rules (Pattern Based)
 * ================================ */

type RouteRule = {
	match: (pathname: string) => boolean;
	requireAuth?: boolean;
	requiredRole?: UserRole;
	redirectTo?: string;
};

const routeRules: RouteRule[] = [
	{
		match: (p) => p === "/profile" || p.startsWith("/profile/"),
		requireAuth: true,
		redirectTo: "/signin",
	},
	{
		match: (p) => p === "/admin" || p.startsWith("/admin/"),
		requireAuth: true,
		requiredRole: "admin",
		redirectTo: "/signin",
	},
];

/* ================================
 * Rule Resolver
 * ================================ */

function findRouteRule(pathname: string): RouteRule | undefined {
	return routeRules.find((rule) => rule.match(pathname));
}

/* ================================
 * Protected Route Factory
 * ================================ */

export interface ProtectedRouteOptions {
	redirectTo?: string;
}

export function createProtectedRoute(options: ProtectedRouteOptions = {}) {
	const { redirectTo = "/signin" } = options;

	return async ({
		location,
	}: {
		location: { pathname: string; href: string };
	}) => {
		const rule = findRouteRule(location.pathname);
		if (!rule) return;

		const session = await fetchSession();
		const user = session?.user;

		if (rule.requireAuth && !user) {
			redirectToLogin(rule.redirectTo ?? redirectTo, location.href);
		}

		if (rule.requiredRole && user?.role !== rule.requiredRole) {
			redirectToLogin(rule.redirectTo ?? redirectTo, location.href);
		}

		return {
			session,
			user,
		};
	};
}

/* ================================
 * Default Middleware Export
 * ================================ */

export const protectedRouteMiddleware = createProtectedRoute();
