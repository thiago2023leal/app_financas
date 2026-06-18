import type { AIMessage } from '@/lib/ai/ai.interface'
import type { AIDraft } from './ai-draft'

export type DraftStatus = 'pending' | 'executing' | 'confirmed' | 'cancelled' | 'error'

export interface ChatEntry {
  id: string
  message: AIMessage
  draft?: AIDraft
  draftStatus?: DraftStatus
  draftError?: string
}
