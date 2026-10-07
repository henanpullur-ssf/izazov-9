"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getResults(eventId?: string, publishedOnly: boolean = false) {
  try {
    const where: Record<string, unknown> = {};
    if (eventId && eventId !== "ALL") {
      where.eventId = eventId;
    }
    if (publishedOnly) {
      where.isPublished = true;
    }

    const results = await prisma.result.findMany({
      where,
      include: {
        event: {
          include: { venue: true },
        },
        participant: {
          include: { house: true },
        },
        registration: {
          include: {
            participants: {
              include: {
                participant: {
                  include: { house: true },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { createdAt: "desc" },
      ],
    });

    return {
      success: true,
      data: results.map((r) => ({
        ...r,
        points: r.points !== null ? Number(r.points) : Number(r.totalMarks),
        totalMarks: Number(r.totalMarks),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch results:", error);
    return { success: false, error: "Failed to fetch results" };
  }
}

export async function saveResult(data: {
  id?: string;
  eventId: string;
  registrationId: string;
  participantId?: string;
  position?: number;
  points: number;
  grade?: string;
  prizeLevel?: string;
  remarks?: string;
  isWinner?: boolean;
  isPublished?: boolean;
}) {
  try {
    const pointsValue = Number(data.points) || 0;
    const isWinnerValue = data.isWinner !== undefined 
      ? data.isWinner 
      : data.position === 1 || data.prizeLevel === "1st Prize";
    const isPublishedValue = data.isPublished !== undefined ? data.isPublished : true;

    let result;
    if (data.id) {
      // Update by result ID
      result = await prisma.result.update({
        where: { id: data.id },
        data: {
          eventId: data.eventId,
          registrationId: data.registrationId,
          participantId: data.participantId || null,
          position: data.position ? Number(data.position) : null,
          points: pointsValue,
          totalMarks: pointsValue,
          grade: data.grade?.trim() || null,
          prizeLevel: data.prizeLevel?.trim() || null,
          remarks: data.remarks?.trim() || null,
          isWinner: isWinnerValue,
          isPublished: isPublishedValue,
        },
      });
    } else {
      // Check if result exists for this registration
      const existing = await prisma.result.findFirst({
        where: {
          eventId: data.eventId,
          registrationId: data.registrationId,
        },
      });

      if (existing) {
        result = await prisma.result.update({
          where: { id: existing.id },
          data: {
            participantId: data.participantId || null,
            position: data.position ? Number(data.position) : null,
            points: pointsValue,
            totalMarks: pointsValue,
            grade: data.grade?.trim() || null,
            prizeLevel: data.prizeLevel?.trim() || null,
            remarks: data.remarks?.trim() || null,
            isWinner: isWinnerValue,
            isPublished: isPublishedValue,
          },
        });
      } else {
        result = await prisma.result.create({
          data: {
            eventId: data.eventId,
            registrationId: data.registrationId,
            participantId: data.participantId || null,
            position: data.position ? Number(data.position) : null,
            points: pointsValue,
            totalMarks: pointsValue,
            grade: data.grade?.trim() || null,
            prizeLevel: data.prizeLevel?.trim() || null,
            remarks: data.remarks?.trim() || null,
            isWinner: isWinnerValue,
            isPublished: isPublishedValue,
          },
        });
      }
    }

    revalidatePath("/admin/results");
    revalidatePath("/admin/championship");
    revalidatePath("/admin/participants");
    revalidatePath("/admin/teams");
    revalidatePath("/results");
    revalidatePath("/");

    return {
      success: true,
      data: {
        ...result,
        points: Number(result.points),
        totalMarks: Number(result.totalMarks),
      },
    };
  } catch (error) {
    console.error("Failed to save result:", error);
    return { success: false, error: "Failed to save result" };
  }
}

export async function toggleResultPublish(id: string, isPublished: boolean) {
  try {
    const result = await prisma.result.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/admin/results");
    revalidatePath("/admin/championship");
    revalidatePath("/admin/participants");
    revalidatePath("/admin/teams");
    revalidatePath("/results");
    revalidatePath("/");

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to toggle publish status:", error);
    return { success: false, error: "Failed to update publish status" };
  }
}

export async function deleteResult(id: string) {
  try {
    await prisma.result.delete({
      where: { id },
    });

    revalidatePath("/admin/results");
    revalidatePath("/admin/championship");
    revalidatePath("/admin/participants");
    revalidatePath("/admin/teams");
    revalidatePath("/results");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete result:", error);
    return { success: false, error: "Failed to delete result" };
  }
}

export async function getChampionshipData() {
  try {
    // 1. Fetch all teams (houses) with members, manager, assistant manager
    const teams = await prisma.house.findMany({
      include: {
        manager: true,
        assistantManager: true,
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // 2. Fetch all published results chronologically
    const publishedResults = await prisma.result.findMany({
      where: { isPublished: true },
      include: {
        event: true,
        participant: {
          include: { house: true },
        },
        registration: {
          include: {
            participants: {
              include: {
                participant: {
                  include: { house: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const totalPublishedCount = publishedResults.length;
    // Checkpoint count for public site: multiples of 5 (e.g. 5, 10, 15, 20...)
    const checkpointCount = Math.floor(totalPublishedCount / 5) * 5;
    const nextCheckpoint = checkpointCount + 5;
    const resultsUntilNextCheckpoint = nextCheckpoint - totalPublishedCount;

    // Filter results up to checkpoint for public calculation
    const checkpointResults = publishedResults.slice(0, checkpointCount);

    // Helper to calculate team standings from a given set of results
    function calculateTeamStandings(resultsSet: typeof publishedResults) {
      const teamMap: Record<
        string,
        {
          id: string;
          name: string;
          shortName: string | null;
          memberCount: number;
          managerName: string | null;
          assistantManagerName: string | null;
          points: number;
          gold: number;
          silver: number;
          bronze: number;
          consolation: number;
          special: number;
        }
      > = {};

      teams.forEach((t) => {
        teamMap[t.id] = {
          id: t.id,
          name: t.name,
          shortName: t.shortName,
          memberCount: t._count.participants,
          managerName: t.manager?.name || null,
          assistantManagerName: t.assistantManager?.name || null,
          points: 0,
          gold: 0,
          silver: 0,
          bronze: 0,
          consolation: 0,
          special: 0,
        };
      });

      resultsSet.forEach((r) => {
        const pts = r.points !== null ? Number(r.points) : Number(r.totalMarks) || 0;

        // Check if individual participant or group registration participants have team
        const houseIds = new Set<string>();
        if (r.participant?.houseId) {
          houseIds.add(r.participant.houseId);
        }
        r.registration?.participants?.forEach((rp) => {
          if (rp.participant?.houseId) {
            houseIds.add(rp.participant.houseId);
          }
        });

        houseIds.forEach((hId) => {
          if (teamMap[hId]) {
            teamMap[hId].points += pts;
            if (r.prizeLevel === "1st Prize" || r.position === 1) {
              teamMap[hId].gold += 1;
            } else if (r.prizeLevel === "2nd Prize" || r.position === 2) {
              teamMap[hId].silver += 1;
            } else if (r.prizeLevel === "3rd Prize" || r.position === 3) {
              teamMap[hId].bronze += 1;
            } else if (r.prizeLevel === "Consolation") {
              teamMap[hId].consolation += 1;
            } else if (r.prizeLevel === "Special Prize") {
              teamMap[hId].special += 1;
            }
          }
        });
      });

      const sorted = Object.values(teamMap).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        return b.bronze - a.bronze;
      });

      return sorted.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
    }

    // Admin Live Team Standings (uses all published results)
    const liveTeamStandings = calculateTeamStandings(publishedResults);

    // Public Checkpoint Team Standings (uses only results up to checkpointCount)
    const publicTeamStandings = calculateTeamStandings(checkpointResults);

    // 3. Admin Individual Championship Standings (Admin only!)
    // Sum points from all published results where participant is assigned
    const participantMap: Record<
      string,
      {
        id: string;
        participantId: string;
        rollNumber: string | null;
        name: string;
        teamName: string | null;
        points: number;
        gold: number;
        silver: number;
        bronze: number;
        consolation: number;
        special: number;
        resultCount: number;
      }
    > = {};

    publishedResults.forEach((r) => {
      const pts = r.points !== null ? Number(r.points) : Number(r.totalMarks) || 0;

      // Collect all participants credited with this result
      const creditedParticipants: {
        id: string;
        participantId: string;
        rollNumber: string | null;
        name: string;
        teamName: string | null;
      }[] = [];

      if (r.participant) {
        creditedParticipants.push({
          id: r.participant.id,
          participantId: r.participant.participantId,
          rollNumber: r.participant.rollNumber,
          name: r.participant.name,
          teamName: r.participant.house?.name || null,
        });
      }

      r.registration?.participants?.forEach((rp) => {
        if (rp.participant && !creditedParticipants.some((p) => p.id === rp.participant.id)) {
          creditedParticipants.push({
            id: rp.participant.id,
            participantId: rp.participant.participantId,
            rollNumber: rp.participant.rollNumber,
            name: rp.participant.name,
            teamName: rp.participant.house?.name || null,
          });
        }
      });

      creditedParticipants.forEach((p) => {
        if (!participantMap[p.id]) {
          participantMap[p.id] = {
            id: p.id,
            participantId: p.participantId,
            rollNumber: p.rollNumber,
            name: p.name,
            teamName: p.teamName,
            points: 0,
            gold: 0,
            silver: 0,
            bronze: 0,
            consolation: 0,
            special: 0,
            resultCount: 0,
          };
        }

        participantMap[p.id].points += pts;
        participantMap[p.id].resultCount += 1;

        if (r.prizeLevel === "1st Prize" || r.position === 1) {
          participantMap[p.id].gold += 1;
        } else if (r.prizeLevel === "2nd Prize" || r.position === 2) {
          participantMap[p.id].silver += 1;
        } else if (r.prizeLevel === "3rd Prize" || r.position === 3) {
          participantMap[p.id].bronze += 1;
        } else if (r.prizeLevel === "Consolation") {
          participantMap[p.id].consolation += 1;
        } else if (r.prizeLevel === "Special Prize") {
          participantMap[p.id].special += 1;
        }
      });
    });

    const individualStandings = Object.values(participantMap)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        return b.bronze - a.bronze;
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    return {
      success: true,
      data: {
        totalPublishedCount,
        checkpointCount,
        nextCheckpoint,
        resultsUntilNextCheckpoint,
        liveTeamStandings,
        publicTeamStandings,
        individualStandings,
      },
    };
  } catch (error) {
    console.error("Failed to calculate championship data:", error);
    return { success: false, error: "Failed to calculate championship data" };
  }
}

