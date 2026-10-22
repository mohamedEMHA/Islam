import { useCallback, useEffect, useRef, useState } from 'react'
import {
  calculateZakatViaUmmah,
  toZakatCalculatePayload,
  type NisabStandard,
  type ZakatCalculateData,
  type ZakatCurrency,
} from '@/lib/api/ummah'
import { getXausMetalPrices, type MetalSpotPrices } from '@/lib/api/xaus'
import {
  mapUmmahMetalPrices,
  mapXausMetalPrices,
  verifyMetalPrices,
  type MetalPriceVerification,
} from '@/lib/utils/zakatPrices'

export interface ZakatFormValues {
  currency: ZakatCurrency
  cash: number
  goldGrams: number
  silverGrams: number
  stocks: number
  businessGoods: number
  liabilities: number
  nisabStandard: NisabStandard
}

const DEBOUNCE_MS = 450

export function useZakatCalculator(values: ZakatFormValues) {
  const [result, setResult] = useState<ZakatCalculateData | null>(null)
  const [xausPrices, setXausPrices] = useState<MetalSpotPrices | null>(null)
  const [verification, setVerification] = useState<MetalPriceVerification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const runCalculation = useCallback(async (form: ZakatFormValues, requestId: number) => {
    setLoading(true)
    setError(null)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const [ummahResult, xausResult] = await Promise.all([
        calculateZakatViaUmmah(
          toZakatCalculatePayload({
            cash: form.cash,
            currency: form.currency,
            goldGrams: form.goldGrams,
            silverGrams: form.silverGrams,
            stocks: form.stocks,
            businessGoods: form.businessGoods,
            liabilities: form.liabilities,
            nisabType: form.nisabStandard,
          }),
          controller.signal,
        ),
        getXausMetalPrices(form.currency, controller.signal).catch(() => null),
      ])

      if (requestId !== requestIdRef.current) return

      setResult(ummahResult)
      setXausPrices(xausResult)

      if (xausResult) {
        setVerification(
          verifyMetalPrices(
            mapUmmahMetalPrices(ummahResult),
            mapXausMetalPrices(xausResult),
          ),
        )
      } else {
        setVerification(null)
      }
    } catch (err) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return
      setResult(null)
      setXausPrices(null)
      setVerification(null)
      setError(err instanceof Error ? err.message : 'Failed to calculate Zakat')
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const requestId = ++requestIdRef.current
    const timer = setTimeout(() => {
      void runCalculation(values, requestId)
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [
    values.currency,
    values.cash,
    values.goldGrams,
    values.silverGrams,
    values.stocks,
    values.businessGoods,
    values.liabilities,
    values.nisabStandard,
    runCalculation,
  ])

  const retry = useCallback(() => {
    const requestId = ++requestIdRef.current
    void runCalculation(values, requestId)
  }, [runCalculation, values])

  return {
    result,
    xausPrices,
    verification,
    loading,
    error,
    retry,
  }
}
