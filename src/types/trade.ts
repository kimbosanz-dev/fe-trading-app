export type TradeSide = 'Buy' | 'Sell'
export type TradeStatus = 'Live' | 'Amended' | 'Cancelled'

export type Trade = {
  id: string
  trader: string
  sales: string
  counterparty: string
  instrument: string
  side: TradeSide
  quantity: number
  price: number
  status: TradeStatus
  createdAt: string
  updatedAt: string
}

export type TradeFormValues = {
  trader: string
  sales: string
  counterparty: string
  instrument: string
  side: TradeSide
  quantity: string
  price: string
}

export const initialTrades: Trade[] = [
  {
    id: 'TRD-1001',
    trader: 'A. Foster',
    sales: 'L. Chen',
    counterparty: 'North Ridge Capital',
    instrument: 'EUR/USD',
    side: 'Buy',
    quantity: 250000,
    price: 1.0834,
    status: 'Live',
    createdAt: '2026-08-31T09:15:00.000Z',
    updatedAt: '2026-08-31T09:15:00.000Z',
  },
  {
    id: 'TRD-1002',
    trader: 'M. Patel',
    sales: 'S. Hall',
    counterparty: 'Blue Harbor Asset Mgmt',
    instrument: 'GBP/JPY',
    side: 'Sell',
    quantity: 180000,
    price: 198.42,
    status: 'Live',
    createdAt: '2026-08-31T09:42:00.000Z',
    updatedAt: '2026-08-31T09:42:00.000Z',
  },
  {
    id: 'TRD-1003',
    trader: 'R. Singh',
    sales: 'H. Lewis',
    counterparty: 'Lumen Advisory',
    instrument: 'US 10Y',
    side: 'Buy',
    quantity: 400,
    price: 113.86,
    status: 'Amended',
    createdAt: '2026-08-31T10:05:00.000Z',
    updatedAt: '2026-08-31T10:12:30.000Z',
  },
  {
    id: 'TRD-1004',
    trader: 'K. Walsh',
    sales: 'P. James',
    counterparty: 'Orchard Partners',
    instrument: 'AAPL',
    side: 'Sell',
    quantity: 1500,
    price: 221.65,
    status: 'Cancelled',
    createdAt: '2026-08-31T08:55:00.000Z',
    updatedAt: '2026-08-31T10:20:45.000Z',
  },
]

export const emptyForm: TradeFormValues = {
  trader: '',
  sales: '',
  counterparty: '',
  instrument: '',
  side: 'Buy',
  quantity: '',
  price: '',
}

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

export const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

export const calculateNotional = (trade: Trade) => trade.quantity * trade.price
