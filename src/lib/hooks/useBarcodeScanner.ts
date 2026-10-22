import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '@/lib/api/client'

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>
}

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike
  }
}

export function isBarcodeDetectorSupported(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window
}

interface UseBarcodeScannerOptions {
  onDetected: (barcode: string) => void
  enabled: boolean
}

export function useBarcodeScanner({ onDetected, enabled }: UseBarcodeScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const detectorRef = useRef<BarcodeDetectorLike | null>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setActive(false)
  }, [])

  const start = useCallback(async () => {
    if (!isBarcodeDetectorSupported()) {
      setError('unsupported')
      return
    }

    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream

      const video = videoRef.current
      if (!video) {
        stop()
        return
      }

      video.srcObject = stream
      await video.play()

      detectorRef.current = new window.BarcodeDetector!({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
      })

      setActive(true)

      const scan = async () => {
        if (!videoRef.current || !detectorRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(scan)
          return
        }

        try {
          const codes = await detectorRef.current.detect(videoRef.current)
          const value = codes[0]?.rawValue
          if (value) {
            onDetected(value)
            stop()
            return
          }
        } catch {
          // detection frame failed, continue scanning
        }

        rafRef.current = requestAnimationFrame(scan)
      }

      rafRef.current = requestAnimationFrame(scan)
    } catch {
      setError('permission')
      stop()
    }
  }, [onDetected, stop])

  useEffect(() => {
    if (!enabled && active) {
      stop()
    }
  }, [enabled, active, stop])

  useEffect(() => () => stop(), [stop])

  return { videoRef, active, error, start, stop, supported: isBarcodeDetectorSupported() }
}

export function getBarcodeLookupErrorKey(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) return 'pages.halalVerification.errors.notFound'
    if (error.status === 400) return 'pages.halalVerification.errors.invalidBarcode'
    return 'pages.halalVerification.errors.network'
  }
  return 'pages.halalVerification.errors.network'
}
