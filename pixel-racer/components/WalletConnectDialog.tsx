"use client";

import { openWalletConnectModal } from "@/services/wallets/walletconnect/walletConnectClient";
import { connectToMetamask } from "@/services/wallets/metamask/metamaskClient";

interface WalletConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * WalletConnectDialog component
 * @param {boolean} isOpen - boolean indicating if the dialog is open
 * @param {() => void} onClose - function to close the dialog
 */
export default function WalletConnectDialog({
  isOpen,
  onClose,
}: WalletConnectDialogProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay active" onClick={handleOverlayClick}>
      <div className="wallet-dialog-content">
        <div className="modal-header">
          <h2>🔗 CONNECT WALLET</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="wallet-dialog-subtitle">
            Choose your preferred wallet to connect
          </p>

          <div className="wallet-options">
            <button
              className="wallet-option-btn metamask-btn"
              onClick={() => connectToMetamask()}
            >
              <div className="wallet-icon">🦊</div>
              <div className="wallet-info">
                <div className="wallet-name">MetaMask</div>
                <div className="wallet-description">
                  Connect using MetaMask browser extension
                </div>
              </div>
            </button>

            <button
              className="wallet-option-btn walletconnect-btn"
              onClick={() => {
                openWalletConnectModal();
                onClose();
              }}
            >
              <div className="wallet-icon">🔐</div>
              <div className="wallet-info">
                <div className="wallet-name">WalletConnect</div>
                <div className="wallet-description">
                  Connect using mobile wallet or QR code
                </div>
              </div>
            </button>
          </div>

          <div className="wallet-dialog-notice">
            <p>
              💡 <strong>New to Web3?</strong> We recommend getting started with
              MetaMask.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
