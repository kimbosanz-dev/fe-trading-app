import { type FormEvent, useEffect, useMemo, useState } from 'react'
import './App.css'
import { MetricCard } from './components/molecules/MetricCard'
import { TradeForm } from './components/organisms/TradeForm'
import { TradeTable } from './components/organisms/TradeTable'
import { useTrades } from './hooks/useTrades'
import {
  calculateNotional,
  emptyForm,
  formatMoney,
  formatTime,
  initialTrades,
  type Trade,
  type TradeFormValues,
  type TradeStatus,
  type SortField,
  type SortDirection,
} from './types/trade'

function App() {
  const { trades, isLoading, createTrade, updateTrade, cancelTrade, fetchTrades } =
    useTrades(initialTrades)
  const [formValues, setFormValues] = useState<TradeFormValues>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [feedMessage, setFeedMessage] = useState('Market feed connected')
  const [statusFilter, setStatusFilter] = useState<'All' | TradeStatus>('All')
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
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
    const activeTrades = trades.filter((trade) => trade.status !== 'CANCELLED')
    const openNotional = activeTrades.reduce((sum, trade) => sum + calculateNotional(trade), 0)
    const cancelledTrades = trades.filter((trade) => trade.status === 'CANCELLED').length

    return {
      totalTrades,
      activeTrades: activeTrades.length,
      openNotional,
      cancelledTrades,
    }
  }, [trades])

  const visibleTrades = useMemo(() => {
    const query = searchText.trim().toLowerCase()

    let filtered = trades.filter((trade) => {
      const matchesStatus = statusFilter === 'All' || trade.status === statusFilter
      const matchesSearch =
        query.length === 0 ||
        [trade.id, trade.trader, trade.sales, trade.counterparty, trade.symbol]
          .join(' ')
          .toLowerCase()
          .includes(query)

      return matchesStatus && matchesSearch
    })

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number | null = null
        let bVal: string | number | null = null

        switch (sortField) {
          case 'id':
            aVal = a.id
            bVal = b.id
            break
          case 'symbol':
            aVal = a.symbol
            bVal = b.symbol
            break
          case 'side':
            aVal = a.side
            bVal = b.side
            break
          case 'quantity':
            aVal = a.quantity
            bVal = b.quantity
            break
          case 'price':
            aVal = a.price
            bVal = b.price
            break
          case 'notional':
            aVal = calculateNotional(a)
            bVal = calculateNotional(b)
            break
          case 'trader':
            aVal = a.trader
            bVal = b.trader
            break
          case 'status':
            aVal = a.status
            bVal = b.status
            break
          case 'tradeDate':
            aVal = new Date(a.tradeDate).getTime()
            bVal = new Date(b.tradeDate).getTime()
            break
        }

        if (aVal === null || bVal === null) return 0

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }

        return 0
      })
    }

    return filtered
  }, [searchText, statusFilter, trades, sortField, sortDirection])

  const handleSearchChange = (text: string) => {
    setSearchText(text)
    setCurrentPage(1)
  }

  const handleStatusChange = (status: 'All' | TradeStatus) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

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
      !formValues.symbol.trim()
    ) {
      setFeedMessage('❌ Missing required fields')
      return
    }

    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0) {
      setFeedMessage('❌ Invalid quantity or price')
      return
    }

    const now = new Date().toISOString()

    if (editingId) {
      updateTrade(editingId, formValues)
        .then(() => {
          setFeedMessage(`Trade ${editingId} amended at ${formatTime(now)}`)
          resetForm()
        })
        .catch((error) => {
          setFeedMessage(`❌ ${error.message}`)
        })
    } else {
      createTrade(formValues)
        .then((trade) => {
          setFeedMessage(`New trade ${trade.id} created at ${formatTime(now)}`)
          resetForm()
        })
        .catch((error) => {
          setFeedMessage(`❌ ${error.message}`)
        })
    }
  }

  const handleEdit = (trade: Trade) => {
    setEditingId(trade.id)
    setFormValues({
      trader: trade.trader,
      sales: trade.sales,
      counterparty: trade.counterparty,
      symbol: trade.symbol,
      side: trade.side,
      quantity: String(trade.quantity),
      price: String(trade.price),
    })
  }

  const handleCancel = (tradeId: string) => {
    const targetTrade = trades.find((trade) => trade.id === tradeId)

    if (!targetTrade || targetTrade.status === 'CANCELLED') {
      return
    }

    const now = new Date().toISOString()

    cancelTrade(tradeId)
      .then(() => {
        setFeedMessage(`Trade ${tradeId} cancelled at ${formatTime(now)}`)
      })
      .catch((error) => {
        setFeedMessage(`❌ ${error.message}`)
      })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field - start with ascending
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleRefresh = () => {
    fetchTrades()
      .then(() => {
        setFeedMessage('✓ Data refreshed from API')
        setCurrentPage(1)
      })
      .catch((error: Error) => {
        setFeedMessage(`❌ ${error.message}`)
      })
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
          currentPage={currentPage}
          isLoading={isLoading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onPageChange={setCurrentPage}
          onSort={handleSort}
          onRefresh={handleRefresh}
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
