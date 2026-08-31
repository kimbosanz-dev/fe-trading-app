import type { TradeSide } from '../../types/trade'

type SidePillProps = {
  side: TradeSide
}

export function SidePill({ side }: SidePillProps) {
  return <span className={`side-pill ${side.toLowerCase()}`}>{side}</span>
}
