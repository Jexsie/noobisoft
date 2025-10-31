import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "server", "data");

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  wallet: string;
  timestamp: string;
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
}

/**
 * Read leaderboard data from file
 */
export function readLeaderboardData(): LeaderboardData {
  const filePath = path.join(DATA_DIR, "leaderboard.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

/**
 * Write leaderboard data to file
 */
export function writeLeaderboardData(data: LeaderboardData): void {
  const filePath = path.join(DATA_DIR, "leaderboard.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
