
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeamMembersPage({ params }: PageProps) {
  const { id } = await params;

  const team = await prisma.house.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      shortName: true,
      description: true,
      logoUrl: true,
      participants: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          participantId: true,
          name: true,
          photoUrl: true,
        },
      },
    },
  });

  if (!team) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href="/teams"
          className="text-sm font-semibold text-brand transition hover:opacity-75"
        >
          ← Back to Teams
        </Link>

        <header className="mt-8 rounded-3xl border border-border-subtle bg-surface-card p-6 sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={`${team.name} logo`}
                className="h-20 w-20 rounded-2xl object-contain"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-muted text-2xl font-black text-brand">
                {(team.shortName || team.name).slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                IZAZOV 9.0 / TEAM
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-5xl">
                {team.name}
              </h1>

              {team.description && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
                  {team.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-border-subtle pt-5">
            <p className="text-2xl font-bold">{team.participants.length}</p>
            <p className="mt-1 text-sm text-text-muted">
              Registered members
            </p>
          </div>
        </header>

        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Team Members
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Meet the participants representing this team.
            </p>
          </div>

          {team.participants.length === 0 ? (
            <div className="rounded-2xl border border-border-subtle bg-surface-card p-8 text-center">
              <p className="font-semibold">No members added yet</p>
              <p className="mt-2 text-sm text-text-muted">
                Members will appear here when they are registered.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.participants.map((participant) => (
                <Link
                  key={participant.id}
                  href={`/participants/${participant.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 transition duration-300 hover:-translate-y-1 hover:border-brand"
                >
                  {participant.photoUrl ? (
                    <img
                      src={participant.photoUrl}
                      alt={participant.name}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-xl font-bold text-brand">
                      {participant.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold group-hover:text-brand">
                      {participant.name}
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">
                      ID: {participant.participantId}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-brand">
                      View profile →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
