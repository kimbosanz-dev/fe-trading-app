import { type FormEvent, useEffect, useMemo, useState } from 'react'
import './App.css'
import { MetricCard } from './components/molecules/MetricCard'
import { TradeForm } from './components/organisms/TradeForm'
import { TradeTable } from './components/organisms/TradeTable'
import {
  calculateNotional,
  emptyForm,
  formatMoney,
  formatTime,
  initialTrades,
  type Trade,
  type TradeFormValues,
  type TradeStatus,
} from './types/trade'

function App() {
  const [trades, setTrades] = useState<Trade[]>(initialTrades)
  const [formValues, setFormValues] = useState<TradeFormValues>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [feedMessage, setFeedMessage] = useState('Market feed connected')
  const [statusFilter, setStatusFilter] = useState<'All' | TradeStatus>('All')
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTrades((currentTrades) => {
        const eligibleTrades = currentTrades.filter((trade) => trade.status !== 'Cancelled')

        if (eligibleTrades.length === 0) {
          return currentTrades
        }

        const targetTrade = eligibleTrades[Math.floor(Math.random() * eligibleTrades.length)]
        const nextPrice = Number(
          Math.max(0.01, targetTrade.price + (Math.random() - 0.5) * 1.5).toFixed(2),
        )

        return currentTrades.map((trade) =>
          trade.id === targetTrade.id
            ? {
                ...trade,
                price: nextPrice,
                updatedAt: new Date().toISOString(),
              }
            : trade,
        )
      })

      setFeedMessage(
        `Live update at ${new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}`,
      )
    }, 12000)

    return () => window.clearInterval(timer)
  }, [])

  const metrics = useMemo(() => {
    const totalTrades = trades.length
    const activeTrades = trades.filter((trade) => trade.status !== 'Cancelled')
    const openNotional = activeTrades.reduce((sum, trade) => sum + calculateNotional(trade), 0)
    const cancelledTrades = trades.filter((trade) => trade.status === 'Cancelled').length

    return {
      totalTrades,
      activeTrades: activeTrades.length,
      openNotional,
      cancelledTrades,
    }
  }, [trades])

  const visibleTrades = useMemo(() => {
    const query = searchText.trim().toLowerCase()

    return trades.filter((trade) => {
      const matchesStatus = statusFilter === 'All' || trade.status === statusFilter
      const matchesSearch =
        query.length === 0 ||
        [trade.id, trade.trader, trade.sales, trade.counterparty, trade.instrument]
          .join(' ')
          .toLowerCase()
          .includes(query)

      return matchesStatus && matchesSearch
    })
  }, [searchText, statusFilter, trades])

  const handleFieldChange = <K extends keyof TradeFormValues>(
    field: K,
    value: TradeFormValues[K],
  ) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setEditingId(null)
    setFormValues(emptyForm)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const quantity = Number(formValues.quantity)
    const price = Number(formValues.price)

    if (
      !formValues.trader.trim() ||
      !formValues.sales.trim() ||
      !formValues.counterparty.trim() ||
      !formValues.instrument.trim()
    ) {
      return
    }

    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0) {
      return
    }

    const now = new Date().toISOString()

    if (editingId) {
      setTrades((currentTrades) =>
        currentTrades.map((trade) =>
          trade.id === editingId
            ? {
                ...trade,
                trader: formValues.trader.trim(),
                sales: formValues.sales.trim(),
                counterparty: formValues.counterparty.trim(),
                instrument: formValues.instrument.trim(),
                side: formValues.side,
                quantity,
                price,
                status: 'Amended',
                updatedAt: now,
              }
            : trade,
        ),
      )
      setFeedMessage(`Trade ${editingId} amended at ${formatTime(now)}`)
    } else {
      const nextId = `TRD-${Math.floor(Math.random() * 9000 + 1000)}`
      const nextTrade: Trade = {
        id: nextId,
        trader: formValues.trader.trim(),
        sales: formValues.sales.trim(),
        counterparty: formValues.counterparty.trim(),
        instrument: formValues.instrument.trim(),
        side: formValues.side,
        quantity,
        price,
        status: 'Live',
        createdAt: now,
        updatedAt: now,
      }

      setTrades((currentTrades) => [nextTrade, ...currentTrades])
      setFeedMessage(`New trade ${nextId} created at ${formatTime(now)}`)
    }

    resetForm()
  }

  const handleEdit = (trade: Trade) => {
    setEditingId(trade.id)
    setFormValues({
      trader: trade.trader,
      sales: trade.sales,
      counterparty: trade.counterparty,
      instrument: trade.instrument,
      side: trade.side,
      quantity: String(trade.quantity),
      price: String(trade.price),
    })
  }

  const handleCancel = (tradeId: string) => {
    const targetTrade = trades.find((trade) => trade.id === tradeId)

    if (!targetTrade || targetTrade.status === 'Cancelled') {
      return
    }

    const now = new Date().toISOString()

    setTrades((currentTrades) =>
      currentTrades.map((trade) =>
        trade.id === tradeId
          ? {
              ...trade,
              status: 'Cancelled',
              updatedAt: now,
            }
          : trade,
      ),
    )

    setFeedMessage(`Trade ${tradeId} cancelled at ${formatTime(now)}`)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Brokerage Operations</p>
          <h1>Trade Blotter</h1>
        </div>

        <div className="live-status" aria-live="polite">
          <span className="live-dot" aria-hidden="true" />
          {feedMessage}
        </div>
      </header>

      <section className="stats-grid" aria-label="Trade summary stats">
        <MetricCard label="Total trades" value={metrics.totalTrades} />
        <MetricCard label="Open trades" value={metrics.activeTrades} />
        <MetricCard label="Open notional" value={formatMoney(metrics.openNotional)} emphasis />
        <MetricCard label="Cancelled" value={metrics.cancelledTrades} />
      </section>

      <main className="content-grid">
        <TradeTable
          trades={visibleTrades}
          editingId={editingId}
          searchText={searchText}
          statusFilter={statusFilter}
          onSearchChange={setSearchText}
          onStatusChange={setStatusFilter}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onNewTrade={resetForm}
        />

        <TradeForm
          formValues={formValues}
          editingId={editingId}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      </main>
    </div>
  )
}

export default App
