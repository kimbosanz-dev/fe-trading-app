import { type FormEvent, useEffect, useMemo, useState } from 'react'
import './App.css'
import { MetricCard } from './components/molecules/MetricCard'
import { ConfirmDialog } from './components/molecules/ConfirmDialog'
import { TradeForm } from './components/organisms/TradeForm'
import { TradeTable } from './components/organisms/TradeTable'
import { useTrades } from './hooks/useTrades'
import { useTradeStream } from './hooks/useTradeStream'
import { TradeServiceError } from './services/tradeService'
import {
  type ApiValidationDetails,
  calculateNotional,
  emptyForm,
  formatMoney,
  formatTime,
  initialTrades,
  type Trade,
  type TradeFormField,
  type TradeFormValues,
  type TradeStatus,
  type SortField,
  type SortDirection,
} from './types/trade'

function App() {
  const { trades, isLoading, error, createTrade, updateTrade, cancelTrade, fetchTrades, upsertTrade } =
    useTrades(initialTrades)
  const [formValues, setFormValues] = useState<TradeFormValues>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<TradeFormField, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [feedMessage, setFeedMessage] = useState('Market feed connected')
  const [streamHighlightId, setStreamHighlightId] = useState<string | null>(null)
  const [pendingCancelTrade, setPendingCancelTrade] = useState<Trade | null>(null)
  const [statusFilter, setStatusFilter] = useState<'All' | TradeStatus>('All')
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null)

  useEffect(() => {
    fetchTrades().catch((fetchError) => {
      const message = fetchError instanceof Error ? fetchError.message : 'Failed to fetch trades'
      setFeedMessage(`❌ ${message}`)
    })
  }, [fetchTrades])

  useTradeStream((eventType, trade) => {
    upsertTrade(trade)

    setStreamHighlightId(trade.id)
    window.setTimeout(() => {
      setStreamHighlightId((current) => (current === trade.id ? null : current))
    }, 2000)

    const action =
      eventType === 'TRADE_CREATED'
        ? 'created'
        : eventType === 'TRADE_AMENDED'
          ? 'amended'
          : 'cancelled'

    setFeedMessage(`🔴 Live: trade ${trade.id} ${action}`)
  })

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
    const fieldKey = field as TradeFormField

    setFormValues((current) => ({
      ...current,
      [field]: value,
    }))
    setFieldErrors((current) => ({ ...current, [fieldKey]: undefined }))
    setFormError(null)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormValues(emptyForm)
    setFieldErrors({})
    setFormError(null)
  }

  const applyBackendValidationErrors = (serviceError: TradeServiceError) => {
    if (serviceError.statusCode !== 400) {
      return
    }

    const details = serviceError.details as ApiValidationDetails | undefined
    const backendFieldErrors = details?.fieldErrors

    if (!backendFieldErrors) {
      setFormError(serviceError.message)
      return
    }

    const nextErrors: Partial<Record<TradeFormField, string>> = {}

    for (const key of Object.keys(backendFieldErrors) as TradeFormField[]) {
      const messages = backendFieldErrors[key]
      if (Array.isArray(messages) && messages.length > 0) {
        nextErrors[key] = messages[0]
      }
    }

    setFieldErrors(nextErrors)
    const formLevelMessage = details?.formErrors?.[0]
    setFormError(formLevelMessage ?? serviceError.message)
  }

  const validateClientSide = (): boolean => {
    const nextErrors: Partial<Record<TradeFormField, string>> = {}

    if (!formValues.trader.trim()) nextErrors.trader = 'Trader is required'
    if (!formValues.sales.trim()) nextErrors.sales = 'Sales is required'
    if (!formValues.counterparty.trim()) nextErrors.counterparty = 'Counterparty is required'
    if (!formValues.symbol.trim()) nextErrors.symbol = 'Symbol is required'

    const quantity = Number(formValues.quantity)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      nextErrors.quantity = 'Quantity must be a positive number'
    }

    const price = Number(formValues.price)
    if (!Number.isFinite(price) || price <= 0) {
      nextErrors.price = 'Price must be a positive number'
    }

    setFieldErrors(nextErrors)
    setFormError(null)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateClientSide()) {
      setFeedMessage('❌ Please fix the form errors and resubmit')
      return
    }

    const now = new Date().toISOString()

    if (editingId) {
      updateTrade(editingId, formValues)
        .then(() => {
          setFieldErrors({})
          setFormError(null)
          setFeedMessage(`Trade ${editingId} amended at ${formatTime(now)}`)
          resetForm()
        })
        .catch((error) => {
          if (error instanceof TradeServiceError) {
            applyBackendValidationErrors(error)
          }
          setFeedMessage(`❌ ${error.message}`)
        })
    } else {
      createTrade(formValues)
        .then((trade) => {
          setFieldErrors({})
          setFormError(null)
          setFeedMessage(`New trade ${trade.id} created at ${formatTime(now)}`)
          resetForm()
        })
        .catch((error) => {
          if (error instanceof TradeServiceError) {
            applyBackendValidationErrors(error)
          }
          setFeedMessage(`❌ ${error.message}`)
        })
    }
  }

  const handleEdit = (trade: Trade) => {
    setEditingId(trade.id)
    setFieldErrors({})
    setFormError(null)
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

    setPendingCancelTrade(targetTrade)
  }

  const dismissCancelDialog = () => {
    setPendingCancelTrade(null)
  }

  const confirmCancelTrade = () => {
    if (!pendingCancelTrade) {
      return
    }

    const tradeId = pendingCancelTrade.id
    const now = new Date().toISOString()

    setPendingCancelTrade(null)

    cancelTrade(tradeId)
      .then(() => {
        setFeedMessage(`Trade ${tradeId} cancelled at ${formatTime(now)}`)
      })
      .catch((error) => {
        if (error instanceof TradeServiceError && error.statusCode === 404) {
          setFeedMessage(`❌ Trade ${tradeId} not found`)
          return
        }
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
        if (error instanceof TradeServiceError && error.statusCode === 404) {
          setFeedMessage('❌ Requested resource was not found')
          return
        }
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
          fetchError={error}
          highlightTradeId={streamHighlightId}
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
          fieldErrors={fieldErrors}
          formError={formError}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      </main>

      <ConfirmDialog
        open={pendingCancelTrade !== null}
        title="Cancel this trade?"
        description={
          pendingCancelTrade ? (
            <>
              You're about to cancel <strong className="dialog-highlight">{pendingCancelTrade.id}</strong>{' '}
              for <strong className="dialog-highlight">{pendingCancelTrade.symbol}</strong> (
              {pendingCancelTrade.quantity.toLocaleString()} @ {pendingCancelTrade.price.toFixed(2)}
              ).
            </>
          ) : undefined
        }
        note="This sets the trade status to CANCELLED and cannot be undone."
        confirmLabel="Cancel trade"
        cancelLabel="Keep trade"
        variant="danger"
        onConfirm={confirmCancelTrade}
        onCancel={dismissCancelDialog}
      />
    </div>
  )
}

export default App
