import createClient from "openapi-fetch";
import type { paths } from "../../generated/api";
import { VITE_PUBLIC_URL } from "./env";

const baseUrl = VITE_PUBLIC_URL;

export const apiClient = createClient<paths>({
	baseUrl: baseUrl,
	credentials: "include",
});
