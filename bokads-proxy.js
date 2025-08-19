/**
 * BOKads Proxy Server
 * 
 * This proxy server integrates the BOKads A2A endpoint with the frontend application.
 * It calls the real A2A endpoint at https://audience-agent.fly.dev/a2a/ and provides
 * a REST API that the frontend can consume.
 * 
 * Features:
 * - Real-time signal discovery from BOKads A2A endpoint
 * - Custom segment proposal generation
 * - Normalized response format for frontend compatibility
 * - Error handling and fallback mechanisms
 * 
 * Dependencies:
 * - Node.js with Express
 * - Fetch API for HTTP requests
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Search for signals using the BOKads A2A endpoint
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
        
        // Call the real A2A endpoint (production)
        const a2aUrl = `https://audience-agent.fly.dev/a2a/?query=${encodeURIComponent(spec)}&max_results=${limit}`;
        if (principal) {
            a2aUrl += `&principal_id=${encodeURIComponent(principal)}`;
        }
        
        console.log(`🌐 Calling A2A endpoint: ${a2aUrl}`);
        
        const response = await fetch(a2aUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`A2A endpoint returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
            console.error('A2A endpoint error:', data.error);
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
            id: signal.id,
            source: 'BOKads',
            description: signal.description || `BOKads segment for ${spec} targeting`
        }));
        
        const responseData = {
            signals: normalizedSignals,
            custom_segment_proposals: data.custom_segment_proposals || [],
            message: data.message || `Found ${normalizedSignals.length} real BOKads signals for "${spec}"`,
            context_id: data.context_id || `ctx_${Date.now()}_bokads_real`
        };

        console.log(`✅ BOKads found ${normalizedSignals.length} real signals from A2A endpoint`);
        res.json(responseData);

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
        service: 'BOKads Proxy (Real A2A)',
        note: 'Using real A2A endpoint data',
        endpoint: 'https://audience-agent.fly.dev/a2a/',
        version: '1.0.0'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 BOKads Proxy (Real A2A) server running on http://localhost:${PORT}`);
    console.log(`🌐 Using A2A endpoint for real data`);
    console.log(`🌐 A2A Endpoint: https://audience-agent.fly.dev/a2a/`);
});
