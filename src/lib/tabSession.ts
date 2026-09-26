// Penanda "tab ini sudah login", disimpan di sessionStorage (per tab, hilang saat
// tab ditutup). Dipakai supaya menutup tab lalu membuka app lagi = wajib login ulang,
// meski cookie sesi browser masih ada.

const KEY = "gm_tab_auth";

export function markTabLoggedIn() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* storage diblokir: abaikan, cookie tetap jadi pengaman utama */
  }
}

export function clearTabLogin() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

/** true = tab sah, false = tab baru/dibuka ulang, null = storage tidak tersedia. */
export function isTabLoggedIn(): boolean | null {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return null;
  }
}
