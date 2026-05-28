import { useEffect } from 'react'
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
  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isLoading) {
        onCancel()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isLoading, onCancel, open])

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-2 pt-4 backdrop-blur-sm sm:items-center sm:px-4'>
      <div className='w-full max-w-md rounded-t-3xl border border-white/10 bg-zinc-950 p-5 shadow-2xl sm:rounded-3xl sm:p-6'>
        <div className='flex items-start gap-4'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200'>
            <AlertTriangle className='h-5 w-5' />
          </div>

          <div>
            <h3 className='text-lg font-semibold text-white'>{title}</h3>
            <p className='mt-2 text-sm leading-6 text-zinc-400'>{description}</p>
          </div>
        </div>

        <div className='mt-6 grid gap-3 sm:flex sm:items-center sm:justify-end'>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className='min-h-12 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className='min-h-12 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
