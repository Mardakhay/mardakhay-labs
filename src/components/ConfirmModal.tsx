import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'

type ConfirmModalProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const titleId = 'confirm-dialog-title'
  const descriptionId = 'confirm-dialog-description'

  useEffect(() => {
    if (!open) return

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isLoading) {
        onCancel()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements?.length) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    cancelButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)

      const previousElement = previousActiveElementRef.current
      if (previousElement?.isConnected) {
        previousElement.focus()
      }
    }
  }, [isLoading, onCancel, open])

  if (!open) return null

  const portalTarget = typeof document !== 'undefined' ? document.body : null
  if (!portalTarget) return null

  return createPortal(
    <div
      className='app-modal-backdrop fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-4 backdrop-blur-sm'
      onPointerDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onCancel()
        }
      }}
    >
      <div
        ref={modalRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className='app-modal-panel w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-black/50 sm:p-6'
      >
        <div className='flex items-start gap-4'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 shadow-[0_0_32px_rgba(239,68,68,0.12)]'>
            <AlertTriangle className='h-5 w-5' />
          </div>

          <div>
            <h3 id={titleId} className='text-lg font-semibold text-white'>{title}</h3>
            <p id={descriptionId} className='mt-2 text-sm leading-6 text-zinc-400'>{description}</p>
          </div>
        </div>

        <div className='mt-6 grid gap-3 sm:flex sm:items-center sm:justify-end'>
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            disabled={isLoading}
            className='min-h-12 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className='min-h-12 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-all duration-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    portalTarget
  )
}

export default ConfirmModal
