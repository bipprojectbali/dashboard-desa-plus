import { nocExternalClient } from "../src/utils/noc-external-client";

async function inspect() {
    const ID_DESA = "desa1";
    console.log("Checking NOC API Data structure...");

    const endpoints = [
        "/api/noc/active-divisions",
        "/api/noc/latest-projects",
        "/api/noc/upcoming-events",
        "/api/noc/latest-discussion"
    ];

    for (const endpoint of endpoints) {
        console.log(`\n--- Endpoint: ${endpoint} ---`);
        try {
            const { data, error } = await (nocExternalClient as any).GET(endpoint, {
                params: { query: { idDesa: ID_DESA, limit: "1" } }
            });

            if (error) {
                console.error(`Error fetching ${endpoint}:`, error);
                continue;
            }

            if (data && data.data && data.data.length > 0) {
                console.log("Sample Data Object Keys:", Object.keys(data.data[0]));
                console.log("Sample Data Object Values:", JSON.stringify(data.data[0], null, 2));
            } else {
                console.log("No data returned or data is empty.");
            }
        } catch (err) {
            console.error(`Failed to fetch ${endpoint}:`, err);
        }
    }
}

inspect();
