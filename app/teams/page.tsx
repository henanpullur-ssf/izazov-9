
import Link from "next/link";
import { getHouses } from "@/actions/settings";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ style?: string }>;
};

const designs = {
  premium: {
    label: "01 / PREMIUM DARK",
    title: "Our Teams.",
    subtitle: "Different identities. One festival.",
    page: "min-h-screen bg-background text-foreground",
    eyebrow: "text-brand",
    card: "border border-border-subtle bg-surface-card hover:border-brand",
    muted: "text-text-muted",
    accent: "text-brand",
    count: "border-border-subtle bg-surface-elevated",
  },
  artfest: {
    label: "02 / ART-FEST IDENTITY",
    title: "MEET THE TEAMS",
    subtitle: "A world of ideas, culture and creativity.",
    page: "min-h-screen bg-background text-foreground",
    eyebrow: "text-accent-amber",
    card: "border-2 border-border-subtle bg-surface-card hover:border-accent-amber",
    muted: "text-text-muted",
    accent: "text-accent-amber",
    count: "border-border-subtle bg-surface-elevated",
  },
  minimal: {
    label: "03 / MINIMAL DIRECTORY",
    title: "Teams",
    subtitle: "Discover the people behind IZAZOV 9.0.",
    page: "min-h-screen bg-background text-foreground",
    eyebrow: "text-brand",
    card: "border border-border-subtle bg-surface-card hover:border-brand",
    muted: "text-text-muted",
    accent: "text-brand",
    count: "border-border-subtle bg-surface-elevated",
  },
  hybrid: {
    label: "04 / CINEMATIC × ART-FEST",
    title: "ONE FESTIVAL. MANY IDENTITIES.",
    subtitle: "Explore the teams shaping IZAZOV 9.0.",
    page: "min-h-screen bg-background text-foreground",
    eyebrow: "text-brand",
    card: "border border-border-strong bg-surface-card hover:border-brand shadow-[var(--shadow-card)]",
    muted: "text-text-muted",
    accent: "text-brand",
    count: "border-border-subtle bg-surface-elevated",
  },
};


export default async function TeamsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const style = params.style;
  const selected =
    style && style in designs
      ? (style as keyof typeof designs)
      : "hybrid";

  const design = designs[selected];
  const result = await getHouses();
  const teams =
    result.success && result.data ? result.data : [];

  return (
    <main className={design.page}>
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <header className="mb-10 sm:mb-14">
          <p
            className={`text-xs font-bold uppercase tracking-[0.25em] ${design.eyebrow}`}
          >
            IZAZOV 9.0 / {design.label}
          </p>

          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">
            {design.title}
          </h1>

          <p className={`mt-5 max-w-xl text-base sm:text-lg ${design.muted}`}>
            {design.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-4 py-2 text-sm ${design.count}`}
            >
              {teams.length} teams
            </span>
            <span className={`text-sm ${design.muted}`}>
              {teams.reduce(
                (total, team) => total + team._count.participants,
                0
              )}{" "}
              registered members
            </span>
          </div>
        </header>

        {teams.length === 0 ? (
          <div className={`rounded-2xl border p-8 ${design.card}`}>
            <h2 className="text-xl font-bold">No teams available yet</h2>
            <p className={`mt-2 ${design.muted}`}>
              Team details will appear here once they are added.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {teams.map((team, index) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className={`group relative flex min-h-64 flex-col overflow-hidden rounded-2xl p-6 transition duration-300 hover:-translate-y-1 sm:p-7 ${design.card}`}
              >
                {selected === "artfest" && (
                  <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rotate-12 rounded-[2rem] border-[18px] border-accent-blue/15"
                  />
                )}
                {selected === "hybrid" && (
                  <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-brand/30"
                  />
                )}

                <div className="relative flex items-start justify-between gap-4">
                  <span
                    className={`text-xs font-bold tracking-[0.2em] ${design.eyebrow}`}
                  >
                    TEAM / {String(index + 1).padStart(2, "0")}
                  </span>

                  {team.logoUrl ? (
                    <img
                      src={team.logoUrl}
                      alt={`${team.name} logo`}
                      className="h-14 w-14 rounded-xl object-contain"
                    />
                  ) : (
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-black ${design.count} ${design.accent}`}
                    >
                      {(team.shortName || team.name)
                        .slice(0, 3)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="relative mt-7">
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                    {team.name}
                  </h2>

                  {team.shortName && (
                    <p className={`mt-1 text-sm ${design.muted}`}>
                      {team.shortName}
                    </p>
                  )}

                  {team.description && (
                    <p className={`mt-4 text-sm leading-6 ${design.muted}`}>
                      {team.description}
                    </p>
                  )}
                </div>

                <div className="relative mt-auto flex items-end justify-between gap-3 pt-7">
                  <div>
                    <p className={`text-2xl font-bold ${design.accent}`}>
                      {team._count.participants}
                    </p>
                    <p className={`mt-1 text-xs ${design.muted}`}>
                      Registered members
                    </p>
                  </div>

                  <span
                    className={`text-sm font-bold transition-transform duration-300 group-hover:translate-x-1 ${design.accent}`}
                  >
                    Explore team →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <footer
          className={`mt-14 border-t pt-6 text-xs tracking-wide ${design.muted} border-current/15`}
        >
          IZAZOV 9.0 · CULTURE · CREATIVITY · COMPETITION
        </footer>
      </div>
    </main>
  );
}
