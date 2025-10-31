/**
 * Game Configuration Constants
 * Central place for all game settings and tuning
 */

export const CONFIG = {
  // Canvas dimensions
  canvasWidth: 600,
  canvasHeight: 600,

  // Road settings
  roadLanes: 3,
  laneWidth: 150,

  // Player settings
  playerSpeed: 10, // Lane switching speed

  // Obstacle settings
  obstacleSpeed: 6.5, // Base speed - increases over time
  obstacleSpawnRate: 0.02, // Base spawn rate

  // Scoring
  scoreIncrement: 1, // Points per obstacle passed

  // Difficulty progression
  difficultyIncrease: 0.0001, // Speed multiplier increase per frame
  maxSpeedMultiplier: 2.5, // Maximum speed (2.5x base)
  spawnRateIncrease: 0.000005, // Spawn rate increase per frame
  maxSpawnRate: 0.04, // Maximum spawn rate

  // Colors
  colors: {
    road: "#2c2c2c",
    roadLine: "#ffff00",
    grass: "#228B22",
    obstacle1: "#ff4444",
    obstacle2: "#ff8800",
    obstacle3: "#9900ff",
  },
} as const;
