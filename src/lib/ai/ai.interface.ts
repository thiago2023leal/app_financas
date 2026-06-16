export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIProviderConfig {
  apiKey: string
  model?: string
}

/**
 * Interface desacoplada para provedores de IA.
 * Compatível com OpenAI, Claude (Anthropic) e Gemini (Google).
 */
export interface IAIProvider {
  readonly name: string
  readonly defaultModel: string

  /**
   * Envia uma conversa e retorna a próxima mensagem do assistente.
   * @param messages Histórico completo da conversa
   * @param systemPrompt Instruções de sistema (contexto financeiro)
   */
  chat(messages: AIMessage[], systemPrompt?: string): Promise<string>
}
