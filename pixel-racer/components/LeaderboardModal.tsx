"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, LeaderboardEntry } from "@/lib/api/leaderboard";

interface LeaderboardModalProps {
  onClose: () => void;
}

const getRankSuffix = (rank: number): string => {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = rank % 100;
  return rank + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};

const getRankClass = (rank: number): string => {
  if (rank === 1) return "rank-1";
  if (rank === 2) return "rank-2";
  if (rank === 3) return "rank-3";
  return "";
};

export default function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getLeaderboard();
        if (result.success && result.leaderboard) {
          setLeaderboard(result.leaderboard);
        } else {
          setError(result.message || "Failed to load leaderboard");
        }
      } catch (err) {
        setError("Failed to load leaderboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay active" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>🏆 LEADERBOARD</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div
                className="loading-spinner"
                style={{ margin: "0 auto 15px" }}
              ></div>
              <p style={{ color: "#ccc" }}>Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#ff5370" }}>{error}</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#ccc" }}>No scores yet. Be the first!</p>
            </div>
          ) : (
            <>
              <div className="leaderboard-list">
                {leaderboard.map((entry) => (
                  <div
                    key={`${entry.wallet}-${entry.timestamp}`}
                    className={`leaderboard-item ${getRankClass(entry.rank)}`}
                  >
                    <span className="rank">{getRankSuffix(entry.rank)}</span>
                    <span className="player-name">{entry.name}</span>
                    <span className="player-score">{entry.score}</span>
                  </div>
                ))}
              </div>
              <div className="web3-notice">
                <p>
                  <strong>Live Leaderboard!</strong> Scores automatically saved
                  when wallet is connected.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
