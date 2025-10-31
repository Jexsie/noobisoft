/**
 * NFT Minting API Client
 * Call this when player achieves a new high score
 */

export interface MintNftResponse {
  success: boolean;
  serialNumber?: number;
  error?: string;
  message?: string;
}

/**
 * Mint a new NFT to the player's wallet
 * @param receiver - Hedera account ID (e.g., "0.0.123456")
 */
export async function mintNftReward(
  receiver: string
): Promise<MintNftResponse> {
  try {
    const response = await fetch(`/api/mint-nft?receiver=${receiver}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error minting NFT:", error);
    return {
      success: false,
      error: "Network error",
      message: "Failed to mint NFT reward",
    };
  }
}
