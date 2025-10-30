"use client";

interface ScoreDisplayProps {
  score: number;
  highScore: number;
}

export default function ScoreDisplay({ score, highScore }: ScoreDisplayProps) {
  return (
    <div className="score-display">
      <div className="score-row">
        <div className="score-item">
          <div className="score-label">SCORE</div>
          <div className="score-value">{score}</div>
        </div>
        {highScore > 0 && (
          <div className="score-item high-score-item">
            <div className="score-label high-score-label">HIGH SCORE</div>
            <div className="score-value high-score-value">
              {highScore}
              {score > highScore && <span className="beating-record"> 🔥</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
