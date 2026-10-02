import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { CctvItem } from "./keamanan.types";

const markerIcon = L.icon({
	iconUrl: "/marker-icon.png",
	iconRetinaUrl: "/marker-icon-2x.png",
	shadowUrl: "/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

export const CctvMap = ({
	cctvList,
	dark,
}: {
	cctvList: CctvItem[];
	dark: boolean;
}) => {
	const mapRef = useRef<HTMLDivElement>(null);
	const leafletMap = useRef<L.Map | null>(null);

	useEffect(() => {
		if (!mapRef.current || leafletMap.current) return;

		const validItems = cctvList.filter((c) => c.latitude && c.longitude);
		const first = validItems[0];
		const center: [number, number] = first
			? [first.latitude, first.longitude]
			: [-8.6705, 115.212];

		const map = L.map(mapRef.current, { center, zoom: 14 });
		leafletMap.current = map;

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "© OpenStreetMap contributors",
		}).addTo(map);

		for (const cctv of validItems) {
			L.marker([cctv.latitude, cctv.longitude], { icon: markerIcon })
				.addTo(map)
				.bindPopup(
					`<b>${cctv.kode}</b><br>${cctv.nama}<br><small>${cctv.lokasi}</small><br><span style="color:${cctv.status === "Online" ? "green" : "gray"}">${cctv.status}</span>`,
				);
		}

		if (validItems.length > 1) {
			const bounds = L.latLngBounds(
				validItems.map((c) => [c.latitude, c.longitude]),
			);
			map.fitBounds(bounds, { padding: [40, 40] });
		}

		return () => {
			map.remove();
			leafletMap.current = null;
		};
	}, [cctvList]);

	return (
		<div
			ref={mapRef}
			style={{
				height: "400px",
				borderRadius: "8px",
				border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
				zIndex: 0,
			}}
		/>
	);
};
