import Image from "next/image"
import { setRequestLocale } from "next-intl/server"

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const tr = locale === "tr"
  return {
    title: tr ? "Proje ve ekip" : "Project and team",
    description: tr ? "AgroNext'i geliştiren ekip ve projenin sahadaki durumu." : "The team building AgroNext and where the project stands in the field.",
  }
}

const TEAM = ["Tuna Özkan Yapıcı", "Yusuf Mete Akınlı", "Ali Kaan Kaya", "Batuhan Melik Gültekin"]

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  const tr = locale === "tr"
  return (
    <div className="s-site s-info">
      <header className="s-wrap s-info-head">
        <p className="s-label">{tr ? "Proje ve ekip" : "Project and team"}</p>
        <h1 className="s-doc-title">{tr ? "Serada geliştirilen bir sistem." : "A system built in the greenhouse."}</h1>
        <p className="s-doc-lead">
          {tr
            ? "AgroNext; sensör donanımı, gömülü yazılım, yerel yapay zekâ ve kullanıcı uygulamasını aynı ekipte geliştiren bir tarım teknolojisi girişimidir. Sistem bir biber serasında kuruldu ve orada geliştirilmeye devam ediyor."
            : "AgroNext is an agritech startup that builds sensor hardware, embedded firmware, local AI and the user app within one team. The system was installed in a pepper greenhouse and continues to be developed there."}
        </p>
      </header>
      <figure className="s-info-photo">
        <div className="s-info-frame">
          <Image src="/agronext/sera-prototip.jpg" alt={tr ? "AgroNext'in sera içindeki saha kurulumu" : "AgroNext field setup inside the greenhouse"} fill priority sizes="100vw" />
        </div>
        <figcaption className="s-wrap">{tr ? "Saha kurulumu, biber serası." : "Field setup, pepper greenhouse."}</figcaption>
      </figure>
      <section className="s-wrap s-info-grid">
        <div>
          <p className="s-label">{tr ? "Ekip" : "Team"}</p>
          <ul className="s-team">
            {TEAM.map((name) => <li key={name}>{name}</li>)}
          </ul>
        </div>
        <dl className="s-notes">
          <div><dt>{tr ? "Konum" : "Location"}</dt><dd>Gebze, Kocaeli</dd></div>
          <div><dt>TEKNOFEST 2026</dt><dd>{tr ? "Tarım Teknolojileri · Tam Otonom Sera Sistemleri finalisti" : "Agricultural Technologies · Fully Autonomous Greenhouse Systems finalist"}</dd></div>
          <div><dt>{tr ? "Sistem" : "System"}</dt><dd>ClimaNex · TerraNex · {tr ? "yerel AI" : "local AI"} · NexAI</dd></div>
          <div><dt>{tr ? "İletişim" : "Contact"}</dt><dd><a href="mailto:agronextstartup@agronext.net">agronextstartup@agronext.net</a></dd></div>
        </dl>
      </section>
    </div>
  )
}
