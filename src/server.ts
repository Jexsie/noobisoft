import express, { Request, Response, NextFunction } from "express";
import CIDManager from "./cidManager.js";
import config from "./config.js";

const app = express();
const cidManager = new CIDManager();

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "CID Management Service",
    total: cidManager.getTotalCount(),
    used: cidManager.getUsedCount(),
    available: cidManager.getAvailableCount(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/cid", (_req: Request, res: Response) => {
  try {
    const cid = cidManager.getNextCID();

    res.json({
      success: true,
      cid: cid,
      timestamp: new Date().toISOString(),
      used: cidManager.getUsedCount(),
      available: cidManager.getAvailableCount(),
      total: cidManager.getTotalCount(),
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

app.post("/api/cid", (_req: Request, res: Response) => {
  try {
    const cid = cidManager.getNextCID();

    res.status(201).json({
      success: true,
      cid: cid,
      timestamp: new Date().toISOString(),
      used: cidManager.getUsedCount(),
      available: cidManager.getAvailableCount(),
      total: cidManager.getTotalCount(),
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

app.get("/api/cid/:cid/check", (req: Request, res: Response) => {
  const { cid } = req.params;
  const isUsed = cidManager.isCIDUsed(cid);

  res.json({
    cid: cid,
    isUsed: isUsed,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/stats", (_req: Request, res: Response) => {
  res.json({
    total: cidManager.getTotalCount(),
    used: cidManager.getUsedCount(),
    available: cidManager.getAvailableCount(),
    timestamp: new Date().toISOString(),
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: {
      "GET /health": "Service health check",
      "GET /api/cid": "Generate a new unique CID",
      "POST /api/cid": "Generate a new unique CID",
      "GET /api/cid/:cid/check": "Check if a CID has been used",
      "GET /api/stats": "Get generation statistics",
    },
  });
});

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
  console.log(`  GET  http://localhost:${PORT}/api/cid`);
  console.log(`  POST http://localhost:${PORT}/api/cid`);
  console.log(`  GET  http://localhost:${PORT}/api/cid/:cid/check`);
  console.log(`  GET  http://localhost:${PORT}/api/stats`);
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
