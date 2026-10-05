import React from "react";
import Link from "next/link";
import {
  Shield,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { getHouses } from "@/actions/settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FEST_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `About & House System | ${FEST_NAME}`,
  description: "Learn about the festival championship, house system, rules, and governance.",
};

export default async function PublicAboutPage() {
  const housesRes = await getHouses();
  const houses = housesRes.data || [];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col selection:bg-[#931827]">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        {/* Title Header */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#931827]">
            The 9th Edition
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            About {FEST_NAME}
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">
            IZAZOV (meaning “The Challenge”) is our premier annual campus festival uniting over 2,000 students across technical hackathons, cultural showdowns, debates, arts, and esports arenas.
          </p>
        </div>

        {/* Four Houses Championship Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[#242122]">
            <Flame className="w-5 h-5 text-[#931827]" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              The Four Houses Championship
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Every enrolled participant is inducted into one of our legendary campus houses. Points earned in individual and group competitions accumulate directly to the annual House Trophy leaderboard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(houses.length > 0 ? houses : [
              { id: "1", name: "Phoenix", shortName: "PHX", description: "House of Flames & Innovation. Known for technical dominance and bold choreography." },
              { id: "2", name: "Pegasus", shortName: "PEG", description: "House of Vision & Culture. Renowned for theatrical productions, music, and literary arts." },
              { id: "3", name: "Orion", shortName: "ORN", description: "House of Strategy & Intellect. Excelling in debate, quiz, strategy games, and coding sprints." },
              { id: "4", name: "Hydra", shortName: "HYD", description: "House of Resilience & Power. Dominating esports, physical sports, and battle of the bands." },
            ]).map((h) => (
              <Card key={h.id} className="p-5 space-y-2 border-[#2c2829] bg-[#141314]">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg">{h.name}</h3>
                  {h.shortName && (
                    <Badge variant="primary">{h.shortName}</Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {h.description || "Official competitive house."}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Code of Conduct & Guidelines */}
        <section id="guidelines" className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[#242122]">
            <Shield className="w-5 h-5 text-[#931827]" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Code of Conduct & Competition Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                1. Pass & Gate Verification
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                All registered participants and spectators must present their digital QR pass or physical college ID at the security gates. Gate passes are non-transferable.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                2. Reporting Timelines
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                Teams and solo participants must report to the assigned venue stage at least 15 minutes prior to the scheduled start time. Late arrivals may forfeit their round.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                3. Jury Decision Finality
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                Decisions of the official judging panel are final and binding. Scores are verified by the super admin operations desk before publication on the live portal.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                4. Sportsmanship & Integrity
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                Unsportsmanlike conduct, plagiarism in technical events, or unauthorized equipment tampering results in immediate disqualification and forfeiture of house points.
              </p>
            </Card>
          </div>
        </section>

        {/* Contact & Coordination Desk */}
        <section className="p-8 rounded-3xl border border-[#2d292a] bg-[#121112] text-center space-y-4">
          <h3 className="text-xl font-bold text-white">
            Have Questions or Need Assistance?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Our student coordinator desk and technical crew are available at the Main Operations Desk in Block A.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/events">
              <Button size="sm">Explore Events</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Staff & Admin Portal
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
