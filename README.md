# Dino — Blockchain-Backed Pixel Runner 🎮🦖

**Dino** is a retro-style endless runner that demonstrates true ownership of in-game assets using Hedera NFTs. Players can use unique NFT skins that change the game's theme, mint NFTs for high scores, and take ownership of items outside the game.

---

## Table of Contents

- [Dino — Blockchain-Backed Pixel Runner 🎮🦖](#dino--blockchain-backed-pixel-runner-)
  - [Table of Contents](#table-of-contents)
  - [Quick start](#quick-start)
  - [How to play](#how-to-play)
  - [Connect your HashPack wallet (extension \& mobile)](#connect-your-hashpack-wallet-extension--mobile)
  - [Get test HBARs (testnet)](#get-test-hbars-testnet)
  - [Token association — Why \& How](#token-association--why--how)
  - [Minting NFTs (high score flow)](#minting-nfts-high-score-flow)
  - [Backend \& deployment notes](#backend--deployment-notes)
  - [Mirror node \& verifying NFTs](#mirror-node--verifying-nfts)
  - [Troubleshooting \& common errors](#troubleshooting--common-errors)
  - [Credits \& License](#credits--license)

---

## Quick start

Clone the repo and install:

```bash
git clone <your-repo-url>
cd dino
npm install
```

If you're using **Vite** (recommended for build & deployment):

```bash
npm run build    # production build (vite)
npm run dev      # dev server
```

Serve the `dist/` folder for production.

---

## How to play

- **Controls**
  - `Space` (keyboard) — Jump.
- **Goal**
  - Avoid obstacles (cacti, birds, pits) to increase your score.
  - When you beat the highest saved score, the game will display a celebration and initiate minting a special NFT reward.
- **Theme / Skins**
  - If you own NFT skins, you can apply them via the theme slots. Each NFT changes the background/tiles (theme) in the game.
  - If you have no NFTs in a slot, you’ll see a placeholder ("NO NFT").

---

## Connect your HashPack wallet (extension & mobile)

Dino uses Hedera Wallet integration to let players sign transactions.

**HashPack Extension (Desktop)**

1. Install HashPack from the Chrome/Edge extension store.
2. Open HashPack, create/import an account, and switch to **Testnet**.
3. On Dino's site, click **Connect Wallet**.
4. Approve the WalletConnect session in the HashPack popup.

**HashPack Mobile**

1. Install HashPack on iOS/Android.
2. Open the mobile app, create/import an account, and switch to **Testnet**.
3. On Dino's site, click **Connect Wallet** — this triggers a WalletConnect QR or deep link.
4. Scan the QR with your phone or follow the link and approve the connection.

**Notes**

- The site may use `@hashgraph/hedera-wallet-connect` or WalletConnect v2. Approve the session request in the wallet.
- After connecting, the footer shows your connected account ID.

---

## Get test HBARs (testnet)

You need HBAR on Hedera Testnet to:

- Pay for token association.
- Pay contract mint transactions (if payable amount is set).

Get test HBARs from the Hedera portal faucet:

- 🔗 https://portal.hedera.com/faucet

Steps:

1. Open the faucet and paste your Testnet account ID (e.g. `0.0.12345`).
2. Request tokens — they will arrive to the account shown in HashPack.

---

## Token association — Why & How

Hedera tokens (including NFTs) require an account to be associated with the token ID before the account can hold balance/own tokens (unless auto-association is enabled).

**Two ways to associate:**

1. **Auto-association (wallet-level)**
   - Many wallets (HashPack included) can auto-associate tokens for you (if the wallet supports and you have enabled it). If auto-association is ON, the wallet will sign/approve a lightweight association transaction on first receipt.
2. **Manual association (site initiates a `TokenAssociateTransaction`)**
   - Dino can request an association transaction which the user needs to approve in their wallet. This costs a small amount of HBAR for gas/transaction fee.

**What you must accept**

- When the site asks to associate a token, a wallet popup appears. Accept that transaction to allow receiving NFTs for that token ID.
- If you do not accept association and the contract tries to transfer an NFT to you, the transfer will revert — so association is required.

---

## Minting NFTs (high score flow)

Dino mints a theme NFT when a player achieves a new high score.

Typical flow:

1. Game detects `new high score`.
2. Shows modal: _Whoopy!!! new high score, getting theme token for you._
3. Backend/contract mints an NFT and transfers it to the player's account (or contract mints + transfers).
4. The frontend listens for transaction success and updates the UI.

**Backend example (conceptual)**

- Endpoint: `POST /api/mint-nft` — sends `metadata` or picks next CID, executes `ContractExecuteTransaction` on Hedera testnet via server operator.

**Important**

- The receiving account must be associated with the token. If not, the transaction can fail.
- Ensure the contract has sufficient HBAR if mint function is payable.

---

## Backend & deployment notes

- Keep private keys on the backend only.
- For a free / lightweight hosting:
  - Use platforms like **Coolify**, Vercel (static + serverless), Netlify, or a small VPS.
- In production builds, ensure your bundler (Vite is recommended here) outputs a single set of assets and that your HTML references correct filenames.

---

## Mirror node & verifying NFTs

You can query Hedera mirror node REST APIs to find tokens and token transfers for an account.

**Mirror node endpoints (Testnet)**

- Token balances:  
  `GET https://testnet.mirrornode.hedera.com/api/v1/accounts/{accountId}/balances`
- Token transfers / transactions:  
  `GET https://testnet.mirrornode.hedera.com/api/v1/accounts/{accountId}/tokens`
- NFT specific (tokenId + serials):  
  `GET https://testnet.mirrornode.hedera.com/api/v1/tokens/{tokenId}/nfts`

**Check association**

- `GET /api/v1/accounts/{accountId}/tokens` — if token is listed, the account is associated.

---

## Troubleshooting & common errors

- **`ACCOUNT_NOT_ASSOCIATED_TO_TOKEN`**
  - The recipient account hasn't associated the token. Accept association or enable auto-association in wallet.
- **Contract reverts silently**
  - Ensure proper `require`/`revert` with messages in contract. Increase gas if needed.
- **Static hosting errors**
  - Serve `dist/` with an HTTP server. Do not open `index.html` directly with `file://`.

---

## Credits & License

**Dino** — a hobby project by _Noobisoft Gamers_  
We celebrate open-source and Web3 gaming.

License: MIT
