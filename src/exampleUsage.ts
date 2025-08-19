import { listTools, getSignals, connectSSE } from './mcpClient';

/**
 * Example usage and tests for MCP Client
 */

async function runExamples() {
  console.log('🚀 Starting MCP Client Examples...\n');

  // Test 1: List available tools
  try {
    console.log('📋 Testing listTools()...');
    const toolsResponse = await listTools();
    
    // Assert it contains a tools array
    if (!toolsResponse.result || !Array.isArray(toolsResponse.result.tools)) {
      throw new Error('Response does not contain tools array');
    }
    
    console.log('✅ listTools() successful');
    console.log(`Found ${toolsResponse.result.tools.length} tools:`);
    toolsResponse.result.tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log('');
    
  } catch (error) {
    console.error('❌ listTools() failed:', error);
  }

  // Test 2: Get signals
  try {
    console.log('🔍 Testing getSignals()...');
    const signalsResponse = await getSignals('electric bikes', { 
      platforms: 'all', 
      countries: ['US', 'UK'] 
    });
    
    // Assert jsonrpc is "2.0" and result exists
    if (signalsResponse.jsonrpc !== '2.0') {
      throw new Error('Response is not JSON-RPC 2.0');
    }
    
    if (!signalsResponse.result) {
      throw new Error('Response does not contain result');
    }
    
    console.log('✅ getSignals() successful');
    console.log(`Found ${signalsResponse.result.signals?.length || 0} signals`);
    console.log(`Generated ${signalsResponse.result.custom_segment_proposals?.length || 0} custom proposals`);
    console.log('');
    
  } catch (error) {
    console.error('❌ getSignals() failed:', error);
  }

  // Test 3: SSE Connection
  try {
    console.log('📡 Testing SSE connection...');
    const eventSource = connectSSE(
      (data) => {
        console.log('📨 SSE Message received:', data);
      },
      (error) => {
        console.error('❌ SSE Error:', error);
      }
    );

    // Close SSE after 5 seconds
    setTimeout(() => {
      console.log('🔌 Closing SSE connection...');
      eventSource.close();
    }, 5000);
    
  } catch (error) {
    console.error('❌ SSE connection failed:', error);
  }
}

// Run examples when this file is executed
if (typeof window !== 'undefined') {
  // Browser environment
  window.addEventListener('load', runExamples);
} else {
  // Node.js environment
  runExamples();
}

// Export for use in other modules
export { runExamples };
