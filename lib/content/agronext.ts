// Detay sayfalarının içeriği (/tr/sistem, /tr/climanex …). Ana sayfadaki bölümlerin
// teknik devamıdır: aynı dil, aynı rakamlar. Pin ve süre değerleri firmware'den
// (TerraNEX_v0_3) ve breadboard bağlantı tasarımından alınmıştır.

export type SiteLocale = "tr" | "en"

export const detailSlugs = ["sistem", "climanex", "terranex", "yapay-zeka", "nexai", "sonuclar", "urun-ailesi"] as const
export type DetailSlug = (typeof detailSlugs)[number]

type Localized = { tr: string; en: string }
type Img = { src: string; w: number; h: number; alt: Localized; caption: Localized; fit?: "contain" }

export type Detail = {
  kicker: Localized
  title: Localized
  lead: Localized
  image: Img
  specs: { k: Localized; v: Localized }[]
  body: { h: Localized; p: Localized }[]
  schematic?: Img
  charts?: boolean
}

const L = (tr: string, en: string): Localized => ({ tr, en })

export const detailContent: Record<DetailSlug, Detail> = {
  sistem: {
    kicker: L("Sistem mimarisi", "System architecture"),
    title: L("Sensörden karara, karardan uygulamaya.", "From sensing to decision, from decision to action."),
    lead: L(
      "AgroNext iki sensör modülü, seradaki yerel bir karar birimi ve dört bağımsız röle kanalından oluşur. Ölçüm, karar ve uygulama aynı yerel ağda kapanır; uygulama ve NexAI bu döngüyü internet üzerinden izler ve açıklar.",
      "AgroNext consists of two sensor modules, a local decision unit in the greenhouse and four independent relay channels. Measurement, decision and action close on the same local network; the app and NexAI observe and explain the loop over the internet.",
    ),
    image: { src: "/agronext/sera-etiketli.jpg", w: 1500, h: 690, alt: L("Sera içindeki AgroNext kurulumunun etiketli fotoğrafı", "Annotated photo of the AgroNext setup in the greenhouse"), caption: L("Saha kurulumu, etiketli görünüm.", "Field setup, annotated view.") },
    specs: [
      { k: L("Sensör modülü", "Sensor modules"), v: L("2 · ClimaNex (iklim), TerraNex (kök bölgesi)", "2 · ClimaNex (climate), TerraNex (root zone)") },
      { k: L("Kontrol kanalı", "Control channels"), v: L("4 · sulama, gübre dozajı, fan, ısıtıcı", "4 · irrigation, fertiliser dosing, fan, heater") },
      { k: L("Örnekleme", "Sampling"), v: L("5 sn", "5 s") },
      { k: L("Karar birimi", "Decision unit"), v: L("Arduino tabanlı, sera içinde", "Arduino-based, inside the greenhouse") },
      { k: L("Uzak erişim", "Remote access"), v: L("yalnız dışa giden TLS; kart port dinlemez", "outbound TLS only; boards never listen on a port") },
    ],
    body: [
      { h: L("Ortak ölçüm paketi", "Shared measurement packet"), p: L("Her ölçüm cihaz ve bölge kimliği, zaman, sıra numarası, değer, birim ve kalite bilgisiyle paketlenir. Kalibrasyon ve güncellik kontrolünden geçmeyen ölçüm işaretlenir ve kaydedilir; karara girmez.", "Every reading carries device and zone ID, time, sequence number, value, unit and quality. A reading that fails calibration or freshness checks is flagged and logged, but never used for a decision.") },
      { h: L("Karar denetimi", "Decision check"), p: L("Yerel AI'nin ya da NexAI'nin önerisi bitki profili, sıcaklık ve nem eşikleri, doz ve pompa süresi sınırları ve aç/kapa aralıklarıyla denetlenir. Uygun karar komuta dönüşür; uygun olmayan karar kaydedilir ve kullanıcıya uyarı olarak gösterilir. Manuel durdurma her zaman önceliklidir.", "A proposal from the local AI or from NexAI is checked against the plant profile, temperature and humidity thresholds, dose and pump-time limits and on/off intervals. An approved decision becomes a command; a rejected one is logged and shown as an alert. Manual stop always takes priority.") },
      { h: L("Bağlantı kesildiğinde", "When the link drops"), p: L("Yerel AI, kayıt ve kontrol kuralları çalışmayı sürdürür. Bağlantı dönünce birikmiş ölçümler zaman sırasıyla aktarılır; süresi geçmiş komutlar yeniden oynatılmaz.", "The local AI, logging and control rules keep running. When the link returns, buffered readings are sent in time order; expired commands are never replayed.") },
    ],
  },
  climanex: {
    kicker: L("Modül 01 · İklim", "Module 01 · Climate"),
    title: L("ClimaNex", "ClimaNex"),
    lead: L(
      "ClimaNex sera havasını ölçer: sıcaklık ve bağıl nem BME680'den I²C ile, CO₂ ayrı bir NDIR sensörden UART ile gelir. Ölçümler beş saniyede bir zaman damgasıyla paketlenir; ısıtıcı ve fan için iki bağımsız röle çıkışı vardır.",
      "ClimaNex measures the greenhouse air: temperature and relative humidity from a BME680 over I²C, CO₂ from a separate NDIR sensor over UART. Readings are timestamped every five seconds; there are two independent relay outputs for a heater and a fan.",
    ),
    image: { src: "/agronext/climanex-prototip.png", w: 824, h: 1026, alt: L("ClimaNex breadboard prototipi ve ölçümleri gösteren TFT ekran", "ClimaNex breadboard prototype with TFT display showing readings"), caption: L("ClimaNex, masa testi.", "ClimaNex, bench test.") },
    specs: [
      { k: L("Denetleyici", "Controller"), v: L("ESP32-WROOM-32", "ESP32-WROOM-32") },
      { k: L("Sıcaklık · nem", "Temperature · humidity"), v: L("BME680 · I²C 0x76 · SDA 21 / SCL 22", "BME680 · I²C 0x76 · SDA 21 / SCL 22") },
      { k: L("CO₂", "CO₂"), v: L("MH-Z14A NDIR · UART · TX 16 / RX 17 · 5 V besleme", "MH-Z14A NDIR · UART · TX 16 / RX 17 · 5 V supply") },
      { k: L("Ekran", "Display"), v: L("1,8″ SPI TFT · iki sayfa: ölçümler, sistem durumu", "1.8″ SPI TFT · two pages: readings, system status") },
      { k: L("Isıtıcı çıkışı", "Heater output"), v: L("GPIO25 · 2N3904 + 5 V röle · NO kontak", "GPIO25 · 2N3904 + 5 V relay · NO contact") },
      { k: L("Fan çıkışı", "Fan output"), v: L("GPIO26 · 2N3904 + 5 V röle · NO kontak", "GPIO26 · 2N3904 + 5 V relay · NO contact") },
    ],
    body: [
      { h: L("Neden ayrı bir CO₂ sensörü?", "Why a separate CO₂ sensor?"), p: L("BME680'in gaz direnci göreceli bir hava kalitesi eğilimidir, CO₂ ölçümü değildir. CO₂ bu yüzden NDIR prensibiyle çalışan ayrı bir sensörden okunur; ilk dakikalardaki ısınma süresi boyunca değeri karara girmez.", "The BME680's gas resistance is a relative air-quality trend, not a CO₂ measurement. CO₂ is therefore read from a separate NDIR sensor; during its warm-up minutes the value is kept out of decisions.") },
      { h: L("Isıtma ve havalandırma", "Heating and ventilation"), p: L("Yerel AI sıcaklık, nem ve CO₂ eğilimini bitki profiliyle değerlendirir ve ısıtıcı ile fan için ayrı karar üretir. Minimum aç/kapa süreleri röleleri ve bağlı ekipmanı sık anahtarlamadan korur.", "The local AI weighs temperature, humidity and CO₂ trends against the plant profile and makes separate decisions for heater and fan. Minimum on/off times protect the relays and the equipment from rapid switching.") },
      { h: L("Yerinde gösterim", "On-site display"), p: L("TFT ekranın ilk sayfası güncel ölçümleri, ikinci sayfası sensör durumunu, Wi-Fi bağlantısını ve gönderim sayacını gösterir. İki buton sayfalar arasında geçiş yapar.", "The TFT's first page shows current readings, the second sensor status, Wi-Fi link and upload counter. Two buttons switch pages.") },
    ],
    schematic: { src: "/agronext/climanex-sema.png", w: 1890, h: 878, alt: L("ClimaNex breadboard bağlantı şeması: BME680, MH-Z14A, SPI TFT, ısıtıcı ve fan röleleri", "ClimaNex breadboard wiring: BME680, MH-Z14A, SPI TFT, heater and fan relays"), caption: L("Elektronik yerleşim · ClimaNex", "Electronic layout · ClimaNex") },
  },
  terranex: {
    kicker: L("Modül 02 · Kök bölgesi", "Module 02 · Root zone"),
    title: L("TerraNex", "TerraNex"),
    lead: L(
      "TerraNex bitkinin kök bölgesini okur ve sulamayı yürütür. Toprak nemi ve pH analog girişlerden, NPK değerleri RS485 / Modbus RTU hattından gelir. Sulama pompası ve besin çözeltisinin dozaj pompası iki ayrı röleyle sürülür.",
      "TerraNex reads the root zone and runs irrigation. Soil moisture and pH arrive on analog inputs, NPK values over an RS485 / Modbus RTU line. The irrigation pump and the nutrient dosing pump are driven by two separate relays.",
    ),
    image: { src: "/agronext/sera-prototip.jpg", w: 2200, h: 1012, alt: L("Serada toprağa yerleştirilmiş NPK, pH ve nem probları ile TerraNex breadboard'u", "NPK, pH and moisture probes in the soil with the TerraNex breadboard"), caption: L("TerraNex probları toprakta, biber serası.", "TerraNex probes in the soil, pepper greenhouse.") },
    specs: [
      { k: L("Denetleyici", "Controller"), v: L("ESP32", "ESP32") },
      { k: L("Toprak nemi", "Soil moisture"), v: L("kapasitif prob · ADC1 · GPIO34 · kuru/ıslak iki nokta kalibrasyon", "capacitive probe · ADC1 · GPIO34 · two-point dry/wet calibration") },
      { k: L("pH", "pH"), v: L("analog arayüz + BNC elektrot · GPIO35 · 10k/20k bölücü · iki tampon kalibrasyon", "analog interface + BNC electrode · GPIO35 · 10k/20k divider · two-buffer calibration") },
      { k: L("NPK", "NPK"), v: L("RS485 prob · Modbus RTU · MAX3485 arayüzü", "RS485 probe · Modbus RTU · MAX3485 interface") },
      { k: L("Sulama pompası", "Irrigation pump"), v: L("GPIO25 · en fazla 60 sn", "GPIO25 · max 60 s") },
      { k: L("Gübre dozajı", "Fertiliser dosing"), v: L("GPIO26 · en fazla 30 sn", "GPIO26 · max 30 s") },
    ],
    body: [
      { h: L("İki pompa, tek kural", "Two pumps, one rule"), p: L("Aynı anda yalnız bir pompa çalışır. Her açılış kanalın en uzun süresiyle sınırlıdır ve süre dolunca kartın kendi zamanlayıcısı pompayı kapatır; bağlantı ya da gönderim takılsa bile pompa açık kalmaz. Kart ayrıca bir watchdog ile izlenir.", "Only one pump runs at a time. Each run is capped at the channel's maximum duration and the board's own timer switches the pump off when time is up; even if the link or an upload stalls, the pump does not stay on. The board is also supervised by a watchdog.") },
      { h: L("Analog girişler ve Wi-Fi", "Analog inputs and Wi-Fi"), p: L("ESP32'de Wi-Fi açıkken ADC2 kullanılamaz. Toprak nemi ve pH bu yüzden ADC1 pinlerine bağlıdır. pH kartının çıkışı 5 V'a kadar çıkabildiği için gerilim bölücüyle 3,3 V sınırına indirilir.", "On the ESP32, ADC2 is unavailable while Wi-Fi is on, so soil moisture and pH use ADC1 pins. The pH board's output can reach 5 V, so a divider brings it within the 3.3 V limit.") },
      { h: L("NPK hattı", "NPK line"), p: L("NPK probu RS485 diferansiyel hat üzerinden konuşur; A/B uçları ESP32'ye doğrudan bağlanmaz, MAX3485 arayüzü üzerinden seri porta çevrilir. Değerler dozaj kararında bağlam olarak kullanılır.", "The NPK probe talks over a differential RS485 line; its A/B wires never connect directly to the ESP32 but go through a MAX3485 transceiver. The values serve as context for dosing decisions.") },
    ],
    schematic: { src: "/agronext/terranex-sema.png", w: 1890, h: 876, alt: L("TerraNex breadboard bağlantı şeması: pH arayüzü, kapasitif nem, NPK RS485, gübre ve sulama röleleri", "TerraNex breadboard wiring: pH interface, capacitive moisture, NPK RS485, fertiliser and irrigation relays"), caption: L("Elektronik yerleşim · TerraNex", "Electronic layout · TerraNex") },
  },
  "yapay-zeka": {
    kicker: L("Yerel yapay zekâ", "Local AI"),
    title: L("Karar seranın içinde verilir.", "The decision is made inside the greenhouse."),
    lead: L(
      "AgroNext'in modeli seradaki Arduino tabanlı yerel birimde çalışır. İklim ve kök bölgesi ölçümlerini, son bir saatin eğilimini ve bitki profilini birlikte değerlendirir; sulama, besleme, ısıtma ve fan için ayrı karar üretir.",
      "AgroNext's model runs on an Arduino-based local unit in the greenhouse. It evaluates climate and root-zone readings, the last hour's trend and the plant profile together, and produces separate decisions for irrigation, feeding, heating and the fan.",
    ),
    image: { src: "/agronext/arduino-uno-q.png", w: 337, h: 239, alt: L("Arduino Uno Q kartı", "Arduino Uno Q board"), caption: L("Yerel karar birimi · Arduino Uno Q", "Local decision unit · Arduino Uno Q"), fit: "contain" },
    specs: [
      { k: L("Model", "Model"), v: L("GRU tabanlı zaman serisi", "GRU time-series") },
      { k: L("Girdi", "Inputs"), v: L("sıcaklık · bağıl nem · toprak nemi · CO₂", "temperature · relative humidity · soil moisture · CO₂") },
      { k: L("Pencere", "Window"), v: L("12 adım × 5 dk (1 saat)", "12 steps × 5 min (1 hour)") },
      { k: L("Ufuk", "Horizon"), v: L("30 dk", "30 min") },
      { k: L("Veri tazeliği", "Freshness"), v: L("15 sn'den eski ölçüm karara girmez", "readings older than 15 s are excluded") },
    ],
    body: [
      { h: L("Karar ile komut ayrıdır", "Decision and command are separate"), p: L("Modelin çıktısı bir öneridir. Öneri; veri geçerliliği, çalışma sınırları, süre ve aralık kurallarından geçmeden röleye ulaşmaz. Bu denetim modelden bağımsız, sabit kurallarla çalışır.", "The model's output is a proposal. It cannot reach a relay without passing data validity, operating limits, duration and interval rules. This check runs on fixed rules, independent of the model.") },
      { h: L("Neden yerel?", "Why local?"), p: L("Karar, ölçümün geldiği yerel ağdan çıkmaz. İnternet kesintisi seradaki kontrolü durdurmaz; uzak panel ve NexAI yalnız eşitlemeyi bekler.", "The decision never leaves the local network the reading arrived on. An internet outage does not stop control in the greenhouse; the remote panel and NexAI simply wait for sync.") },
      { h: L("İzlenebilir karar", "Traceable decisions"), p: L("Her karar; dayandığı ölçüm, model ve kural sürümü, verilen komut ve cihazın yanıtıyla birlikte kaydedilir. Kullanıcı ne yapıldığını ve nedenini panelde görür.", "Every decision is logged with the readings it used, the model and rule version, the command issued and the device's response. The user sees what was done and why in the panel.") },
    ],
  },
  nexai: {
    kicker: L("NexAI", "NexAI"),
    title: L("NexAI ile konuş.", "Talk to NexAI."),
    lead: L(
      "NexAI web ve mobil uygulamadaki dil modeli katmanıdır. Seranla ilgili soruları ölçüm geçmişi, karar kayıtları ve komut geçmişiyle yanıtlar; her yanıtta dayandığı veriyi gösterir.",
      "NexAI is the language-model layer in the web and mobile app. It answers questions about your greenhouse using measurement history, decision records and command history, and shows the data behind every answer.",
    ),
    image: { src: "/agronext/panel-genel-bakis.png", w: 1600, h: 780, alt: L("Sera panelinde AI Karar Özeti ve NexAI sohbet alanı", "AI Decision Summary and NexAI chat in the greenhouse panel"), caption: L("Sera paneli v3 · sağda AI Karar Özeti ve NexAI.", "Greenhouse panel v3 · AI Decision Summary and NexAI on the right.") },
    specs: [
      { k: L("Çalıştığı yer", "Runs in"), v: L("web ve mobil uygulama", "web and mobile app") },
      { k: L("Kaynak", "Sources"), v: L("güncel ölçüm · geçmiş · karar ve komut kayıtları", "current readings · history · decision and command logs") },
      { k: L("Komut yetkisi", "Command authority"), v: L("yok · öneriler yerel denetimden geçer", "none · suggestions pass the local check") },
      { k: L("Erişim", "Access"), v: L("girişli · her kullanıcı yalnız kendi serası", "signed-in · each user sees only their own greenhouse") },
    ],
    body: [
      { h: L("Örnek sorular", "Example questions"), p: L("“Kuzey bölümünde sulama neden başladı?” · “Son 24 saatte CO₂ seviyesi nasıl değişti?” · “Toprak nemi neden hedef değerin altında?” · “Fan neden devreye alındı?”", "“Why did irrigation start in the north section?” · “How did CO₂ change over the last 24 hours?” · “Why is soil moisture below target?” · “Why did the fan switch on?”") },
      { h: L("Açıklar, çalıştırmaz", "Explains, does not operate"), p: L("NexAI pompayı, fanı ya da ısıtıcıyı doğrudan çalıştıramaz. Bir eylem önerdiğinde öneri yerel karar denetimine gider; aynı sınırlar ve aynı kayıt kuralları geçerlidir.", "NexAI cannot switch a pump, fan or heater directly. When it suggests an action, the suggestion goes to the local decision check; the same limits and the same logging rules apply.") },
      { h: L("Kopuklukta", "When offline"), p: L("İnternet kesildiğinde NexAI eşitlemeyi bekler; seradaki ölçüm ve kontrol bundan etkilenmez. Bağlantı dönünce kesinti aralığı kayıt akışında görünür.", "When the internet is down, NexAI waits for sync; measurement and control in the greenhouse are unaffected. When the link returns, the outage window is visible in the record stream.") },
    ],
  },
  sonuclar: {
    kicker: L("Saha verisi", "Field data"),
    title: L("Gerçek sera. Gerçek veri.", "A real greenhouse. Real data."),
    lead: L(
      "AgroNext 10 m²'lik gerçek bir biber serasında geliştiriliyor ve bu serada 45 gün boyunca ölçüm topladı. Aşağıdaki eğriler ClimaNex'in kendi kaydından alınmış kesitlerdir; iki dakikalık ortalama dışında hiçbir işlem görmemiştir.",
      "AgroNext is developed in a real 10 m² pepper greenhouse, where it collected measurements for 45 days. The curves below are excerpts from ClimaNex's own log; apart from two-minute averaging they are unprocessed.",
    ),
    image: { src: "/agronext/sera-prototip.jpg", w: 2200, h: 1012, alt: L("AgroNext'in biber serasındaki saha kurulumu", "AgroNext field setup in the pepper greenhouse"), caption: L("Saha kurulumu, biber serası.", "Field setup, pepper greenhouse.") },
    specs: [
      { k: L("Sera", "Greenhouse"), v: L("10 m² · biber", "10 m² · pepper") },
      { k: L("Süre", "Period"), v: L("45 gün", "45 days") },
      { k: L("Örnekleme", "Sampling"), v: L("5 sn · iki modül", "5 s · both modules") },
      { k: L("Deney", "Experiment"), v: L("3 gün manuel · 3 gün AgroNext kontrolü", "3 days manual · 3 days AgroNext control") },
    ],
    body: [
      { h: L("Eksik veri doldurulmaz", "Gaps are never filled"), p: L("15 saniye içinde gelmeyen alan boş yazılır. Grafiklerde kayıt boşluğu olan yerde çizgi de kesilir; olmayan ölçüm varmış gibi gösterilmez.", "A field that does not arrive within 15 seconds is written as empty. Charts break the line where the log has a gap; a missing reading is never drawn as if it existed.") },
      { h: L("Manuel ve AgroNext kontrolü", "Manual vs AgroNext control"), p: L("Aynı serada üç gün sulama elle, sonraki üç gün AgroNext kararıyla yapılır. Verilen su, toprak nemi eğrisi, sulama sayısı ve saati, iklim değerleri ve bitki gözlemi iki dönemde de kaydedilir. Sonuçlar ham ölçüm ve yöntemle birlikte yayımlanacak.", "In the same greenhouse, irrigation is done by hand for three days and by AgroNext for the next three. Water applied, soil moisture curve, irrigation count and time, climate values and plant observations are logged in both periods. Results will be published together with raw measurements and method.") },
    ],
    charts: true,
  },
  "urun-ailesi": {
    kicker: L("Ürünleşme", "Product path"),
    title: L("Breadboard'dan seraya kurulan ürüne.", "From breadboard to a product installed in the greenhouse."),
    lead: L(
      "Bugün iki modül breadboard üzerinde, gerçek serada çalışıyor. Sıradaki adımlar sensör doğrulaması, ClimaNex ve TerraNex için özel taşıyıcı PCB, sahaya dayanıklı muhafaza ve ikinci bir serada pilot kurulum.",
      "Today both modules run on breadboards in a real greenhouse. Next come sensor validation, custom carrier PCBs for ClimaNex and TerraNex, a field-ready enclosure and a pilot installation in a second greenhouse.",
    ),
    image: { src: "/agronext/pcb-ailesi.png", w: 3600, h: 1800, alt: L("TerraNex ve ClimaNex taşıyıcı PCB yerleşimleri ve 3B kart önizlemeleri", "TerraNex and ClimaNex carrier PCB layouts and 3D board previews"), caption: L("AgroNext PCB tasarım ailesi · mekanik taslak.", "AgroNext PCB design family · mechanical draft.") },
    specs: [
      { k: L("Kart bölgeleri", "Board zones"), v: L("ana kontrol (ESP32) · ölçüm · akış/hava kontrol · saha bağlantı", "main control (ESP32) · measurement · flow/air control · field connection") },
      { k: L("TerraNex kartı", "TerraNex board"), v: L("toprak nemi · pH · NPK · sulama · gübreleme", "soil moisture · pH · NPK · irrigation · fertilising") },
      { k: L("ClimaNex kartı", "ClimaNex board"), v: L("sıcaklık · nem · CO₂ · ısıtma · havalandırma", "temperature · humidity · CO₂ · heating · ventilation") },
      { k: L("Sonraki kanal", "Next channel"), v: L("motorlu pencere · ayrı sürücü, yön kontrolü, limit anahtarları", "motorised vent · separate driver, direction control, limit switches") },
    ],
    body: [
      { h: L("Sensör doğrulama", "Sensor validation"), p: L("Toprak nemi probu kuru ve ıslak uçlarda, pH elektrodu iki tampon çözeltiyle kalibre edilir; NDIR CO₂ sensörünün ısınma süresi ölçülür. Kalibrasyon değerleri her prob için ayrı tutulur.", "The soil moisture probe is calibrated at dry and wet endpoints and the pH electrode with two buffer solutions; the NDIR CO₂ sensor's warm-up time is measured. Calibration values are stored per probe.") },
      { h: L("Özel PCB", "Custom PCB"), p: L("İki modül aynı iskeleti paylaşır: ESP32 soketi, ölçüm bölgesi, röle sürücü bölgesi ve saha bağlantı klemensleri. Böylece bir modülde doğrulanan devre diğerine taşınabilir.", "Both modules share one skeleton: ESP32 socket, measurement zone, relay-driver zone and field terminals, so a circuit validated on one carries over to the other.") },
      { h: L("Pilot ve ölçek", "Pilot and scale"), p: L("Pilot kurulum ikinci bir serada, önceden yazılmış yöntemle yapılır. Ölçekli sürümde her bölgeye bir modül çifti kurulur ve hepsi tek panelden izlenir.", "The pilot runs in a second greenhouse with a method written in advance. At scale, each zone gets a module pair, all observed from one panel.") },
    ],
  },
}
