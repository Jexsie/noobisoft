/**
 * Leaderboard API Client
 */

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  wallet: string;
  timestamp: string;
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboard?: LeaderboardEntry[];
  total?: number;
  error?: string;
  message?: string;
}

export interface SubmitScoreResponse {
  success: boolean;
  rank?: number;
  isTop5?: boolean;
  score?: number;
  error?: string;
  message: string;
}

/**
 * Get the top 5 leaderboard
 */
export async function getLeaderboard(): Promise<LeaderboardResponse> {
  try {
    const response = await fetch("/api/leaderboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return {
      success: false,
      error: "Network error",
      message: "Failed to fetch leaderboard",
    };
  }
}

/**
 * Submit a new score to the leaderboard
 */
export async function submitScore(
  name: string,
  score: number,
  wallet: string
): Promise<SubmitScoreResponse> {
  try {
    const response = await fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, score, wallet }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting score:", error);
    return {
      success: false,
      error: "Network error",
      message: "Failed to submit score",
    };
  }
}
