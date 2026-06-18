import type { IAIProvider, AIMessage, AIToolDefinition, AIChatResult } from './ai.interface'
import Anthropic from '@anthropic-ai/sdk'

export class ClaudeAdapter implements IAIProvider {
  readonly name = 'Claude'
  readonly defaultModel = 'claude-sonnet-4-6'

  async chat(messages: AIMessage[], systemPrompt?: string, tools?: AIToolDefinition[]): Promise<AIChatResult> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY não configurada no servidor.')
    }
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      model: this.defaultModel,
      max_tokens: 1024,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      ...(tools && tools.length > 0 ? { tools: tools as Anthropic.Tool[] } : {}),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    let text = ''
    let toolCall: AIChatResult['toolCall']

    for (const block of response.content) {
      if (block.type === 'text') {
        text += block.text
      } else if (block.type === 'tool_use' && !toolCall) {
        // Extração estruturada apenas — nenhuma ação é executada aqui.
        toolCall = { name: block.name, input: block.input as Record<string, unknown> }
      }
    }

    return { text, toolCall }
  }
}
