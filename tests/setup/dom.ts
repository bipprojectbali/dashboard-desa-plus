/**
 * Preload global untuk `bun test`: registrasi shim DOM (happy-dom) SEBELUM modul
 * apa pun di-import, supaya library yang menyentuh `window`/`document` di top-level
 * import (mis. `leaflet`) tidak crash saat dijalankan di lingkungan test Bun (bukan browser).
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (typeof window === "undefined") {
	GlobalRegistrator.register();
}
