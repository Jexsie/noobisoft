"use client";

import { useEffect, useRef, useState } from "react";
import soundManager from "@/lib/soundManager";
import { CONFIG } from "@/lib/gameConfig";
import { PlayerCar } from "@/lib/classes/PlayerCar";
import { Obstacle } from "@/lib/classes/Obstacle";
import { Particle } from "@/lib/classes/Particle";
import {
  checkCollision,
  drawRoad,
  drawSpeedIndicator,
  drawStartScreen,
} from "@/lib/gameUtils";
import ScoreDisplay from "./ScoreDisplay";
import GameOverScreen from "./GameOverScreen";
import MobileControls from "./MobileControls";
import CelebrationEffect from "./CelebrationEffect";
import { useWalletInterface } from "@/services/wallets/useWalletInterface";
import { mintNftReward } from "@/lib/api/nft";
import { submitScore, getLeaderboard } from "@/lib/api/leaderboard";
import { AccountId } from "@hashgraph/sdk";
import { mutate } from "swr";

interface GameCanvasProps {
  carColor: string;
}

interface GameState {
  isPlaying: boolean;
  gameStarted: boolean;
  score: number;
  highScore: number;
  roadOffset: number;
  obstacles: Obstacle[];
  particles: Particle[];
  speedMultiplier: number;
  currentSpawnRate: number;
}

export default function GameCanvas({ carColor }: GameCanvasProps) {
  const { accountId } = useWalletInterface();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [mintingNft, setMintingNft] = useState(false);
  const gameStateRef = useRef<GameState | null>(null);
  const playerRef = useRef<PlayerCar | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const accountIdRef = useRef<string | null>(null);

  useEffect(() => {
    accountIdRef.current = accountId;
  }, [accountId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CONFIG.canvasWidth;
    canvas.height = CONFIG.canvasHeight;

    // Initialize game state
    const gameState: GameState = {
      isPlaying: false,
      gameStarted: false,
      score: 0,
      highScore: 0,
      roadOffset: 0,
      obstacles: [],
      particles: [],
      speedMultiplier: 1.0,
      currentSpawnRate: CONFIG.obstacleSpawnRate,
    };

    const player = new PlayerCar(canvas);
    playerRef.current = player;
    gameStateRef.current = gameState;

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("pixelRacerHighScore");
    if (savedHighScore) {
      gameState.highScore = parseInt(savedHighScore);
      setHighScore(parseInt(savedHighScore));
    }

    // Collision detection
    const checkCollisions = () => {
      const playerBounds = player.getBounds();

      for (let obstacle of gameState.obstacles) {
        const obstacleBounds = obstacle.getBounds();
        const jumpClearance = 50;
        const isJumpingOverObstacle =
          player.isJumping && player.baseY - player.y > jumpClearance;

        if (
          checkCollision(playerBounds, obstacleBounds) &&
          !isJumpingOverObstacle
        ) {
          // Play crash sound
          soundManager.playCrashSound();

          // Create explosion particles
          for (let i = 0; i < 20; i++) {
            gameState.particles.push(
              new Particle(
                playerBounds.x + playerBounds.width / 2,
                playerBounds.y + playerBounds.height / 2
              )
            );
          }
          handleGameOver();
          return;
        }
      }
    };

    // Spawn obstacles
    const spawnObstacle = () => {
      if (Math.random() < gameState.currentSpawnRate) {
        const lane = Math.floor(Math.random() * CONFIG.roadLanes);
        const types: Array<"car" | "barrier" | "oil"> = [
          "car",
          "car",
          "car",
          "barrier",
          "oil",
        ];
        const type = types[Math.floor(Math.random() * types.length)];

        // Check if obstacle too close in this lane
        const tooClose = gameState.obstacles.some(
          (obs) => obs.lane === lane && obs.y < 100
        );

        if (!tooClose) {
          gameState.obstacles.push(
            new Obstacle(canvas, lane, type, gameState.speedMultiplier)
          );
        }
      }
    };

    // Render function
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawRoad(ctx, canvas, gameState.roadOffset);

      gameState.obstacles.forEach((obstacle) => obstacle.draw(ctx));

      player.draw(ctx, carColor);

      gameState.particles.forEach((particle) => particle.draw(ctx));

      if (gameState.isPlaying) {
        drawSpeedIndicator(ctx, gameState.speedMultiplier);
      }

      if (!gameState.gameStarted && !gameState.isPlaying) {
        drawStartScreen(ctx, canvas);
      }
    };

    // Update function
    const update = () => {
      if (!gameState.isPlaying) return;

      // Increase difficulty over time
      if (gameState.speedMultiplier < CONFIG.maxSpeedMultiplier) {
        gameState.speedMultiplier += CONFIG.difficultyIncrease;
      }

      if (gameState.currentSpawnRate < CONFIG.maxSpawnRate) {
        gameState.currentSpawnRate += CONFIG.spawnRateIncrease;
      }

      // Update road scroll
      gameState.roadOffset += CONFIG.obstacleSpeed * gameState.speedMultiplier;

      // Update player
      player.update();

      // Spawn obstacles
      spawnObstacle();

      // Update obstacles
      gameState.obstacles.forEach((obstacle) => {
        obstacle.update();

        // Award points for passing obstacles
        if (!obstacle.passed && obstacle.y > player.y) {
          obstacle.passed = true;
          gameState.score += CONFIG.scoreIncrement;
        }
      });

      // Remove off-screen obstacles
      gameState.obstacles = gameState.obstacles.filter(
        (obs) => !obs.isOffScreen()
      );

      // Update particles
      gameState.particles.forEach((particle) => particle.update());
      gameState.particles = gameState.particles.filter(
        (particle) => !particle.isDead()
      );

      // Check collisions
      checkCollisions();

      // Increase score over time (scales with difficulty)
      gameState.score += 0.1 * gameState.speedMultiplier;
      setScore(Math.floor(gameState.score));
    };

    // Game loop
    const gameLoop = () => {
      update();
      render();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Game over handler
    const handleGameOver = async () => {
      gameState.isPlaying = false;

      // Stop background music
      soundManager.stopBackgroundMusic();

      const currentScore = Math.floor(gameState.score);
      const isNewHighScore = currentScore > gameState.highScore;

      if (isNewHighScore) {
        // New high score achieved!
        gameState.highScore = currentScore;
        localStorage.setItem("pixelRacerHighScore", currentScore.toString());
        setHighScore(currentScore);

        // Show celebration effect
        setShowCelebration(true);

        // Play celebration sound
        soundManager.playCelebrationSound();

        console.log(`NEW HIGH SCORE: ${currentScore}!`);

        // Get current accountId from ref (to handle wallet connections during gameplay)
        const currentAccountId = accountIdRef.current;
        console.log("Current accountId:", currentAccountId);

        // Process rewards if wallet is connected
        if (currentAccountId) {
          const evmAddress =
            AccountId.fromString(currentAccountId).toEvmAddress();
          setMintingNft(true);

          try {
            // STEP 1: Mint NFT reward FIRST (always happens on new high score)
            console.log(`Step 1: Minting NFT reward for ${evmAddress}...`);
            const mintResult = await mintNftReward(evmAddress);

            if (mintResult.success) {
              mutate(`nfts-${currentAccountId}`);

              console.log(
                `NFT Minted! Serial Number: ${mintResult.serialNumber}`
              );
            } else {
              console.error(`NFT Minting failed: ${mintResult.error}`);
            }

            // STEP 2: Check if score qualifies for top 5 leaderboard
            console.log(`Step 2: Checking if score qualifies for top 5...`);
            const leaderboardCheck = await getLeaderboard();

            let shouldSubmitToLeaderboard = false;
            let leaderboardResult = null;

            if (leaderboardCheck.success && leaderboardCheck.leaderboard) {
              // If leaderboard has less than 5 entries, always submit
              if (leaderboardCheck.leaderboard.length < 5) {
                shouldSubmitToLeaderboard = true;
                console.log(
                  `Leaderboard has ${leaderboardCheck.leaderboard.length}/5 entries - submitting score`
                );
              } else {
                // Check if score is better than 5th place
                const fifthPlace = leaderboardCheck.leaderboard[4];
                if (currentScore > fifthPlace.score) {
                  shouldSubmitToLeaderboard = true;
                  console.log(
                    `Score ${currentScore} beats 5th place (${fifthPlace.score}) - qualifying for leaderboard!`
                  );
                } else {
                  console.log(
                    `Score ${currentScore} doesn't beat top 5 (5th: ${fifthPlace.score}) - leaderboard not updated`
                  );
                }
              }
            } else {
              // If can't fetch leaderboard, submit anyway
              shouldSubmitToLeaderboard = true;
              console.log(`Could not fetch leaderboard - submitting anyway`);
            }

            // STEP 3: Submit to leaderboard only if qualified for top 5
            if (shouldSubmitToLeaderboard) {
              console.log(` Step 3: Submitting score to leaderboard...`);
              leaderboardResult = await submitScore(
                "PLAYER", // You can get this from user input or wallet
                currentScore,
                currentAccountId
              );

              if (leaderboardResult.success) {
                console.log(
                  `Score submitted! Rank: #${leaderboardResult.rank}`
                );
              }
            }

            // STEP 4: Show notification based on results
            setTimeout(() => {
              let message = "";

              if (mintResult.success && leaderboardResult?.success) {
                // Both NFT and leaderboard success
                message = leaderboardResult.isTop5
                  ? `AMAZING!\n\n` +
                    `New High Score: ${currentScore}\n` +
                    `Leaderboard Rank: #${leaderboardResult.rank} 🏆\n` +
                    `NFT Reward: Serial #${mintResult.serialNumber}\n\n` +
                    `You made the TOP 5! Check your wallet for your reward NFT!`
                  : `Congratulations!\n\n` +
                    `New High Score: ${currentScore}\n` +
                    `Leaderboard Rank: #${leaderboardResult.rank}\n` +
                    `NFT Reward: Serial #${mintResult.serialNumber}\n\n` +
                    `Check your wallet for your new NFT!`;
              } else if (mintResult.success && !shouldSubmitToLeaderboard) {
                // NFT success but didn't qualify for top 5
                message =
                  ` New High Score!\n\n` +
                  `Score: ${currentScore}\n` +
                  `NFT Reward: Serial #${mintResult.serialNumber}\n\n` +
                  `NFT minted to your wallet!\n` +
                  `(Score didn't qualify for top 5 leaderboard)`;
              } else if (mintResult.success) {
                // NFT success only
                message =
                  ` Congratulations!\n\n` +
                  `New High Score: ${currentScore}\n` +
                  `NFT Reward: Serial #${mintResult.serialNumber}\n\n` +
                  `Check your wallet for your new NFT!`;
              } else if (leaderboardResult?.success) {
                // Leaderboard success but NFT failed
                message =
                  ` New High Score: ${currentScore}\n` +
                  `Rank: #${leaderboardResult.rank}\n\n` +
                  `${leaderboardResult.message}\n` +
                  `(NFT minting failed - check console)`;
              } else {
                // Both failed or only NFT failed
                message =
                  ` New High Score: ${currentScore}!\n\n` +
                  `Rewards processing encountered issues.\n` +
                  `Check console for details.`;
              }

              alert(message);
            }, 1000);
          } catch (error) {
            console.error("Error processing high score rewards:", error);
          } finally {
            setMintingNft(false);
          }
        }
      }

      setFinalScore(currentScore);
      setIsGameOver(true);
    };

    // Start game (first time)
    const startGame = () => {
      gameState.isPlaying = true;
      gameState.gameStarted = true;
      gameState.score = 0;
      gameState.speedMultiplier = 1.0;
      gameState.currentSpawnRate = CONFIG.obstacleSpawnRate;
      setScore(0);
      setIsGameOver(false);

      // Initialize and start background music
      if (!soundManager.isInitialized) {
        soundManager.init();
      }
      soundManager.startBackgroundMusic();
    };

    // Restart game
    const restartGame = () => {
      gameState.isPlaying = true;
      gameState.gameStarted = true;
      gameState.score = 0;
      gameState.roadOffset = 0;
      gameState.obstacles = [];
      gameState.particles = [];
      gameState.speedMultiplier = 1.0;
      gameState.currentSpawnRate = CONFIG.obstacleSpawnRate;

      // Reset player
      player.lane = 1;
      player.x = player.getLaneX(1);
      player.targetX = player.x;
      player.y = player.baseY;
      player.isJumping = false;
      player.jumpVelocity = 0;

      setScore(0);
      setIsGameOver(false);

      // Restart background music
      soundManager.startBackgroundMusic();
    };

    // Keyboard event handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isPlaying) {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          player.moveLeft();
        } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          player.moveRight();
        } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          player.jump();
        }
      }

      // Start or restart with spacebar
      if (e.key === " " && !gameState.isPlaying) {
        e.preventDefault();
        if (!gameState.gameStarted) {
          startGame();
        } else {
          restartGame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clean up sound on unmount
      soundManager.stopBackgroundMusic();
    };
  }, [carColor]);

  const handleRestart = () => {
    const gameState = gameStateRef.current;
    const player = playerRef.current;

    if (gameState && player) {
      gameState.isPlaying = true;
      gameState.gameStarted = true;
      gameState.score = 0;
      gameState.roadOffset = 0;
      gameState.obstacles = [];
      gameState.particles = [];
      gameState.speedMultiplier = 1.0;
      gameState.currentSpawnRate = CONFIG.obstacleSpawnRate;

      // Reset player position
      player.lane = 1;
      player.x = player.getLaneX(1);
      player.targetX = player.x;
      player.y = player.baseY;
      player.isJumping = false;
      player.jumpVelocity = 0;

      setScore(0);
      setIsGameOver(false);

      // Restart music
      soundManager.startBackgroundMusic();
    }
  };

  const handleMoveLeft = () => {
    playerRef.current?.moveLeft();
  };

  const handleMoveRight = () => {
    playerRef.current?.moveRight();
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  return (
    <div className="game-container">
      <ScoreDisplay score={score} highScore={highScore} />

      <canvas ref={canvasRef} id="gameCanvas" />

      <GameOverScreen
        isVisible={isGameOver}
        finalScore={finalScore}
        onRestart={handleRestart}
      />

      <MobileControls
        onMoveLeft={handleMoveLeft}
        onMoveRight={handleMoveRight}
      />

      <CelebrationEffect
        isActive={showCelebration}
        onComplete={handleCelebrationComplete}
      />

      {/* NFT Minting Indicator */}
      {mintingNft && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.9)",
            border: "3px solid #00ff88",
            padding: "30px",
            borderRadius: "8px",
            textAlign: "center",
            zIndex: 2000,
          }}
        >
          <div
            className="loading-spinner"
            style={{ margin: "0 auto 15px" }}
          ></div>
          <p style={{ color: "#00ff88", fontSize: "18px", fontWeight: "bold" }}>
            🎁 Processing Rewards...
          </p>
          <p style={{ color: "#ccc", fontSize: "14px", marginTop: "10px" }}>
            Minting NFT reward & checking leaderboard!
          </p>
        </div>
      )}
    </div>
  );
}
