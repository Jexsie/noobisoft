"use client";

import { useEffect, useState } from "react";

interface Flower {
  id: number;
  emoji: string;
  left: number;
  animationDelay: number;
  duration: number;
  size: number;
  rotation: number;
  drift: number;
}

interface CelebrationEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

export default function CelebrationEffect({
  isActive,
  onComplete,
}: CelebrationEffectProps) {
  const [flowers, setFlowers] = useState<Flower[]>([]);

  useEffect(() => {
    if (!isActive) {
      setFlowers([]);
      return;
    }

    // Create 30 flower particles
    const newFlowers: Flower[] = [];
    for (let i = 0; i < 30; i++) {
      newFlowers.push({
        id: i,
        emoji: ["🌸", "🌺", "🌼", "🌻", "🌷", "💐", "🏵️", "🌹"][
          Math.floor(Math.random() * 8)
        ],
        left: Math.random() * 100, // Random horizontal position (%)
        animationDelay: Math.random() * 2, // Stagger the start
        duration: 3 + Math.random() * 2, // 3-5 seconds
        size: 20 + Math.random() * 20, // 20-40px
        rotation: Math.random() * 360, // Random initial rotation
        drift: (Math.random() - 0.5) * 100, // Horizontal drift
      });
    }

    setFlowers(newFlowers);

    // Auto-complete after 5 seconds
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="celebration-overlay">
      {/* Celebration text */}
      <div className="celebration-text">
        <div className="celebration-title">🎉 NEW HIGH SCORE! 🎉</div>
        <div className="celebration-subtitle">Amazing job!</div>
      </div>

      {/* Flowing flowers */}
      {flowers.map((flower) => (
        <div
          key={flower.id}
          className="flower-particle"
          style={{
            left: `${flower.left}%`,
            animationDelay: `${flower.animationDelay}s`,
            animationDuration: `${flower.duration}s`,
            fontSize: `${flower.size}px`,
            // @ts-ignore - CSS custom properties
            "--drift": `${flower.drift}px`,
            "--rotation": `${flower.rotation}deg`,
          }}
        >
          {flower.emoji}
        </div>
      ))}

      {/* Confetti burst from center */}
      <div className="confetti-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              // @ts-ignore - CSS custom properties
              "--angle": `${(i * 360) / 20}deg`,
              "--delay": `${i * 0.05}s`,
              background: `hsl(${(i * 360) / 20}, 100%, 60%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
