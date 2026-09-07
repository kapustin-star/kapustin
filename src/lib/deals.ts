import { supabase } from './supabase'
import type { Deal } from '../types'

export async function fetchDeals(): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data as Deal[]
}

export interface NewDealInput {
  client: string
  company: string
  contact: string
  amount: number | null
  note: string
}

export async function createDeal(input: NewDealInput): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .insert({ ...input, stage: 'lead' })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Deal
}
