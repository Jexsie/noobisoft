"use client";

import { useState, useEffect, useCallback } from "react";
import { MirrorNodeClient, NftInfo } from "@/services/wallets/mirrorNodeClient";
import { useWalletInterface } from "@/services/wallets/useWalletInterface";
import { appConfig } from "@/config";
import useSWR from "swr";

/**
 * Custom hook to fetch NFTs for the connected wallet
 * @returns NFTs data, loading state, error, and refetch function
 */
export const useUserNfts = () => {
  const { accountId } = useWalletInterface();

  const mirrorNodeClient = new MirrorNodeClient(appConfig.networks.testnet);

  const fetchNfts = useCallback(async () => {
    if (!accountId) {
      throw new Error("Account ID is required");
    }
    return await mirrorNodeClient.getAllAccountNfts(accountId);
  }, [accountId]);

  const { data, isLoading, error, mutate, isValidating } = useSWR(
    accountId ? `nfts-${accountId}` : null,
    fetchNfts
  );

  return {
    nfts: data || [],
    loading: isLoading || isValidating,
    error: error || null,
    refetch: mutate,
    hasNfts: (data?.length || 0) > 0,
  };
};
