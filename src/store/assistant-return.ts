import { proxy } from "valtio";
import { assistantStore, closeAssistant, openAssistant } from "./assistant";

/**
 * P6: saat panel dalam mode diperbesar (menutupi layar) dan penunjuk akan
 * bekerja, panel ditutup sementara agar elemen yang ditunjuk terlihat.
 * `awaitingReturn` memunculkan tombol "Kembali ke chat". Percakapan tetap di
 * assistantStore, jadi membuka kembali tidak mereset apa pun.
 */
export const returnStore = proxy({ awaitingReturn: false });

/** Tutup panel sementara bila sedang diperbesar; true bila benar-benar ditutup. */
export function suspendPanelForPointer(): boolean {
	if (!assistantStore.open || !assistantStore.maximized) return false;
	closeAssistant();
	returnStore.awaitingReturn = true;
	return true;
}

/** Buka lagi panel (ukuran diperbesar tetap) dan sembunyikan tombol kembali. */
export function returnToChat() {
	returnStore.awaitingReturn = false;
	openAssistant();
}

/** Panel dibuka dengan cara lain (FAB): tombol kembali tidak relevan lagi. */
export function clearReturn() {
	returnStore.awaitingReturn = false;
}
