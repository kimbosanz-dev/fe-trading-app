import type { TradeStatus } from '../../types/trade'

type StatusPillProps = {
  status: TradeStatus
}

export function StatusPill({ status }: StatusPillProps) {
  return <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
}
