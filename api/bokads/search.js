/**
 * BOKads Search API - Vercel Serverless Function
 * 
 * This function provides BOKads signal search functionality for the production deployment.
 * It connects to the real BOKads MCP endpoint at https://audience-agent.fly.dev/mcp/
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { spec, limit = 5, principal } = req.query;
        
        if (!spec) {
            return res.status(400).json({ error: 'Missing signal specification' });
        }

        console.log(`🔍 BOKads search: "${spec}" (limit: ${limit})`);
        
        // Make real API call to BOKads MCP endpoint
        const realBOKadsData = await fetchRealBOKadsData(spec, parseInt(limit));
        
        console.log(`✅ BOKads found ${realBOKadsData.signals.length} real signals`);
        res.status(200).json(realBOKadsData);
        
    } catch (error) {
        console.error('❌ BOKads search error:', error);
        res.status(500).json({ 
            error: 'BOKads search failed', 
            details: error.message 
        });
    }
}

/**
 * Fetch real BOKads data from the MCP endpoint with proper session handling
 */
async function fetchRealBOKadsData(spec, limit) {
    try {
        // First, establish a session with the MCP endpoint
        const sessionResponse = await fetch('https://audience-agent.fly.dev/mcp/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {}
                    },
                    clientInfo: {
                        name: 'gupad-production',
                        version: '1.0.0'
                    }
                }
            })
        });

        if (!sessionResponse.ok) {
            throw new Error(`Session initialization failed: ${sessionResponse.status}`);
        }

        const sessionData = await sessionResponse.json();
        console.log('Session established:', sessionData);

        // Now make the actual search request
        const searchResponse = await fetch('https://audience-agent.fly.dev/mcp/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 2,
                method: 'tools/call',
                params: {
                    name: 'search_signals',
                    arguments: {
                        spec: spec,
                        limit: limit
                    }
                }
            })
        });

        if (!searchResponse.ok) {
            throw new Error(`Search request failed: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        
        if (searchData.error) {
            throw new Error(`MCP error: ${searchData.error.message}`);
        }

        // Extract signals from the MCP response
        const signals = (searchData.result?.content || []).map(signal => ({
            name: signal.name,
            type: signal.signal_type || 'marketplace',
            platform: signal.data_provider || 'LiveRamp (Bridge)',
            coverage: signal.coverage_percentage ? `${signal.coverage_percentage.toFixed(1)}%` : 'Unknown',
            cpm: signal.pricing?.cpm ? `$${signal.pricing.cpm.toFixed(2)}` : 'Unknown',
            id: signal.signals_agent_segment_id,
            source: 'BOKads',
            description: signal.description || `BOKads segment for ${spec} targeting`
        }));

        // Extract custom proposals if available
        const customProposals = searchData.result?.custom_segment_proposals || [];

        return {
            signals: signals,
            custom_segment_proposals: customProposals,
            message: `Found ${signals.length} real BOKads signals for "${spec}"`,
            context_id: `ctx_${Date.now()}_bokads_real`
        };

    } catch (error) {
        console.error('Error fetching real BOKads data:', error);
        
        // If MCP fails, return empty results instead of mock data
        return {
            signals: [],
            custom_segment_proposals: [],
            message: `Failed to fetch real BOKads data: ${error.message}`,
            context_id: `ctx_${Date.now()}_bokads_error`
        };
    }
}
