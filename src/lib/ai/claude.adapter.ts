import type { IAIProvider, AIMessage } from './ai.interface'
import Anthropic from '@anthropic-ai/sdk'

export class ClaudeAdapter implements IAIProvider {
  readonly name = 'Claude'
  readonly defaultModel = 'claude-sonnet-4-6'

  async chat(messages: AIMessage[], systemPrompt?: string): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY não configurada no servidor.')
    }
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      model: this.defaultModel,
      max_tokens: 1024,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })
    const block = response.content[0]
    return block.type === 'text' ? block.text : ''
  }
}
