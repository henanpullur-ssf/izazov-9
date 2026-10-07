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
            results: {
              where: { isPublished: true },
              select: { points: true, totalMarks: true, prizeLevel: true, position: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Compute team points and prize counts
    const teamsWithStats = houses.map((house) => {
      let totalPoints = 0;
      let gold = 0;
      let silver = 0;
      let bronze = 0;
      let consolation = 0;
      let special = 0;

      house.participants.forEach((p) => {
        p.results.forEach((r) => {
          const pts = r.points !== null ? Number(r.points) : Number(r.totalMarks) || 0;
          totalPoints += pts;

          if (r.prizeLevel === "1st Prize" || r.position === 1) gold++;
          else if (r.prizeLevel === "2nd Prize" || r.position === 2) silver++;
          else if (r.prizeLevel === "3rd Prize" || r.position === 3) bronze++;
          else if (r.prizeLevel === "Consolation") consolation++;
          else if (r.prizeLevel === "Special Prize") special++;
        });
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
            results: {
              where: { isPublished: true },
              select: { points: true, totalMarks: true, prizeLevel: true, position: true, event: { select: { name: true, code: true } } },
            },
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

    // Also get all teams to calculate this team's championship rank
    const allTeamsRes = await getTeams();
    const rankedList = allTeamsRes.data || [];
    const thisRanked = rankedList.find((t) => t.id === id);
    const rank = thisRanked ? thisRanked.rank : 1;

    let totalPoints = 0;
    let gold = 0;
    let silver = 0;
    let bronze = 0;
    let consolation = 0;
    let special = 0;

    // Process members
    const membersWithPoints = house.participants.map((p) => {
      let memberPts = 0;
      let mGold = 0;
      let mSilver = 0;
      let mBronze = 0;

      p.results.forEach((r) => {
        const pts = r.points !== null ? Number(r.points) : Number(r.totalMarks) || 0;
        memberPts += pts;
        totalPoints += pts;

        if (r.prizeLevel === "1st Prize" || r.position === 1) {
          gold++;
          mGold++;
        } else if (r.prizeLevel === "2nd Prize" || r.position === 2) {
          silver++;
          mSilver++;
        } else if (r.prizeLevel === "3rd Prize" || r.position === 3) {
          bronze++;
          mBronze++;
        } else if (r.prizeLevel === "Consolation") {
          consolation++;
        } else if (r.prizeLevel === "Special Prize") {
          special++;
        }
      });

      return {
        id: p.id,
        participantId: p.participantId,
        rollNumber: p.rollNumber,
        name: p.name,
        gender: p.gender,
        email: p.email,
        phone: p.phone,
        address: p.address,
        totalPoints: memberPts,
        registrationsCount: p._count.registrations,
        attendanceCount: p._count.attendance,
        prizes: { gold: mGold, silver: mSilver, bronze: mBronze },
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
