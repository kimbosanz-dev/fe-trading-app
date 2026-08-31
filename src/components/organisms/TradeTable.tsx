import type { Trade, TradeStatus } from '../../types/trade'
import { SidePill } from '../atoms/SidePill'
import { StatusPill } from '../atoms/StatusPill'
import { calculateNotional, formatMoney, formatTime } from '../../types/trade'

type TradeTableProps = {
  trades: Trade[]
  editingId: string | null
  searchText: string
  statusFilter: 'All' | TradeStatus
  onSearchChange: (value: string) => void
  onStatusChange: (value: 'All' | TradeStatus) => void
  onEdit: (trade: Trade) => void
  onCancel: (tradeId: string) => void
  onNewTrade: () => void
}

export function TradeTable({
  trades,
  editingId,
  searchText,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onEdit,
  onCancel,
  onNewTrade,
}: TradeTableProps) {
  return (
    <section className="table-panel" aria-label="Trade list">
      <div className="section-heading">
        <h2>Trades</h2>
        <button type="button" className="secondary-button" onClick={onNewTrade}>
          New trade
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <label htmlFor="trade-search" className="sr-only">
            Search trades
          </label>
          <input
            id="trade-search"
            type="search"
            value={searchText}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search trade, counterparty, instrument..."
          />
        </div>

        <label className="filter-box">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value as 'All' | TradeStatus)}
          >
            <option value="All">All</option>
            <option value="Live">Live</option>
            <option value="Amended">Amended</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Trader</th>
              <th>Counterparty</th>
              <th>Instrument</th>
              <th>Side</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Notional</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.length > 0 ? (
              trades.map((trade) => (
                <tr key={trade.id} className={editingId === trade.id ? 'selected-row' : ''}>
                  <td>{trade.id}</td>
                  <td>{trade.trader}</td>
                  <td>{trade.counterparty}</td>
                  <td>{trade.instrument}</td>
                  <td>
                    <SidePill side={trade.side} />
                  </td>
                  <td>{trade.quantity.toLocaleString()}</td>
                  <td>{trade.price.toFixed(2)}</td>
                  <td>{formatMoney(calculateNotional(trade))}</td>
                  <td>
                    <StatusPill status={trade.status} />
                  </td>
                  <td>{formatTime(trade.updatedAt)}</td>
                  <td className="actions-cell">
                    <button type="button" className="action-button" onClick={() => onEdit(trade)}>
                      Amend
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => onCancel(trade.id)}
                      disabled={trade.status === 'Cancelled'}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="empty-state">
                  No trades match the current search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
