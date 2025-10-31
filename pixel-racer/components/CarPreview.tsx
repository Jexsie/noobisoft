"use client";

import { useEffect, useRef } from "react";

interface CarPreviewProps {
  color: string;
  width?: number;
  height?: number;
}

export default function CarPreview({ color, width = 160, height = 120 }: CarPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Simple road background
    ctx.fillStyle = "#2c2c2c";
    ctx.fillRect(0, height - 50, width, 50);
    ctx.fillStyle = "#ffff00";
    for (let x = 0; x < width; x += 30) {
      ctx.fillRect(x, height - 25, 15, 4);
    }

    // Car dimensions
    const carW = 64;
    const carH = 40;
    const carX = (width - carW) / 2;
    const carY = height - 70;

    // Car body
    ctx.fillStyle = color;
    ctx.fillRect(carX, carY, carW, carH);

    // Roof (darker shade)
    const adjust = (hex: string, amt: number) => {
      const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amt));
      const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amt));
      const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amt));
      return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };

    const roofColor = /^#([0-9a-fA-F]{6})$/.test(color) ? adjust(color, -30) : "#111";
    ctx.fillStyle = roofColor;
    ctx.fillRect(carX + 8, carY + 6, carW - 16, 14);

    // Windows
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(carX + 12, carY + 8, carW - 24, 10);

    // Wheels
    ctx.fillStyle = "#000000";
    ctx.fillRect(carX - 6, carY + 6, 10, 12);
    ctx.fillRect(carX + carW - 4, carY + 6, 10, 12);
    ctx.fillRect(carX - 6, carY + carH - 18, 10, 12);
    ctx.fillRect(carX + carW - 4, carY + carH - 18, 10, 12);

    // Headlights
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(carX + 12, carY + carH - 6, 10, 4);
    ctx.fillRect(carX + carW - 22, carY + carH - 6, 10, 4);
  }, [color, width, height]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <canvas ref={canvasRef} style={{ border: "2px solid #e94560", background: "#0f3460" }} />
      <div style={{ fontSize: 12, color: "#ccc" }}>Preview</div>
    </div>
  );
}

