export interface AgentMessageRequest {
  message: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentMessageResponse {
  reply: string;
  sessionId?: string;
  provider: string;
  metadata?: Record<string, unknown>;
}

export interface IAgentProvider {
  readonly name: string;
  sendMessage(request: AgentMessageRequest): Promise<AgentMessageResponse>;
}
