
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ParticipantProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const participant = await prisma.participant.findUnique({
    where: { id },
    select: {
      id: true,
      participantId: true,
      name: true,
      photoUrl: true,
      house: {
        select: {
          id: true,
          name: true,
          shortName: true,
          logoUrl: true,
        },
      },
      registrations: {
        where: {
          registration: {
            status: {
              notIn: ["CANCELLED", "DISQUALIFIED"],
            },
          },
        },
        select: {
          registration: {
            select: {
             event: {
              select: {
                 id: true,
                 name: true,
                 code: true,
                 category: true,
                 type: true,
                 schedules: {
                   orderBy: {
                     startTime: "asc",
                 },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        venue: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    },
  },
},
            },
          },
        },
      },
    },
  });

  if (!participant) {
    notFound();
  }

  const achievements = await prisma.result.findMany({
    where: {
      isPublished: true,
      OR: [
        { participantId: participant.id },
        {
          registration: {
            participants: {
              some: {
                participantId: participant.id,
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      position: true,
      grade: true,
      prizeLevel: true,
      isWinner: true,
      event: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      position: "asc",
    },
  });

  const programs = Array.from(
    new Map(
      participant.registrations.map(({ registration }) => [
        registration.event.id,
        registration.event,
      ])
    ).values()
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href={
            participant.house
              ? `/teams/${participant.house.id}`
              : "/teams"
          }
          className="text-sm font-semibold text-brand hover:opacity-75"
        >
          ← Back to {participant.house ? "Team" : "Teams"}
        </Link>

        <section className="mt-8 overflow-hidden rounded-3xl border border-border-subtle bg-surface-card">
          <div className="h-2 bg-brand" />

          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-10">
            {participant.photoUrl ? (
              <img
                src={participant.photoUrl}
                alt={participant.name}
                className="h-32 w-32 rounded-2xl border border-border-subtle object-cover sm:h-40 sm:w-40"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-brand-muted text-4xl font-black text-brand sm:h-40 sm:w-40">
                {participant.name.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">
                IZAZOV 9.0 / PARTICIPANT PROFILE
              </p>

              <h1 className="mt-3 text-3xl font-black sm:text-5xl">
                {participant.name}
              </h1>

              <p className="mt-3 text-sm text-text-muted">
                Participant ID: {participant.participantId}
              </p>

              {participant.house && (
                <Link
                  href={`/teams/${participant.house.id}`}
                  className="mt-5 inline-flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-elevated px-4 py-3 transition hover:border-brand"
                >
                  {participant.house.logoUrl && (
                    <img
                      src={participant.house.logoUrl}
                      alt=""
                      className="h-9 w-9 rounded-lg object-contain"
                    />
                  )}

                  <span>
                    <span className="block text-xs text-text-muted">
                      Team
                    </span>
                    <span className="font-bold">
                      {participant.house.name}
                    </span>
                  </span>

                  <span className="ml-2 text-brand">→</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              PARTICIPATION
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Registered Programs
            </h2>
          </div>

          {programs.length === 0 ? (
            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 text-sm text-text-muted">
              No registered programs to display yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {programs.map((event) => (
                <div
  key={event.id}
  className="rounded-2xl border border-border-subtle bg-surface-card p-5"
>
  <p className="text-xs font-semibold uppercase tracking-wider text-brand">
    {event.category || event.type}
  </p>

  <h3 className="mt-2 text-lg font-bold">
    {event.name}
  </h3>

  <p className="mt-2 text-xs text-text-muted">
    Event code: {event.code}
  </p>

  <div className="mt-5 border-t border-border-subtle pt-4">
    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand">
      Schedule & Venue
    </p>

    {event.schedules.length === 0 ? (
      <p className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-3 text-sm text-text-muted">
        Schedule not announced yet
      </p>
    ) : (
      <div className="space-y-4">
        {event.schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="rounded-xl border border-border-subtle bg-surface-elevated p-3"
          >
            <p className="text-sm font-semibold">
              {new Date(schedule.startTime).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Kolkata",
              })}
            </p>

            <p className="mt-2 flex items-start gap-2 text-sm text-text-muted">
              <span aria-hidden="true">◷</span>
              <span>
                {new Date(schedule.startTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                })}
                {" – "}
                {new Date(schedule.endTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                })}
              </span>
            </p>

            <div className="mt-3 flex items-start gap-2 text-sm">
              <span aria-hidden="true">⌖</span>
              <div>
                <p className="font-semibold">
                  {schedule.venue?.name || "Venue not announced yet"}
                </p>

                {schedule.venue?.location && (
                  <p className="mt-1 text-text-muted">
                    {schedule.venue.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              RECOGNITION
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Achievements
            </h2>
          </div>

          {achievements.length === 0 ? (
            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 text-sm text-text-muted">
              No published achievements yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {achievements.map((achievement) => (
                <article
                  key={achievement.id}
                  className="rounded-2xl border border-border-subtle bg-surface-card p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-brand">
                    {achievement.isWinner
                      ? "Achievement"
                      : "Published Result"}
                  </p>

                  <h3 className="mt-2 text-lg font-bold">
                    {achievement.event.name}
                  </h3>

                  {achievement.prizeLevel && (
                    <p className="mt-2 text-sm text-text-muted">
                      {achievement.prizeLevel}
                    </p>
                  )}

                  {achievement.position != null && (
                    <p className="mt-3 font-semibold">
                      Position: {achievement.position}
                    </p>
                  )}

                  {achievement.grade && (
                    <p className="mt-1 text-sm text-text-muted">
                      Grade: {achievement.grade}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 border-t border-border-subtle pt-6 text-sm text-text-muted">
          IZAZOV 9.0 · Participant Profile
        </footer>
      </div>
    </main>
  );
}
