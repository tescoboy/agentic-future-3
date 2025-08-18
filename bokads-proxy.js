/**
 * BOKads Proxy Server
 * 
 * This proxy server integrates the BOKads MCP endpoint with the frontend application.
 * It uses a Python MCP client to communicate with the remote MCP server and provides
 * a REST API that the frontend can consume.
 * 
 * Features:
 * - Real-time signal discovery from BOKads MCP endpoint
 * - Custom segment proposal generation
 * - Normalized response format for frontend compatibility
 * - Error handling and fallback mechanisms
 * 
 * Dependencies:
 * - Node.js with Express
 * - Python with FastMCP client
 * - UV package manager for Python dependencies
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Search for signals using the BOKads MCP endpoint
 * 
 * @param {string} spec - Signal specification (search query)
 * @param {number} limit - Maximum number of results to return
 * @param {string} principal - Optional principal ID for pricing
 * @returns {Object} Normalized signal data and custom proposals
 */
app.get('/api/bokads/search', async (req, res) => {
    try {
        const { spec, limit = 5, principal } = req.query;
        
        if (!spec) {
            return res.status(400).json({ error: 'Missing signal specification' });
        }

        console.log(`🔍 BOKads search: "${spec}" (limit: ${limit})`);
        
        // Use the JSON output Python MCP client
        const pythonScript = path.join(__dirname, '../signals-agent-1/mcp_client_json.py');
        
        const pythonProcess = spawn('uv', [
            'run', 'python', pythonScript, 
            spec,
            limit.toString(),
            principal || ''
        ], {
            cwd: path.join(__dirname, '../signals-agent-1')
        });

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        return new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        // Parse the JSON output from Python MCP client
                        const data = JSON.parse(output);
                        
                        if (data.error) {
                            console.error('Python MCP error:', data.error);
                            res.status(500).json({ 
                                error: 'BOKads search failed', 
                                details: data.error 
                            });
                            return;
                        }
                        
                        // Normalize the signals to match frontend expectations
                        const normalizedSignals = (data.signals || []).map(signal => ({
                            name: signal.name,
                            type: signal.signal_type || 'Audience',
                            platform: signal.data_provider,
                            coverage: signal.coverage_percentage ? `${signal.coverage_percentage.toFixed(1)}%` : 'Unknown',
                            cpm: signal.pricing?.cpm ? `$${signal.pricing.cpm.toFixed(2)}` : 'Unknown',
                            id: signal.signals_agent_segment_id,
                            source: 'BOKads',
                            description: signal.description || `BOKads segment for ${spec} targeting`
                        }));
                        
                        const response = {
                            signals: normalizedSignals,
                            custom_segment_proposals: data.custom_segment_proposals || [],
                            message: data.message || `Found ${normalizedSignals.length} real BOKads signals for "${spec}"`,
                            context_id: data.context_id || `ctx_${Date.now()}_bokads_real`
                        };

                        console.log(`✅ BOKads found ${normalizedSignals.length} real signals`);
                        res.json(response);
                        
                    } catch (parseError) {
                        console.error('Error parsing JSON output:', parseError);
                        console.log('Raw output:', output);
                        
                        res.status(500).json({ 
                            error: 'BOKads search failed', 
                            details: 'Failed to parse JSON output',
                            raw_output: output
                        });
                    }
                } else {
                    console.error('Python process failed:', errorOutput);
                    res.status(500).json({ 
                        error: 'BOKads search failed', 
                        details: errorOutput 
                    });
                }
            });
        });

    } catch (error) {
        console.error('❌ BOKads search error:', error);
        res.status(500).json({ 
            error: 'BOKads search failed', 
            details: error.message 
        });
    }
});

/**
 * Health check endpoint
 * Returns server status and configuration information
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'BOKads Proxy (Real MCP)',
        note: 'Using real MCP endpoint data',
        endpoint: 'https://audience-agent.fly.dev/mcp/',
        version: '1.0.0'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 BOKads Proxy (Real MCP) server running on http://localhost:${PORT}`);
    console.log(`🐍 Using Python MCP client for real data`);
    console.log(`🌐 MCP Endpoint: https://audience-agent.fly.dev/mcp/`);
});
