export class ApiError extends Error {
  status?: number
  source?: string

  constructor(message: string, status?: number, source?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.source = source
  }
}

const REQUEST_TIMEOUT_MS = 15_000

function isRetryableHttpStatus(status: number): boolean {
  if (status >= 400 && status < 500) {
    return status === 408 || status === 429
  }
  return status >= 500
}

function isNetworkFailure(error: unknown, userSignal?: AbortSignal | null): boolean {
  if (error instanceof ApiError) return false
  if (userSignal?.aborted) return false
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (error instanceof TypeError) return true
  return false
}

function mergeAbortSignals(
  timeoutSignal: AbortSignal,
  userSignal?: AbortSignal | null,
): AbortSignal {
  if (!userSignal) return timeoutSignal
  if (userSignal.aborted) return userSignal

  const controller = new AbortController()
  const abort = () => controller.abort()

  timeoutSignal.addEventListener('abort', abort)
  userSignal.addEventListener('abort', abort)

  return controller.signal
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit & { retries?: number; source?: string },
): Promise<T> {
  const { retries = 2, source, signal: userSignal, ...fetchOptions } = options ?? {}
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS)
    const signal = mergeAbortSignals(timeoutController.signal, userSignal)

    try {
      const response = await fetch(url, { ...fetchOptions, signal })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const statusLabel = response.statusText?.trim() || `HTTP ${response.status}`
        const apiError = new ApiError(
          `Request failed: ${statusLabel}`,
          response.status,
          source,
        )

        if (!isRetryableHttpStatus(response.status) || attempt >= retries) {
          throw apiError
        }

        lastError = apiError
      } else {
        return (await response.json()) as T
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (userSignal?.aborted) {
        throw error instanceof Error ? error : new DOMException('Aborted', 'AbortError')
      }

      if (error instanceof ApiError) {
        lastError = error
      } else if (isNetworkFailure(error, userSignal)) {
        lastError =
          error instanceof Error
            ? error
            : new ApiError('Network request failed', undefined, source)
      } else {
        throw error
      }

      if (attempt >= retries) {
        break
      }
    }

    if (lastError instanceof ApiError && lastError.status !== undefined) {
      if (!isRetryableHttpStatus(lastError.status)) {
        break
      }
    } else if (!(lastError && isNetworkFailure(lastError, userSignal))) {
      break
    }

    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
  }

  throw lastError ?? new ApiError('Unknown fetch error', undefined, source)
}
