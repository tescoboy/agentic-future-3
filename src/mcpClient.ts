/**
 * MCP Client for Browser
 * 
 * Developer Notes:
 * - Use POST for /mcp
 * - Do not set Accept: text/event-stream for tools/call
 * - Only use EventSource for /mcp/sse
 * - If you see the "Not Acceptable" error, you likely set the wrong Accept header or used the SSE path
 */

const MCP_ENDPOINT = 'https://audience-agent.fly.dev/mcp';

// Types
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export interface DeliverTo {
  platforms?: 'all' | Array<{ platform: string; account?: string }>;
  countries?: string[];
}

// Utility helpers
function createJsonRpcRequest(method: string, params?: any, id: string | number = Date.now()): JsonRpcRequest {
  return {
    jsonrpc: '2.0',
    id,
    method,
    params
  };
}

async function makeMcpCall(method: string, params?: any): Promise<JsonRpcResponse> {
  const request = createJsonRpcRequest(method, params);
  
  const response = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/event-stream')) {
    throw new Error('Received event stream response. Use connectSSE() for streaming calls.');
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`MCP error: ${data.error.message} (code: ${data.error.code})`);
  }

  return data;
}

/**
 * List available tools from the MCP endpoint
 */
export async function listTools(): Promise<any> {
  return makeMcpCall('tools/list');
}

/**
 * Get signals using the MCP endpoint
 */
export async function getSignals(
  query: string, 
  deliverTo?: DeliverTo
): Promise<any> {
  const params = {
    name: 'get_signals',
    arguments: {
      query,
      ...(deliverTo ? { deliver_to: deliverTo } : {})
    }
  };

  return makeMcpCall('tools/call', params);
}

/**
 * Connect to Server-Sent Events stream
 */
export function connectSSE(
  onMessage: (data: any) => void, 
  onError?: (err: any) => void
): EventSource {
  const eventSource = new EventSource(`${MCP_ENDPOINT}/sse`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error('Error parsing SSE message:', err);
    }
  };

  if (onError) {
    eventSource.onerror = onError;
  }

  return eventSource;
}
