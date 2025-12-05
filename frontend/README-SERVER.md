# Running the Frontend with a Local Server

MetaMask requires the frontend to be served over HTTP/HTTPS, not from `file://` protocol.

## Quick Start

### Option 1: Python (Recommended)

**Windows:**
```bash
cd frontend
python -m http.server 8000
```

**Mac/Linux:**
```bash
cd frontend
python3 -m http.server 8000
```

Then open: http://localhost:8000/index-simple.html

### Option 2: Node.js (npx serve)

```bash
cd frontend
npx serve
```

### Option 3: Use the batch file (Windows)

Double-click `start-server.bat` in the frontend folder.

### Option 4: Use Vite (Development)

```bash
cd frontend
npm install
npm run dev
```

## Why?

MetaMask browser extension injects `window.ethereum` only when the page is served over HTTP/HTTPS, not from `file://` protocol. This is a security feature.

## Troubleshooting

If MetaMask still doesn't work:
1. Make sure you're accessing via `http://localhost:8000` (not `file://`)
2. Check browser console (F12) for errors
3. Make sure MetaMask extension is enabled
4. Try refreshing the page

