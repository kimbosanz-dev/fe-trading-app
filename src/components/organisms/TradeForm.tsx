import type { FormEvent } from 'react'
import type { TradeFormValues, TradeSide } from '../../types/trade'

type TradeFormProps = {
  formValues: TradeFormValues
  editingId: string | null
  onFieldChange: <K extends keyof TradeFormValues>(field: K, value: TradeFormValues[K]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onReset: () => void
}

export function TradeForm({
  formValues,
  editingId,
  onFieldChange,
  onSubmit,
  onReset,
}: TradeFormProps) {
  return (
    <aside className="form-panel" aria-label="Trade editor">
      <div className="section-heading compact">
        <h2>{editingId ? 'Amend trade' : 'Create trade'}</h2>
      </div>

      <form onSubmit={onSubmit} className="trade-form">
        <label>
          Trader
          <input
            type="text"
            value={formValues.trader}
            onChange={(event) => onFieldChange('trader', event.target.value)}
            placeholder="A. Foster"
          />
        </label>

        <label>
          Sales
          <input
            type="text"
            value={formValues.sales}
            onChange={(event) => onFieldChange('sales', event.target.value)}
            placeholder="L. Chen"
          />
        </label>

        <label>
          Counterparty
          <input
            type="text"
            value={formValues.counterparty}
            onChange={(event) => onFieldChange('counterparty', event.target.value)}
            placeholder="North Ridge Capital"
          />
        </label>

        <label>
          Instrument
          <input
            type="text"
            value={formValues.instrument}
            onChange={(event) => onFieldChange('instrument', event.target.value)}
            placeholder="EUR/USD"
          />
        </label>

        <div className="field-row">
          <label>
            Side
            <select
              value={formValues.side}
              onChange={(event) => onFieldChange('side', event.target.value as TradeSide)}
            >
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </label>

          <label>
            Quantity
            <input
              type="number"
              min="1"
              step="1"
              value={formValues.quantity}
              onChange={(event) => onFieldChange('quantity', event.target.value)}
              placeholder="250000"
            />
          </label>
        </div>

        <label>
          Price
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={formValues.price}
            onChange={(event) => onFieldChange('price', event.target.value)}
            placeholder="1.0834"
          />
        </label>

        <div className="button-row">
          <button type="submit" className="primary-button">
            {editingId ? 'Save changes' : 'Create trade'}
          </button>
          <button type="button" className="secondary-button subtle" onClick={onReset}>
            Reset
          </button>
        </div>
      </form>
    </aside>
  )
}
