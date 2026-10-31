import { IAgentProvider, AgentMessageRequest, AgentMessageResponse } from './agent.types.js';
import { HermesAgentProvider } from './providers/hermes.provider.js';

export class AgentService {
  private provider: IAgentProvider;

  constructor(provider?: IAgentProvider) {
    this.provider = provider || new HermesAgentProvider();
  }

  /**
   * Sets or overrides the agent provider at runtime.
   */
  setProvider(provider: IAgentProvider): void {
    this.provider = provider;
  }

  /**
   * Submits a message to the agent service and retrieves a response.
   */
  async sendMessage(request: AgentMessageRequest): Promise<AgentMessageResponse> {
    if (!request.message || request.message.trim() === '') {
      throw new Error('AgentMessageRequest message cannot be empty');
    }
    return await this.provider.sendMessage(request);
  }
}

export const agentService = new AgentService();
