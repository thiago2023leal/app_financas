/**
 * OpenAI adapter — estrutura preparatória.
 * SDK: openai
 *
 * Para ativar:
 * 1. npm install openai
 * 2. Adicionar OPENAI_API_KEY ao .env.local
 */
import type { IAIProvider, AIMessage, AIToolDefinition, AIChatResult } from './ai.interface'

export class OpenAIAdapter implements IAIProvider {
  readonly name = 'OpenAI'
  readonly defaultModel = 'gpt-4o-mini'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async chat(_messages: AIMessage[], _systemPrompt?: string, _tools?: AIToolDefinition[]): Promise<AIChatResult> {
    throw new Error(
      'OpenAI: adicione OPENAI_API_KEY ao .env.local e instale o pacote openai para ativar.'
    )
  }
}
