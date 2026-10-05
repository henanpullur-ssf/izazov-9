import React from "react";
import Link from "next/link";
import { MapPin, Users, Calendar, ArrowRight } from "lucide-react";
import { getVenues } from "@/actions/venues";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FEST_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Venues & Stages | ${FEST_NAME}`,
  description: "Explore campus auditoriums, open stages, and computing arenas.",
};

export default async function PublicVenuesPage() {
  const res = await getVenues();
  const venues = res.data || [];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col selection:bg-[#931827]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#931827]">
            Campus Stages & Arenas
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Festival Venues
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            State-of-the-art concert halls, computing labs, amphitheaters, and indoor arenas hosting IZAZOV 9.0 competitions.
          </p>
        </div>

        {venues.length === 0 ? (
          <EmptyState
            icon={<MapPin className="w-6 h-6 text-zinc-500" />}
            title="Venues being configured"
            description="The campus facilities map will be released shortly."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((v) => (
              <Card
                key={v.id}
                className="flex flex-col justify-between hover:border-[#931827] transition group"
              >
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-[#931827] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{v.location || "Campus"}</span>
                    </span>
                    {v.isActive ? (
                      <Badge variant="success" className="text-[10px]">
                        Active Arena
                      </Badge>
                    ) : (
                      <Badge variant="neutral" className="text-[10px]">
                        Restricted
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-red-400 transition-colors">
                    {v.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {v.description ||
                      "Equipped with staging, acoustic sound systems, and tournament projection."}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[#232021] text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Capacity: {v.capacity || "Open"}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{v.events?.length || 0} Events Hosted</span>
                    </span>
                  </div>

                  {v.events && v.events.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        Hosted Events
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {v.events.map((e) => (
                          <Link key={e.id} href={`/events/${e.id}`}>
                            <Badge
                              variant="neutral"
                              className="text-[10px] hover:border-[#931827] hover:text-white transition"
                            >
                              {e.code}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link href={`/schedule`}>
                      <Button variant="outline" size="sm" className="w-full gap-1">
                        <span>View Schedule at {v.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
