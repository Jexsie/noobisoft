import { AccountId, TokenId } from "@hashgraph/sdk";
import { NetworkConfig } from "../../config";

export interface NftMetadata {
  name: string;
  creator: string;
  description: string;
  file_url: string;
  image: string;
  type: string;
  format: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  custom_fields: {
    dna: string;
    edition: number;
    date: number;
    compiler: string;
    game: {
      name: string;
      series: string;
      edition: string;
    };
  };
}

export interface NftInfo {
  account_id: string;
  created_timestamp: string;
  deleted: boolean;
  metadata: string; // Base64 encoded metadata
  metadataJson?: NftMetadata;
  modified_timestamp: string;
  serial_number: number;
  token_id: string;
  spender?: string;
}

export interface NftsResponse {
  nfts: NftInfo[];
  links: {
    next: string | null;
  };
}

export interface TokenInfoResponse {
  token_id: string;
  symbol: string;
  name: string;
  type: string;
  memo: string;
  metadata: string;
  treasury_account_id: string;
  total_supply: string;
}

export class MirrorNodeClient {
  url: string;
  constructor(networkConfig: NetworkConfig) {
    this.url = networkConfig.mirrorNodeUrl;
  }

  async getAccountInfo(accountId: AccountId | string) {
    const accountInfo = await fetch(
      `${this.url}/api/v1/accounts/${accountId}`,
      { method: "GET" }
    );
    const accountInfoJson = await accountInfo.json();
    return accountInfoJson;
  }

  /**
   * Fetch all NFTs owned by an account
   * @param accountId - The Hedera account ID (e.g., "0.0.123456")
   * @param limit - Maximum number of NFTs to return per page (default: 100, max: 100)
   * @returns Promise with NFTs data
   */
  async getAccountNfts(
    accountId: AccountId | string,
    limit: number = 100
  ): Promise<NftsResponse> {
    try {
      const response = await fetch(
        `${this.url}/api/v1/accounts/${accountId}/nfts?limit=${limit}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching account NFTs:", error);
      throw error;
    }
  }

  /**
   * Fetch all NFTs with pagination support
   * @param accountId - The Hedera account ID
   * @param maxNfts - Maximum total NFTs to fetch (default: 500)
   */
  async getAllAccountNfts(
    accountId: AccountId | string,
    maxNfts: number = 500
  ): Promise<NftInfo[]> {
    const allNfts: NftInfo[] = [];
    let nextLink: string | null = null;
    let fetchedCount = 0;

    do {
      const url = nextLink
        ? `${this.url}${nextLink}`
        : `${this.url}/api/v1/accounts/${accountId}/nfts?limit=10`;

      const response = await fetch(url, { method: "GET" });
      const data: NftsResponse = await response.json();

      console.log("data", data);

      for (const nft of data?.nfts) {
        try {
          const url = this.decodeNftMetadata(nft.metadata);
          const metadata = await this.fetchMetadata(this.normalizeIpfsUri(url));
          allNfts.push({
            ...nft,
            metadataJson: {
              ...metadata,
              image: this.normalizeIpfsUri(metadata.file_url),
            },
          });
        } catch (err) {
          console.error("Failed to fetch metadata for NFT", nft, err);
        }
      }

      fetchedCount += data.nfts.length;
      nextLink = data.links?.next || null;
    } while (nextLink && fetchedCount < maxNfts);

    return allNfts;
  }

  /**
   * Fetch token information
   * @param tokenId - The token ID (e.g., "0.0.123456")
   */
  async getTokenInfo(tokenId: string): Promise<TokenInfoResponse> {
    try {
      const response = await fetch(`${this.url}/api/v1/tokens/${tokenId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token info: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching token info:", error);
      throw error;
    }
  }

  /**
   * Decode base64 metadata from NFT
   * @param base64Metadata - Base64 encoded metadata string
   */
  decodeNftMetadata(base64Metadata: string): string {
    try {
      // Remove 'base64,' prefix if present
      const cleanBase64 = base64Metadata.replace(/^data:.*base64,/, "");
      return atob(cleanBase64);
    } catch (error) {
      console.error("Error decoding NFT metadata:", error);
      return base64Metadata;
    }
  }

  normalizeIpfsUri(uri: string): string {
    if (!uri) return "";

    if (uri.startsWith("ipfs://")) {
      const cid = uri.replace("ipfs://", "");
      return `${
        process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"
      }/ipfs/${cid}`;
    }
    return uri;
  }

  async fetchMetadata(url: string): Promise<NftMetadata> {
    const response = await fetch(url);
    return (await response.json()) as NftMetadata;
  }

  /**
   * Get NFT metadata as JSON if possible
   * @param base64Metadata - Base64 encoded metadata string
   */
  async getNftMetadataJson(base64Metadata: string): Promise<any> {
    try {
      const decoded = this.decodeNftMetadata(base64Metadata);
      console.log("decoded", decoded);
      return JSON.parse(decoded);
    } catch (error) {
      // Not JSON, return decoded string
      return this.decodeNftMetadata(base64Metadata);
    }
  }
}
