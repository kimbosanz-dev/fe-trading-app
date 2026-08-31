import type { TradeStatus } from '../../types/trade'

type StatusPillProps = {
  status: TradeStatus
}

export function StatusPill({ status }: StatusPillProps) {
  const getClassAndLabel = (status: TradeStatus) => {
    switch (status) {
      case 'ACTIVE':
        return { className: 'active', label: 'Active' }
      case 'AMENDED':
        return { className: 'amended', label: 'Amended' }
      case 'CANCELLED':
        return { className: 'cancelled', label: 'Cancelled' }
    }
  }

  const { className, label } = getClassAndLabel(status)

  return <span className={`status-pill ${className}`}>{label}</span>
}
