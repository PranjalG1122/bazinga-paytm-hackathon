import { IAgentProvider, AgentMessageRequest, AgentMessageResponse } from '../agent.types.js';

/**
 * Placeholder Agent Provider.
 * Clearly marked placeholder to be replaced with real LLM/Agent API implementation
 * (e.g. Gemini, OpenAI, Claude, or custom webhook agent).
 */
export class PlaceholderAgentProvider implements IAgentProvider {
  readonly name = 'placeholder-agent';

  async sendMessage(request: AgentMessageRequest): Promise<AgentMessageResponse> {
    // TODO: Connect to AGENT_API_URL using AGENT_API_KEY when agent backend is ready
    return {
      reply: `We received your message: "${request.message}". Our team will get back to you shortly.`,
      sessionId: request.sessionId || `session-${Date.now()}`,
      provider: this.name,
      metadata: {
        receivedAt: new Date().toISOString(),
        placeholder: true,
      },
    };
  }
}
