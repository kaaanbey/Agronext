export type L = "tr" | "en"

/** Her bölüm kendi tr/en metnini yanında tutar; bu yardımcı yalnız doğru dili seçer. */
export function pick<T>(locale: L, copy: { tr: T; en: T }): T {
  // Geçersiz bir [locale] (ör. /favicon.ico) sayfayı düşürmesin; düzen zaten 404 verir.
  return copy[locale] ?? copy.tr
}
