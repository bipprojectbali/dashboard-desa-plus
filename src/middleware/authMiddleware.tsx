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
	// Public routes - no auth required
	{
		match: (p) =>
			p === "/" ||
			p === "/signin" ||
			p === "/signup" ||
			p.startsWith("/kinerja-divisi") ||
			p.startsWith("/pengaduan") ||
			p.startsWith("/jenna") ||
			p.startsWith("/demografi") ||
			p.startsWith("/keuangan") ||
			p.startsWith("/bumdes") ||
			p.startsWith("/sosial") ||
			p.startsWith("/keamanan") ||
			p.startsWith("/bantuan") ||
			p.startsWith("/pengaturan") ||
			p.startsWith("/users"),
		requireAuth: false,
	},
	// Profile routes - auth required for all roles
	{
		match: (p) => p === "/profile" || p.startsWith("/profile/"),
		requireAuth: true,
		redirectTo: "/signin",
	},
	// Admin routes - auth required with admin role only
	{
		match: (p) => p.startsWith("/admin"),
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

		// If no rule matches, allow access by default
		if (!rule) return;

		// If route explicitly doesn't require auth, allow access
		if (rule.requireAuth === false) return;

		const session = await fetchSession();
		const user = session?.user;

		// If auth is required but user is not logged in, redirect to login
		if (rule.requireAuth && !user) {
			redirectToLogin(rule.redirectTo ?? redirectTo, location.href);
		}

		// If specific role is required, check it
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
