"use client";

import { ReactNode } from "react";
import { AllWalletsProvider } from "@/providers/AllWalletsProvider";
import { SWRProvider } from "../providers/SWRProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRProvider>
      <AllWalletsProvider>{children}</AllWalletsProvider>
    </SWRProvider>
  );
}
