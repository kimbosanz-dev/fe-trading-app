import { useEffect, type ReactNode } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: ReactNode
  note?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Generic, reusable confirmation modal.
 * Not tied to any specific feature/business logic — combines atoms
 * (buttons) into a focused UI unit, so it lives at the molecule level.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  note,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) {
    return null
  }

  return (
    <div
      className="dialog-overlay"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className={`dialog-panel${variant === 'danger' ? ' dialog-panel--danger' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? 'confirm-dialog-description' : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <span className={`dialog-icon${variant === 'danger' ? ' dialog-icon--danger' : ''}`} aria-hidden="true">
            {variant === 'danger' ? '!' : '?'}
          </span>

          <div className="dialog-body">
            <p className="dialog-eyebrow">
              {variant === 'danger' ? 'Action required' : 'Please confirm'}
            </p>
            <h2 id="confirm-dialog-title" className="dialog-title">
              {title}
            </h2>

            {description ? (
              <p id="confirm-dialog-description" className="dialog-description">
                {description}
              </p>
            ) : null}

            {note ? <p className="dialog-note">{note}</p> : null}
          </div>
        </div>

        <div className="dialog-actions">
          <button type="button" className="secondary-button subtle" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={variant === 'danger' ? 'cancel-button' : 'primary-button'}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )

}
