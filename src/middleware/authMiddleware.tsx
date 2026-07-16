import { redirect } from "@tanstack/react-router";
import { VITE_PUBLIC_URL } from "../utils/env";

/* ================================
 * Types
 * ================================ */

type UserRole = "user" | "admin";

type SessionUser = {
	id: string;
	role: UserRole;
	emailVerified?: boolean | null;
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
	// Truly public — signin, signup, and OAuth callback handler
	{
		match: (p) => p === "/signin" || p === "/signup" || p === "/auth-callback",
		requireAuth: false,
	},
	// Admin routes — auth + admin role required
	{
		match: (p) => p.startsWith("/admin"),
		requireAuth: true,
		requiredRole: "admin",
		redirectTo: "/signin",
	},
	// Akses & Tim settings — admin only
	{
		match: (p) => p === "/pengaturan/akses-dan-tim",
		requireAuth: true,
		requiredRole: "admin",
		redirectTo: "/",
	},
	// Pengaturan video wall — admin only. Harus SEBELUM rule `/wall` publik;
	// meski `/pengaturan/wall` tak match `startsWith("/wall")`, urutan eksplisit
	// ini mencegah salah-lolos bila pola diubah kelak.
	{
		match: (p) => p === "/pengaturan/wall",
		requireAuth: true,
		requiredRole: "admin",
		redirectTo: "/",
	},
	// NOC video wall — publik (TV/kiosk tak login). Token opsional dicek
	// di server via WALL_ACCESS_TOKEN, bukan di router.
	{
		match: (p) => p.startsWith("/wall"),
		requireAuth: false,
	},
	// All other routes — auth required
	{
		match: () => true,
		requireAuth: true,
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

		// Always fetch session so authStore can be populated for all routes
		const session = await fetchSession();
		const user = session?.user;

		// If no rule matches or route is public, return session data without enforcing auth
		if (!rule || rule.requireAuth === false) {
			return { session, user };
		}

		// If auth is required but user is not logged in, redirect to login
		if (rule.requireAuth && !user) {
			redirectToLogin(rule.redirectTo ?? redirectTo, location.href);
		}

		// If user has not been verified by admin yet, block access (except /profile)
		if (
			user &&
			user.emailVerified === false &&
			!location.pathname.startsWith("/profile")
		) {
			redirectToLogin("/signin", location.href);
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
