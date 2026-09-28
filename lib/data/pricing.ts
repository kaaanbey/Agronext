export interface PricingFeature {
  tr: string
  en: string
  included: boolean
}

export interface StaticPricingPlan {
  id: string
  nameKey: "starter" | "pro" | "enterprise"
  descriptionKey: "starter" | "pro" | "enterprise"
  priceMonthly: number | null
  priceYearly: number | null
  highlighted: boolean
  ctaKey: "demo" | "quote"
  sortOrder: number
  features: PricingFeature[]
}

export const pricingPlans: StaticPricingPlan[] = [
  {
    id: "starter",
    nameKey: "starter",
    descriptionKey: "starter",
    priceMonthly: null,
    priceYearly: null,
    highlighted: false,
    ctaKey: "demo",
    sortOrder: 1,
    features: [
      { tr: "1 sera bağlantısı", en: "1 greenhouse connection", included: true },
      {
        tr: "Temel sensör izleme (5 parametre)",
        en: "Basic sensor monitoring (5 parameters)",
        included: true,
      },
      { tr: "Mobil uygulama erişimi", en: "Mobile app access", included: true },
      { tr: "E-posta bildirimleri", en: "Email notifications", included: true },
      { tr: "7/24 veri kaydı", en: "24/7 data logging", included: true },
    ],
  },
  {
    id: "pro",
    nameKey: "pro",
    descriptionKey: "pro",
    priceMonthly: null,
    priceYearly: null,
    highlighted: true,
    ctaKey: "demo",
    sortOrder: 2,
    features: [
      { tr: "3 seraya kadar bağlantı", en: "Up to 3 greenhouses", included: true },
      {
        tr: "GRU tabanlı AI tahmin motoru",
        en: "GRU-based AI prediction engine",
        included: true,
      },
      {
        tr: "Sulama & gübreleme otomasyonu",
        en: "Irrigation & fertilization automation",
        included: true,
      },
      {
        tr: "Anlık push bildirimleri",
        en: "Real-time push notifications",
        included: true,
      },
      {
        tr: "Web panosu + mobil uygulama",
        en: "Web dashboard + mobile app",
        included: true,
      },
      { tr: "Haftalık AI raporu", en: "Weekly AI report", included: true },
    ],
  },
  {
    id: "enterprise",
    nameKey: "enterprise",
    descriptionKey: "enterprise",
    priceMonthly: null,
    priceYearly: null,
    highlighted: false,
    ctaKey: "quote",
    sortOrder: 3,
    features: [
      {
        tr: "Sınırsız sera bağlantısı",
        en: "Unlimited greenhouses",
        included: true,
      },
      {
        tr: "Özelleştirilmiş AI model eğitimi",
        en: "Custom AI model training",
        included: true,
      },
      {
        tr: "API erişimi & ERP entegrasyonu",
        en: "API access & ERP integration",
        included: true,
      },
      {
        tr: "Öncelikli teknik destek",
        en: "Priority technical support",
        included: true,
      },
      { tr: "Saha kurulum desteği", en: "On-site setup support", included: true },
      { tr: "SLA garantisi", en: "SLA guarantee", included: true },
    ],
  },
]
