import React from "react";
import Link from "next/link";
import { MapPin, Calendar, Shield } from "lucide-react";
import { FEST_NAME, FEST_DATES, FEST_TAGLINE } from "@/lib/constants";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#232021] bg-[#0c0b0c] text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#931827] flex items-center justify-center font-black text-white text-xs">
                IZ
              </div>
              <span className="text-base font-bold text-white tracking-wide">
                {FEST_NAME}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {FEST_TAGLINE}. The premier campus cultural, technical, and esports festival.
            </p>
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#931827]" />
              <span>{FEST_DATES}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Explore
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="hover:text-white transition">
                  Competitions & Events
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-white transition">
                  Festival Schedule
                </Link>
              </li>
              <li>
                <Link href="/venues" className="hover:text-white transition">
                  Campus Stages & Venues
                </Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-white transition">
                  Live Leaderboard & Results
                </Link>
              </li>
            </ul>
          </div>

          {/* Information & Rules */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Information
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/announcements" className="hover:text-white transition">
                  Official Bulletins
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  House Championship System
                </Link>
              </li>
              <li>
                <Link href="/about#guidelines" className="hover:text-white transition">
                  Code of Conduct
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition text-[#931827]">
                  Coordinator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Location */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Campus Center
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Main Campus Arena, Grand Auditorium & Tech Hub.
            </p>
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#931827]" />
              <span>Central Campus Grounds</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1f1c1d] flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400 text-[11px]">
          <p>© 2026 {FEST_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white">
              Rules
            </Link>
            <Link href="/about" className="hover:text-white">
              House Standings
            </Link>
            <Link href="/login" className="hover:text-white flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#931827]" /> Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
