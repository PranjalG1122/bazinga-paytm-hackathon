import { config, assertEnv } from '../../../config/env.js';
import { AgentIntegrationError, TimeoutError } from '../../../utils/errors.js';
import { AgentMessageRequest, AgentMessageResponse, IAgentProvider } from '../agent.types.js';

interface HermesChatResponse {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  error?: { message?: string; code?: string };
}

/** Calls the local Hermes API server using its OpenAI-compatible endpoint. */
export class HermesAgentProvider implements IAgentProvider {
  readonly name = 'hermes';

  async sendMessage(request: AgentMessageRequest): Promise<AgentMessageResponse> {
    const baseUrl = assertEnv(config.agent.apiUrl, 'HERMES_API_URL').replace(/\/$/, '');
    const apiKey = assertEnv(config.agent.apiKey, 'HERMES_API_KEY');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.agent.timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(request.sessionId
            ? {
                'X-Hermes-Session-Id': request.sessionId,
                'X-Hermes-Session-Key': `paytm:telegram:${request.sessionId}`,
              }
            : {}),
        },
        body: JSON.stringify({
          model: config.agent.model,
          stream: false,
          messages: [
            {
              role: 'system',
              content:
                'You are a Paytm merchant support agent. Use available tools when appropriate. Reply in concise Indian English. Never claim an action succeeded unless a tool confirmed it. Escalate high-risk, irreversible, or unauthorized financial actions.',
            },
            { role: 'user', content: request.message },
          ],
        }),
        signal: controller.signal,
      });

      const raw = await response.text();
      let body: HermesChatResponse;
      try {
        body = JSON.parse(raw) as HermesChatResponse;
      } catch {
        throw new AgentIntegrationError('Hermes returned a non-JSON response', {
          status: response.status,
        });
      }

      if (!response.ok) {
        throw new AgentIntegrationError(
          `Hermes request failed with HTTP ${response.status}: ${body.error?.message || 'Unknown error'}`,
          { status: response.status, code: body.error?.code }
        );
      }

      const choice = body.choices?.[0];
      const reply = choice?.message?.content?.trim();
      if (!reply) {
        throw new AgentIntegrationError('Hermes returned no final response', {
          finishReason: choice?.finish_reason,
        });
      }

      return {
        reply,
        sessionId: request.sessionId,
        provider: this.name,
        metadata: { finishReason: choice?.finish_reason },
      };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new TimeoutError(`Hermes request timed out after ${config.agent.timeoutMs}ms`);
      }
      if (error instanceof AgentIntegrationError || error instanceof TimeoutError) throw error;
      throw new AgentIntegrationError(`Could not reach Hermes: ${(error as Error).message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
