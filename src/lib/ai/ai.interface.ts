export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIProviderConfig {
  apiKey: string
  model?: string
}

// JSON Schema simplificado — compatível com Anthropic Tool.input_schema
export interface AIToolDefinition {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, unknown>
    required: string[]
  }
}

export interface AIToolCall {
  name: string
  input: Record<string, unknown>
}

export interface AIChatResult {
  text: string
  toolCall?: AIToolCall
}

/**
 * Interface desacoplada para provedores de IA.
 * Compatível com OpenAI, Claude (Anthropic) e Gemini (Google).
 */
export interface IAIProvider {
  readonly name: string
  readonly defaultModel: string

  /**
   * Envia uma conversa e retorna a próxima resposta do assistente.
   * Se `tools` for fornecido e o modelo decidir invocar um deles, o resultado
   * inclui `toolCall` — apenas dados extraídos, nenhuma ação é executada aqui.
   * @param messages Histórico completo da conversa
   * @param systemPrompt Instruções de sistema (contexto financeiro)
   * @param tools Definições de tools disponíveis para extração estruturada
   */
  chat(messages: AIMessage[], systemPrompt?: string, tools?: AIToolDefinition[]): Promise<AIChatResult>
}
