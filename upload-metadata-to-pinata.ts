import { PinataSDK } from "pinata";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.GATEWAY_URL!,
});

interface UploadResult {
  folder: string;
  cid: string;
  group: string;
  success: boolean;
  error?: string;
}

// Group IDs
const GROUP_IDS = {
  "dino-metadata": "db51d5f9-7557-47a9-817a-c61bc81f9849",
  "pixel-metadata": "3bd1f37d-29fc-49ec-95c9-1ae605e54a3b",
} as const;

/**
 * Upload a single folder to Pinata with group assignment using pinFromFS
 * This uploads the entire folder structure, so the CID points to the folder
 * and metadata.json is accessible at {CID}/metadata.json
 */
async function uploadFolder(
  folderPath: string,
  groupId: string,
  groupName: string
): Promise<UploadResult> {
  const folderName = path.basename(folderPath);

  try {
    // Verify the folder exists and contains metadata.json
    const metadataPath = path.join(folderPath, "metadata.json");
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`metadata.json not found in ${folderPath}`);
    }

    console.log(`📁 Uploading folder: ${folderName}`);
    console.log(`   Path: ${folderPath}`);
    console.log(`   Group: ${groupName} (ID: ${groupId})`);

    // Read files from the folder
    const filesInFolder = fs.readdirSync(folderPath);
    console.log(`   Files in folder:`, filesInFolder.join(", "));

    // Create File objects for each file in the folder
    // IMPORTANT: Set webkitRelativePath to {folderName}/{fileName}
    // This creates the path structure {folderName}/metadata.json
    const files = filesInFolder.map((fileName) => {
      const filePath = path.join(folderPath, fileName);
      const fileContent = fs.readFileSync(filePath);
      const blob = new Blob([fileContent]);
      const file = new File([blob], fileName);

      // Set webkitRelativePath to {folderName}/fileName
      // So for folder "1" with file "metadata.json", path becomes "1/metadata.json"
      Object.defineProperty(file, "webkitRelativePath", {
        value: `${folderName}/${fileName}`,
        writable: false,
      });

      console.log(`   - Uploading as: ${folderName}/${fileName}`);
      return file;
    });

    // Upload using fileArray to preserve directory structure
    // Add metadata to set the folder name (1, 2, 3, etc.)
    const upload = await pinata.upload.public.fileArray(files, {
      groupId: groupId,
      metadata: {
        name: folderName, // Set the folder name to "1", "2", etc.
      },
    });

    console.log(`   ✅ Success! CID: ${upload.cid}`);
    console.log(`   📎 Uploaded as: ${folderName}`);
    console.log(
      `   📎 Access at: ipfs://${upload.cid}/${folderName}/metadata.json`
    );

    return {
      folder: folderName,
      cid: upload.cid,
      group: groupName,
      success: true,
    };
  } catch (error) {
    console.log(
      `   ❌ Error: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      folder: folderName,
      cid: "",
      group: groupName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Upload all folders in a directory to Pinata under a specific group
 */
async function uploadMetadataFolders(
  baseDir: string,
  groupId: string,
  groupName: string
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const folders = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort((a, b) => parseInt(a) - parseInt(b));

  console.log(
    `\n📤 Uploading ${folders.length} folders to group "${groupName}" (ID: ${groupId})...\n`
  );

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    const folderPath = path.join(baseDir, folder);

    process.stdout.write(
      `[${i + 1}/${folders.length}] Uploading ${folder}... `
    );

    const result = await uploadFolder(folderPath, groupId, groupName);
    results.push(result);

    if (result.success) {
      console.log(`✓ CID: ${result.cid}`);
      // Immediately append to available_cids.json after each successful upload
      try {
        const availableCidsPath = path.join(
          __dirname,
          "data",
          "available_cids.json"
        );
        let availableCids: { dino: string[]; "pixel-racer": string[] } = {
          dino: [],
          "pixel-racer": [],
        };
        if (fs.existsSync(availableCidsPath)) {
          const existing = fs.readFileSync(availableCidsPath, "utf8");
          availableCids = JSON.parse(existing);
        }

        const cidPath = `${result.cid}/metadata.json`;
        if (groupName === "dino-metadata") {
          if (!availableCids.dino.includes(cidPath)) {
            availableCids.dino.push(cidPath);
          }
        } else if (groupName === "pixel-metadata") {
          if (!availableCids["pixel-racer"].includes(cidPath)) {
            availableCids["pixel-racer"].push(cidPath);
          }
        }

        fs.writeFileSync(
          availableCidsPath,
          JSON.stringify(availableCids, null, 2),
          "utf8"
        );

        console.log(
          `📘 appended to available_cids.json -> ${
            groupName === "dino-metadata" ? "dino" : "pixel-racer"
          }: ${cidPath}`
        );
      } catch (e) {
        console.log(
          `⚠️  Failed to append to available_cids.json: ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      }
    } else {
      console.log(`✗ Error: ${result.error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Update available_cids.json with uploaded CIDs
 */
async function updateAvailableCids(
  successfulUploads: UploadResult[]
): Promise<void> {
  const availableCidsPath = path.join(__dirname, "data", "available_cids.json");

  let availableCids: {
    dino: string[];
    "pixel-racer": string[];
  } = {
    dino: [],
    "pixel-racer": [],
  };

  if (fs.existsSync(availableCidsPath)) {
    const existingData = fs.readFileSync(availableCidsPath, "utf8");
    availableCids = JSON.parse(existingData);
  }

  for (const result of successfulUploads) {
    if (result.success && result.cid) {
      const cidPath = `${result.cid}/metadata.json`;

      if (result.group === "dino-metadata") {
        if (!availableCids.dino.includes(cidPath)) {
          availableCids.dino.push(cidPath);
        }
      } else if (result.group === "pixel-metadata") {
        if (!availableCids["pixel-racer"].includes(cidPath)) {
          availableCids["pixel-racer"].push(cidPath);
        }
      }
    }
  }

  // Save updated available CIDs
  fs.writeFileSync(
    availableCidsPath,
    JSON.stringify(availableCids, null, 2),
    "utf8"
  );

  console.log(`\n💾 Updated available_cids.json:`);
  console.log(`  - dino: ${availableCids.dino.length} CIDs`);
  console.log(`  - pixel-racer: ${availableCids["pixel-racer"].length} CIDs`);
}

/**
 * Main upload function
 */
async function main() {
  console.log("🚀 Starting metadata upload to Pinata...\n");

  // Validate environment variables
  if (!process.env.PINATA_JWT) {
    throw new Error("PINATA_JWT not found in .env file");
  }
  if (!process.env.GATEWAY_URL) {
    throw new Error("GATEWAY_URL not found in .env file");
  }

  const baseDir = path.join(__dirname);
  const dinoDir = path.join(baseDir, "dino-metadata");
  const pixelDir = path.join(baseDir, "pixel-metadata");

  // Verify directories exist
  if (!fs.existsSync(dinoDir)) {
    throw new Error(`Directory not found: ${dinoDir}`);
  }
  if (!fs.existsSync(pixelDir)) {
    throw new Error(`Directory not found: ${pixelDir}`);
  }

  const allResults: UploadResult[] = [];

  // Upload dino metadata
  console.log("=".repeat(60));
  console.log("🦕 Uploading DINO metadata...");
  console.log("=".repeat(60));
  const dinoResults = await uploadMetadataFolders(
    dinoDir,
    GROUP_IDS["dino-metadata"],
    "dino-metadata"
  );
  allResults.push(...dinoResults);

  // Upload pixel-racer metadata
  console.log("\n" + "=".repeat(60));
  console.log("🏎️  Uploading PIXEL-RACER metadata...");
  console.log("=".repeat(60));
  const pixelResults = await uploadMetadataFolders(
    pixelDir,
    GROUP_IDS["pixel-metadata"],
    "pixel-metadata"
  );
  allResults.push(...pixelResults);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Upload Summary");
  console.log("=".repeat(60));

  const successful = allResults.filter((r) => r.success);
  const failed = allResults.filter((r) => !r.success);

  console.log(`\n✅ Successful: ${successful.length}/${allResults.length}`);
  console.log(`❌ Failed: ${failed.length}/${allResults.length}`);

  // Group by group name
  const byGroup = allResults.reduce((acc, result) => {
    if (!acc[result.group]) {
      acc[result.group] = { success: 0, failed: 0, cids: [] };
    }
    if (result.success) {
      acc[result.group].success++;
      acc[result.group].cids.push({
        folder: result.folder,
        cid: result.cid,
      });
    } else {
      acc[result.group].failed++;
    }
    return acc;
  }, {} as Record<string, { success: number; failed: number; cids: Array<{ folder: string; cid: string }> }>);

  console.log("\n📁 By Group:");
  for (const [group, stats] of Object.entries(byGroup)) {
    console.log(`\n  ${group}:`);
    console.log(`    ✅ ${stats.success} successful`);
    console.log(`    ❌ ${stats.failed} failed`);
  }

  // Save results to file
  const resultsFile = path.join(baseDir, "upload-results.json");
  fs.writeFileSync(
    resultsFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          total: allResults.length,
          successful: successful.length,
          failed: failed.length,
        },
        byGroup,
        allResults,
      },
      null,
      2
    )
  );

  console.log(`\n💾 Results saved to: ${resultsFile}`);

  // Update available_cids.json with the new CIDs
  await updateAvailableCids(successful);

  if (failed.length > 0) {
    console.log("\n⚠️  Failed uploads:");
    failed.forEach((result) => {
      console.log(`  - ${result.folder} (${result.group}): ${result.error}`);
    });
    process.exit(1);
  }

  console.log("\n✅ All uploads completed successfully!");
}

// Run the upload
main().catch((error) => {
  console.error("\n❌ Upload failed:", error);
  process.exit(1);
});
