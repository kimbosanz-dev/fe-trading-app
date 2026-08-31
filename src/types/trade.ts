import { generateMockTrades } from '../utils/generateMockTrades'

export type TradeSide = 'BUY' | 'SELL'
export type TradeStatus = 'ACTIVE' | 'AMENDED' | 'CANCELLED'

export type Trade = {
  id: string
  symbol: string
  quantity: number
  price: number
  side: TradeSide
  trader: string
  tradeDate: string
  status: TradeStatus
  // Extended fields
  sales: string
  counterparty: string
}

export type TradeFormValues = {
  trader: string
  sales: string
  counterparty: string
  symbol: string
  side: TradeSide
  quantity: string
  price: string
}

export type SortField =
  | 'id'
  | 'symbol'
  | 'side'
  | 'quantity'
  | 'price'
  | 'notional'
  | 'trader'
  | 'status'
  | 'tradeDate'

export type SortDirection = 'asc' | 'desc'


export const initialTrades: Trade[] = generateMockTrades(150)

export const emptyForm: TradeFormValues = {
  trader: '',
  sales: '',
  counterparty: '',
  symbol: '',
  side: 'BUY',
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
