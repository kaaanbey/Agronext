// AgroNext — Panel v2
// ====================
// Kurallar (index.html başındaki güvenlik notlarıyla aynı):
//  - Yalnız publishable anahtar. Yetki = kullanıcı oturumu + veritabanındaki RLS.
//  - Ekrana yalnız textContent / DOM düğümü; innerHTML hiç kullanılmaz.
//  - Ölçülmeyen değer gösterilmez: veri yoksa "Veri yok", tahmin yoksa "Tahmin yok".
//  - Onayla/Reddet yalnız kayıttır; pompayı çalıştırmaz.

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
  soil_pct_1: { ad: "Toprak nemi",    alt: "Kalibre göreceli nem",              birim: "%",   b: 0 },
  soil_pct_2: { ad: "Prob 2 (yedek)", alt: "Kalibre göreceli nem",              birim: "%",   b: 0 },
  soil_ec:    { ad: "Toprak EC",      alt: "Toprak iletkenliği — trend takibi", birim: "",    b: 0 },
  soil_ph:    { ad: "Toprak pH",      alt: "Trend takibi",                      birim: "",    b: 1,
                yokMetni: "Sensör doğrulanıyor" },
};
const GENEL_ALANLAR = ["air_temp", "humidity", "co2", "soil_pct_1", "soil_ec", "soil_ph"];

// Cihaz adı → tip ve o kartın ölçtüğü alanlar. Bilinmeyen adda tüm alanlar denenir.
const CIHAZ_TIPI = [
  { onek: "ClimaNEX", tip: "İklim ünitesi", alanlar: ["air_temp", "humidity", "co2"] },
  { onek: "TerraNEX", tip: "Toprak ünitesi", alanlar: ["soil_pct_1", "soil_pct_2", "soil_ec", "soil_ph"] },
];

// Geçmiş sekmesindeki seriler. CO₂ sensörü basamaklı değer verir → basamaklı çizim.
const SERILER = [
  { k: "air_temp",   ad: "Hava sıcaklığı", birim: "°C" },
  { k: "humidity",   ad: "Bağıl nem",      birim: "%" },
  { k: "soil_pct_1", ad: "Toprak nemi",    birim: "% göreceli" },
  { k: "co2",        ad: "CO₂",            birim: "ppm", basamakli: true },
  { k: "soil_ec",    ad: "Toprak EC",      birim: "trend" },
];

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
function sayi(v, b) { return Number(v).toLocaleString("tr-TR", { minimumFractionDigits: b, maximumFractionDigits: b }); }
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
const SEKMELER = ["genel", "cihazlar", "yz", "gecmis", "ayarlar"];
function sekmeGoster() {
  const ad = SEKMELER.includes(location.hash.slice(1)) ? location.hash.slice(1) : "genel";
  for (const s of SEKMELER) $("s_" + s).classList.toggle("gizli", s !== ad);
  for (const a of document.querySelectorAll(".menu-dugme")) {
    if (a.dataset.sekme === ad) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  // Canvas gizliyken genişliği 0'dır; grafikler sekme görününce çizilir.
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
    durum.readings = await sayfaliCek(() => sb.from("readings").select("*")
      .gte("ts", bastan).order("ts", { ascending: false }).order("id", { ascending: false }));
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

  genelCiz();
  cihazlarCiz();
  onerilerCiz();
  yzOzetCiz();
  aktiviteCiz();
  durum.gecmisOnbellek[24] = { zaman: Date.now(), satirlar: durum.readings };
  const acik = location.hash.slice(1);
  if (acik === "yz") yzGrafikCiz();
  if (acik === "gecmis") gecmisCiz();

  $("guncelleme").textContent = hatalar.length
    ? "Bazı veriler okunamadı (" + [...new Set(hatalar)].join(", ") + "). Bağlantıyı kontrol et."
    : "Güncellendi " + new Date().toLocaleTimeString("tr-TR") + " · 60 sn'de bir tazelenir";
}

// ------------------------------------------------------------ Genel Bakış
function olcumKarti(k, satirlar) {
  const a = ALAN[k];
  const kart = el("article", "kart cam olcum");
  kart.append(el("div", "ad", a.ad), el("div", "alt", a.alt));
  const bulunan = sonDolu(satirlar, k);
  if (!bulunan) {
    kart.append(el("div", "deger metin", a.yokMetni || "Veri yok"), el("div", "yas", ""));
    return kart;
  }
  const deger = el("div", "deger", sayi(bulunan[k], a.b));
  if (a.birim) deger.append(el("span", "birim", a.birim));
  const s = sn(bulunan.ts);
  const bayat = s > AYAR.BAYAT_OLCUM_SANIYE;
  if (bayat) kart.classList.add("bayat");
  kart.append(deger, el("div", "yas", yasMetni(s) + (bayat ? " · gecikiyor" : "")));
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

  const pk = el("article", "kart cam olcum");
  pk.append(el("div", "ad", "Pompa çalışma süresi"), el("div", "alt", "Bugün toplam"));
  const dk = pompaDakika(durum.readings);
  if (dk === null) {
    pk.append(el("div", "deger metin", "Veri yok"), el("div", "yas", ""));
  } else {
    const d = el("div", "deger", sayi(dk, 0));
    d.append(el("span", "birim", "dk"));
    pk.append(d, el("div", "yas", "debimetre yok, litre gösterilmez"));
  }
  hedef.append(pk);

  tahminKartiCiz();
  cihazOzetCiz();
}

function modelNotu(surum) {
  // CLAUDE.md: Model A "simüle veriyle eğitildi" notu olmadan gösterilmez.
  // Yeni model gerçek veriyle eğitilince sürüm adında "simule" olmaz, not kalkar.
  return /simule/i.test(surum || "") ? "Model simüle veriyle eğitildi · " + surum : "Model: " + surum;
}

function tahminKartiCiz() {
  const dolu = $("gosterge_dolu");
  const son = durum.tahminler[0];
  dolu.classList.remove("yuksek", "bayat");
  dolu.classList.add("sifir");   // tahmin yoksa/0 ise yuvarlak uç nokta bırakmasın
  if (durum.v2Yok) {
    dolu.setAttribute("stroke-dasharray", "0 100");
    $("tahmin_yuzde").textContent = "—";
    $("tahmin_metin").textContent = "Tahmin kaydı henüz kurulmadı";
    $("tahmin_not").textContent = "Veritabanı güncellemesi bekleniyor.";
    return;
  }
  if (!son) {
    dolu.setAttribute("stroke-dasharray", "0 100");
    $("tahmin_yuzde").textContent = "—";
    $("tahmin_metin").textContent = "Son 24 saatte tahmin yok";
    $("tahmin_not").textContent = "Model en az 1 saatlik kesintisiz ölçüm ister.";
    return;
  }
  const yuzde = Math.round(son.probability * 100);
  dolu.setAttribute("stroke-dasharray", yuzde + " 100");
  dolu.classList.toggle("sifir", yuzde === 0);
  const dkOnce = sn(son.created_at) / 60;
  if (dkOnce > AYAR.BAYAT_TAHMIN_DK) dolu.classList.add("bayat");
  else if (son.decision) dolu.classList.add("yuksek");
  $("tahmin_yuzde").textContent = "%" + yuzde;
  $("tahmin_metin").textContent = son.horizon_min + " dk içinde sulama olasılığı %" + yuzde;
  $("tahmin_not").textContent =
    (dkOnce > AYAR.BAYAT_TAHMIN_DK ? "Son tahmin " + yasMetni(dkOnce * 60) + " · " : saat(son.created_at) + " · ") +
    modelNotu(son.model_version);
}

function cihazOzetCiz() {
  const hedef = $("cihaz_ozet");
  hedef.textContent = "";
  if (durum.v2Yok) { hedef.append(el("li", "bos", "Cihaz listesi için veritabanı güncellemesi bekleniyor.")); return; }
  if (!durum.cihazlar.length) { hedef.append(el("li", "bos", "Kayıtlı cihaz yok.")); return; }
  for (const c of durum.cihazlar) {
    const d = cihazDurumu(c.son_ts);
    const li = el("li");
    li.append(el("span", "durum-nokta " + d.sinif), el("b", "", c.ad || "Cihaz"),
              el("span", "sag", d.metin + (c.son_ts ? " · " + yasMetni(sn(c.son_ts)) : "")));
    hedef.append(li);
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
    const kart = el("article", "kart cam cihaz-kart");

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
  const satirlar = await sayfaliCek(() => sb.from("readings")
    .select("id,ts,air_temp,humidity,soil_pct_1,co2,soil_ec")
    .gte("ts", bastan).order("ts", { ascending: false }).order("id", { ascending: false }));
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
function seriCiz(c, noktalar, t0, t1, basamakli) {
  const { x, G, Y } = tuvalHazirla(c, 150);
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

// ------------------------------------------------------------ oturum sürüyorsa aç
sb.auth.getSession().then(({ data }) => { if (data.session) panelAc(); });
