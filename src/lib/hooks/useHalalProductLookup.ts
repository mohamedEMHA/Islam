import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '@/lib/api/client'
import {
  fetchProductByBarcode,
  getIngredientsText,
  getProductDisplayName,
  getProductImageUrl,
  isValidBarcode,
  type OpenFoodFactsResponse,
} from '@/lib/api/openFoodFacts'
import { analyzeProduct, type ProductAnalysis } from '@/lib/halal/verdict'

interface ProductLookupState {
  loading: boolean
  error: string | null
  response: OpenFoodFactsResponse | null
  analysis: ProductAnalysis | null
}

const initialState: ProductLookupState = {
  loading: false,
  error: null,
  response: null,
  analysis: null,
}

export function useHalalProductLookup(debounceMs = 400) {
  const [state, setState] = useState<ProductLookupState>(initialState)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setState(initialState)
  }, [])

  const lookup = useCallback(
    (barcode: string) => {
      abortRef.current?.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)

      const trimmed = barcode.trim()
      if (!trimmed) {
        setState(initialState)
        return
      }

      if (!isValidBarcode(trimmed)) {
        setState({
          loading: false,
          error: 'pages.halalVerification.errors.invalidBarcode',
          response: null,
          analysis: null,
        })
        return
      }

      setState((prev) => ({ ...prev, loading: true, error: null }))

      debounceRef.current = setTimeout(async () => {
        const controller = new AbortController()
        abortRef.current = controller

        try {
          const response = await fetchProductByBarcode(trimmed, controller.signal)
          const product = response.product!
          const analysis = analyzeProduct({
            ingredientsText: getIngredientsText(product),
            additiveTags: product.additives_tags,
            labelsTags: product.labels_tags,
          })

          setState({
            loading: false,
            error: null,
            response,
            analysis,
          })
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return

          const errorKey =
            error instanceof ApiError && error.status === 404
              ? 'pages.halalVerification.errors.notFound'
              : error instanceof ApiError && error.status === 400
                ? 'pages.halalVerification.errors.invalidBarcode'
                : 'pages.halalVerification.errors.network'

          setState({
            loading: false,
            error: errorKey,
            response: null,
            analysis: null,
          })
        }
      }, debounceMs)
    },
    [debounceMs],
  )

  useEffect(
    () => () => {
      abortRef.current?.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    [],
  )

  const product = state.response?.product
  const productName = product ? getProductDisplayName(product) : undefined
  const productImage = product ? getProductImageUrl(product) : undefined
  const ingredientsText = product ? getIngredientsText(product) : undefined

  return {
    ...state,
    lookup,
    reset,
    productName,
    productImage,
    ingredientsText,
    barcode: state.response?.code,
  }
}
