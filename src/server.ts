import express, { Request, Response, NextFunction } from "express";
import CIDManager from "./cidManager.js";
import config from "./config.js";

const app = express();
const cidManager = new CIDManager();

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  const stats = cidManager.getAllStats();
  res.json({
    status: "healthy",
    service: "CID Management Service",
    games: stats.games,
    overall: stats.overall,
    timestamp: new Date().toISOString(),
  });
});

// Main endpoint: Get a new unique CID for a specific game
app.get("/api/cid", (req: Request, res: Response) => {
  try {
    const game = req.query.game as string;

    if (!game) {
      return res.status(400).json({
        success: false,
        error: "Missing game parameter",
        message: "Please specify a game using ?game=dino or ?game=pixel-racer",
        validGames: cidManager.getValidGames(),
      });
    }

    const cid = cidManager.getNextCID(game);
    const stats = cidManager.getGameStats(game);

    res.json({
      success: true,
      game: game,
      cid: cid,
      timestamp: new Date().toISOString(),
      stats: stats,
    });
  } catch (error) {
    console.error("Error getting CID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get CID",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Alternative POST endpoint for consistency with REST standards
app.post("/api/cid", (req: Request, res: Response) => {
  try {
    const { game } = req.body;

    if (!game) {
      return res.status(400).json({
        success: false,
        error: "Missing game parameter",
        message:
          "Please provide a game in the request body: { 'game': 'dino' | 'pixel-racer' }",
        validGames: cidManager.getValidGames(),
      });
    }

    const cid = cidManager.getNextCID(game);
    const stats = cidManager.getGameStats(game);

    res.status(201).json({
      success: true,
      game: game,
      cid: cid,
      timestamp: new Date().toISOString(),
      stats: stats,
    });
  } catch (error) {
    console.error("Error getting CID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get CID",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Check if a CID has been used for a specific game
app.get("/api/cid/:game/check/:cid", (req: Request, res: Response) => {
  try {
    const { game, cid } = req.params;
    const isUsed = cidManager.isCIDUsed(game, cid);

    res.json({
      game: game,
      cid: cid,
      isUsed: isUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to check CID",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get statistics - can be for a specific game or all games
app.get("/api/stats", (req: Request, res: Response) => {
  try {
    const game = req.query.game as string | undefined;

    if (game) {
      // Return stats for specific game
      const stats = cidManager.getGameStats(game);
      res.json({
        game: game,
        ...stats,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Return stats for all games
      const allStats = cidManager.getAllStats();
      res.json({
        ...allStats,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to get statistics",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get list of valid games
app.get("/api/games", (_req: Request, res: Response) => {
  res.json({
    games: cidManager.getValidGames(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: {
      "GET /health": "Service health check",
      "GET /api/games": "Get list of valid game types",
      "GET /api/cid?game=<game>": "Get a new unique CID for a game",
      "POST /api/cid": "Get a new unique CID (game in body)",
      "GET /api/cid/:game/check/:cid":
        "Check if a CID has been used for a game",
      "GET /api/stats": "Get statistics (all games)",
      "GET /api/stats?game=<game>": "Get statistics for a specific game",
    },
    example: "/api/cid?game=dino",
  });
});

// Error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("NoobiSoft CID Management Service Started");
  console.log("=".repeat(50));
  console.log(`Server running on port ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log("");
  console.log("Available endpoints:");
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  GET  http://localhost:${PORT}/api/games`);
  console.log(`  GET  http://localhost:${PORT}/api/cid?game=dino`);
  console.log(`  GET  http://localhost:${PORT}/api/cid?game=pixel-racer`);
  console.log(`  POST http://localhost:${PORT}/api/cid`);
  console.log(`  GET  http://localhost:${PORT}/api/cid/:game/check/:cid`);
  console.log(`  GET  http://localhost:${PORT}/api/stats`);
  console.log(`  GET  http://localhost:${PORT}/api/stats?game=<game>`);
  console.log("=".repeat(50));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received, shutting down gracefully...");
  process.exit(0);
});
