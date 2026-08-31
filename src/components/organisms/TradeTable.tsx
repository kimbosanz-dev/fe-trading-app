import type { Trade, TradeStatus, SortField, SortDirection } from '../../types/trade'
import { SidePill } from '../atoms/SidePill'
import { StatusPill } from '../atoms/StatusPill'
import { calculateNotional, formatMoney, formatTime } from '../../types/trade'

const ITEMS_PER_PAGE = 7;

type TradeTableProps = {
  trades: Trade[]
  editingId: string | null
  searchText: string
  statusFilter: 'All' | TradeStatus
  currentPage: number
  isLoading: boolean
  sortField: SortField | null
  sortDirection: SortDirection | null
  onSearchChange: (value: string) => void
  onStatusChange: (value: 'All' | TradeStatus) => void
  onPageChange: (page: number) => void
  onSort: (field: SortField) => void
  onRefresh: () => void
  onEdit: (trade: Trade) => void
  onCancel: (tradeId: string) => void
  onNewTrade: () => void
}

const getSortIndicator = (field: SortField, sortField: SortField | null, sortDir: SortDirection | null) => {
  if (sortField !== field) return ' ◇'
  return sortDir === 'asc' ? ' ▲' : ' ▼'
}

export function TradeTable({
  trades,
  editingId,
  searchText,
  statusFilter,
  currentPage,
  isLoading,
  sortField,
  sortDirection,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onSort,
  onRefresh,
  onEdit,
  onCancel,
  onNewTrade,
}: TradeTableProps) {
  const totalPages = Math.ceil(trades.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTrades = trades.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  return (
    <section className="table-panel" aria-label="Trade list">
      <div className="section-heading">
        <h2>Trades</h2>
        <div className="heading-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh data from API"
          >
            {isLoading ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
          <button type="button" className="secondary-button" onClick={onNewTrade}>
            New trade
          </button>
        </div>
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
            placeholder="Search trade, counterparty, symbol..."
          />
        </div>

        <label className="filter-box">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value as 'All' | TradeStatus)}
          >
            <option value="All">All</option>
            <option value="ACTIVE">Active</option>
            <option value="AMENDED">Amended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className="sort-header"
                  onClick={() => onSort('id')}
                  title="Sort by ID"
                >
                  ID{getSortIndicator('id', sortField, sortDirection)}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header"
                  onClick={() => onSort('trader')}
                  title="Sort by Trader"
                >
                  Trader{getSortIndicator('trader', sortField, sortDirection)}
                </button>
              </th>
              <th>Counterparty</th>
              <th>
                <button
                  type="button"
                  className="sort-header"
                  onClick={() => onSort('symbol')}
                  title="Sort by Symbol"
                >
                  Symbol{getSortIndicator('symbol', sortField, sortDirection)}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header"
                  onClick={() => onSort('side')}
                  title="Sort by Side"
                >
                  Side{getSortIndicator('side', sortField, sortDirection)}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header"
                  onClick={() => onSort('quantity')}
                  title="Sort by Quantity"
                >
                  Qty{getSortIndicator('quantity', sortField, sortDirection)}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header"
                  onClick={() => onSort('price')}
                  title="Sort by Price"
                >
                  Price{getSortIndicator('price', sortField, sortDirection)}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header"
                  onClick={() => onSort('notional')}
                  title="Sort by Notional"
                >
                  Notional{getSortIndicator('notional', sortField, sortDirection)}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header"
                  onClick={() => onSort('status')}
                  title="Sort by Status"
                >
                  Status{getSortIndicator('status', sortField, sortDirection)}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header"
                  onClick={() => onSort('tradeDate')}
                  title="Sort by Trade Date"
                >
                  Trade Date{getSortIndicator('tradeDate', sortField, sortDirection)}
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTrades.length > 0 ? (
              paginatedTrades.map((trade) => (
                <tr key={trade.id} className={editingId === trade.id ? 'selected-row' : ''}>
                  <td>{trade.id}</td>
                  <td>{trade.trader}</td>
                  <td>{trade.counterparty}</td>
                  <td>{trade.symbol}</td>
                  <td>
                    <SidePill side={trade.side} />
                  </td>
                  <td>{trade.quantity.toLocaleString()}</td>
                  <td>{trade.price.toFixed(2)}</td>
                  <td>{formatMoney(calculateNotional(trade))}</td>
                  <td>
                    <StatusPill status={trade.status} />
                  </td>
                  <td>{formatTime(trade.tradeDate)}</td>
                  <td className="actions-cell">
                    <button type="button" className="action-button" onClick={() => onEdit(trade)}>
                      Amend
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => onCancel(trade.id)}
                      disabled={trade.status === 'CANCELLED'}
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

      {trades.length > 0 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            className="pagination-button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  )
}
