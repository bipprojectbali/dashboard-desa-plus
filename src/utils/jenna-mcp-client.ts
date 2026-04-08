/**
 * Jenna MCP External API Client
 * Digunakan untuk mengakses API dari server Jenna MCP
 * Base URL: https://cld-dkr-prod-jenna-mcp.wibudev.com
 */

const JENNA_MCP_BASE_URL = "https://cld-dkr-prod-jenna-mcp.wibudev.com";
const JENNA_MCP_API_KEY =
	"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJob3N0Iiwic3ViIjoiYmlwIiwicGF5bG9hZCI6IntcIm5hbWVcIjpcIm5vYyBkZXNhK1wiLFwiZGVzY3JpcHRpb25cIjpcInVudHVrIGRhc2hib2FyZCBub2MgZGVzYStcIixcImV4cGlyZWRBdFwiOlwiMjAzMC0xMi0zMVwifSIsImV4cCI6MTkyNDkwNTYwMCwiaWF0IjoxNzc1NTMzMDc0fQ.Ta3pxlwF3oM6Ve0KWhfvL6zbQiXE6D6I09dXMdogJXs";

/**
 * Fetch data from Jenna MCP external API
 * @param endpoint - API endpoint (e.g., '/api/noc/surat-perminggu')
 * @param options - Optional fetch options
 * @returns Promise with response data
 */
export async function fetchJennaMCP<T>(
	endpoint: string,
	options?: RequestInit,
): Promise<T> {
	const url = `${JENNA_MCP_BASE_URL}${endpoint}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			Authorization: JENNA_MCP_API_KEY,
			"Content-Type": "application/json",
		},
		...options,
	});

	if (!response.ok) {
		throw new Error(
			`Jenna MCP API error: ${response.status} ${response.statusText}`,
		);
	}

	return response.json() as Promise<T>;
}

/**
 * Get weekly service letter count from backend proxy (Jenna MCP API)
 * Backend proxy untuk menghindari CORS issues
 * @returns Promise with weekly count data
 */
export async function getWeeklyServiceCount(): Promise<number> {
	try {
		const response = await fetch("/api/noc/jenna/surat-perminggu");

		if (!response.ok) {
			throw new Error(`Backend proxy error: ${response.status}`);
		}

		const result = await response.json();

		if (!result.success) {
			console.warn("[Jenna MCP] Backend proxy returned error:", result.error);
			return result.jumlah ?? 0;
		}

		const data = result.data;

		// Try different response structures
		return data?.jumlah ?? data?.count ?? data?.total ?? result.jumlah ?? 0;
	} catch (error) {
		console.error("Failed to fetch weekly service count:", error);
		return 0; // Fallback to 0
	}
}

/**
 * Get complaint count statistics from backend proxy (Jenna MCP API)
 * Backend proxy untuk menghindari CORS issues
 * @returns Promise with complaint statistics
 */
export async function getComplaintCount(): Promise<{
	antrian: number;
	diterima: number;
	dikerjakan: number;
	ditolak: number;
	selesai: number;
	aktif: number;
	total: number;
}> {
	try {
		const response = await fetch("/api/noc/jenna/pengaduan-count");

		if (!response.ok) {
			throw new Error(`Backend proxy error: ${response.status}`);
		}

		const result = await response.json();

		if (!result.success) {
			console.warn("[Jenna MCP] Backend proxy returned error:", result.error);
			return {
				antrian: result.antrian ?? 0,
				diterima: result.diterima ?? 0,
				dikerjakan: result.dikerjakan ?? 0,
				ditolak: result.ditolak ?? 0,
				selesai: result.selesai ?? 0,
				aktif: result.aktif ?? 0,
				total: result.total ?? 0,
			};
		}

		const data = result.data;

		return {
			antrian: data?.antrian ?? 0,
			diterima: data?.diterima ?? 0,
			dikerjakan: data?.dikerjakan ?? 0,
			ditolak: data?.ditolak ?? 0,
			selesai: data?.selesai ?? 0,
			aktif: data?.aktif ?? 0,
			total: data?.total ?? 0,
		};
	} catch (error) {
		console.error("Failed to fetch complaint count:", error);
		return {
			antrian: 0,
			diterima: 0,
			dikerjakan: 0,
			ditolak: 0,
			selesai: 0,
			aktif: 0,
			total: 0,
		}; // Fallback to 0
	}
}
