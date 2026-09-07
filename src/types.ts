export type DealStage = 'lead' | 'working' | 'negotiation' | 'success' | 'refused'

export interface Deal {
  id: string
  client: string
  company: string
  contact: string
  amount: number | null
  note: string | null
  stage: DealStage
  user_id: string
  created_at: string
}

export const DEAL_STAGES: { value: DealStage; label: string }[] = [
  { value: 'lead', label: 'Новый лид' },
  { value: 'working', label: 'В работе' },
  { value: 'negotiation', label: 'Переговоры' },
  { value: 'success', label: 'Успех' },
  { value: 'refused', label: 'Отказ' },
]
