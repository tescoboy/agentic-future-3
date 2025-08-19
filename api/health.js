/**
 * Health Check API - Vercel Serverless Function
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

    res.status(200).json({ 
        status: 'ok', 
        service: 'BOKads API (Production)',
        note: 'Using production-ready mock data',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
}
