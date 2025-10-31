"use client";

import { ReactNode } from "react";
import { MetamaskContextProvider } from "@/contexts/MetamaskContext";
import { WalletConnectContextProvider } from "@/contexts/WalletConnectContext";
import { MetaMaskClient } from "@/services/wallets/metamask/metamaskClient";
import { WalletConnectClient } from "@/services/wallets/walletconnect/walletConnectClient";

export const AllWalletsProvider = (props: {
  children: ReactNode | undefined;
}) => {
  return (
    <MetamaskContextProvider>
      <WalletConnectContextProvider>
        <MetaMaskClient />
        <WalletConnectClient />
        {props.children}
      </WalletConnectContextProvider>
    </MetamaskContextProvider>
  );
};
