"use client";

interface GameOverScreenProps {
  isVisible: boolean;
  finalScore: number;
  onRestart: () => void;
}

export default function GameOverScreen({
  isVisible,
  finalScore,
  onRestart,
}: GameOverScreenProps) {
  if (!isVisible) return null;

  return (
    <div className="game-over-screen active">
      <div className="game-over-content">
        <h2 className="game-over-title">GAME OVER!</h2>
        <div className="final-score">
          <div className="final-score-label">FINAL SCORE</div>
          <div className="final-score-value">{finalScore}</div>
        </div>
        <button className="pixel-btn restart-btn" onClick={onRestart}>
          🔄 RESTART GAME
        </button>
        <div className="restart-hint">Press SPACEBAR to restart</div>
      </div>
    </div>
  );
}
