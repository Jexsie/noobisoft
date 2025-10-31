/**
 * Game Utility Functions
 * Helper functions for collision detection and rendering
 */

import { CONFIG } from "./gameConfig";

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Check collision between two rectangles (AABB collision)
 */
export function checkCollision(rect1: Bounds, rect2: Bounds): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Draw the road with animated lane markers
 */
export function drawRoad(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  roadOffset: number
): void {
  const roadStartX = (canvas.width - CONFIG.roadLanes * CONFIG.laneWidth) / 2;
  const roadWidth = CONFIG.roadLanes * CONFIG.laneWidth;

  // Grass on sides
  ctx.fillStyle = CONFIG.colors.grass;
  ctx.fillRect(0, 0, roadStartX, canvas.height);
  ctx.fillRect(roadStartX + roadWidth, 0, roadStartX, canvas.height);

  // Road surface
  ctx.fillStyle = CONFIG.colors.road;
  ctx.fillRect(roadStartX, 0, roadWidth, canvas.height);

  // Animated lane lines
  ctx.fillStyle = CONFIG.colors.roadLine;
  const lineHeight = 40;
  const lineGap = 20;
  const totalSegment = lineHeight + lineGap;

  for (let i = 0; i < CONFIG.roadLanes - 1; i++) {
    const lineX = roadStartX + (i + 1) * CONFIG.laneWidth - 2;

    for (
      let y = -totalSegment + (roadOffset % totalSegment);
      y < canvas.height;
      y += totalSegment
    ) {
      ctx.fillRect(lineX, y, 4, lineHeight);
    }
  }
}

/**
 * Draw speed indicator bar
 */
export function drawSpeedIndicator(
  ctx: CanvasRenderingContext2D,
  speedMultiplier: number
): void {
  const speedPercent = Math.floor(
    ((speedMultiplier - 1) / (CONFIG.maxSpeedMultiplier - 1)) * 100
  );

  // Background box
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(10, 10, 120, 35);

  // Label
  ctx.fillStyle = "#ffffff";
  ctx.font = "12px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("SPEED:", 15, 25);

  // Bar background
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(15, 28, 100, 12);

  // Bar fill (color changes with speed)
  const barWidth = speedPercent;
  let barColor: string;
  if (speedPercent < 33) {
    barColor = "#00ff88"; // Green
  } else if (speedPercent < 66) {
    barColor = "#ffff00"; // Yellow
  } else {
    barColor = "#ff4444"; // Red
  }
  ctx.fillStyle = barColor;
  ctx.fillRect(15, 28, barWidth, 12);

  // Speed multiplier text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillText(`x${speedMultiplier.toFixed(1)}`, 120, 38);
}

/**
 * Draw start screen overlay
 */
export function drawStartScreen(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
): void {
  // Semi-transparent overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Game title
  ctx.fillStyle = "#00ff88";
  ctx.font = "bold 48px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PIXEL RACER", canvas.width / 2, canvas.height / 2 - 60);

  // Title outline
  ctx.strokeStyle = "#e94560";
  ctx.lineWidth = 3;
  ctx.strokeText("PIXEL RACER", canvas.width / 2, canvas.height / 2 - 60);

  // Instructions
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.fillText(
    "Press SPACEBAR to Start",
    canvas.width / 2,
    canvas.height / 2 + 20
  );

  // Controls hint
  ctx.font = "16px 'Courier New', monospace";
  ctx.fillStyle = "#cccccc";
  ctx.fillText("← → or A D to move", canvas.width / 2, canvas.height / 2 + 60);
  ctx.fillText("↑ or W to jump", canvas.width / 2, canvas.height / 2 + 85);

  // Blinking "Press Space" text
  const blink = Math.floor(Date.now() / 500) % 2;
  if (blink) {
    ctx.fillStyle = "#ffff00";
    ctx.font = "bold 28px 'Courier New', monospace";
    ctx.fillText("▶ PRESS SPACE ◀", canvas.width / 2, canvas.height / 2 + 130);
  }
}
