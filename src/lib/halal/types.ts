export type HalalStatus = 'halal' | 'haram' | 'mushbooh' | 'unknown'

export interface ENumberEntry {
  code: string
  name: string
  status: HalalStatus
  source: string
  notes: string
}

export interface AdditiveResult {
  code: string
  status: HalalStatus
  name?: string
  source?: string
  notes?: string
}

export type ProductVerdict = HalalStatus
