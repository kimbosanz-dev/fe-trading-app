import type { ApiErrorResponse, Trade, TradeFormValues } from '../types/trade'

/**
 * Trade API service
 * Integrates with backend REST endpoints.
 */

class TradeServiceError extends Error {
  statusCode: number
  code?: string
  details?: unknown

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'TradeServiceError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

class TradeService {
  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = new Headers(options?.headers)
    headers.set('Content-Type', 'application/json')

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let apiError: ApiErrorResponse | null = null

      try {
        apiError = (await response.json()) as ApiErrorResponse
      } catch {
        // apiError remains null if JSON parsing fails
      }

      throw new TradeServiceError(
        response.status,
        apiError?.message ?? 'Request failed',
        apiError?.code,
        apiError?.details,
      )
    }

    return (await response.json()) as T
  }

  /**
   * GET /api/trades - Fetch all trades
   */
  async listTrades(): Promise<Trade[]> {
    return this.request<Trade[]>('/trades')
  }

  /**
   * GET /api/trades/:id - Fetch single trade
   */
  async getTradeById(id: string): Promise<Trade> {
    return this.request<Trade>(`/trades/${id}`)
  }

  /**
   * POST /api/trades - Create new trade
   */
  async createTrade(formValues: TradeFormValues): Promise<Trade> {
    return this.request<Trade>('/trades', {
      method: 'POST',
      body: JSON.stringify(formValues),
    })
  }

  /**
   * PATCH /api/trades/:id - Update/Amend existing trade
   */
  async amendTrade(id: string, formValues: TradeFormValues): Promise<Trade> {
    return this.request<Trade>(`/trades/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(formValues),
    })
  }

  /**
   * PATCH /api/trades/:id/cancel - Cancel a trade
   */
  async cancelTrade(id: string): Promise<Trade> {
    return this.request<Trade>(`/trades/${id}/cancel`, {
      method: 'PATCH',
    })
  }

  /**
   * GET /api/trades/stream - Server-Sent Events URL for live trade updates
   */
  getStreamUrl(): string {
    return `${this.baseUrl}/trades/stream`
  }
}

export const tradeService = new TradeService()
export { TradeServiceError }
