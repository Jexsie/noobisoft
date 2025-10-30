/**
 * Obstacle Class
 * Handles different obstacle types, movement, and rendering
 */

import { CONFIG } from "@/lib/gameConfig";

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ObstacleType = "car" | "barrier" | "oil";

export class Obstacle {
  canvas: HTMLCanvasElement;
  lane: number;
  type: ObstacleType;
  width: number;
  height: number;
  x: number;
  y: number;
  speed: number;
  passed: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    lane: number,
    type: ObstacleType,
    speedMultiplier: number = 1.0
  ) {
    this.canvas = canvas;
    this.lane = lane;
    this.type = type; // 'car', 'barrier', or 'oil'
    this.width = type === "oil" ? 60 : 40;
    this.height = type === "oil" ? 30 : 60;
    this.x = this.getLaneX(lane);
    this.y = -this.height;
    this.speed = CONFIG.obstacleSpeed * speedMultiplier;
    this.passed = false; // For score tracking
  }

  getLaneX(lane: number): number {
    const roadStartX =
      (this.canvas.width - CONFIG.roadLanes * CONFIG.laneWidth) / 2;
    return (
      roadStartX + lane * CONFIG.laneWidth + (CONFIG.laneWidth - this.width) / 2
    );
  }

  update(): void {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.type === "car") {
      // Enemy car - color based on lane
      const color =
        this.lane === 0
          ? CONFIG.colors.obstacle1
          : this.lane === 1
          ? CONFIG.colors.obstacle2
          : CONFIG.colors.obstacle3;

      ctx.fillStyle = color;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Car details
      ctx.fillStyle = "#660000";
      ctx.fillRect(this.x + 5, this.y + 30, this.width - 10, 20);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(this.x + 8, this.y + 33, this.width - 16, 14);

      // Wheels
      ctx.fillStyle = "#000000";
      ctx.fillRect(this.x - 5, this.y + 10, 8, 15);
      ctx.fillRect(this.x + this.width - 3, this.y + 10, 8, 15);
      ctx.fillRect(this.x - 5, this.y + this.height - 25, 8, 15);
      ctx.fillRect(this.x + this.width - 3, this.y + this.height - 25, 8, 15);
    } else if (this.type === "barrier") {
      // Traffic cone/barrier
      ctx.fillStyle = "#ff8800";
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Stripes
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(this.x, this.y + 10, this.width, 8);
      ctx.fillRect(this.x, this.y + 30, this.width, 8);
      ctx.fillRect(this.x, this.y + 50, this.width, 8);
    } else if (this.type === "oil") {
      // Oil spill
      ctx.fillStyle = "#333333";
      ctx.fillRect(this.x, this.y, this.width, this.height);

      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);

      // Shimmer effect
      ctx.fillStyle = "rgba(100, 100, 150, 0.3)";
      ctx.fillRect(this.x + 10, this.y + 8, 15, 6);
      ctx.fillRect(this.x + 30, this.y + 15, 12, 5);
    }
  }

  getBounds(): Bounds {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  isOffScreen(): boolean {
    return this.y > this.canvas.height;
  }
}
