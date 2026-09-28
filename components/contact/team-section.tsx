import Image from "next/image"
import { Linkedin, GraduationCap } from "lucide-react"
import { useTranslations } from "next-intl"
import { teamMembers, type TeamMember } from "@/lib/data/team"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TeamSectionProps {
  showAdvisor?: boolean
}

export function TeamSection({ showAdvisor = true }: TeamSectionProps) {
  const t = useTranslations("contact")

  const founders = teamMembers.filter((m) => !m.isAdvisor)
  const advisors = teamMembers.filter((m) => m.isAdvisor)

  return (
    <section className="mb-16">
      <div className="mb-8 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {t("team_title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("team_subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {founders.map((member) => (
          <TeamMemberCard key={member.name} member={member} linkedinLabel={t("team_linkedin")} />
        ))}
      </div>

      {showAdvisor && advisors.length > 0 ? (
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold tracking-tight">
              {t("advisor_title")}
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            {advisors.map((member) => (
              <AdvisorCard
                key={member.name}
                member={member}
                badgeLabel={t("advisor_badge")}
                linkedinLabel={t("team_linkedin")}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function TeamMemberCard({
  member,
  linkedinLabel,
}: {
  member: TeamMember
  linkedinLabel: string
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col items-center pt-6 text-center">
        <Avatar member={member} />
        <div className="font-semibold">{member.name}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">
          {member.title}
        </div>
        {member.description ? (
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            {member.description}
          </p>
        ) : null}
        {member.linkedinUrl ? (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} · ${linkedinLabel}`}
            className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        ) : null}
      </CardContent>
    </Card>
  )
}

function AdvisorCard({
  member,
  badgeLabel,
  linkedinLabel,
}: {
  member: TeamMember
  badgeLabel: string
  linkedinLabel: string
}) {
  return (
    <Card className="border-dashed bg-muted/20">
      <CardContent className="flex flex-col items-center pt-6 text-center">
        <Badge variant="secondary" className="mb-3 gap-1">
          <GraduationCap className="h-3 w-3" />
          {badgeLabel}
        </Badge>
        <Avatar member={member} />
        <div className="font-semibold">{member.name}</div>
        {member.institution ? (
          <div className="mt-0.5 text-sm text-muted-foreground">
            {member.institution}
          </div>
        ) : null}
        {member.description ? (
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            {member.description}
          </p>
        ) : null}
        {member.linkedinUrl ? (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} · ${linkedinLabel}`}
            className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        ) : null}
      </CardContent>
    </Card>
  )
}

function Avatar({ member }: { member: TeamMember }) {
  return (
    <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
      {member.avatarImage ? (
        <Image
          src={member.avatarImage}
          alt={member.name}
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-xl font-semibold">{member.avatarInitials}</span>
      )}
    </div>
  )
}
