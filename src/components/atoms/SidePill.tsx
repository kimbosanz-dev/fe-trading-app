import type { TradeSide } from '../../types/trade'

type SidePillProps = {
  side: TradeSide
}

export function SidePill({ side }: SidePillProps) {
  const getClassAndLabel = (side: TradeSide) => {
    switch (side) {
      case 'BUY':
        return { className: 'buy', label: 'Buy' }
      case 'SELL':
        return { className: 'sell', label: 'Sell' }
    }
  }

  const { className, label } = getClassAndLabel(side)

  return <span className={`side-pill ${className}`}>{label}</span>
}
