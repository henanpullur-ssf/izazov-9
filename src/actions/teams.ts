"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTeams(search?: string) {
  try {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const houses = await prisma.house.findMany({
      where,
      include: {
        manager: true,
        assistantManager: true,
        participants: {
          select: {
            id: true,
            name: true,
            participantId: true,
            rollNumber: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Fetch all published results with event type to correctly separate
    // individual vs group event scoring.
    const allPublishedResults = await prisma.result.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        points: true,
        totalMarks: true,
        prizeLevel: true,
        position: true,
        participantId: true,
        event: { select: { type: true } },
        participant: { select: { houseId: true } },
        registration: {
          select: {
            participants: {
              select: {
                participant: { select: { houseId: true } },
              },
            },
          },
        },
      },
    });

    // Compute team points and prize counts.
    // GROUP event: points are awarded to the team/house only — not to individual participants.
    // INDIVIDUAL event: points are awarded to the directly assigned participant's house.
    const teamsWithStats = houses.map((house) => {
      let totalPoints = 0;
      let gold = 0;
      let silver = 0;
      let bronze = 0;
      let consolation = 0;
      let special = 0;

      allPublishedResults.forEach((r) => {
        const pts = r.points !== null ? Number(r.points) : Number(r.totalMarks) || 0;
        const isGroupEvent = r.event.type === "GROUP";

        let belongsToThisHouse = false;

        if (isGroupEvent) {
          // GROUP events: determine team by any registration participant belonging to this house.
          // The result is credited to the house exactly once (boolean flag prevents duplication).
          const anyMemberInHouse = (r.registration?.participants ?? []).some(
            (rp) => rp.participant?.houseId === house.id
          );
          if (anyMemberInHouse) {
            belongsToThisHouse = true;
          }
        } else {
          // INDIVIDUAL events: credit the house of the directly assigned participant.
          if (r.participant?.houseId === house.id) {
            belongsToThisHouse = true;
          } else if (!r.participantId) {
            // No direct participant link — fall back to registration participants.
            const anyMemberInHouse = (r.registration?.participants ?? []).some(
              (rp) => rp.participant?.houseId === house.id
            );
            if (anyMemberInHouse) {
              belongsToThisHouse = true;
            }
          }
        }

        if (belongsToThisHouse) {
          totalPoints += pts;

          if (r.prizeLevel === "1st Prize" || r.position === 1) gold++;
          else if (r.prizeLevel === "2nd Prize" || r.position === 2) silver++;
          else if (r.prizeLevel === "3rd Prize" || r.position === 3) bronze++;
          else if (r.prizeLevel === "Consolation") consolation++;
          else if (r.prizeLevel === "Special Prize") special++;
        }
      });

      return {
        id: house.id,
        name: house.name,
        shortName: house.shortName,
        description: house.description,
        logoUrl: house.logoUrl,
        managerId: house.managerId,
        assistantManagerId: house.assistantManagerId,
        manager: house.manager,
        assistantManager: house.assistantManager,
        totalMembers: house.participants.length,
        totalPoints,
        prizes: { gold, silver, bronze, consolation, special },
      };
    });

    // Calculate ranks based on totalPoints desc
    const sorted = [...teamsWithStats].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.prizes.gold !== a.prizes.gold) return b.prizes.gold - a.prizes.gold;
      if (b.prizes.silver !== a.prizes.silver) return b.prizes.silver - a.prizes.silver;
      return b.prizes.bronze - a.prizes.bronze;
    });

    const rankedTeams = sorted.map((t, idx) => ({
      ...t,
      rank: idx + 1,
    }));

    return { success: true, data: rankedTeams };
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return { success: false, error: "Failed to fetch teams" };
  }
}

export async function getTeamById(id: string, options?: {
  search?: string;
  sortBy?: "rollNumber" | "name" | "participantId" | "points";
  sortOrder?: "asc" | "desc";
}) {
  try {
    const house = await prisma.house.findUnique({
      where: { id },
      include: {
        manager: true,
        assistantManager: true,
        participants: {
          include: {
            _count: {
              select: {
                registrations: true,
                attendance: true,
              },
            },
          },
        },
      },
    });

    if (!house) {
      return { success: false, error: "Team not found" };
    }

    // Also get all teams to calculate this team's championship rank.
    // getTeams() already uses the corrected group/individual scoring logic.
    const allTeamsRes = await getTeams();
    const rankedList = allTeamsRes.data || [];
    const thisRanked = rankedList.find((t) => t.id === id);
    const rank = thisRanked ? thisRanked.rank : 1;
    const totalPoints = thisRanked?.totalPoints ?? 0;
    const gold = thisRanked?.prizes.gold ?? 0;
    const silver = thisRanked?.prizes.silver ?? 0;
    const bronze = thisRanked?.prizes.bronze ?? 0;
    const consolation = thisRanked?.prizes.consolation ?? 0;
    const special = thisRanked?.prizes.special ?? 0;

    // Fetch published individual-event results for each member of this house.
    // GROUP event points are excluded: they belong to the team, not to individual members.
    const memberIds = house.participants.map((p) => p.id);

    // Individual event results where this participant is the direct result target.
    const individualResultsByParticipant = await prisma.result.findMany({
      where: {
        isPublished: true,
        participantId: { in: memberIds },
        event: { type: "INDIVIDUAL" },
      },
      select: {
        participantId: true,
        points: true,
        totalMarks: true,
        prizeLevel: true,
        position: true,
        event: { select: { name: true, code: true } },
      },
    });

    // Build a map: participantId → their individual points and prizes
    const memberIndividualStats: Record<
      string,
      { pts: number; gold: number; silver: number; bronze: number }
    > = {};

    memberIds.forEach((pid) => {
      memberIndividualStats[pid] = { pts: 0, gold: 0, silver: 0, bronze: 0 };
    });

    individualResultsByParticipant.forEach((r) => {
      if (!r.participantId) return;
      const stats = memberIndividualStats[r.participantId];
      if (!stats) return;
      const pts = r.points !== null ? Number(r.points) : Number(r.totalMarks) || 0;
      stats.pts += pts;
      if (r.prizeLevel === "1st Prize" || r.position === 1) stats.gold++;
      else if (r.prizeLevel === "2nd Prize" || r.position === 2) stats.silver++;
      else if (r.prizeLevel === "3rd Prize" || r.position === 3) stats.bronze++;
    });

    // Process members — individual points only (group event points go to the team, not members)
    const membersWithPoints = house.participants.map((p) => {
      const stats = memberIndividualStats[p.id] ?? { pts: 0, gold: 0, silver: 0, bronze: 0 };

      return {
        id: p.id,
        participantId: p.participantId,
        rollNumber: p.rollNumber,
        name: p.name,
        gender: p.gender,
        email: p.email,
        phone: p.phone,
        address: p.address,
        totalPoints: stats.pts,
        registrationsCount: p._count.registrations,
        attendanceCount: p._count.attendance,
        prizes: { gold: stats.gold, silver: stats.silver, bronze: stats.bronze },
        isManager: house.managerId === p.id,
        isAssistantManager: house.assistantManagerId === p.id,
      };
    });

    // Filter members if search is applied
    let filteredMembers = membersWithPoints;
    if (options?.search) {
      const q = options.search.toLowerCase();
      filteredMembers = filteredMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.participantId.toLowerCase().includes(q) ||
          (m.rollNumber && m.rollNumber.toLowerCase().includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          (m.phone && m.phone.includes(q))
      );
    }

    // Sort members
    const sortOrder = options?.sortOrder || "desc";
    filteredMembers.sort((a, b) => {
      if (options?.sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (options?.sortBy === "rollNumber") {
        const rA = a.rollNumber || "";
        const rB = b.rollNumber || "";
        return sortOrder === "asc"
          ? rA.localeCompare(rB)
          : rB.localeCompare(rA);
      }
      if (options?.sortBy === "participantId") {
        return sortOrder === "asc"
          ? a.participantId.localeCompare(b.participantId)
          : b.participantId.localeCompare(a.participantId);
      }
      // Default: sort by points
      return sortOrder === "asc"
        ? a.totalPoints - b.totalPoints
        : b.totalPoints - a.totalPoints;
    });

    return {
      success: true,
      data: {
        id: house.id,
        name: house.name,
        shortName: house.shortName,
        description: house.description,
        logoUrl: house.logoUrl,
        managerId: house.managerId,
        assistantManagerId: house.assistantManagerId,
        manager: house.manager,
        assistantManager: house.assistantManager,
        totalMembers: house.participants.length,
        totalPoints,
        rank,
        prizes: { gold, silver, bronze, consolation, special },
        members: filteredMembers,
        allMembersList: membersWithPoints.map((m) => ({
          id: m.id,
          name: m.name,
          participantId: m.participantId,
          rollNumber: m.rollNumber,
        })),
      },
    };
  } catch (error) {
    console.error("Failed to fetch team:", error);
    return { success: false, error: "Failed to fetch team" };
  }
}

export async function updateTeamManagers(
  teamId: string,
  managerId: string | null,
  assistantManagerId: string | null
) {
  try {
    // Validation 1: Manager and Assistant Manager cannot be the same person
    if (managerId && assistantManagerId && managerId === assistantManagerId) {
      return {
        success: false,
        error: "Team Manager and Assistant Team Manager cannot be the same participant.",
      };
    }

    // Validation 2: Verify Manager belongs to this team
    if (managerId) {
      const managerParticipant = await prisma.participant.findUnique({
        where: { id: managerId },
      });
      if (!managerParticipant || managerParticipant.houseId !== teamId) {
        return {
          success: false,
          error: "Selected Team Manager must be a member of this Team.",
        };
      }
    }

    // Validation 3: Verify Assistant Manager belongs to this team
    if (assistantManagerId) {
      const asstParticipant = await prisma.participant.findUnique({
        where: { id: assistantManagerId },
      });
      if (!asstParticipant || asstParticipant.houseId !== teamId) {
        return {
          success: false,
          error: "Selected Assistant Team Manager must be a member of this Team.",
        };
      }
    }

    const updated = await prisma.house.update({
      where: { id: teamId },
      data: {
        managerId: managerId || null,
        assistantManagerId: assistantManagerId || null,
      },
      include: {
        manager: true,
        assistantManager: true,
      },
    });

    revalidatePath("/admin/teams");
    revalidatePath(`/admin/teams/${teamId}`);
    revalidatePath("/admin/championship");
    revalidatePath("/admin/participants");
    revalidatePath("/results");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update team managers:", error);
    return { success: false, error: "Failed to update team managers" };
  }
}

export async function updateTeam(
  id: string,
  data: {
    name?: string;
    shortName?: string;
    description?: string;
    logoUrl?: string;
  }
) {
  try {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.shortName !== undefined) updateData.shortName = data.shortName?.trim() || null;
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl?.trim() || null;

    const team = await prisma.house.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/teams");
    revalidatePath(`/admin/teams/${id}`);
    revalidatePath("/admin/championship");
    revalidatePath("/results");

    return { success: true, data: team };
  } catch (error) {
    console.error("Failed to update team:", error);
    return { success: false, error: "Failed to update team" };
  }
}

export async function createTeam(data: {
  name: string;
  shortName?: string;
  description?: string;
}) {
  try {
    const existing = await prisma.house.findUnique({
      where: { name: data.name.trim() },
    });

    if (existing) {
      return { success: false, error: "A Team with this name already exists" };
    }

    const team = await prisma.house.create({
      data: {
        name: data.name.trim(),
        shortName: data.shortName?.trim() || null,
        description: data.description?.trim() || null,
      },
    });

    revalidatePath("/admin/teams");
    revalidatePath("/admin/championship");
    revalidatePath("/results");

    return { success: true, data: team };
  } catch (error) {
    console.error("Failed to create team:", error);
    return { success: false, error: "Failed to create team" };
  }
}
