import type { Trade, TradeSide, TradeStatus } from '../types/trade'

const SYMBOLS = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'TSLA',
  'META',
  'NVDA',
  'JPM',
  'BAC',
  'WFC',
  'GS',
  'MS',
  'C',
  'BLK',
  'SCHW',
  'IBKR',
]

const TRADERS = [
  'JSMITH',
  'ABROWN',
  'MJONES',
  'KCHEN',
  'RWALKER',
  'LPARKER',
  'EDAVIS',
  'MWHITE',
  'JMILLER',
  'SGARCIA',
  'PKING',
  'JTAYLOR',
  'CMARTIN',
  'BLEE',
  'ALOPEZ',
  'SHUGHES',
]

const COUNTERPARTIES = [
  'Goldman Sachs',
  'JP Morgan',
  'Morgan Stanley',
  'Bank of America',
  'Citigroup',
  'BlackRock',
  'Vanguard',
  'State Street',
  'Fidelity',
  'Wells Fargo',
  'Credit Suisse',
  'Barclays',
  'Deutsche Bank',
  'UBS',
  'BNY Mellon',
  'Northern Trust',
  'Ameritrade',
  'Interactive Brokers',
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomDecimal(min: number, max: number, decimals: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(decimals))
}

function generateTradeId(): string {
  const num = getRandomInteger(100000, 999999)
  return `TRD-${num}`
}

function generateTimestamp(daysAgo: number = 30): string {
  const now = new Date()
  const pastDate = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000)
  return pastDate.toISOString()
}

function generatePrice(symbol: string): number {
  // Realistic price ranges for different symbols
  const priceRanges: Record<string, [number, number]> = {
    AAPL: [150, 250],
    MSFT: [300, 450],
    GOOGL: [100, 200],
    AMZN: [120, 200],
    TSLA: [200, 400],
    META: [250, 400],
    NVDA: [400, 900],
    JPM: [150, 200],
    BAC: [30, 50],
    WFC: [40, 60],
    GS: [350, 450],
    MS: [80, 120],
    C: [50, 80],
    BLK: [700, 900],
    SCHW: [60, 90],
    IBKR: [100, 150],
  }

  const [min, max] = priceRanges[symbol] || [50, 300]
  return getRandomDecimal(min, max, 2)
}

function generateQuantity(symbol: string): number {
  // Realistic quantity ranges
  const quantityRanges: Record<string, [number, number]> = {
    AAPL: [100, 10000],
    MSFT: [100, 8000],
    GOOGL: [50, 5000],
    AMZN: [100, 5000],
    TSLA: [200, 8000],
    META: [200, 6000],
    NVDA: [100, 5000],
    JPM: [500, 15000],
    BAC: [1000, 25000],
    WFC: [1000, 20000],
    GS: [200, 8000],
    MS: [500, 15000],
    C: [1000, 30000],
    BLK: [100, 5000],
    SCHW: [500, 10000],
    IBKR: [500, 10000],
  }

  const [min, max] = quantityRanges[symbol] || [100, 10000]
  return getRandomInteger(min, max)
}

function generateStatus(): TradeStatus {
  const random = Math.random()
  // 75% ACTIVE, 15% AMENDED, 10% CANCELLED
  if (random < 0.75) return 'ACTIVE'
  if (random < 0.9) return 'AMENDED'
  return 'CANCELLED'
}

function generateSide(): TradeSide {
  return Math.random() < 0.5 ? 'BUY' : 'SELL'
}

export function generateMockTrades(count: number = 150): Trade[] {
  const trades: Trade[] = []
  const usedIds = new Set<string>()

  for (let i = 0; i < count; i++) {
    let tradeId = generateTradeId()
    // Ensure unique trade IDs
    while (usedIds.has(tradeId)) {
      tradeId = generateTradeId()
    }
    usedIds.add(tradeId)

    const symbol = getRandomElement(SYMBOLS)
    const side = generateSide()
    const quantity = generateQuantity(symbol)
    const price = generatePrice(symbol)
    const trader = getRandomElement(TRADERS)
    const sales = getRandomElement(TRADERS)
    const counterparty = getRandomElement(COUNTERPARTIES)
    const tradeDate = generateTimestamp()
    const status = generateStatus()

    const trade: Trade = {
      id: tradeId,
      symbol,
      quantity,
      price,
      side,
      trader,
      tradeDate,
      status,
      sales,
      counterparty,
    }

    trades.push(trade)
  }

  // Sort by tradeDate descending (most recent first)
  return trades.sort(
    (a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime(),
  )
}
