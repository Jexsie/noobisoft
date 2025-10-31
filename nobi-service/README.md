# CID Management Service

A TypeScript Node.js service that manages and distributes Customer IDs (CIDs) from a pre-defined pool. Each CID is returned only once and will never be reused, even across server restarts.

## Features

- Written in TypeScript with ES6 modules
- Returns CIDs from a pre-defined pool
- Persistent tracking - used CIDs are saved to disk
- Never reuses CIDs
- RESTful API endpoints
- Statistics tracking (total, used, available)
- Health check endpoint
- Type-safe with full TypeScript support

## Quick Start

### Setup

1. **Add your CIDs** - Edit `data/available_cids.json` with your array of CIDs:

```json
["CID-1001", "CID-1002", "CID-1003", "..."]
```

2. **Install dependencies**

```bash
npm install
```

### Running the Service

```bash
# Production mode (compiles TypeScript and runs)
npm start

# Development mode (runs TypeScript directly with tsx)
npm run dev

# Development mode with auto-restart on file changes
npm run dev:watch

# Build only (compile TypeScript to JavaScript)
npm run build

# Watch mode (automatically recompile on changes)
npm run watch
```

The service will start on `http://localhost:3000` (or the port specified in the PORT environment variable).

**Notes:**

- `npm start` compiles TypeScript to the `dist/` directory first
- `npm run dev` runs TypeScript files directly using `tsx` (faster for development, no compilation needed)
- `npm run dev:watch` uses `tsx watch` for automatic restarts when files change

## API Endpoints

### 1. Generate New CID (GET)

**Endpoint:** `GET /api/cid`

**Description:** Returns the next available CID from the pool.

**Response:**

```json
{
  "success": true,
  "cid": "CID-1001",
  "timestamp": "2025-10-22T10:30:45.123Z",
  "used": 1,
  "available": 19,
  "total": 20
}
```

**Example:**

```bash
curl http://localhost:3000/api/cid
```

### 2. Generate New CID (POST)

**Endpoint:** `POST /api/cid`

**Description:** Returns the next available CID from the pool (alternative REST-compliant endpoint).

**Response:**

```json
{
  "success": true,
  "cid": "CID-1001",
  "timestamp": "2025-10-22T10:30:45.123Z",
  "used": 1,
  "available": 19,
  "total": 20
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/cid
```

### 3. Check if CID is Used

**Endpoint:** `GET /api/cid/:cid/check`

**Description:** Checks if a specific CID has been distributed before.

**Response:**

```json
{
  "cid": "CID-1001",
  "isUsed": true,
  "timestamp": "2025-10-22T10:30:45.123Z"
}
```

**Example:**

```bash
curl http://localhost:3000/api/cid/CID-1001/check
```

### 4. Get Statistics

**Endpoint:** `GET /api/stats`

**Description:** Returns statistics about the CID pool.

**Response:**

```json
{
  "total": 20,
  "used": 5,
  "available": 15,
  "timestamp": "2025-10-22T10:30:45.123Z"
}
```

**Example:**

```bash
curl http://localhost:3000/api/stats
```

### 5. Health Check

**Endpoint:** `GET /health`

**Description:** Returns the service health status.

**Response:**

```json
{
  "status": "healthy",
  "service": "CID Management Service",
  "total": 20,
  "used": 5,
  "available": 15,
  "timestamp": "2025-10-22T10:30:45.123Z"
}
```

**Example:**

```bash
curl http://localhost:3000/health
```

## Configuration

You can configure the service using environment variables:

- `PORT` - Server port (default: 3000)

### Example

```bash
PORT=8080 npm start
```

## Data Persistence

The service uses two data files:

1. **`data/available_cids.json`** - Your pool of available CIDs (you define these)
2. **`data/used_cids.json`** - Tracks which CIDs have been distributed

This ensures that:

- CIDs are never reused, even after server restarts
- The service maintains a complete history of all distributed CIDs
- The uniqueness guarantee is maintained across deployments

## How It Works

1. You provide a list of CIDs in `data/available_cids.json`
2. When a client requests a CID, the service picks the first unused one
3. The CID is marked as used and saved to `data/used_cids.json`
4. That CID will never be returned again
5. When all CIDs are used, the service returns an error

## Testing the Service

```bash
# Test CID generation
curl http://localhost:3000/api/cid

# Generate multiple CIDs
for i in {1..5}; do curl http://localhost:3000/api/cid; echo; done

# Check statistics
curl http://localhost:3000/api/stats

# Health check
curl http://localhost:3000/health
```

## Architecture

```
src/
├── server.ts       # Express server and API endpoints (TypeScript)
├── cidManager.ts   # CID pool management logic (TypeScript)
└── config.ts       # Configuration settings (TypeScript)

dist/               # Compiled JavaScript output (generated)

data/
├── available_cids.json  # Your pool of CIDs (you define these)
└── used_cids.json       # Tracks distributed CIDs

tsconfig.json       # TypeScript configuration
```

## Technology Stack

- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment
- **Express** - Web framework
- **ES6 Modules** - Modern JavaScript module system

## Error Handling

The service includes comprehensive error handling:

- If CID generation fails, a 500 error is returned with details
- All CIDs are validated before being marked as used
- File system errors are caught and logged
- Graceful shutdown on SIGTERM/SIGINT

## Development

### TypeScript

This project is written in TypeScript. The source files are in `src/` and compiled JavaScript output goes to `dist/`.

- Edit TypeScript files in `src/`
- Run `npm run build` to compile
- Run `npm run dev` for development with auto-reload
- Type definitions are included for full IntelliSense support

### Project Structure

- **Source files**: `src/*.ts` (TypeScript)
- **Compiled files**: `dist/*.js` (JavaScript, git-ignored)
- **Type definitions**: `dist/*.d.ts` (generated)

## Production Considerations

1. **Compilation** - Always run `npm run build` before deploying to ensure latest TypeScript changes are compiled
2. **CID Pool Size** - Ensure you have enough CIDs in `available_cids.json` for your needs
3. **Backup** - Regularly backup both `available_cids.json` and `used_cids.json`
4. **Monitoring** - Monitor the `/api/stats` endpoint to track available CIDs
5. **Scaling** - For high-traffic scenarios, consider using a database instead of JSON file storage
6. **Load Balancing** - If running multiple instances, use a shared database for CID storage to avoid conflicts
7. **Replenishment** - Add more CIDs to `available_cids.json` before running out (requires restart)

## License

MIT
