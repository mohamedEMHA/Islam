export interface AdhanMuezzin {
  id: string
  labelKey: string
  descKey: string
  urls: string[]
}

const GH_BASE = 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/'

function githubRaw(filename: string): string {
  return `${GH_BASE}${encodeURI(filename)}`
}

const ADHAN_SOURCES: Record<string, string[]> = {
  mishary: [
    '/adhan/mishary.mp3',
    githubRaw('Mishary_Rashid_Alafasy_1_-_Kuwait_(مشاري_راشد_العفاسي_-_الكويت).mp3'),
    githubRaw('Mishary_Al_Afasy_-_HQ_(مشاري_العفاسي).mp3'),
  ],
  makkah: [
    '/adhan/makkah.mp3',
    githubRaw('Muhammad_Khaleel_Raml_-_Al_Haram_Al_Maki_(محمد_خليل_رمل_-_الحرم_المكي).mp3'),
    githubRaw('Ali_Ibn_Ahmad_Mala_HQ.mp3'),
  ],
  madinah: [
    '/adhan/madinah.mp3',
    githubRaw('Adhan_Al_Haram_Al_Madani_-_Al_Madinah_1_(أذان_الحرم_المدني_-_المدينة_المنورة).mp3'),
    githubRaw('Adhan_Al_Haram_Al_Madani_-_Al_Madinah_2_(أذان_الحرم_المدني_-_المدينة_المنورة).mp3'),
  ],
}

export const ADHAN_MUEZZINS: AdhanMuezzin[] = [
  {
    id: 'mishary',
    labelKey: 'pages.adhan.muezzins.mishary',
    descKey: 'pages.adhan.muezzins.misharyDesc',
    urls: ADHAN_SOURCES.mishary,
  },
  {
    id: 'makkah',
    labelKey: 'pages.adhan.muezzins.makkah',
    descKey: 'pages.adhan.muezzins.makkahDesc',
    urls: ADHAN_SOURCES.makkah,
  },
  {
    id: 'madinah',
    labelKey: 'pages.adhan.muezzins.madinah',
    descKey: 'pages.adhan.muezzins.madinahDesc',
    urls: ADHAN_SOURCES.madinah,
  },
]

export function getAdhanUrls(muezzinId?: string): string[] {
  const id = muezzinId ?? 'mishary'
  return ADHAN_SOURCES[id] ?? ADHAN_SOURCES.mishary
}

let audio: HTMLAudioElement | null = null
let playGeneration = 0
let playingMuezzinId: string | null = null
let loadingMuezzinId: string | null = null
let errorMuezzinId: string | null = null
const listeners = new Set<() => void>()

function notifyListeners(): void {
  listeners.forEach((listener) => listener())
}

export function subscribeAdhanPlayer(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAdhanPlayingId(): string | null {
  return playingMuezzinId
}

export function getAdhanLoadingId(): string | null {
  return loadingMuezzinId
}

export function getAdhanErrorId(): string | null {
  return errorMuezzinId
}

function clearAudioHandlers(): void {
  if (!audio) return
  audio.onended = null
  audio.onerror = null
}

function disposeAudio(): void {
  if (!audio) return
  audio.pause()
  clearAudioHandlers()
  audio = null
}

function waitForCanPlay(el: HTMLAudioElement, timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (el.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      resolve()
      return
    }

    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error('adhan load timeout'))
    }, timeoutMs)

    const onReady = () => {
      cleanup()
      resolve()
    }

    const onError = () => {
      cleanup()
      reject(new Error('adhan load error'))
    }

    const cleanup = () => {
      window.clearTimeout(timer)
      el.removeEventListener('canplaythrough', onReady)
      el.removeEventListener('error', onError)
    }

    el.addEventListener('canplaythrough', onReady, { once: true })
    el.addEventListener('error', onError, { once: true })
    el.load()
  })
}

async function tryPlayFromUrls(
  _muezzinId: string,
  urls: string[],
  generation: number,
): Promise<boolean> {
  for (const url of urls) {
    if (generation !== playGeneration) return false
    disposeAudio()
    audio = new Audio(url)
    audio.volume = 1

    try {
      await waitForCanPlay(audio)
      if (generation !== playGeneration) {
        disposeAudio()
        return false
      }
      await audio.play()
      if (generation !== playGeneration) {
        disposeAudio()
        return false
      }
      audio.onended = () => {
        if (generation !== playGeneration) return
        playingMuezzinId = null
        notifyListeners()
      }
      return true
    } catch {
      disposeAudio()
    }
  }

  return false
}

export function unlockAdhanAudio(muezzinId?: string): void {
  const urls = getAdhanUrls(muezzinId)
  disposeAudio()
  audio = new Audio(urls[0])
  audio.volume = 0.001

  void audio
    .play()
    .then(() => {
      audio?.pause()
      if (audio) audio.currentTime = 0
      if (audio) audio.volume = 1
    })
    .catch(() => {
      if (audio) audio.volume = 1
    })
}

export async function playAdhan(muezzinId: string): Promise<boolean> {
  if (playingMuezzinId === muezzinId) {
    stopAdhan()
    return true
  }

  stopAdhan()
  const generation = playGeneration
  loadingMuezzinId = muezzinId
  errorMuezzinId = null
  notifyListeners()

  const ok = await tryPlayFromUrls(muezzinId, getAdhanUrls(muezzinId), generation)

  if (generation !== playGeneration) return false

  loadingMuezzinId = null

  if (!ok) {
    playingMuezzinId = null
    errorMuezzinId = muezzinId
    notifyListeners()
    return false
  }

  playingMuezzinId = muezzinId
  notifyListeners()
  return true
}

export function stopAdhan(): void {
  playGeneration += 1
  disposeAudio()
  playingMuezzinId = null
  loadingMuezzinId = null
  notifyListeners()
}

export function clearAdhanError(): void {
  errorMuezzinId = null
  notifyListeners()
}
