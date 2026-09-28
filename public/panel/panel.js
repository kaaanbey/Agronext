// AgroNext — Panel v3
// ====================
// Kurallar (index.html başındaki güvenlik notlarıyla aynı):
//  - Yalnız publishable anahtar. Yetki = kullanıcı oturumu + veritabanındaki RLS.
//  - Ekrana yalnız textContent / DOM düğümü; innerHTML hiç kullanılmaz.
//  - Ölçülmeyen değer gösterilmez: veri yoksa "Veri yok", tahmin yoksa "Tahmin yok".
//  - Onayla/Reddet yalnız kayıttır; pompayı çalıştırmaz.
//  - Uyarılar, karar gerekçesi ve NexAI yanıtları yalnız okunan veriden üretilir;
//    NexAI tarayıcı dışına istek atmaz (dil modeli bağlı değil, kural tabanlı).

// ============================ AYARLAR =====================================
const SUPABASE_URL = "https://uidjvztigoubyhmsmvog.supabase.co";
const SUPABASE_KEY = "sb_publishable_cadBrLPJOSn3sUuih8ud4w_Jfr4wNG_";

const AYAR = {
  YENILE_MS: 60000,        // cihazlar 60 sn'de bir gönderir; panel de 60 sn'de bir tazeler
  ONLINE_SANIYE: 120,      // 60 sn gönderim + ağ gecikmesi; 60 olsaydı durum sürekli yanıp sönerdi
  GECIKME_SANIYE: 300,     // bundan eskiyse "çevrimdışı"
  BAYAT_OLCUM_SANIYE: 180, // ölçüm kartında "gecikiyor" uyarısı
  BAYAT_TAHMIN_DK: 15,     // tahmin 5 dk'da bir gelir; 15 dk'dır yoksa gösterge griye döner
  BOSLUK_MS: 10 * 60000,   // grafikte bundan uzun boşlukta çizgi kesilir (ara değer uydurulmaz)
  POMPA_ADIM_TAVAN_MS: 2 * 60000, // pompa süresi: tek satır en fazla 2 dk sayılır (kayıp veri şişirmesin)
  SAYFA: 1000,             // Supabase tek istekte en fazla 1000 satır döndürür → sayfalayarak çek
};
// ==========================================================================

if (typeof supabase === "undefined") {
  document.getElementById("giris_hata").textContent =
    "Bağlantı kütüphanesi yüklenemedi. Sayfayı yenile; sürerse internet bağlantını kontrol et.";
  document.getElementById("giris_btn").disabled = true;
  throw new Error("supabase-js yuklenemedi");
}
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = (id) => document.getElementById(id);

// Alan tanımları. ETİKETLER KİLİTLİ (CLAUDE.md etiketleme kuralları):
// toprak nemi "göreceli", EC "trend takibi", "NPK" yok, ışık yok.
const ALAN = {
  air_temp:   { ad: "Hava sıcaklığı", alt: "",                                  birim: "°C",  b: 1 },
  humidity:   { ad: "Bağıl nem",      alt: "",                                  birim: "%",   b: 0 },
  co2:        { ad: "CO₂",            alt: "",                                  birim: "ppm", b: 0 },
  pressure:   { ad: "Hava basıncı",   alt: "BME680",                            birim: "hPa", b: 0 },
  // Gaz direnci IAQ değildir (Bosch BSEC gerekir): yalnız eğilim, yüksek = daha temiz hava.
  gas_res:    { ad: "Gaz direnci",    alt: "Hava kalitesi — göreceli trend",    birim: "kΩ",  b: 0 },
  soil_pct_1: { ad: "Toprak nemi",    alt: "Kalibre göreceli nem",              birim: "%",   b: 0 },
  soil_pct_2: { ad: "Prob 2 (yedek)", alt: "Kalibre göreceli nem",              birim: "%",   b: 0 },
  soil_ec:    { ad: "Toprak EC",      alt: "Toprak iletkenliği — trend takibi", birim: "",    b: 0 },
  soil_ph:    { ad: "Toprak pH",      alt: "Trend takibi",                      birim: "",    b: 1,
                yokMetni: "Sensör doğrulanıyor" },
};
const GENEL_ALANLAR = ["air_temp", "humidity", "co2", "gas_res", "pressure", "soil_pct_1", "soil_ec", "soil_ph"];

// Cihaz adı → tip ve o kartın ölçtüğü alanlar. Bilinmeyen adda tüm alanlar denenir.
const CIHAZ_TIPI = [
  { onek: "ClimaNEX", tip: "İklim ünitesi", alanlar: ["air_temp", "humidity", "co2", "pressure", "gas_res"] },
  { onek: "TerraNEX", tip: "Toprak ünitesi", alanlar: ["soil_pct_1", "soil_pct_2", "soil_ec", "soil_ph"] },
];

// Geçmiş sekmesindeki seriler. CO₂ sensörü basamaklı değer verir → basamaklı çizim.
const SERILER = [
  { k: "air_temp",   ad: "Hava sıcaklığı", birim: "°C" },
  { k: "humidity",   ad: "Bağıl nem",      birim: "%" },
  { k: "soil_pct_1", ad: "Toprak nemi",    birim: "% göreceli" },
  { k: "co2",        ad: "CO₂",            birim: "ppm", basamakli: true },
  { k: "soil_ec",    ad: "Toprak EC",      birim: "trend" },
  { k: "gas_res",    ad: "Gaz direnci",    birim: "kΩ, göreceli" },
  { k: "pressure",   ad: "Hava basıncı",   birim: "hPa" },
];

// Optimum aralıklar: genel sebze serası (domates baz), eski asistan.py'deki FAO
// tabanlı değerler — danışman teyidi alınacak. EC ve pH için aralık YOK: EC kalibre
// değil (yalnız trend), pH sensörü doğrulanmadı. Onlara "Normal/Düşük" denmez.
// Basınç ve gaz direnci için de aralık yok: seraya özgü eşik yok / gaz direnci göreceli.
const ARALIK = {
  air_temp:   { alt: 18,  ust: 27,   ad: "sıcaklık" },
  humidity:   { alt: 50,  ust: 75,   ad: "bağıl nem" },
  co2:        { alt: 400, ust: 1200, ad: "CO₂" },
  soil_pct_1: { alt: 40,  ust: 75,   ad: "toprak nemi" },
};
// MH-Z14A 27 Eyl'den beri sürekli tavan (5000) basıyor: ölçüm değil, "doydu" demek.
// Böyle satırların CO₂'si okunurken silinir. Gerçek ölçüm yokken kart, 22–25 Eyl'deki
// 3699 gerçek ölçümün ortalamasını "geçmiş ortalama" notuyla gösterir. Bu değer uyarı,
// NexAI ve tahmine GİRMEZ (onlar yalnız durum.readings'teki gerçek değeri görür).
const CO2_TAVAN = 5000;
const CO2_GECMIS_ORT = { v: 1340, not: "Geçmiş ortalama (22–25 Eyl, 3699 ölçüm) · sensör kalibrasyonda" };
function co2Temizle(satirlar) {
  for (const r of satirlar) if (doluMu(r.co2) && Number(r.co2) >= CO2_TAVAN) r.co2 = null;
  return satirlar;
}
const ESIK_VARSAYILAN = 32;   // sulama_esigi(); tahmin kaydı gelmezse kullanılır
// Eğilim oku: son 30 dk ortalaması ile önceki 30 dk arasındaki fark bundan küçükse "sabit".
// soil_ec ve gas_res mutlak ölçek taşımaz: eşikleri değerin %3'üyle büyür (trendEsigi).
const TREND_ESIK = { air_temp: 0.3, humidity: 1.5, co2: 40, pressure: 0.5, gas_res: 2,
                     soil_pct_1: 1, soil_ec: 5, soil_ph: 0.1 };
const GORECELI = ["soil_ec", "gas_res"];
function trendEsigi(k, v) {
  const e = TREND_ESIK[k] || 0;
  return GORECELI.includes(k) ? Math.max(e, Math.abs(v) * 0.03) : e;
}

// Düzenek fotoğrafındaki işaretler. x/y fotoğrafın yüzdesidir; hero.jpg eklenince
// gerçek konumlara göre ayarlanır. Yalnız GERÇEKTE var olan parçalar işaretlenir
// (fan/ısıtıcı düzenekte yok, bu yüzden listede de yok).
const NOKTALAR = [
  { ad: "ClimaNEX", tip: "İklim ünitesi", onek: "ClimaNEX", x: 12, y: 28,
    ozet: () => [olcumMetni("air_temp"), olcumMetni("humidity")] },
  { ad: "TerraNEX", tip: "Toprak ünitesi", onek: "TerraNEX", x: 26, y: 60,
    ozet: () => [olcumMetni("soil_pct_1", "toprak ")] },
  { ad: "Pompa", tip: "Röle · kartta sürülür", pompa: true, x: 90, y: 40,
    ozet: () => [pompaMetni()] },
];

// Uyarı seviyeleri: sıralama ve etiketler tek yerde.
const SEVIYE = {
  kritik: { ad: "Kritik",        sira: 0, ikon: "M12 3l9.5 17h-19zM12 10v4M12 17.5h.01" },
  orta:   { ad: "Orta",          sira: 1, ikon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v5M12 16.5h.01" },
  bilgi:  { ad: "Bilgilendirme", sira: 2, ikon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 7.5h.01" },
};

const durum = {
  kullanici: null,
  readings: [],        // son 24 saat, yeniden eskiye
  cihazlar: [],
  tahminler: [],       // prediction_outcomes, son 24 saat, yeniden eskiye
  oneriler: [],
  aktivite: [],
  ilkTahmin: null,
  v2Yok: false,        // v2 şeması henüz yüklenmediyse panel çökmeden v1 gibi çalışır
  gecmisSaat: 24,
  gecmisOnbellek: {},  // { saat: {zaman, satirlar} }
  zamanlayici: null,
  uyarilar: [],        // uyarilariHesapla() çıktısı; NexAI de buradan okur
  sohbetBasladi: false,
};

// ------------------------------------------------------------ yardımcılar
function el(etiket, sinif, metin) {
  const e = document.createElement(etiket);
  if (sinif) e.className = sinif;
  if (metin !== undefined && metin !== null) e.textContent = metin;
  return e;
}
const doluMu = (v) => v !== null && v !== undefined;
const sn = (ts) => (Date.now() - new Date(ts).getTime()) / 1000;

function yasMetni(saniye) {
  if (saniye < 60) return Math.max(1, Math.round(saniye)) + " sn önce";
  if (saniye < 3600) return Math.round(saniye / 60) + " dk önce";
  if (saniye < 86400) return Math.round(saniye / 3600) + " saat önce";
  return Math.round(saniye / 86400) + " gün önce";
}
function saat(ts) {
  const d = new Date(ts);
  const bugun = new Date().toDateString() === d.toDateString();
  const hm = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  return bugun ? hm : d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) + " " + hm;
}
// useGrouping "min2": 4 haneli sayıya ayraç konmaz (1005 hPa "1.005" görünüp 1,005 sanılmasın)
function sayi(v, b) { return Number(v).toLocaleString("tr-TR", { minimumFractionDigits: b, maximumFractionDigits: b, useGrouping: "min2" }); }
function renk(ad) { return getComputedStyle(document.documentElement).getPropertyValue(ad).trim(); }

// v2 tablosu/fonksiyonu yoksa PostgREST bu kodları döner.
function semaEksik(error) {
  return error && ["PGRST202", "PGRST205", "42P01", "42883"].includes(error.code);
}

// Supabase tek istekte en fazla 1000 satır verir. 24 saat × 2 cihaz ≈ 2880 satır;
// sayfalamadan sorgulanırsa grafik sessizce yalnız son ~8 saati gösterir.
async function sayfaliCek(sorgu, tavan = 25000) {
  let tum = [];
  for (let bas = 0; bas < tavan; bas += AYAR.SAYFA) {
    const { data, error } = await sorgu().range(bas, bas + AYAR.SAYFA - 1);
    if (error) throw error;
    tum = tum.concat(data);
    if (data.length < AYAR.SAYFA) break;
  }
  return tum;
}

function cihazTipi(ad) {
  return CIHAZ_TIPI.find((t) => (ad || "").startsWith(t.onek)) ||
         { tip: "Cihaz", alanlar: Object.keys(ALAN) };
}
function cihazDurumu(sonTs) {
  if (!sonTs) return { sinif: "cevrimdisi", metin: "Hiç veri yok" };
  const s = sn(sonTs);
  if (s < AYAR.ONLINE_SANIYE) return { sinif: "cevrimici", metin: "Çevrimiçi" };
  if (s < AYAR.GECIKME_SANIYE) return { sinif: "gecikmeli", metin: "Gecikmeli" };
  return { sinif: "cevrimdisi", metin: "Çevrimdışı" };
}
// satırlar yeniden eskiye sıralı; filtre verilirse yalnız o satırlar arasında arar
function sonDolu(satirlar, alan, filtre) {
  return satirlar.find((r) => doluMu(r[alan]) && (!filtre || filtre(r)));
}

// Uyarı ve gerekçe yalnız TAZE ölçümden üretilir: 30 dk'dan eski değer
// "şu an" diye yorumlanmaz (bayatlığı ayrıca bağlantı uyarısı söyler).
function taze(alan) {
  const r = sonDolu(durum.readings, alan);
  return r && sn(r.ts) < 30 * 60 ? { v: Number(r[alan]), ts: r.ts } : null;
}
function esikDegeri() {
  const t = durum.tahminler[0];
  return t && doluMu(t.esik) ? Number(t.esik) : ESIK_VARSAYILAN;
}
// "normal" | "dusuk" | "yuksek" | "kritik" | null (aralığı olmayan alan)
function seviyeBul(alan, v) {
  const a = ARALIK[alan];
  if (!a || !doluMu(v)) return null;
  if (alan === "soil_pct_1" && v < esikDegeri()) return "kritik";
  if (v < a.alt) return "dusuk";
  if (v > a.ust) return "yuksek";
  return "normal";
}
const SEVIYE_AD = { normal: "Normal", dusuk: "Düşük", yuksek: "Yüksek", kritik: "Kritik" };

function ortalama(alan, t0, t1) {
  let top = 0, n = 0;
  for (const r of durum.readings) {
    const t = new Date(r.ts).getTime();
    if (t >= t0 && t < t1 && doluMu(r[alan])) { top += Number(r[alan]); n++; }
  }
  return n ? top / n : null;
}
// Son 30 dk ile önceki 30 dk'nın ortalama farkı. Veri yetmezse null.
function egilim(alan) {
  const s = Date.now(), dk = 60000;
  const yeni = ortalama(alan, s - 30 * dk, s), eski = ortalama(alan, s - 60 * dk, s - 30 * dk);
  return yeni === null || eski === null ? null : yeni - eski;
}
// İşaret kutusu için kısa metin; ölçüm yoksa null (kutu "veri yok" yazar).
function olcumMetni(alan, onek) {
  const r = sonDolu(durum.readings, alan);
  return r ? (onek || "") + sayi(r[alan], ALAN[alan].b) + " " + ALAN[alan].birim : null;
}
function pompaMetni() {
  const r = sonDolu(durum.readings, "pump");
  if (!r) return "pompa kaydı yok";
  return Number(r.pump) === 1 ? "çalışıyor" : "kapalı";
}
// Son 24 saatte pompanın açık görüldüğü en son an (pump kolonu).
function sonSulama() {
  const r = durum.readings.find((x) => doluMu(x.pump) && Number(x.pump) === 1);
  return r ? r.ts : null;
}
function suredenMetin(saniye) {
  if (saniye < 3600) return Math.max(1, Math.round(saniye / 60)) + " dk";
  return sayi(saniye / 3600, saniye < 36000 ? 1 : 0) + " saat";
}

// ------------------------------------------------------------ giriş / çıkış
$("giris_form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("giris_btn").disabled = true;
  $("giris_hata").textContent = "";
  const { error } = await sb.auth.signInWithPassword({
    email: $("eposta").value.trim(),
    password: $("sifre").value,
  });
  $("giris_btn").disabled = false;
  if (error) {
    // Ayrıntı yazılmaz: "bu e-posta kayıtlı mı?" bilgisi sızmasın.
    $("giris_hata").textContent = "Giriş başarısız. E-posta veya şifre hatalı.";
    return;
  }
  $("sifre").value = "";
  await panelAc();
});

$("cikis").addEventListener("click", () => sb.auth.signOut());

sb.auth.onAuthStateChange((olay) => {
  if (olay === "SIGNED_OUT") girisGoster();
});

function girisGoster() {
  if (durum.zamanlayici) clearInterval(durum.zamanlayici);
  durum.zamanlayici = null;
  durum.gecmisOnbellek = {};
  $("uygulama").classList.add("gizli");
  $("giris").classList.remove("gizli");
}

async function panelAc() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return girisGoster();
  durum.kullanici = user;
  $("kullanici").textContent = user.email;
  $("avatar").textContent = (user.email || "?").charAt(0).toLocaleUpperCase("tr-TR");
  $("ayar_eposta").textContent = user.email;
  $("giris").classList.add("gizli");
  $("uygulama").classList.remove("gizli");
  sekmeGoster();

  const { data: seralar } = await sb.from("seralar").select("ad").limit(1);
  const seraAd = seralar && seralar[0] ? seralar[0].ad : "Sera";
  $("sera_ad").textContent = seraAd;
  $("ayar_sera").textContent = seraAd;

  await yenile();
  if (durum.zamanlayici) clearInterval(durum.zamanlayici);
  durum.zamanlayici = setInterval(yenile, AYAR.YENILE_MS);
}

// ------------------------------------------------------------ sekmeler
const SEKMELER = ["genel", "cihazlar", "uyarilar", "gecmis", "yz", "nexai", "ayarlar"];
function sekmeGoster() {
  const ad = SEKMELER.includes(location.hash.slice(1)) ? location.hash.slice(1) : "genel";
  for (const s of SEKMELER) $("s_" + s).classList.toggle("gizli", s !== ad);
  for (const a of document.querySelectorAll(".menu-dugme")) {
    if (a.dataset.sekme === ad) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  // Sohbet tek düğüm: NexAI sekmesinde büyük, diğerlerinde Genel Bakış'ın yan sütununda.
  // Taşımak (kopyalamak değil) konuşma geçmişini ve yazılan metni korur.
  const yuva = $(ad === "nexai" ? "yuva_nexai" : "yuva_genel");
  if ($("sohbet").parentNode !== yuva) yuva.append($("sohbet"));
  $("sohbet_akis").scrollTop = $("sohbet_akis").scrollHeight;
  // Canvas gizliyken genişliği 0'dır; grafikler sekme görününce çizilir.
  if (ad === "genel") genelGrafikleriCiz();
  if (ad === "yz") yzGrafikCiz();
  if (ad === "gecmis") gecmisCiz();
}
window.addEventListener("hashchange", sekmeGoster);

let boyutZamani = null;
window.addEventListener("resize", () => {
  clearTimeout(boyutZamani);
  boyutZamani = setTimeout(sekmeGoster, 150);
});

// Hero görseli yoksa (henüz eklenmediyse) yer tutucu gösterilir. Stok fotoğraf konmaz.
function heroYok() { $("hero_img").classList.add("gizli"); $("hero_yok").classList.remove("gizli"); }
$("hero_img").addEventListener("error", heroYok);
if ($("hero_img").complete && $("hero_img").naturalWidth === 0) heroYok();

// ------------------------------------------------------------ veri
async function yenile() {
  const bastan = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const hatalar = [];

  // DİKKAT: cihaz_id filtresi YOK. RLS yalnız bu kullanıcının satırlarını döndürür.
  try {
    durum.readings = co2Temizle(await sayfaliCek(() => sb.from("readings").select("*")
      .gte("ts", bastan).order("ts", { ascending: false }).order("id", { ascending: false })));
  } catch (e) { hatalar.push("ölçümler"); }

  // v2 kaynakları: her biri ayrı; biri yoksa diğerleri yine çalışır.
  const [cih, tah, one, akt, ilk] = await Promise.all([
    sb.rpc("cihazlarim"),
    sb.from("prediction_outcomes").select("*").gte("created_at", bastan)
      .order("created_at", { ascending: false }).limit(1000),
    sb.from("oneriler").select("*").eq("durum", "bekliyor")
      .order("created_at", { ascending: false }).limit(20),
    sb.from("activity_log").select("*").order("created_at", { ascending: false }).limit(100),
    durum.ilkTahmin ? Promise.resolve({ data: [durum.ilkTahmin] })
      : sb.from("predictions").select("created_at").order("created_at", { ascending: true }).limit(1),
  ]);
  durum.v2Yok = [cih, tah, one, akt].some((r) => semaEksik(r.error));
  durum.cihazlar = cih.data || [];
  durum.tahminler = tah.data || [];
  durum.oneriler = one.data || [];
  durum.aktivite = akt.data || [];
  if (ilk.data && ilk.data[0]) durum.ilkTahmin = ilk.data[0];
  if (!durum.v2Yok) for (const r of [cih, tah, one, akt]) if (r.error) hatalar.push("panel verisi");

  durum.uyarilar = uyarilariHesapla();
  genelCiz();
  cihazlarCiz();
  uyarilarCiz();
  onerilerCiz();
  yzOzetCiz();
  aktiviteCiz();
  sistemDurumuCiz();
  durum.gecmisOnbellek[24] = { zaman: Date.now(), satirlar: durum.readings };
  const acik = location.hash.slice(1) || "genel";
  if (acik === "genel") genelGrafikleriCiz();
  if (acik === "yz") yzGrafikCiz();
  if (acik === "gecmis") gecmisCiz();
  if (!durum.sohbetBasladi) sohbetBaslat();
  sohbetCipleriCiz();

  const sonOlcum = durum.readings[0];
  $("guncelleme").textContent = hatalar.length
    ? "Bazı veriler okunamadı (" + [...new Set(hatalar)].join(", ") + "). Bağlantıyı kontrol et."
    : "Son ölçüm " + (sonOlcum ? saat(sonOlcum.ts) + " (" + yasMetni(sn(sonOlcum.ts)) + ")" : "yok") +
      " · panel " + new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) +
      "'de tazelendi, 60 sn'de bir yenilenir";
}

// Üstteki durum hapı. "Yerel mod": buluta veri gelmiyor. Sahadaki hat (USB → laptop)
// internetten bağımsızdır; panel onun çalıştığını göremez, yalnız bulutun sustuğunu bilir.
function sistemDurumuCiz() {
  const hap = $("sistem_durumu");
  const kritik = durum.uyarilar.filter((u) => u.seviye === "kritik").length;
  const orta = durum.uyarilar.filter((u) => u.seviye === "orta").length;
  const cevrimici = durum.cihazlar.filter((c) => cihazDurumu(c.son_ts).sinif !== "cevrimdisi").length;
  const sonOlcum = durum.readings[0];
  const bulutSustu = !sonOlcum || sn(sonOlcum.ts) > AYAR.GECIKME_SANIYE ||
                     (durum.cihazlar.length > 0 && cevrimici === 0);
  let sinif, metin, aciklama;
  if (bulutSustu) {
    sinif = "yerel"; metin = "Yerel mod";
    aciklama = "Buluta yeni veri gelmiyor. Sahadaki ölçüm ve tahmin hattı internetten bağımsızdır.";
  } else if (kritik || orta) {
    sinif = kritik ? "kritik" : "uyari"; metin = "Uyarı var";
    aciklama = (kritik ? kritik + " kritik, " : "") + orta + " orta seviye uyarı";
  } else {
    sinif = "cevrimici"; metin = "Çevrimiçi";
    aciklama = "Veri akışı normal, dikkat gerektiren durum yok";
  }
  hap.className = "durum-hap " + sinif;
  hap.lastChild.textContent = metin;
  hap.title = aciklama;

  const rozet = $("uyari_rozet");
  rozet.classList.toggle("gizli", kritik + orta === 0);
  rozet.classList.toggle("kritik", kritik > 0);
  rozet.textContent = kritik + orta;
}

// ------------------------------------------------------------ Genel Bakış
function olcumKarti(k, satirlar) {
  const a = ALAN[k];
  const kart = el("article", "kart olcum");
  const ust = el("div", "ust-satir");
  const adlar = el("div");
  adlar.append(el("div", "ad", a.ad), el("div", "alt", a.alt));
  ust.append(adlar);
  kart.append(ust);

  const bulunan = sonDolu(satirlar, k);
  if (!bulunan && k === "co2") {
    ust.append(el("span", "etiket notr", "Ortalama"));
    const d = el("div", "deger", sayi(CO2_GECMIS_ORT.v, 0));
    d.append(el("span", "birim", a.birim));
    kart.classList.add("bayat");
    kart.append(d, el("div", "yas", CO2_GECMIS_ORT.not));
    return kart;
  }
  if (!bulunan) {
    kart.append(el("div", "deger metin", a.yokMetni || "Veri yok"), el("div", "yas", ""));
    return kart;
  }
  const v = Number(bulunan[k]);
  const s = sn(bulunan.ts);
  const bayat = s > AYAR.BAYAT_OLCUM_SANIYE;

  // Durum etiketi yalnız aralığı tanımlı alanlarda; EC/pH'ye "Trend" yazılır.
  const sev = bayat ? null : seviyeBul(k, v);
  if (sev) ust.append(el("span", "etiket " + sev, SEVIYE_AD[sev]));
  else if (!ARALIK[k]) ust.append(el("span", "etiket notr", "Trend"));

  const satir = el("div", "deger-satir");
  const deger = el("div", "deger", sayi(v, a.b));
  if (a.birim) deger.append(el("span", "birim", a.birim));
  satir.append(deger);
  const fark = egilim(k);
  if (fark !== null) {
    const esik = trendEsigi(k, v);
    const yon = fark > esik ? "artis" : fark < -esik ? "azalis" : "sabit";
    const ok = el("span", "ok " + yon, { artis: "↗", azalis: "↘", sabit: "→" }[yon]);
    ok.title = "Son 30 dk, önceki 30 dk'ya göre " + (yon === "sabit" ? "sabit" :
      (fark > 0 ? "+" : "") + sayi(fark, a.b || 1) + (a.birim ? " " + a.birim : ""));
    satir.append(ok);
  }
  kart.append(satir);

  // Sparkline: son 6 saat. Çizim genelGrafikleriCiz'de (canvas görünür olunca).
  const c = el("canvas");
  const t0 = Date.now() - 6 * 3600 * 1000;
  c.noktalar = satirlar.filter((r) => doluMu(r[k]) && new Date(r.ts).getTime() >= t0)
    .reverse().map((r) => ({ t: new Date(r.ts).getTime(), v: Number(r[k]) }));
  c.basamakli = k === "co2";
  kart.append(c);

  if (bayat) kart.classList.add("bayat");
  kart.append(el("div", "yas", "Güncellendi " + yasMetni(s) + (bayat ? " · gecikiyor" : "")));
  return kart;
}

// Bugün pompanın açık kaldığı toplam dakika, pump kolonundan. Her satır bir
// sonraki satıra kadar geçerli sayılır, en fazla 2 dk (veri kesildiyse süre
// şişirilmez). Litre GÖSTERİLMEZ: debimetre yok.
function pompaDakika(satirlar) {
  const gece = new Date(); gece.setHours(0, 0, 0, 0);
  const p = satirlar.filter((r) => doluMu(r.pump) && new Date(r.ts) >= gece).reverse();
  if (!p.length) return null;
  let ms = 0;
  for (let i = 0; i < p.length; i++) {
    if (Number(p[i].pump) !== 1) continue;
    const bitis = i + 1 < p.length ? new Date(p[i + 1].ts) : new Date();
    ms += Math.min(bitis - new Date(p[i].ts), AYAR.POMPA_ADIM_TAVAN_MS);
  }
  return ms / 60000;
}

function genelCiz() {
  const hedef = $("olcumler");
  hedef.textContent = "";
  for (const k of GENEL_ALANLAR) hedef.append(olcumKarti(k, durum.readings));

  const pk = el("article", "kart olcum");
  const ust = el("div", "ust-satir");
  const adlar = el("div");
  adlar.append(el("div", "ad", "Pompa çalışma süresi"), el("div", "alt", "Bugün toplam"));
  ust.append(adlar);
  pk.append(ust);
  const dk = pompaDakika(durum.readings);
  if (dk === null) {
    pk.append(el("div", "deger metin", "Veri yok"), el("div", "yas", ""));
  } else {
    const satir = el("div", "deger-satir");
    const d = el("div", "deger", sayi(dk, 0));
    d.append(el("span", "birim", "dk"));
    satir.append(d);
    pk.append(satir, el("div", "yas", "Debimetre yok, litre gösterilmez"));
  }
  hedef.append(pk);

  ozetBarCiz();
  tahminKartiCiz();
  kararOzetCiz();
  noktalarCiz();
  uyariListesi($("uyari_ozet"), durum.uyarilar.slice(0, 4));
}

// Sparkline'lar ve 24 saatlik mini grafikler. Canvas gizliyken genişliği 0 olur;
// bu yüzden yalnız Genel Bakış görünürken çağrılır.
function genelGrafikleriCiz() {
  for (const c of document.querySelectorAll("#olcumler canvas")) sparklineCiz(c);
  const hedef = $("mini_trendler");
  hedef.textContent = "";
  const t1 = Date.now(), t0 = t1 - 24 * 3600 * 1000;
  const eski = [...durum.readings].reverse();
  for (const s of SERILER.filter((x) => ["air_temp", "soil_pct_1", "humidity"].includes(x.k))) {
    const kutu = el("div");
    const b = el("div", "seri-baslik", s.ad);
    const son = sonDolu(durum.readings, s.k);
    b.append(el("span", "", son ? sayi(son[s.k], ALAN[s.k].b) + " " + ALAN[s.k].birim : s.birim));
    const c = el("canvas");
    kutu.append(b, c);
    hedef.append(kutu);
    seriCiz(c, eski.filter((r) => doluMu(r[s.k])).map((r) => ({ t: new Date(r.ts).getTime(), v: Number(r[s.k]) })),
            t0, t1, false, 120);
  }
}

function sparklineCiz(c) {
  if (!c.clientWidth) return;
  const { x, G, Y } = tuvalHazirla(c, 34);
  const n = c.noktalar || [];
  if (n.length < 2) return;
  let enAz = Math.min(...n.map((p) => p.v)), enCok = Math.max(...n.map((p) => p.v));
  if (enCok - enAz < 1e-6) { enAz -= 1; enCok += 1; }
  const t1 = Date.now(), t0 = t1 - 6 * 3600 * 1000;
  const px = (t) => ((t - t0) / (t1 - t0)) * G;
  const py = (v) => 3 + (Y - 6) - ((v - enAz) / (enCok - enAz)) * (Y - 6);
  x.strokeStyle = renk("--vurgu"); x.lineWidth = 1.6; x.lineJoin = "round";
  x.beginPath();
  x.moveTo(px(n[0].t), py(n[0].v));
  for (let i = 1; i < n.length; i++) {
    // Gerçek boşlukta çizgi kesilir; ara değer uydurulmaz.
    if (n[i].t - n[i - 1].t > AYAR.BOSLUK_MS) { x.moveTo(px(n[i].t), py(n[i].v)); continue; }
    if (c.basamakli) x.lineTo(px(n[i].t), py(n[i - 1].v));
    x.lineTo(px(n[i].t), py(n[i].v));
  }
  x.stroke();
  const son = n[n.length - 1];
  x.fillStyle = renk("--vurgu");
  x.beginPath(); x.arc(px(son.t), py(son.v), 2.6, 0, Math.PI * 2); x.fill();
}

// ---- özet bar: aktif uyarı · sulama · son karar · bağlantı
const IKON = {
  uyari:  "M12 3l9.5 17h-19zM12 10v4M12 17.5h.01",
  damla:  "M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z",
  yz:     "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  wifi:   "M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0M12 19.5h.01",
  saat:   "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 3",
  hedef:  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  ok:     "M5 12h14M13 6l6 6-6 6",
  kalkan: "M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z",
};

function ozetKutu(sinif, ikonYolu, etiket, deger, alt) {
  const k = el("div", "kart ozet" + (sinif ? " " + sinif : ""));
  const i = el("div", "ikon");
  i.append(ikon(ikonYolu));
  const g = el("div");
  g.append(el("div", "etk", etiket), el("div", "dgr", deger), el("div", "alt", alt));
  k.append(i, g);
  return k;
}

function ozetBarCiz() {
  const hedef = $("ozet_bar");
  hedef.textContent = "";
  const say = (s) => durum.uyarilar.filter((u) => u.seviye === s).length;
  const kritik = say("kritik"), orta = say("orta"), bilgi = say("bilgi");
  hedef.append(ozetKutu(kritik ? "kritik" : orta ? "amber" : "", IKON.uyari, "Aktif uyarı",
    kritik + orta ? String(kritik + orta) : "Yok",
    kritik + " kritik · " + orta + " orta · " + bilgi + " bilgi"));

  const pompa = sonDolu(durum.readings, "pump");
  const ss = sonSulama();
  const dk = pompaDakika(durum.readings);
  hedef.append(ozetKutu(pompa && Number(pompa.pump) === 1 ? "bilgi" : "", IKON.damla, "Sulama durumu",
    !pompa ? "Pompa kaydı yok" : Number(pompa.pump) === 1 ? "Pompa çalışıyor" : "Pompa kapalı",
    ss ? "Son sulama " + yasMetni(sn(ss)) + (dk !== null ? " · bugün " + sayi(dk, 0) + " dk" : "")
       : pompa ? "Son 24 saatte sulama yok" : "Pompa verisi gelmiyor"));

  const t = durum.tahminler[0];
  hedef.append(ozetKutu("", IKON.yz, "Son karar",
    t ? (t.decision ? "Sulama önerildi" : "Sulama gerekmedi") : "Tahmin yok",
    t ? saat(t.created_at) + " · olasılık %" + Math.round(t.probability * 100) : "Model en az 1 saatlik veri ister"));

  const toplam = durum.cihazlar.length;
  const acik = durum.cihazlar.filter((c) => cihazDurumu(c.son_ts).sinif === "cevrimici").length;
  hedef.append(ozetKutu(toplam && acik < toplam ? "amber" : "", IKON.wifi, "Bağlantı",
    toplam ? acik + "/" + toplam + " cihaz çevrimiçi" : "Cihaz bilgisi yok",
    "Bulut · cihazlar 60 sn'de bir gönderir"));
}

// ---- karar gerekçesi: modelin baktığı ölçümler + modelin çıktısı
// GRU bir "neden" üretmez. Burada yazılanlar modele GİREN ölçümlerin şu anki
// durumu ve modelin verdiği olasılıktır; nedensellik iddiası değildir.
function dayanaklar() {
  const m = [];
  const esik = esikDegeri();
  const toprak = taze("soil_pct_1");
  if (toprak) {
    const v = "%" + sayi(toprak.v, 0);
    if (toprak.v < esik) m.push("toprak nemi eşiğin altında (" + v + ", eşik %" + sayi(esik, 0) + ")");
    else if (toprak.v < ARALIK.soil_pct_1.alt) m.push("toprak nemi eşiğe yaklaşıyor (" + v + ", eşik %" + sayi(esik, 0) + ")");
    else m.push("toprak nemi yeterli (" + v + ")");
  } else m.push("güncel toprak nemi ölçümü yok");

  const sic = taze("air_temp");
  if (sic) {
    const s = seviyeBul("air_temp", sic.v);
    m.push("sıcaklık " + { normal: "orta seviyede", dusuk: "düşük", yuksek: "yüksek" }[s] +
           " (" + sayi(sic.v, 1) + " °C)");
  }
  const nem = taze("humidity");
  if (nem) {
    const s = seviyeBul("humidity", nem.v);
    if (s !== "normal") m.push("bağıl nem " + SEVIYE_AD[s].toLocaleLowerCase("tr-TR") + " (%" + sayi(nem.v, 0) + ")");
  }
  const ss = sonSulama();
  if (ss) m.push("son sulamadan bu yana " + suredenMetin(sn(ss)) + " geçti");
  else if (sonDolu(durum.readings, "pump")) m.push("son 24 saatte sulama yapılmadı");
  return m;
}
function buyukHarf(s) { return s ? s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1) : s; }
function tahminSonucu(t) {
  if (!t) return null;
  const p = t.probability;
  if (t.decision) return t.horizon_min + " dk içinde toprak neminin eşiğe inmesi bekleniyor";
  if (p >= 0.3) return "nem düşüşü izleniyor, kısa vadede eşik aşılmıyor";
  return "kısa vadede su stresi beklenmiyor";
}

function modelNotu(surum) {
  // CLAUDE.md: Model A "simüle veriyle eğitildi" notu olmadan gösterilmez.
  // Yeni model gerçek veriyle eğitilince sürüm adında "simule" olmaz, not kalkar.
  return /simule/i.test(surum || "") ? "Model simüle veriyle eğitildi · " + surum : "Model: " + surum;
}
function tahminBayat(t) { return !t || sn(t.created_at) / 60 > AYAR.BAYAT_TAHMIN_DK; }

function tahminKartiCiz() {
  const dolu = $("gosterge_dolu");
  const kutu = $("tahmin_oneri");
  const son = durum.tahminler[0];
  dolu.classList.remove("yuksek", "bayat");
  dolu.classList.add("sifir");   // tahmin yoksa/0 ise yuvarlak uç nokta bırakmasın
  kutu.className = "oneri-kutu";
  $("tahmin_ufuk").textContent = "sulama olasılığı";
  if (durum.v2Yok) {
    dolu.setAttribute("stroke-dasharray", "0 100");
    $("tahmin_yuzde").textContent = "—";
    kutu.classList.add("bayat");
    $("tahmin_metin").textContent = "Tahmin kaydı henüz kurulmadı";
    $("tahmin_neden").textContent = "";
    $("tahmin_not").textContent = "Veritabanı güncellemesi bekleniyor.";
    return;
  }
  if (!son) {
    dolu.setAttribute("stroke-dasharray", "0 100");
    $("tahmin_yuzde").textContent = "—";
    kutu.classList.add("bayat");
    $("tahmin_metin").textContent = "Son 24 saatte tahmin yok";
    $("tahmin_neden").textContent = "Model en az 1 saatlik kesintisiz ölçüm ister.";
    $("tahmin_not").textContent = "";
    return;
  }
  const yuzde = Math.round(son.probability * 100);
  dolu.setAttribute("stroke-dasharray", yuzde + " 100");
  dolu.classList.toggle("sifir", yuzde === 0);
  const bayat = tahminBayat(son);
  if (bayat) { dolu.classList.add("bayat"); kutu.classList.add("bayat"); }
  else if (son.decision) { dolu.classList.add("yuksek"); kutu.classList.add("yuksek"); }
  $("tahmin_yuzde").textContent = "%" + yuzde;
  $("tahmin_ufuk").textContent = son.horizon_min + " dk içinde sulama olasılığı";
  $("tahmin_metin").textContent = bayat ? "Tahmin güncel değil"
    : "AI önerisi: " + (son.decision ? son.horizon_min + " dk içinde sulama önerilir" : "Şu an sulama gerekmez");
  $("tahmin_neden").textContent = buyukHarf(dayanaklar().slice(0, 3).join(", ")) + ".";
  $("tahmin_not").textContent =
    (bayat ? "Son tahmin " + yasMetni(sn(son.created_at)) + " · " : saat(son.created_at) + " · ") +
    modelNotu(son.model_version);
}

function kararSatiri(ikonYolu, baslik, icerik, hafif) {
  const d = el("div");
  const i = el("div", "ikon");
  i.append(ikon(ikonYolu));
  const g = el("div");
  g.append(el("dt", "", baslik));
  if (typeof icerik === "string") g.append(el("dd", hafif ? "hafif" : "", icerik));
  else { const dd = el("dd"); dd.append(icerik); g.append(dd); }
  d.append(i, g);
  return d;
}

function kararOzetCiz() {
  const hedef = $("karar_ozet");
  hedef.textContent = "";
  const t = durum.tahminler[0];
  if (!t) {
    hedef.append(kararSatiri(IKON.yz, "Son karar", durum.v2Yok ? "Tahmin kaydı kurulmadı" : "Son 24 saatte tahmin yok"));
    hedef.append(kararSatiri(IKON.saat, "Neden", "Model karar vermek için 12 ardışık 5 dk'lık ölçüm (≈1 saat) bekliyor.", true));
    return;
  }
  hedef.append(kararSatiri(IKON.yz, "Son karar · " + saat(t.created_at),
    t.decision ? "Sulama önerildi" : "Sulama önerilmedi"));

  const ul = el("ul");
  for (const m of dayanaklar()) ul.append(el("li", "", buyukHarf(m)));
  ul.append(el("li", "", "Model: " + tahminSonucu(t) + " (%" + Math.round(t.probability * 100) + ")"));
  hedef.append(kararSatiri(IKON.hedef, "Gerekçe", ul));

  // Tahminler 5 dk'da bir yazılır (tahmin_kaydet.py). Bayatsa bunu söyleriz, süre uydurmayız.
  let sonraki;
  if (tahminBayat(t)) sonraki = "Yeni tahmin gelmiyor; laptoptaki tahmin hattı kontrol edilmeli.";
  else {
    const kalan = Math.max(1, Math.round(5 - sn(t.created_at) / 60));
    sonraki = t.decision
      ? "Öneri 'Yapay Zekâ' sekmesinde onay bekliyor. " + kalan + " dk içinde yeniden değerlendirme."
      : "Yaklaşık " + kalan + " dk içinde yeniden değerlendirme.";
  }
  hedef.append(kararSatiri(IKON.ok, "Sonraki olası eylem", sonraki, true));
  hedef.append(kararSatiri(IKON.kalkan, "Güvence",
    "Onay yalnız kayıttır; pompa uzaktan çalıştırılamaz. " + modelNotu(t.model_version) + ".", true));
}

// ---- düzenek fotoğrafı üzerindeki işaretler
function noktalarCiz() {
  const hedef = $("noktalar");
  hedef.textContent = "";
  for (const n of NOKTALAR) {
    let sinif;
    if (n.pompa) sinif = sonDolu(durum.readings, "pump") ? "cevrimici" : "cevrimdisi";
    else {
      const c = durum.cihazlar.find((x) => (x.ad || "").startsWith(n.onek));
      sinif = cihazDurumu(c && c.son_ts).sinif;
    }
    const isaret = el("div", "nokta-isaret " + sinif + (n.x > 60 ? " sola" : ""));
    // CSP satır içi style'ı yasaklar ama JS'ten CSSOM ile konum vermek serbesttir.
    isaret.style.left = n.x + "%";
    isaret.style.top = n.y + "%";
    const dugme = el("button");
    dugme.type = "button";
    dugme.setAttribute("aria-label", n.ad);
    const kutu = el("div", "nokta-kutu");
    const degerler = n.ozet().filter(Boolean);
    kutu.append(el("b", "", n.ad), el("span", "", n.tip + " · " + (degerler.length ? degerler.join(" · ") : "veri yok")));
    isaret.append(dugme, kutu);
    hedef.append(isaret);
  }
}

// ------------------------------------------------------------ Uyarılar
// Kurallar: yalnız taze ölçümden; aralıklar ARALIK'tan; eşik veritabanındaki
// sulama_esigi(). Her uyarı ölçülen bir değere ya da bir kesintiye dayanır.
function uyarilariHesapla() {
  const u = [];
  const ekle = (seviye, baslik, detay) => u.push({ seviye, baslik, detay });

  // Bağlantı
  for (const c of durum.cihazlar) {
    const d = cihazDurumu(c.son_ts);
    if (d.sinif === "cevrimdisi") {
      ekle("orta", "Bağlantı kesildi: " + (c.ad || "cihaz"),
        (c.son_ts ? "Buluta son veri " + yasMetni(sn(c.son_ts)) + " geldi. " : "Buluta hiç veri gelmedi. ") +
        "Sahadaki yerel hat (USB → laptop) internetten bağımsız çalışmaya devam eder.");
    } else if (d.sinif === "gecikmeli") {
      ekle("bilgi", (c.ad || "Cihaz") + " gecikmeli gönderiyor", "Son veri " + yasMetni(sn(c.son_ts)) + ".");
    }
  }
  if (!durum.cihazlar.length && !durum.readings.length) {
    ekle("orta", "Buluta veri gelmiyor", "Son 24 saatte hiç ölçüm yok. Sahadaki yerel hat bundan etkilenmez.");
  }

  // Toprak nemi
  const esik = esikDegeri();
  const toprak = taze("soil_pct_1");
  if (toprak) {
    const v = "Şu an %" + sayi(toprak.v, 0) + ", sulama eşiği %" + sayi(esik, 0) + ".";
    if (toprak.v < esik) ekle("kritik", "Toprak nemi sulama eşiğinin altında", v);
    else if (toprak.v < esik + 6) ekle("orta", "Toprak nemi kritik seviyeye yaklaşıyor", v);
    else if (toprak.v < ARALIK.soil_pct_1.alt) ekle("bilgi", "Toprak nemi optimum aralığın altında", v);
  }

  // İklim
  const sic = taze("air_temp");
  if (sic) {
    const a = ARALIK.air_temp, v = sayi(sic.v, 1) + " °C";
    if (sic.v > a.ust + 5) ekle("kritik", "Sıcaklık çok yüksek", v + " · optimum " + a.alt + "–" + a.ust + " °C. Isı stresi riski.");
    else if (sic.v > a.ust) ekle("orta", "Sıcaklık optimum aralığın üstünde", v + " · optimum " + a.alt + "–" + a.ust + " °C.");
    else if (sic.v < a.alt) ekle("orta", "Sıcaklık optimum aralığın altında", v + " · optimum " + a.alt + "–" + a.ust + " °C.");
  }
  // Son 2 saatteki eğilim: son 15 dk ile 2 saat önceki 15 dk'nın ortalaması.
  const s = Date.now(), dk = 60000;
  const simdi = ortalama("air_temp", s - 15 * dk, s), once = ortalama("air_temp", s - 120 * dk, s - 105 * dk);
  if (simdi !== null && once !== null && Math.abs(simdi - once) >= 2) {
    ekle("bilgi", "Son 2 saatte sıcaklık " + (simdi > once ? "artış" : "düşüş") + " eğilimi gözlendi",
      sayi(once, 1) + " °C → " + sayi(simdi, 1) + " °C (" + (simdi > once ? "+" : "") + sayi(simdi - once, 1) + " °C).");
  }
  const nem = taze("humidity");
  if (nem) {
    const a = ARALIK.humidity, v = "%" + sayi(nem.v, 0) + " · optimum %" + a.alt + "–" + a.ust + ".";
    if (nem.v > a.ust) ekle("orta", "Bağıl nem yüksek", v + " Yüksek nem mantar hastalığı riskini artırır.");
    else if (nem.v < a.alt) ekle("bilgi", "Bağıl nem düşük", v);
  }
  const co2 = taze("co2");
  if (co2) {
    const a = ARALIK.co2, v = sayi(co2.v, 0) + " ppm · optimum " + a.alt + "–" + a.ust + " ppm.";
    if (co2.v > a.ust) ekle("orta", "CO₂ seviyesi yüksek", v + " Havalandırma önerilir.");
    else if (co2.v < a.alt) ekle("bilgi", "CO₂ seviyesi optimum aralığın altında", v);
  }

  // Model
  const t = durum.tahminler[0];
  if (t && !tahminBayat(t) && t.decision) {
    ekle("orta", t.horizon_min + " dk içinde sulama ihtiyacı bekleniyor",
      "Model olasılığı %" + Math.round(t.probability * 100) + ". Öneri Yapay Zekâ sekmesinde.");
  }
  if (t && tahminBayat(t) && durum.readings[0] && sn(durum.readings[0].ts) < AYAR.GECIKME_SANIYE) {
    ekle("bilgi", "Yeni tahmin gelmiyor",
      "Son tahmin " + yasMetni(sn(t.created_at)) + ". Tahmini laptoptaki tahmin hattı yazar; kapalı olabilir.");
  }
  const bekleyen = durum.oneriler.filter((o) => new Date(o.son_karar_zamani) > new Date()).length;
  if (bekleyen) ekle("bilgi", bekleyen + " öneri onayını bekliyor", "Onay kayıt amaçlıdır, pompayı çalıştırmaz.");

  return u.sort((a, b) => SEVIYE[a.seviye].sira - SEVIYE[b.seviye].sira);
}

function uyariKutusu(u) {
  const d = el("div", "uyari " + u.seviye);
  const i = el("div", "ikon");
  i.append(ikon(SEVIYE[u.seviye].ikon));
  const g = el("div", "govde");
  g.append(el("b", "", u.baslik), el("div", "detay", u.detay));
  d.append(i, g, el("span", "seviye", SEVIYE[u.seviye].ad));
  return d;
}

function uyariListesi(hedef, liste, bosMetin) {
  hedef.textContent = "";
  if (!liste.length) {
    const b = el("div", "uyari-bos");
    b.append(ikon("M5 12l5 5 9-10"), el("span", "", bosMetin || "Şu an dikkat gerektiren bir durum yok."));
    hedef.append(b);
    return;
  }
  for (const u of liste) hedef.append(uyariKutusu(u));
}

function uyarilarCiz() {
  const hedef = $("uyari_seviyeler");
  hedef.textContent = "";
  for (const s of ["kritik", "orta", "bilgi"]) {
    const liste = durum.uyarilar.filter((u) => u.seviye === s);
    const kart = el("article", "kart");
    const h = el("h2", "", SEVIYE[s].ad);
    h.append(el("span", "etiket sayac " + (s === "orta" ? "yuksek" : s === "bilgi" ? "notr" : s), String(liste.length)));
    const icerik = el("div", "uyari-liste");
    kart.append(h, icerik);
    uyariListesi(icerik, liste, "Bu seviyede uyarı yok.");
    hedef.append(kart);
  }
}

// ------------------------------------------------------------ Cihazlar
function cihazlarCiz() {
  const hedef = $("cihaz_kartlari");
  hedef.textContent = "";
  $("cihaz_not").textContent = "Durum son veri zamanından hesaplanır: " +
    AYAR.ONLINE_SANIYE + " sn'den yeni = çevrimiçi, " + AYAR.GECIKME_SANIYE / 60 +
    " dk'ya kadar = gecikmeli, daha eski = çevrimdışı.";
  if (durum.v2Yok) { hedef.append(el("p", "bos", "Cihaz kartları için veritabanı güncellemesi bekleniyor.")); return; }
  if (!durum.cihazlar.length) { hedef.append(el("p", "bos", "Kayıtlı cihaz yok.")); return; }

  for (const c of durum.cihazlar) {
    const tip = cihazTipi(c.ad);
    const d = cihazDurumu(c.son_ts);
    const kart = el("article", "kart cihaz-kart");

    const baslik = el("div", "baslik");
    const ad = el("div");
    ad.append(el("h2", "", c.ad || "Cihaz"), el("div", "tip", tip.tip));
    baslik.append(el("span", "durum-nokta " + d.sinif), ad);
    kart.append(baslik);

    kart.append(el("div", "durum", d.metin + " · son veri " +
      (c.son_ts ? yasMetni(sn(c.son_ts)) : "yok")));

    // Satırları cihaza göre ayırmak yalnız GÖRÜNTÜLEMEdir; yetki RLS'tedir.
    const dl = el("dl");
    for (const k of tip.alanlar) {
      const a = ALAN[k];
      const b = sonDolu(durum.readings, k, (r) => r.cihaz_id === c.id);
      dl.append(el("dt", "", a.ad));
      dl.append(el("dd", "", b ? sayi(b[k], a.b) + (a.birim ? " " + a.birim : "") : (a.yokMetni || "Veri yok")));
    }
    kart.append(dl);

    if (d.sinif !== "cevrimici") {
      kart.append(el("div", "serit", c.son_ts
        ? "Veri gelmiyor — son veri " + saat(c.son_ts)
        : "Bu cihazdan hiç veri gelmedi"));
    }
    hedef.append(kart);
  }
}

// ------------------------------------------------------------ Yapay Zekâ: öneriler
function onerilerCiz() {
  const hedef = $("oneriler");
  hedef.textContent = "";
  const rozet = $("oneri_rozet");
  const bekleyen = durum.oneriler.filter((o) => new Date(o.son_karar_zamani) > new Date());
  rozet.classList.toggle("gizli", bekleyen.length === 0);
  rozet.textContent = bekleyen.length;

  if (durum.v2Yok) { hedef.append(el("p", "bos", "Öneriler için veritabanı güncellemesi bekleniyor.")); return; }
  if (!bekleyen.length) { hedef.append(el("p", "bos", "Bekleyen öneri yok.")); return; }

  for (const o of bekleyen) {
    const kart = el("div", "oneri");
    const bilgi = el("div", "bilgi");
    const yuzde = doluMu(o.probability) ? " · olasılık %" + Math.round(o.probability * 100) : "";
    bilgi.append(el("b", "", "Sulama önerisi" + yuzde + " · " + saat(o.created_at)));
    const kalan = Math.max(0, Math.round((new Date(o.son_karar_zamani) - Date.now()) / 60000));
    bilgi.append(el("span", "soluk kucuk", "Karar için " + kalan + " dk kaldı"));

    const butonlar = el("div", "butonlar");
    const onay = el("button", "dugme ana", "Onayla");
    const red = el("button", "dugme ikincil", "Reddet");
    const mesaj = el("div", "hata");
    onay.addEventListener("click", () => kararVer(o.id, true, [onay, red], mesaj));
    red.addEventListener("click", () => kararVer(o.id, false, [onay, red], mesaj));
    butonlar.append(onay, red);
    kart.append(bilgi, butonlar, mesaj);
    hedef.append(kart);
  }
}

// Durum güncellemesi ve log kaydı veritabanında TEK işlemde yapılır (oneri_karar).
// Tarayıcı hiçbir tabloya doğrudan yazamaz.
async function kararVer(id, onay, butonlar, mesaj) {
  butonlar.forEach((b) => (b.disabled = true));
  mesaj.textContent = "";
  const { data, error } = await sb.rpc("oneri_karar", { p_oneri: id, p_onay: onay });
  if (error) {
    mesaj.textContent = "İşlem kaydedilemedi. Öneri başkasına ait, süresi dolmuş ya da bağlantı yok.";
    butonlar.forEach((b) => (b.disabled = false));
    return;
  }
  if (data === "suresi_doldu") mesaj.textContent = "Bu önerinin süresi dolmuş.";
  await yenile();
}

// ------------------------------------------------------------ Yapay Zekâ: tahmin vs gerçek
function yzOzetCiz() {
  const hedef = $("yz_ozet");
  hedef.textContent = "";
  $("yz_tanim").textContent = "";
  $("yz_kayit").textContent = "";
  if (durum.v2Yok) { hedef.append(el("p", "bos", "Tahmin kaydı için veritabanı güncellemesi bekleniyor.")); return; }

  const t = durum.tahminler;
  const say = (s) => t.filter((x) => x.sonuc === s).length;
  const dogru = say("dogru"), yanlis = say("yanlis");
  // Yüzde yazılmaz, sayılar yazılır (CLAUDE.md: doğruluk rakamı ekrana yazılmaz).
  // Bekleyenler ve ölçümü olmayanlar isabete KATILMAZ.
  const kutu = (etiket, deger) => { const d = el("div", "", etiket); d.prepend(el("b", "", String(deger))); return d; };
  hedef.append(
    kutu("toplam tahmin", t.length),
    kutu("isabet / değerlendirilen", dogru + " / " + (dogru + yanlis)),
    kutu("değerlendirmesi bekleyen", say("bekliyor")),
    kutu("ölçüm yok (sayılmadı)", say("veri_yok")),
  );

  const esik = t.length ? t[0].esik : null;
  const ufuk = t.length ? t[0].horizon_min : 30;
  $("yz_tanim").textContent = "Gerçek = " + ufuk + " dk içinde toprak nemi" +
    (doluMu(esik) ? " %" + sayi(esik, 0) : " eşiğin") + " altına düştü mü. " +
    "Pompa kaydı kullanılmaz (döngüsel karşılaştırma olurdu)." +
    (t.length ? " " + modelNotu(t[0].model_version) + "." : "");

  if (durum.ilkTahmin) {
    const gun = (Date.now() - new Date(durum.ilkTahmin.created_at)) / 86400000;
    $("yz_kayit").textContent = "Gerçek sera verisi, " +
      (gun < 1 ? "1 günden kısa" : Math.floor(gun) + " günlük") + " kayıt.";
  }
}

function yzGrafikCiz() {
  const c = $("yz_grafik");
  if (!c.clientWidth) return;
  const { x, G, Y } = tuvalHazirla(c, 200);
  const sol = 36, sag = 10, ust = 10, alt = 22;
  const gen = G - sol - sag, yuk = Y - ust - alt;
  const t1 = Date.now(), t0 = t1 - 24 * 3600 * 1000;
  const px = (t) => sol + ((t - t0) / (t1 - t0)) * gen;
  const py = (p) => ust + yuk - p * yuk;

  x.font = "11px sans-serif";
  x.strokeStyle = renk("--cizgi"); x.fillStyle = renk("--soluk"); x.lineWidth = 1;
  for (const p of [0, 0.5, 1]) {
    x.setLineDash(p === 0.5 ? [4, 4] : []);
    x.beginPath(); x.moveTo(sol, py(p)); x.lineTo(G - sag, py(p)); x.stroke();
    x.fillText("%" + p * 100, 4, py(p) + 4);
  }
  x.setLineDash([]);
  zamanEtiketleri(x, t0, t1, sol, G - sag, Y - 6);

  if (durum.v2Yok || !durum.tahminler.length) {
    x.fillStyle = renk("--soluk"); x.font = "13px sans-serif";
    x.fillText(durum.v2Yok ? "Veritabanı güncellemesi bekleniyor." : "Son 24 saatte tahmin yok.", sol + 8, Y / 2);
    return;
  }
  const RENK = { dogru: renk("--vurgu"), yanlis: renk("--amber"), veri_yok: renk("--gri") };
  for (const p of durum.tahminler) {
    const cx = px(new Date(p.created_at).getTime()), cy = py(p.probability);
    x.beginPath(); x.arc(cx, cy, 4.5, 0, Math.PI * 2);
    if (p.sonuc === "bekliyor") { x.strokeStyle = renk("--gri"); x.lineWidth = 2; x.stroke(); }
    else { x.fillStyle = RENK[p.sonuc]; x.fill(); }
  }
}

// ------------------------------------------------------------ Geçmiş: grafikler
for (const b of document.querySelectorAll(".secici-dugme")) {
  b.addEventListener("click", () => {
    document.querySelectorAll(".secici-dugme").forEach((x) => x.classList.toggle("secili", x === b));
    durum.gecmisSaat = Number(b.dataset.saat);
    gecmisCiz();
  });
}

async function gecmisSatirlari(saatSayisi) {
  // 6 ve 24 saat zaten yüklü 24 saatlik veriden; 7 gün ayrı çekilir ve 5 dk saklanır.
  if (saatSayisi <= 24) {
    const sinir = Date.now() - saatSayisi * 3600 * 1000;
    return durum.readings.filter((r) => new Date(r.ts).getTime() >= sinir);
  }
  const onb = durum.gecmisOnbellek[saatSayisi];
  if (onb && Date.now() - onb.zaman < 5 * 60000) return onb.satirlar;
  const bastan = new Date(Date.now() - saatSayisi * 3600 * 1000).toISOString();
  const satirlar = co2Temizle(await sayfaliCek(() => sb.from("readings")
    .select("id,ts,air_temp,humidity,soil_pct_1,co2,soil_ec,gas_res,pressure")
    .gte("ts", bastan).order("ts", { ascending: false }).order("id", { ascending: false })));
  durum.gecmisOnbellek[saatSayisi] = { zaman: Date.now(), satirlar };
  return satirlar;
}

let gecmisSira = 0;
async function gecmisCiz() {
  const hedef = $("grafikler");
  const sira = ++gecmisSira;
  let satirlar;
  try {
    if (durum.gecmisSaat > 24 && !durum.gecmisOnbellek[durum.gecmisSaat]) {
      hedef.textContent = "";
      hedef.append(el("p", "bos", "Yükleniyor…"));
    }
    satirlar = await gecmisSatirlari(durum.gecmisSaat);
  } catch (e) {
    hedef.textContent = "";
    hedef.append(el("p", "bos", "Geçmiş veri okunamadı."));
    return;
  }
  if (sira !== gecmisSira) return;   // bu arada başka aralık seçildi
  hedef.textContent = "";
  const t1 = Date.now(), t0 = t1 - durum.gecmisSaat * 3600 * 1000;
  const eski = [...satirlar].reverse();
  for (const s of SERILER) {
    const kutu = el("div");
    const b = el("div", "seri-baslik", s.ad + " ");
    b.append(el("span", "", s.birim + (s.basamakli ? " · basamaklı" : "")));
    const c = el("canvas");
    kutu.append(b, c);
    hedef.append(kutu);
    seriCiz(c, eski.filter((r) => doluMu(r[s.k])).map((r) => ({ t: new Date(r.ts).getTime(), v: Number(r[s.k]) })),
            t0, t1, s.basamakli);
  }
}

function tuvalHazirla(c, yukseklik) {
  const o = window.devicePixelRatio || 1;
  const G = c.clientWidth, Y = yukseklik;
  c.width = G * o; c.height = Y * o;
  const x = c.getContext("2d");
  x.setTransform(o, 0, 0, o, 0, 0);
  x.clearRect(0, 0, G, Y);
  return { x, G, Y };
}

function zamanEtiketleri(x, t0, t1, sol, sag, y) {
  const uzun = t1 - t0 > 36 * 3600 * 1000;
  // 24 saatlik eksende iki uç da "21:22" olur; dünkü uca gün de yazılır.
  const f = (t) => uzun
    ? new Date(t).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
    : saat(t);
  x.fillStyle = renk("--soluk"); x.font = "11px sans-serif";
  x.fillText(f(t0), sol, y);
  const s = f(t1);
  x.fillText(s, sag - x.measureText(s).width, y);
}

// Her seri kendi ölçeğinde çizilir (CO₂ ppm ile % aynı eksene sığmaz).
// Seri önce KENDİ dolu noktalarına indirgenmiş gelir: iki kart dönüşümlü satır
// gönderdiği için "null görünce kalemi kaldır" deseni grafiği boş bırakırdı.
// Çizgi yalnız gerçek zaman boşluğunda (BOSLUK_MS) kesilir.
function seriCiz(c, noktalar, t0, t1, basamakli, yukseklik = 150) {
  const { x, G, Y } = tuvalHazirla(c, yukseklik);
  const sol = 40, sag = 8, ust = 8, alt = 20;
  const gen = G - sol - sag, yuk = Y - ust - alt;
  zamanEtiketleri(x, t0, t1, sol, G - sag, Y - 5);
  if (noktalar.length < 2) {
    x.fillStyle = renk("--soluk"); x.font = "12px sans-serif";
    x.fillText("Bu aralıkta ölçüm yok", sol, Y / 2);
    return;
  }
  let enAz = Math.min(...noktalar.map((n) => n.v)), enCok = Math.max(...noktalar.map((n) => n.v));
  const pay = (enCok - enAz) * 0.1 || 1;
  enAz -= pay; enCok += pay;
  const px = (t) => sol + ((t - t0) / (t1 - t0)) * gen;
  const py = (v) => ust + yuk - ((v - enAz) / (enCok - enAz)) * yuk;

  x.strokeStyle = renk("--cizgi"); x.lineWidth = 1; x.fillStyle = renk("--soluk"); x.font = "11px sans-serif";
  for (const v of [enAz + pay, (enAz + enCok) / 2, enCok - pay]) {
    x.beginPath(); x.moveTo(sol, py(v)); x.lineTo(G - sag, py(v)); x.stroke();
    x.fillText(sayi(v, Math.abs(enCok - enAz) < 10 ? 1 : 0), 2, py(v) + 4);
  }

  x.strokeStyle = renk("--vurgu"); x.lineWidth = 1.8;
  x.beginPath();
  x.moveTo(px(noktalar[0].t), py(noktalar[0].v));
  for (let i = 1; i < noktalar.length; i++) {
    const n = noktalar[i], o = noktalar[i - 1];
    if (n.t - o.t > AYAR.BOSLUK_MS) { x.moveTo(px(n.t), py(n.v)); continue; }
    if (basamakli) x.lineTo(px(n.t), py(o.v));   // değer bir sonraki ölçüme kadar sabit
    x.lineTo(px(n.t), py(n.v));
  }
  x.stroke();
}

// ------------------------------------------------------------ Geçmiş: aktivite
const OLAY = {
  oneri_olustu:     { metin: "Sulama önerisi oluştu", kim: "Sistem (model)", ikon: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" },
  oneri_onaylandi:  { metin: "Öneri onaylandı",       kim: null,             ikon: "M5 12l5 5 9-10" },
  oneri_reddedildi: { metin: "Öneri reddedildi",      kim: null,             ikon: "M6 6l12 12M18 6L6 18", amber: true },
  pompa_calisti:    { metin: "Pompa çalıştı",         kim: "Cihaz",          ikon: "M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z" },
};

function ikon(yol) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  const p = document.createElementNS(ns, "path");
  p.setAttribute("d", yol);
  svg.append(p);
  return svg;
}

function aktiviteCiz() {
  const hedef = $("aktivite");
  hedef.textContent = "";
  if (durum.v2Yok) { hedef.append(el("li", "bos", "Aktivite geçmişi için veritabanı güncellemesi bekleniyor.")); return; }
  if (!durum.aktivite.length) { hedef.append(el("li", "bos", "Henüz kayıtlı olay yok.")); return; }
  const cihazAdi = Object.fromEntries(durum.cihazlar.map((c) => [c.id, c.ad]));
  for (const a of durum.aktivite) {
    const o = OLAY[a.event] || { metin: a.event, kim: "", ikon: "M12 8v4M12 16h.01" };
    const li = el("li");
    const ik = el("div", "ikon" + (o.amber ? " amber" : ""));
    ik.append(ikon(o.ikon));
    const govde = el("div");
    let metin = o.metin;
    if (a.event === "oneri_olustu" && a.detail && doluMu(a.detail.olasilik)) {
      metin += " · olasılık %" + Math.round(a.detail.olasilik * 100);
    }
    govde.append(el("div", "olay", metin));
    // Onay/red'i yalnız cihazın sahibi verebilir; sahip = oturumdaki kullanıcı.
    const kim = o.kim || (a.sahip === durum.kullanici.id ? "Sen" : "Sahip");
    const cihaz = a.cihaz_id && cihazAdi[a.cihaz_id] ? " · " + cihazAdi[a.cihaz_id] : "";
    govde.append(el("div", "detay", saat(a.created_at) + " · " + kim + cihaz));
    li.append(ik, govde);
    hedef.append(li);
  }
}

// ------------------------------------------------------------ NexAI
// Açıklama asistanı. DÜRÜST TEKNİK NOT (sunumda da böyle anlatılır):
//  - Tahmini yapan GRU modelidir (laptopta çalışır, sonucu Supabase'e yazılır).
//  - NexAI bir dil modeli DEĞİLDİR: soruyu anahtar kelimeyle tanır, yanıtı o anki
//    ölçümlerden, uyarılardan ve model çıktısından CANLI kurar. Ezber cevap yok;
//    ölçülmeyen bir şey sorulursa "ölçmüyoruz" der.
//  - Tarayıcı dışına istek atmaz; soru hiçbir yere gönderilmez.
// Yanıt biçimi: { p: [paragraf...], m: [madde...], gerekce: bool }

// Karşılaştırma için Türkçe harfler sadeleştirilir ("sıcaklık" = "sicaklik").
function sade(metin) {
  return metin.toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/â/g, "a");
}

function alanYaniti(k) {
  const a = ALAN[k];
  const r = sonDolu(durum.readings, k);
  if (!r) return { p: [a.ad + " için son 24 saatte ölçüm yok, bu yüzden yorum yapamıyorum."] };
  const v = Number(r[k]);
  const p = [a.ad + " şu an " + sayi(v, a.b) + (a.birim ? " " + a.birim : "") + " (" + yasMetni(sn(r.ts)) + " ölçüldü)."];
  const sev = seviyeBul(k, v);
  if (sev && ARALIK[k]) {
    const ar = ARALIK[k];
    p.push(sev === "normal"
      ? "Bu değer optimum aralıkta (" + ar.alt + "–" + ar.ust + " " + a.birim + ")."
      : "Bu değer " + SEVIYE_AD[sev].toLocaleLowerCase("tr-TR") + " sayılır; optimum aralık " + ar.alt + "–" + ar.ust + " " + a.birim + ".");
  }
  const fark = egilim(k);
  if (fark !== null) {
    const esik = trendEsigi(k, v);
    p.push(Math.abs(fark) <= esik ? "Son yarım saatte belirgin bir değişim yok."
      : "Son yarım saatte " + (fark > 0 ? "yükseliyor" : "düşüyor") + " (" + (fark > 0 ? "+" : "") + sayi(fark, a.b || 1) + ").");
  }
  if (k === "soil_ec") p.push("EC kalibre edilmedi; mutlak değer değil, eğilim takip edilir.");
  if (k === "gas_res") p.push("Gaz direnci bir hava kalitesi puanı değildir; yalnız eğilime bakılır. Düşüş, havada uçucu bileşiklerin (VOC) arttığına işaret edebilir — havalandırmayı kontrol et.");
  return { p };
}

function sulamaYaniti() {
  const t = durum.tahminler[0];
  if (!t) {
    return { p: ["Son 24 saatte model tahmini yok. Model karar verebilmek için 12 ardışık 5 dakikalık ölçüm (yaklaşık 1 saat) bekliyor."],
             m: dayanaklar().map(buyukHarf), gerekce: true };
  }
  const yuzde = Math.round(t.probability * 100);
  const p = [];
  if (tahminBayat(t)) p.push("Son tahmin " + yasMetni(sn(t.created_at)) + " yapıldı; güncel değil, bu yüzden temkinli yorumluyorum.");
  p.push(t.decision
    ? "Model " + t.horizon_min + " dakika içinde sulama gerekeceğini öngörüyor (olasılık %" + yuzde + ")."
    : "Sulama önerilmedi çünkü model " + t.horizon_min + " dakika içinde toprak neminin eşiğe inmesini beklemiyor (olasılık %" + yuzde + ").");
  p.push("Kararın dayandığı ölçümler:");
  const cevap = { p, m: dayanaklar().map(buyukHarf), gerekce: true };
  cevap.son = "Onay kayıt amaçlıdır; pompa uzaktan çalıştırılamaz. " + modelNotu(t.model_version) + ".";
  return cevap;
}

function durumYaniti() {
  const u = durum.uyarilar;
  if (!u.length) {
    return { p: ["Şu an dikkat etmen gereken bir durum görmüyorum. Ölçümler optimum aralıkta ve bağlantı normal."],
             m: dayanaklar().map(buyukHarf) };
  }
  const kritik = u.filter((x) => x.seviye === "kritik").length;
  return {
    p: [kritik ? kritik + " kritik durum var, önce onlara bakmanı öneririm:"
               : u.length + " konuya dikkat etmekte fayda var:"],
    m: u.slice(0, 5).map((x) => SEVIYE[x.seviye].ad + ": " + x.baslik + ". " + x.detay),
  };
}

const NEXAI_KURALLAR = [
  { k: /\b(fan|isitici|isitma|sogutma|havalandirma)/, f: () => ({
      p: ["Bu düzenekte fan ya da ısıtıcı yok ve böyle bir kayıt tutulmuyor; çalışıp çalışmadığı hakkında yorum yapamam.",
          "İklim tarafında ClimaNEX sıcaklık, bağıl nem ve CO₂ ölçüyor. CO₂ yükselirse havalandırma önerisini uyarılarda görürsün."] }) },
  { k: /\bph\b|asit/, f: () => {
      const r = sonDolu(durum.readings, "soil_ph");
      if (!r) return { p: ["Toprak pH sensörü henüz doğrulanıyor, ölçüm gelmiyor. Ölçmediğim bir değerin bitkiye uygun olup olmadığını söyleyemem.",
                           "Bilgi olarak: domates gibi sera sebzeleri için genelde 5,5–6,8 arası önerilir."] };
      const v = Number(r.soil_ph);
      return { p: ["Toprak pH son ölçümde " + sayi(v, 1) + ". Domates için genelde 5,5–6,8 önerilir; bu değer " +
                   (v < 5.5 ? "aralığın altında (asidik)." : v > 6.8 ? "aralığın üstünde (bazik)." : "aralığın içinde.") ,
                   "Sensör henüz doğrulama aşamasında olduğu için bunu eğilim bilgisi olarak değerlendir."] };
    } },
  { k: /npk|azot|fosfor|potasyum|gubre/, f: () => ({
      p: ["NPK (azot, fosfor, potasyum) ölçen bir sensörümüz yok, bu yüzden besin durumu hakkında sayı veremem.",
          "Toprak EC'yi ölçüyoruz; o da yalnız iletkenliğin eğilimini gösterir, besin miktarını değil."] }) },
  { k: /sula|sulama|su ver|kuru/, f: sulamaYaniti },
  { k: /pompa|role/, f: () => {
      const r = sonDolu(durum.readings, "pump");
      const dk = pompaDakika(durum.readings), ss = sonSulama();
      if (!r) return { p: ["Pompa durumu buluta gelmiyor, bu yüzden şu an çalışıp çalışmadığını göremiyorum."] };
      return { p: ["Pompa şu an " + (Number(r.pump) === 1 ? "çalışıyor" : "kapalı") + ".",
                   (ss ? "Son sulama " + yasMetni(sn(ss)) + "." : "Son 24 saatte pompa çalışmadı.") +
                   (dk !== null ? " Bugün toplam " + sayi(dk, 0) + " dakika çalıştı." : ""),
                   "Pompayı yalnız sahadaki kart sürer; panelden uzaktan komut gönderilemez."] };
    } },
  { k: /dikkat|uyari|sorun|risk|tehlike|durum|nasil gidiyor|ne var|kontrol/, f: durumYaniti },
  { k: /internet|baglanti|yerel|kesil|offline|cevrimdisi|wifi/, f: () => ({
      p: ["Sistem iki bağımsız hattan oluşuyor:"],
      m: ["Yerel hat: sensörler USB ile sahadaki laptopa bağlı. Ölçüm, kayıt ve GRU tahmini internet olmadan sürer.",
          "Bulut hattı: kartlar dakikada bir Supabase'e veri gönderir; bu panel oradan okur.",
          "İnternet kesilirse yalnız bu panel güncellenmez; sahadaki yerel panel çalışmaya devam eder."],
      son: durum.uyarilar.some((u) => u.baslik.startsWith("Bağlantı kesildi"))
        ? "Şu an bir cihazdan buluta veri gelmiyor; ayrıntı Uyarılar'da." : "Şu an bulut bağlantısı normal." }) },
  { k: /model|tahmin|yapay|gru|nasil karar|nasil calis|ogren/, f: () => {
      const t = durum.tahminler[0];
      return { p: ["Tahmini bir GRU (derin öğrenme) modeli yapıyor. Son 1 saatin 5 dakikalık ölçümlerine bakıyor: sıcaklık, bağıl nem, toprak nemi ve CO₂.",
                   "Çıktısı, önümüzdeki 30 dakikada toprak neminin sulama eşiğinin altına inme olasılığı. %50'nin üstü sulama önerisi demek.",
                   "Ben (NexAI) bu çıktıyı ve ölçümleri birleştirip kararı açıklıyorum."],
               son: t ? modelNotu(t.model_version) + ". Tahmin ve gerçek sonuç karşılaştırması Yapay Zekâ sekmesinde." : undefined };
    } },
  { k: /sicaklik|derece|sicak|soguk/, f: () => alanYaniti("air_temp") },
  { k: /toprak/, f: () => alanYaniti("soil_pct_1") },
  { k: /\bnem/, f: () => alanYaniti("humidity") },
  { k: /co2|karbon/, f: () => alanYaniti("co2") },
  { k: /gaz|voc|hava kalitesi/, f: () => alanYaniti("gas_res") },
  { k: /basinc|hpa/, f: () => alanYaniti("pressure") },
  { k: /\bec\b|iletken|tuz/, f: () => alanYaniti("soil_ec") },
  { k: /merhaba|selam|gunaydin|iyi aksamlar/, f: () => ({ p: ["Merhaba! Seranın ölçümlerini ve yapay zekâ kararlarını açıklayabilirim. Aşağıdaki sorulardan birini seçebilir ya da kendin yazabilirsin."] }) },
  { k: /tesekkur|sagol/, f: () => ({ p: ["Rica ederim. Durum değişirse uyarılarda görürsün."] }) },
];

function nexaiYanit(soru) {
  const s = sade(soru);
  for (const kural of NEXAI_KURALLAR) if (kural.k.test(s)) return kural.f();
  return { p: ["Bunu henüz yanıtlayamıyorum. Sulama kararları, ölçümler, uyarılar, pompa, model ve bağlantı hakkında sorabilirsin."] };
}

function mesajEkle(kim, icerik) {
  const akis = $("sohbet_akis");
  const m = el("div", "mesaj " + kim);
  if (kim === "kullanici") m.append(el("p", "", icerik));
  else {
    const baslik = el("div", "kim", "NexAI");
    if (icerik.gerekce) baslik.append(el("span", "etiket gerekce", "Karar gerekçesi"));
    m.append(baslik);
    for (const p of icerik.p || []) m.append(el("p", "", p));
    if (icerik.m && icerik.m.length) {
      const ul = el("ul");
      for (const x of icerik.m) ul.append(el("li", "", x));
      m.append(ul);
    }
    if (icerik.son) m.append(el("p", "", icerik.son));
    const son = durum.readings[0];
    m.append(el("div", "kaynak", "Kaynak: " + (son ? "son ölçüm " + saat(son.ts) : "ölçüm yok") +
      (durum.tahminler[0] ? " · tahmin " + saat(durum.tahminler[0].created_at) : "")));
  }
  akis.append(m);
  akis.scrollTop = akis.scrollHeight;
}

function soruSor(soru) {
  soru = soru.trim().slice(0, 200);
  if (!soru) return;
  mesajEkle("kullanici", soru);
  mesajEkle("nexai", nexaiYanit(soru));
}

$("sohbet_form").addEventListener("submit", (e) => {
  e.preventDefault();
  soruSor($("sohbet_girdi").value);
  $("sohbet_girdi").value = "";
});

function sohbetCipleriCiz() {
  const t = durum.tahminler[0];
  const sorular = [
    t && t.decision ? "Neden sulama öneriliyor?" : "Neden sulama yapılmadı?",
    "Serada şu anda dikkat etmem gereken bir durum var mı?",
    "Toprak pH değeri bitki için uygun mu?",
    "İnternet kesilirse ne olur?",
    "Tahmin nasıl yapılıyor?",
  ];
  const hedef = $("sohbet_oneriler");
  hedef.textContent = "";
  for (const s of sorular) {
    const c = el("button", "cip", s);
    c.type = "button";
    c.addEventListener("click", () => soruSor(s));
    hedef.append(c);
  }
}

// İlk veri gelince NexAI kısa bir durum özetiyle açılır.
function sohbetBaslat() {
  durum.sohbetBasladi = true;
  const u = durum.uyarilar;
  const kritik = u.filter((x) => x.seviye === "kritik").length;
  const orta = u.filter((x) => x.seviye === "orta").length;
  const t = durum.tahminler[0];
  const p = ["Merhaba, ben NexAI. " + ($("sera_ad").textContent || "Sera") + " verilerini canlı izliyorum."];
  p.push(kritik + orta
    ? "Şu an " + (kritik ? kritik + " kritik" + (orta ? " ve " : "") : "") + (orta ? orta + " orta seviye" : "") + " uyarı var."
    : "Şu an dikkat gerektiren bir durum yok.");
  if (t && !tahminBayat(t)) {
    p.push("Son karar: " + (t.decision ? "sulama önerildi" : "sulama gerekmedi") +
           " (" + t.horizon_min + " dk olasılığı %" + Math.round(t.probability * 100) + "). Nedenini sorabilirsin.");
  }
  mesajEkle("nexai", { p });
}

// ------------------------------------------------------------ oturum sürüyorsa aç
sb.auth.getSession().then(({ data }) => { if (data.session) panelAc(); });
