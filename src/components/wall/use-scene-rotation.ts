import { useEffect, useState } from "react";
import { SCENE_INTERVAL_MS } from "./wall-theme";

/** Indeks scene berikutnya dengan wrap-around. Pure, agar mudah diuji. */
export function nextSceneIndex(current: number, count: number): number {
	if (count <= 0) return 0;
	return (current + 1) % count;
}

/**
 * Rotasi otomatis antar scene tiap SCENE_INTERVAL_MS.
 * Reset ke 0 bila jumlah scene berubah agar indeks tak out-of-range.
 */
export function useSceneRotation(count: number): number {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (count <= 1) {
			setIndex(0);
			return;
		}
		const timer = setInterval(() => {
			setIndex((current) => nextSceneIndex(current, count));
		}, SCENE_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [count]);

	return Math.min(index, Math.max(0, count - 1));
}
