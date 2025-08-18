# Signals Agent Frontend

A modern web application for discovering and activating advertising signals from multiple sources including GupAds and BOKads.

## Features

- **Multi-Source Signal Discovery**: Search across GupAds (A2A protocol) and BOKads (MCP protocol)
- **Real-Time Results**: Get live signal data with coverage and pricing information
- **Custom Segment Proposals**: AI-generated custom segments for targeted advertising
- **Clean, Modern UI**: Bootstrap-based responsive design
- **Source Filtering**: Choose between GupAds only, BOKads only, or both sources

## Architecture

```
Frontend (localhost:8000)
├── index.html          # Main application interface
├── app.js             # Frontend JavaScript logic
├── styles.css         # Custom styling
└── package.json       # Node.js dependencies

BOKads Proxy (localhost:3001)
├── bokads-proxy.js    # Node.js proxy server
└── Python MCP Client  # Connects to MCP endpoint

Backend Services
├── GupAds API         # https://signals-agent-backend.onrender.com
└── BOKads MCP         # https://audience-agent.fly.dev/mcp/
```

## Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (for BOKads MCP client)
cd ../signals-agent-1
uv sync
```

### 2. Start the BOKads Proxy

```bash
# Start the BOKads proxy server
node bokads-proxy.js
```

The proxy will start on `http://localhost:3001` and connect to the BOKads MCP endpoint.

### 3. Start the Frontend Server

```bash
# Start the frontend HTTP server
python3 -m http.server 8000
```

The application will be available at `http://localhost:8000`.

## Usage

1. **Open the Application**: Navigate to `http://localhost:8000`
2. **Enter Search Query**: Type your signal specification (e.g., "luxury automotive")
3. **Select Ad Source**: Choose from:
   - **Both** (default): Search both GupAds and BOKads
   - **GupAds only**: Search only GupAds signals
   - **BOKads only**: Search only BOKads signals
4. **Set Results Limit**: Choose how many results to display (5, 10, 20, 50)
5. **Search**: Click the search button to discover signals
6. **View Results**: See signals with coverage, pricing, and source information
7. **Activate Signals**: Click "Activate" to activate signals for your campaigns

## API Endpoints

### BOKads Proxy (`localhost:3001`)

- `GET /api/bokads/search?spec={query}&limit={number}&principal={id}`
  - Search for BOKads signals
  - Returns normalized signal data and custom proposals

- `GET /health`
  - Health check endpoint
  - Returns server status and configuration

### GupAds Backend (`signals-agent-backend.onrender.com`)

- `GET /api/signals?spec={query}&max_results={number}`
  - Search for GupAds signals
  - Returns signal data and custom proposals

## Signal Sources

### GupAds (A2A Protocol)
- **Provider**: GupAds backend service
- **Protocol**: A2A (AdCP)
- **Features**: Real-time signal discovery, custom proposals

### BOKads (MCP Protocol)
- **Provider**: LiveRamp, Asterisks.com, AlarisPeople, 123Push
- **Protocol**: MCP (Model Context Protocol)
- **Features**: AI-powered segments, custom proposals, real-time pricing

## Development

### Project Structure

```
agentic-future-3/
├── index.html              # Main application
├── app.js                  # Frontend JavaScript
├── styles.css              # Custom styles
├── bokads-proxy.js         # BOKads proxy server
├── package.json            # Node.js dependencies
└── README.md              # This file

signals-agent-1/
├── mcp_client_json.py      # Python MCP client
├── pyproject.toml          # Python dependencies
└── .venv/                  # Python virtual environment
```

### Adding New Signal Sources

1. Create a new proxy server (similar to `bokads-proxy.js`)
2. Update `app.js` to include the new source in the search logic
3. Add the source option to the dropdown in `index.html`
4. Update the `displayResults` function to handle the new source format

### Troubleshooting

**BOKads Proxy Not Starting**
- Ensure Python dependencies are installed: `cd ../signals-agent-1 && uv sync`
- Check that the MCP endpoint is accessible: `curl https://audience-agent.fly.dev/mcp/`

**Frontend Not Loading**
- Verify the HTTP server is running: `python3 -m http.server 8000`
- Check browser console for JavaScript errors

**No Search Results**
- Check proxy server logs for errors
- Verify both proxy and backend services are running
- Test individual endpoints: `curl http://localhost:3001/health`

## License

This project is part of the Signals Agent ecosystem for advertising signal discovery and activation.
