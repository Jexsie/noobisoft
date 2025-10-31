"use client";

import { useState } from "react";
import WalletConnectDialog from "./WalletConnectDialog";
import { useWalletInterface } from "@/services/wallets/useWalletInterface";

interface HeaderProps {
  onLeaderboardClick: () => void;
}

export default function Header({ onLeaderboardClick }: HeaderProps) {
  const { accountId, walletInterface } = useWalletInterface();
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const handleHomeClick = () => {
    if (confirm("Return to home? Your current game will be lost.")) {
      window.location.reload();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="game-title">🏁 PIXEL RACER</h1>
        <nav className="header-nav">
          <button className="pixel-btn" onClick={handleHomeClick}>
            HOME
          </button>
          <button className="pixel-btn" onClick={onLeaderboardClick}>
            LEADERBOARD
          </button>
          <button
            className="pixel-btn wallet-btn"
            onClick={() => {
              if (accountId) {
                walletInterface?.disconnect();
              } else {
                setShowWalletDialog(true);
              }
            }}
          >
            {accountId ? accountId : "CONNECT WALLET"}
          </button>
        </nav>
      </div>
      <WalletConnectDialog
        isOpen={showWalletDialog}
        onClose={() => setShowWalletDialog(false)}
      />
    </header>
  );
}
