"use client";

import { ReactNode } from "react";
import { SWRConfig } from "swr";

interface SWRProviderProps {
  children: ReactNode;
}

export const SWRProvider = ({ children }: SWRProviderProps) => {
  return (
    <SWRConfig
      value={{
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 1,
        errorRetryInterval: 5000,
        shouldRetryOnError: (error: any) => {
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          if (
            error?.message?.includes("No NFTs found") ||
            error?.message?.includes("authentication")
          ) {
            return false;
          }
          return true;
        },
        onError: (error, key) => {
          console.error(`SWR Error for key "${key}":`, error);
        },
        onSuccess: (data, key) => {
          console.log(`SWR Success for key "${key}":`, data);
        },
        fallbackData: undefined,
        loadingTimeout: 10000,
      }}
    >
      {children}
    </SWRConfig>
  );
};
