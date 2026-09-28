export interface TeamMember {
  name: string
  title: string
  description?: string
  linkedinUrl: string | null
  avatarInitials: string
  avatarImage: string | null
  institution?: string
  isAdvisor?: boolean
}

/**
 * Replace these entries with the real team data.
 * Add `avatarImage: "/team/firstname.jpg"` and drop the file under `public/team/`
 * to show a photo; otherwise the initials will be rendered inside a circle.
 */
export const teamMembers: TeamMember[] = [
  {
    name: "Tuna Özkan Yapıcı",
    title: "Kurucu & CEO",
    description:
      "Girişimin stratejik yönü, pazar araştırması, rekabet analizi ve dış ilişkilerden sorumlu.",
    linkedinUrl:
      "https://www.linkedin.com/in/tuna-özkan-yapıcı-1b071a340",
    avatarInitials: "TÖ",
    avatarImage: null,
  },
  {
    name: "Yusuf Mete Akınlı",
    title: "Kurucu & CTO",
    description:
      "GRU tabanlı yapay zekâ modelinin geliştirilmesi, bulut altyapısı ve mobil/web uygulamalarından sorumlu.",
    linkedinUrl: null,
    avatarInitials: "YA",
    avatarImage: null,
  },
  {
    name: "Ali Kaan Kaya",
    title: "Kurucu & Donanım Lideri",
    description:
      "Sensör altyapısı, ESP32 programlama, güneş enerjisi entegrasyonu ve saha donanım tasarımından sorumlu.",
    linkedinUrl: null,
    avatarInitials: "AK",
    avatarImage: null,
  },
  {
    name: "Doç. Dr. Nurgül Kıtır Şen",
    title: "Akademik Danışman",
    description:
      "Gebze Teknik Üniversitesi Yer ve Deniz Bilimleri Enstitüsü. AI modelinin Türkiye iklim verisiyle eğitilmesi ve saha test metodolojisi.",
    linkedinUrl: null,
    institution: "Gebze Teknik Üniversitesi",
    avatarInitials: "NŞ",
    avatarImage: null,
    isAdvisor: true,
  },
]
