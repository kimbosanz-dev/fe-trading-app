import { generateMockTrades } from '../utils/generateMockTrades'
import type { Trade, TradeFormValues } from '../types/trade'

/**
 * Mock Trade Service
 * Simulates API endpoints with realistic delays and response patterns.
 * Ready to be replaced with real HTTP calls (fetch/axios) without changing consumer code.
 */

class TradeServiceError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'TradeServiceError'
    this.statusCode = statusCode
  }
}

class TradeService {
  private baseDelay = 300 // ms

  /**
   * Simulate network delay
   */
  private async delay(ms?: number): Promise<void> {
    const duration = ms ?? this.baseDelay
    return new Promise((resolve) => setTimeout(resolve, duration))
  }

  /**
   * GET /api/trades - Fetch all trades
   */
  async fetchTrades(): Promise<Trade[]> {
    await this.delay()
    return generateMockTrades(150)
  }

  /**
   * GET /api/trades/:id - Fetch single trade
   */
  async fetchTradeById(id: string): Promise<Trade | null> {
    await this.delay()
    const trades = generateMockTrades(150)
    return trades.find((trade) => trade.id === id) || null
  }

  /**
   * POST /api/trades - Create new trade
   */
  async createTrade(formValues: TradeFormValues): Promise<Trade> {
    // Validate required fields
    if (
      !formValues.trader.trim() ||
      !formValues.sales.trim() ||
      !formValues.counterparty.trim() ||
      !formValues.symbol.trim()
    ) {
      throw new TradeServiceError(400, 'Missing required fields')
    }

    const quantity = Number(formValues.quantity)
    const price = Number(formValues.price)

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new TradeServiceError(400, 'Quantity must be a positive number')
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new TradeServiceError(400, 'Price must be a positive number')
    }

    await this.delay()

    const now = new Date().toISOString()
    const tradeId = `TRD-${Math.floor(Math.random() * 9000 + 1000)}`

    const newTrade: Trade = {
      id: tradeId,
      trader: formValues.trader.trim(),
      sales: formValues.sales.trim(),
      counterparty: formValues.counterparty.trim(),
      symbol: formValues.symbol.trim(),
      side: formValues.side,
      quantity,
      price,
      status: 'ACTIVE',
      tradeDate: now,
    }

    return newTrade
  }

  /**
   * PATCH /api/trades/:id - Update/Amend existing trade
   */
  async updateTrade(id: string, formValues: TradeFormValues): Promise<Trade> {
    // Validate required fields
    if (
      !formValues.trader.trim() ||
      !formValues.sales.trim() ||
      !formValues.counterparty.trim() ||
      !formValues.symbol.trim()
    ) {
      throw new TradeServiceError(400, 'Missing required fields')
    }

    const quantity = Number(formValues.quantity)
    const price = Number(formValues.price)

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new TradeServiceError(400, 'Quantity must be a positive number')
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new TradeServiceError(400, 'Price must be a positive number')
    }

    await this.delay()

    const now = new Date().toISOString()

    const amendedTrade: Trade = {
      id,
      trader: formValues.trader.trim(),
      sales: formValues.sales.trim(),
      counterparty: formValues.counterparty.trim(),
      symbol: formValues.symbol.trim(),
      side: formValues.side,
      quantity,
      price,
      status: 'AMENDED',
      tradeDate: now,
    }

    return amendedTrade
  }

  /**
   * PATCH /api/trades/:id/cancel - Cancel a trade
   */
  async cancelTrade(id: string): Promise<Trade> {
    await this.delay()

    const now = new Date().toISOString()

    const cancelledTrade: Trade = {
      id,
      trader: '',
      sales: '',
      counterparty: '',
      symbol: '',
      side: 'BUY',
      quantity: 0,
      price: 0,
      status: 'CANCELLED',
      tradeDate: now,
    }

    return cancelledTrade
  }
}

export const tradeService = new TradeService()
