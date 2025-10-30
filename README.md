## Noobisoft Monorepo — Web3 Game Demos and Services

This monorepo contains two playable browser games showcasing a cross‑game NFT concept, plus a supporting service for CID/metadata management. The goal is to demonstrate how player achievements and items can be represented as on-chain assets and reused across games.

### Live Demos

- Dino: `https://dino.open-elements.cloud/`
- Pixel Racer: `https://racer.open-elements.cloud/`

You can open these links directly to test the games in your browser. Wallet connection and on‑chain flows are available where applicable.

### Repository Structure

```
noobisoft/
├── dino/          # Dino endless runner with Hedera wallet + NFT mint flow
├── pixel-racer/   # Pixel Racer (Next.js) arcade racer, Web3‑ready
└── nobi-service/  # CID management service (TypeScript/Node)
```

## Projects

### Dino — Blockchain‑Backed Pixel Runner

An endless runner that integrates Hedera wallet flows. When players beat their high score, the app can mint and transfer a theme NFT to their account. Includes guidance for wallet connection (HashPack), testnet HBAR faucet, token association, and verifying NFTs via mirror node APIs.

- Tech: Vite, JS, Hedera wallet flows
- Play online: `https://dino.open-elements.cloud/`
- Local quick start:
  - `cd dino && npm install`
  - `npm run dev` (development)
  - `npm run build` then serve `dist/` (production)

Core capabilities distilled from the project README:

- Wallet connect (HashPack extension/mobile)
- Testnet setup and faucet link
- Token association prompts and flows
- High‑score NFT minting concept and backend notes
- Mirror node endpoints to verify token associations and NFTs

### Pixel Racer — Retro Arcade Racer (Web3‑Ready)

A 3‑lane racer built with Next.js 15 and React 19. Features smooth movement, jumping, progressive speed, retro sounds generated via Web Audio API, mobile controls, and a leaderboard UI. Designed with clear modular architecture and placeholders to integrate wallet, NFT car skins, and on‑chain leaderboard.

- Tech: Next.js 15, React 19, Canvas API, Web Audio API
- Play online: `https://racer.open-elements.cloud/`
- Local quick start:
  - `cd pixel-racer && npm install`
  - `npm run dev` (development)
  - `npm run build && npm run start` (production)
  - `npm run lint` (checks)

Highlights from the project README:

- Progressive difficulty (1.0x → 2.5x)
- Programmatic chiptune sound effects
- Clean, modular component and game‑loop structure
- Web3 integration targets: wallet connect, NFT car skins, on‑chain leaderboard

### Nobi Service — CID Management Service

A TypeScript/Node service that manages and distributes unique CIDs/metadata from a predefined pool. It guarantees one‑time issuance with persistence across restarts and exposes REST endpoints for allocation, stats, and health checks. Useful for coordinating NFT metadata or cross‑game asset distribution.

- Tech: TypeScript, Node.js, Express (ES modules)
- Local quick start:
  - `cd nobi-service && npm install`
  - `npm run dev` (TypeScript via tsx)
  - `npm start` (build + run)
  - Endpoints: `/api/cid`, `/api/stats`, `/health`
- Data files: `data/available_cids.json`, `data/used_cids.json`

## Cross‑Game NFT Concept (High‑Level)

1. Game events (e.g., new high score) trigger minting or assignment of an NFT or metadata entry.
2. Ownership is tied to a player wallet; token association may be required (Hedera).
3. Other games read wallet holdings/metadata to unlock themed skins, visuals, or progression.
4. A small backend (e.g., CID management) coordinates unique metadata/CIDs across apps.

## Local Development

Run projects independently from their directories:

- Dino

  - `cd dino && npm install`
  - `npm run dev` (dev) or `npm run build` and serve `dist/` (prod)

- Pixel Racer

  - `cd pixel-racer && npm install`
  - `npm run dev` (dev), `npm run build && npm run start` (prod)

- Nobi Service
  - `cd nobi-service && npm install`
  - `npm run dev` (dev), `npm start` (prod)

## Notes

- Use the live links to play and validate flows:
  - Dino: `https://dino.open-elements.cloud/`
  - Pixel Racer: `https://racer.open-elements.cloud/`
- Wallet connection is required for certain features (e.g., token association, mint) in Dino.
- For Hedera Testnet, obtain HBAR from `https://portal.hedera.com/faucet`.

## References

- Core of the idea: (Hendrik Ebber's blog)[https://dev.to/hendrikebbers/gaming-web3-how-an-open-and-secure-future-of-ownership-in-games-could-look-2ihf]
