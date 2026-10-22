import { useCallback, useEffect, useState } from 'react'

let audio: HTMLAudioElement | null = null
let playGeneration = 0
let playingStationId: number | null = null
let loadingStationId: number | null = null
let errorStationId: number | null = null
const listeners = new Set<() => void>()

function notifyListeners(): void {
  listeners.forEach((listener) => listener())
}

export function subscribeRadioPlayer(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getRadioPlayingId(): number | null {
  return playingStationId
}

export function getRadioLoadingId(): number | null {
  return loadingStationId
}

export function getRadioErrorId(): number | null {
  return errorStationId
}

export function clearRadioError(): void {
  errorStationId = null
  notifyListeners()
}

function disposeAudio(): void {
  if (!audio) return
  const el = audio
  audio = null
  el.onplaying = null
  el.onended = null
  el.onerror = null
  el.onstalled = null
  el.pause()
  el.removeAttribute('src')
  el.load()
}

export function stopRadio(): void {
  playGeneration += 1
  disposeAudio()
  playingStationId = null
  loadingStationId = null
  notifyListeners()
}

/** Prefer API URL, then known Qurango mirrors for the same path. */
export function buildRadioUrlCandidates(url: string): string[] {
  const candidates = [url.trim()]
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.replace(/\/$/, '')
    if (parsed.hostname.toLowerCase().includes('qurango.net') && path) {
      candidates.push(`https://backup.qurango.net${path}`)
      candidates.push(`https://Qurango.net${path}`)
      candidates.push(`https://qurango.net${path}`)
    }
  } catch {
    // keep original only
  }
  return [...new Set(candidates.filter(Boolean))]
}

function tryPlayUrl(url: string, generation: number, timeoutMs = 12_000): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    if (generation !== playGeneration) {
      reject(new Error('aborted'))
      return
    }

    const player = new Audio()
    player.preload = 'auto'

    const cleanup = () => {
      window.clearTimeout(timer)
      player.onplaying = null
      player.onerror = null
    }

    const disposeCandidate = () => {
      cleanup()
      player.pause()
      player.removeAttribute('src')
      player.load()
    }

    const timer = window.setTimeout(() => {
      disposeCandidate()
      reject(new Error('timeout'))
    }, timeoutMs)

    player.onplaying = () => {
      cleanup()
      resolve(player)
    }

    player.onerror = () => {
      disposeCandidate()
      reject(new Error('media error'))
    }

    player.src = url
    void player.play().catch((err: unknown) => {
      if (generation !== playGeneration) {
        disposeCandidate()
        return
      }
      const name = err instanceof Error ? err.name : ''
      if (name === 'AbortError') {
        disposeCandidate()
        return
      }
      disposeCandidate()
      reject(err instanceof Error ? err : new Error('play failed'))
    })
  })
}

export async function playRadio(stationId: number, url: string): Promise<void> {
  clearRadioError()
  stopRadio()

  const generation = playGeneration
  loadingStationId = stationId
  notifyListeners()

  const candidates = buildRadioUrlCandidates(url)

  for (const candidate of candidates) {
    if (generation !== playGeneration) return

    try {
      const player = await tryPlayUrl(candidate, generation)
      if (generation !== playGeneration) {
        player.pause()
        player.removeAttribute('src')
        player.load()
        return
      }

      audio = player
      player.onended = () => {
        if (generation !== playGeneration) return
        playingStationId = null
        notifyListeners()
      }
      player.onerror = () => {
        if (generation !== playGeneration || audio !== player) return
        disposeAudio()
        playingStationId = null
        loadingStationId = null
        errorStationId = stationId
        notifyListeners()
      }

      loadingStationId = null
      playingStationId = stationId
      notifyListeners()
      return
    } catch {
      // try next mirror
    }
  }

  if (generation !== playGeneration) return

  loadingStationId = null
  playingStationId = null
  errorStationId = stationId
  notifyListeners()
}

export function useRadioPlayer() {
  const [state, setState] = useState({
    playingId: getRadioPlayingId(),
    loadingId: getRadioLoadingId(),
    errorId: getRadioErrorId(),
  })

  useEffect(
    () =>
      subscribeRadioPlayer(() => {
        setState({
          playingId: getRadioPlayingId(),
          loadingId: getRadioLoadingId(),
          errorId: getRadioErrorId(),
        })
      }),
    [],
  )

  const handlePlay = useCallback((stationId: number, url: string) => {
    if (getRadioPlayingId() === stationId || getRadioLoadingId() === stationId) {
      stopRadio()
      return
    }
    void playRadio(stationId, url)
  }, [])

  return {
    ...state,
    handlePlay,
    stopRadio,
    clearRadioError,
  }
}
