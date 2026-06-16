/**
 * Claude (Anthropic) adapter — estrutura preparatória.
 * SDK: @anthropic-ai/sdk
 *
 * Para ativar:
 * 1. npm install @anthropic-ai/sdk
 * 2. Adicionar ANTHROPIC_API_KEY ao .env.local
 * 3. Descomentar a implementação abaixo
 */
import type { IAIProvider, AIMessage } from './ai.interface'

export class ClaudeAdapter implements IAIProvider {
  readonly name = 'Claude'
  readonly defaultModel = 'claude-sonnet-4-6'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async chat(_messages: AIMessage[], _systemPrompt?: string): Promise<string> {
    throw new Error(
      'Claude: adicione ANTHROPIC_API_KEY ao .env.local e instale @anthropic-ai/sdk para ativar.'
    )

    /*
    Implementação futura:

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: this.defaultModel,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    return response.content[0].type === 'text' ? response.content[0].text : ''
    */
  }
}
