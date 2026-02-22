
/**
 * ATLAS-X MCP REGISTRY (Model Context Protocol)
 * --------------------------------------------
 * This service acts as the 'Universal Tool Connector' standard.
 * Aligning with Anthropic/Google 2026 interoperability benchmarks.
 */

export interface MCPTool {
    id: string;
    name: string;
    description: string;
    endpoint: string;
    status: 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE';
    type: 'DATA_SOURCE' | 'EXECUTION' | 'SEARCH';
    latency: string;
}

class MCPRegistry {
    private static instance: MCPRegistry;
    private tools: MCPTool[] = [
        {
            id: 'mcp-google-search-v4',
            name: 'Google Live Grounding',
            description: 'Real-time web-search indexing via Vertex AI Search.',
            endpoint: 'https://mcp.google.api/v4/search',
            status: 'ACTIVE',
            type: 'SEARCH',
            latency: '150ms'
        },
        {
            id: 'mcp-medical-ehr-node',
            name: 'Medical EHR Connector',
            description: 'Standardized connector for HL7/FHIR hospital datasets.',
            endpoint: 'http://localhost:8080/mcp/medical',
            status: 'ACTIVE',
            type: 'DATA_SOURCE',
            latency: '45ms'
        },
        {
            id: 'mcp-neon-x-engine',
            name: 'Neon-X Model Trainer',
            description: 'Autonomous hyperparameter tuning node for Docker clusters.',
            endpoint: 'tcp://127.0.0.1:9090',
            status: 'ACTIVE',
            type: 'EXECUTION',
            latency: '12ms'
        },
        {
            id: 'mcp-market-intel-v1',
            name: 'Global Market Stream',
            description: 'Real-time financial flow monitoring (NYSE/Crypto).',
            endpoint: 'wss://mcp.market.io/live',
            status: 'ACTIVE',
            type: 'DATA_SOURCE',
            latency: '0.01ms'
        }
    ];

    private constructor() { }

    public static getInstance() {
        if (!MCPRegistry.instance) MCPRegistry.instance = new MCPRegistry();
        return MCPRegistry.instance;
    }

    public getActiveTools(): MCPTool[] {
        return this.tools;
    }

    public mountTool(tool: MCPTool) {
        this.tools.push(tool);
    }
}

export const mcpRegistry = MCPRegistry.getInstance();
