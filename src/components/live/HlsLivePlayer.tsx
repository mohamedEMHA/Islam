import { useEffect, useRef, useState } from 'react'
import type Hls from 'hls.js'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/format'

interface HlsLivePlayerProps {
  sources: readonly string[]
  title: string
  poster?: string
  className?: string
}

function supportsNativeHls(video: HTMLVideoElement): boolean {
  return video.canPlayType('application/vnd.apple.mpegurl') !== ''
}

export function HlsLivePlayer({ sources, title, poster, className }: HlsLivePlayerProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const sourceIndexRef = useRef(0)
  const [loading, setLoading] = useState(true)
  const [allFailed, setAllFailed] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || sources.length === 0) {
      setAllFailed(true)
      setLoading(false)
      return
    }

    let cancelled = false
    sourceIndexRef.current = 0
    setLoading(true)
    setAllFailed(false)

    const destroyHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }

    const tryNextSource = () => {
      if (cancelled) return

      destroyHls()
      video.removeAttribute('src')
      video.load()

      sourceIndexRef.current += 1
      if (sourceIndexRef.current >= sources.length) {
        setAllFailed(true)
        setLoading(false)
        return
      }

      void loadSource(sourceIndexRef.current)
    }

    const onReady = () => {
      if (cancelled) return
      setLoading(false)
      void video.play().catch(() => {})
    }

    const loadSource = async (index: number) => {
      if (cancelled || index >= sources.length) return

      const src = sources[index]
      setLoading(true)

      if (supportsNativeHls(video)) {
        const onMetadata = () => {
          video.removeEventListener('loadedmetadata', onMetadata)
          onReady()
        }
        const onError = () => {
          video.removeEventListener('error', onError)
          tryNextSource()
        }
        video.addEventListener('loadedmetadata', onMetadata)
        video.addEventListener('error', onError)
        video.src = src
        video.load()
        return
      }

      try {
        const { default: HlsCtor } = await import('hls.js')
        if (cancelled) return

        if (HlsCtor.isSupported()) {
          const hls = new HlsCtor({
            enableWorker: true,
            lowLatencyMode: false,
            capLevelToPlayerSize: false,
            maxMaxBufferLength: 30,
            startLevel: -1,
          })
          hlsRef.current = hls
          hls.loadSource(src)
          hls.attachMedia(video)

          hls.on(HlsCtor.Events.MANIFEST_PARSED, () => {
            onReady()
          })
          hls.on(HlsCtor.Events.ERROR, (_event, data) => {
            if (data.fatal) tryNextSource()
          })
          return
        }
      } catch {
        // fall through to failure
      }

      if (!cancelled) {
        setAllFailed(true)
        setLoading(false)
      }
    }

    void loadSource(0)

    return () => {
      cancelled = true
      destroyHls()
      video.removeAttribute('src')
      video.load()
    }
  }, [sources])

  return (
    <div className={cn('relative w-full h-full overflow-hidden bg-ink-black', className)}>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        title={title}
        poster={poster}
        muted
        autoPlay
        playsInline
        controls
      />

      {loading && !allFailed && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-ink-black/60 text-stone pointer-events-none"
          aria-busy="true"
          aria-live="polite"
        >
          <span className="material-symbols-outlined text-4xl mb-2 animate-pulse">hourglass_empty</span>
          <p className="font-body-md text-body-sm">{t('pages.live.loading')}</p>
        </div>
      )}

      {allFailed && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-ink-black/80 text-stone px-6 text-center"
          role="alert"
        >
          <span className="material-symbols-outlined text-4xl mb-2 text-error">videocam_off</span>
          <p className="font-body-md text-body-md text-ink-soft">{t('pages.live.unavailable')}</p>
        </div>
      )}
    </div>
  )
}
