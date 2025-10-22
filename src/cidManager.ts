import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CIDManager {
  private availableCidsFile: string;
  private usedCidsFile: string;
  private availableCIDs: string[];
  private usedCIDs: Set<string>;

  constructor(
    availableCidsFile: string = "data/available_cids.json",
    usedCidsFile: string = "data/used_cids.json"
  ) {
    this.availableCidsFile = path.join(__dirname, "..", availableCidsFile);
    this.usedCidsFile = path.join(__dirname, "..", usedCidsFile);
    this.availableCIDs = [];
    this.usedCIDs = new Set<string>();
    this.loadCIDs();
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

      if (fs.existsSync(this.availableCidsFile)) {
        const availableData = fs.readFileSync(this.availableCidsFile, "utf8");
        this.availableCIDs = JSON.parse(availableData) as string[];
        console.log(`Loaded ${this.availableCIDs.length} available CIDs`);
      } else {
        console.log(
          "No available CIDs file found. Please create data/available_cids.json with an array of CIDs."
        );
        this.availableCIDs = [];
      }

      if (fs.existsSync(this.usedCidsFile)) {
        const usedData = fs.readFileSync(this.usedCidsFile, "utf8");
        const usedArray = JSON.parse(usedData) as string[];
        this.usedCIDs = new Set<string>(usedArray);
        console.log(`Loaded ${this.usedCIDs.size} previously used CIDs`);
      } else {
        this.saveUsedCIDs();
        console.log("Created new used CIDs storage file");
      }
    } catch (error) {
      console.error(
        "Error loading CIDs:",
        error instanceof Error ? error.message : String(error)
      );
      this.availableCIDs = [];
      this.usedCIDs = new Set<string>();
    }
  }

  /**
   * Save used CIDs to persistent storage
   */
  private saveUsedCIDs(): void {
    try {
      const usedArray = Array.from(this.usedCIDs);
      fs.writeFileSync(
        this.usedCidsFile,
        JSON.stringify(usedArray, null, 2),
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
   * Get the next available CID from the pool
   * @returns An unused CID from the available pool
   */
  public getNextCID(): string {
    const unusedCIDs = this.availableCIDs.filter(
      (cid) => !this.usedCIDs.has(cid)
    );

    if (unusedCIDs.length === 0) {
      throw new Error(
        "No available CIDs left. All CIDs from the pool have been used."
      );
    }

    const selectedCID = unusedCIDs[0];

    this.usedCIDs.add(selectedCID);
    this.saveUsedCIDs();

    console.log(
      `Assigned CID: ${selectedCID} (${unusedCIDs.length - 1} remaining)`
    );
    return selectedCID;
  }

  /**
   * Get the count of used CIDs
   */
  public getUsedCount(): number {
    return this.usedCIDs.size;
  }

  /**
   * Get the count of available (unused) CIDs
   */
  public getAvailableCount(): number {
    return this.availableCIDs.filter((cid) => !this.usedCIDs.has(cid)).length;
  }

  /**
   * Get the total count of CIDs in the pool
   */
  public getTotalCount(): number {
    return this.availableCIDs.length;
  }

  /**
   * Check if a CID has been used
   */
  public isCIDUsed(cid: string): boolean {
    return this.usedCIDs.has(cid);
  }
}

export default CIDManager;
