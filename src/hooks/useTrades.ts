import { useCallback, useState } from 'react'
import { tradeService } from '../services/tradeService'
import type { Trade, TradeFormValues } from '../types/trade'

type UseTradesState = {
  trades: Trade[]
  isLoading: boolean
  error: string | null
}

export function useTrades(initialTrades: Trade[]) {
  const [state, setState] = useState<UseTradesState>({
    trades: initialTrades,
    isLoading: false,
    error: null,
  })

  /**
   * Fetch all trades from the service
   */
  const fetchTrades = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const trades = await tradeService.listTrades()
      setState({ trades, isLoading: false, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trades'
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      throw error
    }
  }, [])

  /**
   * Create a new trade
   */
  const createTrade = useCallback(
    async (formValues: TradeFormValues) => {
      try {
        const newTrade = await tradeService.createTrade(formValues)
        setState((prev) => ({
          ...prev,
          trades: [newTrade, ...prev.trades],
          error: null,
        }))
        return newTrade
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create trade'
        setState((prev) => ({ ...prev, error: message }))
        throw error
      }
    },
    [],
  )

  /**
   * Update an existing trade
   */
  const updateTrade = useCallback(
    async (id: string, formValues: TradeFormValues) => {
      try {
        const updatedTrade = await tradeService.amendTrade(id, formValues)
        setState((prev) => ({
          ...prev,
          trades: prev.trades.map((t) => (t.id === id ? updatedTrade : t)),
          error: null,
        }))
        return updatedTrade
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update trade'
        setState((prev) => ({ ...prev, error: message }))
        throw error
      }
    },
    [],
  )

  /**
   * Cancel a trade
   */
  const cancelTrade = useCallback(
    async (id: string) => {
      try {
        const cancelledTrade = await tradeService.cancelTrade(id)
        setState((prev) => ({
          ...prev,
          trades: prev.trades.map((t) => (t.id === id ? cancelledTrade : t)),
          error: null,
        }))
        return cancelledTrade
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to cancel trade'
        setState((prev) => ({ ...prev, error: message }))
        throw error
      }
    },
    [],
  )

  return {
    trades: state.trades,
    isLoading: state.isLoading,
    error: state.error,
    fetchTrades,
    createTrade,
    updateTrade,
    cancelTrade,
  }
}
