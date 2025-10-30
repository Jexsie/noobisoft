/**
 * PlayerCar Class
 * Handles player car movement, jumping, and rendering
 */

import soundManager from "@/lib/soundManager";
import { CONFIG } from "@/lib/gameConfig";

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class PlayerCar {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  lane: number;
  x: number;
  baseY: number;
  y: number;
  targetX: number;
  speed: number;
  isJumping: boolean;
  jumpVelocity: number;
  jumpPower: number;
  gravity: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = 40;
    this.height = 60;
    this.lane = 1; // 0, 1, or 2 (left, middle, right)
    this.x = this.getLaneX(this.lane);
    this.baseY = canvas.height - this.height - 40;
    this.y = this.baseY;
    this.targetX = this.x;
    this.speed = CONFIG.playerSpeed;
    this.isJumping = false;
    this.jumpVelocity = 0;
    this.jumpPower = -15; // Initial upward velocity
    this.gravity = 0.8; // Gravity pull
  }

  getLaneX(lane: number): number {
    const roadStartX =
      (this.canvas.width - CONFIG.roadLanes * CONFIG.laneWidth) / 2;
    return (
      roadStartX + lane * CONFIG.laneWidth + (CONFIG.laneWidth - this.width) / 2
    );
  }

  moveLeft(): void {
    if (this.lane > 0) {
      this.lane--;
      this.targetX = this.getLaneX(this.lane);
      soundManager.playMoveSound("left");
    }
  }

  moveRight(): void {
    if (this.lane < CONFIG.roadLanes - 1) {
      this.lane++;
      this.targetX = this.getLaneX(this.lane);
      soundManager.playMoveSound("right");
    }
  }

  jump(): void {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = this.jumpPower;
      soundManager.playJumpSound();
    }
  }

  update(): void {
    // Smooth horizontal movement
    if (this.x < this.targetX) {
      this.x += this.speed;
      if (this.x > this.targetX) this.x = this.targetX;
    } else if (this.x > this.targetX) {
      this.x -= this.speed;
      if (this.x < this.targetX) this.x = this.targetX;
    }

    // Jump physics
    if (this.isJumping) {
      this.jumpVelocity += this.gravity;
      this.y += this.jumpVelocity;

      // Land back on ground
      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, color: string): void {
    // Draw shadow when jumping
    if (this.isJumping) {
      const shadowY = this.baseY + this.height - 5;
      const shadowSize = Math.max(0.3, 1 - (this.baseY - this.y) / 100);
      const shadowWidth = this.width * shadowSize;
      const shadowHeight = 8 * shadowSize;
      const shadowX = this.x + (this.width - shadowWidth) / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(shadowX, shadowY, shadowWidth, shadowHeight);
    }

    // Car body (uses selected color)
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Car roof (darker shade)
    const roofColor = this.adjustBrightness(color, -30);
    ctx.fillStyle = roofColor;
    ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, 20);

    // Windows
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(this.x + 8, this.y + 13, this.width - 16, 14);

    // Wheels
    ctx.fillStyle = "#000000";
    ctx.fillRect(this.x - 5, this.y + 10, 8, 15);
    ctx.fillRect(this.x + this.width - 3, this.y + 10, 8, 15);
    ctx.fillRect(this.x - 5, this.y + this.height - 25, 8, 15);
    ctx.fillRect(this.x + this.width - 3, this.y + this.height - 25, 8, 15);

    // Headlights
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(this.x + 8, this.y + this.height - 8, 10, 6);
    ctx.fillRect(this.x + this.width - 18, this.y + this.height - 8, 10, 6);
  }

  adjustBrightness(hex: string, amount: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));

    return `#${newR.toString(16).padStart(2, "0")}${newG
      .toString(16)
      .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  }

  getBounds(): Bounds {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
