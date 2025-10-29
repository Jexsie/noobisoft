import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type GameType = "dino" | "pixel-racer";

interface GameCIDPool {
  [game: string]: string[];
}

interface UsedCIDs {
  [game: string]: string[];
}

class CIDManager {
  private availableCidsFile: string;
  private usedCidsFile: string;
  private availableCIDs: GameCIDPool;
  private usedCIDs: UsedCIDs;
  private readonly validGames: GameType[] = ["dino", "pixel-racer"];

  constructor(
    availableCidsFile: string = "data/available_cids.json",
    usedCidsFile: string = "data/used_cids.json"
  ) {
    this.availableCidsFile = path.join(__dirname, "..", availableCidsFile);
    this.usedCidsFile = path.join(__dirname, "..", usedCidsFile);
    this.availableCIDs = {};
    this.usedCIDs = {};
    this.loadCIDs();
  }

  /**
   * Validate if a game type is valid
   */
  private isValidGame(game: string): game is GameType {
    return this.validGames.includes(game as GameType);
  }

  /**
   * Load available and used CIDs from persistent storage
   */
  private loadCIDs(): void {
    try {
      const dataDir = path.dirname(this.usedCidsFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Load available CIDs (game-based structure)
      if (fs.existsSync(this.availableCidsFile)) {
        const availableData = fs.readFileSync(this.availableCidsFile, "utf8");
        this.availableCIDs = JSON.parse(availableData) as GameCIDPool;

        // Validate structure
        for (const game of this.validGames) {
          if (!this.availableCIDs[game]) {
            this.availableCIDs[game] = [];
          }
        }

        const total = Object.values(this.availableCIDs).reduce(
          (sum, cids) => sum + cids.length,
          0
        );
        console.log(`Loaded ${total} total available CIDs across games`);
        for (const game of this.validGames) {
          console.log(`  ${game}: ${this.availableCIDs[game].length} CIDs`);
        }
      } else {
        console.log(
          "No available CIDs file found. Please create data/available_cids.json with game-based structure."
        );
        for (const game of this.validGames) {
          this.availableCIDs[game] = [];
        }
      }

      // Load used CIDs (game-based structure)
      if (fs.existsSync(this.usedCidsFile)) {
        const usedData = fs.readFileSync(this.usedCidsFile, "utf8");
        this.usedCIDs = JSON.parse(usedData) as UsedCIDs;

        // Ensure all games have arrays
        for (const game of this.validGames) {
          if (!this.usedCIDs[game]) {
            this.usedCIDs[game] = [];
          }
        }

        const totalUsed = Object.values(this.usedCIDs).reduce(
          (sum, cids) => sum + cids.length,
          0
        );
        console.log(`Loaded ${totalUsed} total used CIDs across games`);
        for (const game of this.validGames) {
          console.log(`  ${game}: ${this.usedCIDs[game].length} used`);
        }
      } else {
        // Initialize empty structure
        for (const game of this.validGames) {
          this.usedCIDs[game] = [];
        }
        this.saveUsedCIDs();
        console.log("Created new used CIDs storage file");
      }
    } catch (error) {
      console.error(
        "Error loading CIDs:",
        error instanceof Error ? error.message : String(error)
      );
      this.availableCIDs = {};
      this.usedCIDs = {};
      for (const game of this.validGames) {
        this.availableCIDs[game] = [];
        this.usedCIDs[game] = [];
      }
    }
  }

  /**
   * Save used CIDs to persistent storage
   */
  private saveUsedCIDs(): void {
    try {
      fs.writeFileSync(
        this.usedCidsFile,
        JSON.stringify(this.usedCIDs, null, 2),
        "utf8"
      );
    } catch (error) {
      console.error(
        "Error saving used CIDs:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Get the next available CID from the pool for a specific game
   * @param game - The game type (dino or pixel-racer)
   * @returns An unused CID from the available pool
   */
  public getNextCID(game: string): string {
    if (!this.isValidGame(game)) {
      throw new Error(
        `Invalid game type: ${game}. Valid games are: ${this.validGames.join(
          ", "
        )}`
      );
    }

    const availablePool = this.availableCIDs[game] || [];
    const usedSet = new Set(this.usedCIDs[game] || []);

    const unusedCIDs = availablePool.filter((cid) => !usedSet.has(cid));

    if (unusedCIDs.length === 0) {
      throw new Error(
        `No available CIDs left for game "${game}". All CIDs from the pool have been used.`
      );
    }

    const selectedCID = unusedCIDs[0];

    // Mark as used and persist
    if (!this.usedCIDs[game]) {
      this.usedCIDs[game] = [];
    }
    this.usedCIDs[game].push(selectedCID);
    this.saveUsedCIDs();

    console.log(
      `Assigned CID for ${game}: ${selectedCID} (${
        unusedCIDs.length - 1
      } remaining)`
    );
    return selectedCID;
  }

  /**
   * Get statistics for a specific game
   */
  public getGameStats(game: string): {
    total: number;
    used: number;
    available: number;
  } {
    if (!this.isValidGame(game)) {
      throw new Error(
        `Invalid game type: ${game}. Valid games are: ${this.validGames.join(
          ", "
        )}`
      );
    }

    const total = (this.availableCIDs[game] || []).length;
    const used = (this.usedCIDs[game] || []).length;
    const available = total - used;

    return { total, used, available };
  }

  /**
   * Get statistics for all games
   */
  public getAllStats(): {
    games: {
      [game: string]: {
        total: number;
        used: number;
        available: number;
      };
    };
    overall: {
      total: number;
      used: number;
      available: number;
    };
  } {
    const games: {
      [game: string]: { total: number; used: number; available: number };
    } = {};

    let overallTotal = 0;
    let overallUsed = 0;

    for (const game of this.validGames) {
      const stats = this.getGameStats(game);
      games[game] = stats;
      overallTotal += stats.total;
      overallUsed += stats.used;
    }

    return {
      games,
      overall: {
        total: overallTotal,
        used: overallUsed,
        available: overallTotal - overallUsed,
      },
    };
  }

  /**
   * Get the count of used CIDs for a specific game
   */
  public getUsedCount(game: string): number {
    if (!this.isValidGame(game)) {
      return 0;
    }
    return (this.usedCIDs[game] || []).length;
  }

  /**
   * Get the count of available (unused) CIDs for a specific game
   */
  public getAvailableCount(game: string): number {
    if (!this.isValidGame(game)) {
      return 0;
    }
    const total = (this.availableCIDs[game] || []).length;
    const used = (this.usedCIDs[game] || []).length;
    return total - used;
  }

  /**
   * Get the total count of CIDs in the pool for a specific game
   */
  public getTotalCount(game: string): number {
    if (!this.isValidGame(game)) {
      return 0;
    }
    return (this.availableCIDs[game] || []).length;
  }

  /**
   * Check if a CID has been used for a specific game
   */
  public isCIDUsed(game: string, cid: string): boolean {
    if (!this.isValidGame(game)) {
      return false;
    }
    const usedSet = new Set(this.usedCIDs[game] || []);
    return usedSet.has(cid);
  }

  /**
   * Get list of valid games
   */
  public getValidGames(): GameType[] {
    return [...this.validGames];
  }
}

export default CIDManager;
