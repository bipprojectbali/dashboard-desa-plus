/**
 * Manually maintained types for Desa External API (desa-darmasaba-stg.wibudev.com).
 * Only includes the endpoints actually used in this project.
 * Update this file when adding new endpoints from the external API.
 */

type ApiResponse = {
	headers: { [name: string]: unknown };
	content: {
		"application/json": {
			data?: unknown;
			status?: string;
			message?: string;
		};
	};
};

type ApiError = {
	headers: { [name: string]: unknown };
	content: {
		"application/json": {
			message?: string;
			error?: string;
		};
	};
};

type GetOperation = {
	parameters: {
		query?: never;
		header?: never;
		path?: never;
		cookie?: never;
	};
	requestBody?: never;
	responses: {
		200: ApiResponse;
		default: ApiError;
	};
};

export interface paths {
	"/api/kependudukan/dashboard/summary": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/kependudukan/databanjar/find-many": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/kependudukan/distribusiumur/find-many": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/ekonomi/demografipekerjaan/find-many": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/kependudukan/distribusiagama/find-many": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/kesehatan/kelahiran/findMany": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/kesehatan/kematian/findMany": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/kependudukan/migrasipenduduk/find-many": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/ekonomi/sektourunggulandesa/find-many": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/keamanan/cctv/stats": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/keamanan/cctv/find-many": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/keamanan/laporanpublik/find-many": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/kesehatan/ringkasankesehatan/stats": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/kesehatan/posyandu/find-many": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/desa/eventbudaya/find-upcoming": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/ekonomi/umkm/dashboard/kpi": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: {
			parameters: { query?: { period?: string }; header?: never; path?: never; cookie?: never };
			requestBody?: never;
			responses: { 200: ApiResponse; default: ApiError };
		};
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/ekonomi/umkm/dashboard/ringkasan-penjualan": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: {
			parameters: { query?: { period?: string }; header?: never; path?: never; cookie?: never };
			requestBody?: never;
			responses: { 200: ApiResponse; default: ApiError };
		};
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/ekonomi/umkm/dashboard/top-produk": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: {
			parameters: { query?: { period?: string }; header?: never; path?: never; cookie?: never };
			requestBody?: never;
			responses: { 200: ApiResponse; default: ApiError };
		};
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/ekonomi/umkm/dashboard/detail-penjualan": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: {
			parameters: { query?: { period?: string; kategoriId?: string; umkmId?: string }; header?: never; path?: never; cookie?: never };
			requestBody?: never;
			responses: { 200: ApiResponse; default: ApiError };
		};
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/ekonomi/kategoriproduk/find-many-all": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/ekonomi/umkm/find-many-all": {
		parameters: { query?: never; header?: never; path?: never; cookie?: never };
		get: GetOperation;
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/landingpage/apbdes/{id}": {
		parameters: { query?: never; header?: never; path: { id: string }; cookie?: never };
		get: {
			parameters: {
				query?: never;
				header?: never;
				path: { id: string };
				cookie?: never;
			};
			requestBody?: never;
			responses: {
				200: ApiResponse;
				default: ApiError;
			};
		};
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
}
