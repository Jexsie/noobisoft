import { NextRequest, NextResponse } from "next/server";
import {
  readLeaderboardData,
  writeLeaderboardData,
  LeaderboardEntry,
} from "@/server/utils/fileSystem";

/**
 * GET /api/leaderboard
 * Returns the top 5 players on the leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const data = readLeaderboardData();

    const top5 = data.leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return NextResponse.json({
      success: true,
      leaderboard: top5,
      total: data.leaderboard.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch leaderboard",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leaderboard
 * Submit a new score to the leaderboard
 * Body: { name: string, score: number, wallet: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, score, wallet } = body;

    if (!name || typeof score !== "number" || !wallet) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          message: "Please provide name, score, and wallet address",
        },
        { status: 400 }
      );
    }

    const data = readLeaderboardData();

    const newEntry: LeaderboardEntry = {
      rank: 0,
      name: name.toUpperCase(),
      score: Math.floor(score),
      wallet,
      timestamp: new Date().toISOString(),
    };

    data.leaderboard.push(newEntry);

    data.leaderboard = data.leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    writeLeaderboardData(data);

    const userRank = data.leaderboard.findIndex((e) => e.wallet === wallet) + 1;
    const isTop5 = userRank > 0 && userRank <= 5;

    return NextResponse.json({
      success: true,
      rank: userRank,
      isTop5,
      score: newEntry.score,
      message: isTop5
        ? `🎉 Congratulations! You're rank #${userRank}!`
        : `Score submitted! Your rank is #${userRank}`,
    });
  } catch (error) {
    console.error("Error submitting score:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to submit score",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leaderboard
 * Clear the entire leaderboard (for testing)
 */
export async function DELETE(request: NextRequest) {
  try {
    const data = readLeaderboardData();
    const previousCount = data.leaderboard.length;

    data.leaderboard = [];

    writeLeaderboardData(data);

    return NextResponse.json({
      success: true,
      cleared: previousCount,
      message: `Leaderboard cleared. ${previousCount} entries removed.`,
    });
  } catch (error) {
    console.error("Error clearing leaderboard:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to clear leaderboard",
      },
      { status: 500 }
    );
  }
}
