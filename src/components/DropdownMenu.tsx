import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, type LucideIcon } from 'lucide-react'

type DropdownItem<T extends string> = {
  value: T
  label: string
  description?: string
}

type DropdownMenuProps<T extends string> = {
  icon: LucideIcon
  label: string
  value: T
  items: DropdownItem<T>[]
  onChange: (value: T) => void
  align?: 'left' | 'right'
  className?: string
}

function DropdownMenu<T extends string>({
  icon: Icon,
  label,
  value,
  items,
  onChange,
  align = 'left',
  className = '',
}: DropdownMenuProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const selectedLabel = useMemo(
    () => items.find((item) => item.value === value)?.label ?? label,
    [items, label, value]
  )

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  function handleSelect(nextValue: T) {
    onChange(nextValue)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type='button'
        onClick={() => setOpen((current) => !current)}
        aria-haspopup='menu'
        aria-expanded={open}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-white shadow-sm transition-all duration-200 ${
          open
            ? 'border-violet-500/30 bg-violet-500/10 shadow-violet-950/20'
            : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900'
        }`}
      >
        <span className='flex min-w-0 items-center gap-3'>
          <Icon className={`h-4 w-4 shrink-0 transition-colors ${open ? 'text-violet-200' : 'text-zinc-500'}`} />
          <span className='min-w-0 truncate text-sm font-medium'>{selectedLabel}</span>
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180 text-violet-200' : ''}`}
        />
      </button>

      {open ? (
        <div
          role='menu'
          aria-label={label}
          className={`app-menu absolute top-[calc(100%+0.5rem)] z-30 w-full min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl sm:w-72 ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {items.map((item) => {
            const active = item.value === value

            return (
              <button
                key={item.value}
                type='button'
                onClick={() => handleSelect(item.value)}
                className={`flex min-h-12 w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left transition-all duration-200 ${active ? 'bg-violet-500/10 text-violet-100' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'}`}
                role='menuitemradio'
                aria-checked={active}
              >
                <span className='min-w-0'>
                  <span className='block text-sm font-medium'>{item.label}</span>
                  {item.description ? (
                    <span className='mt-0.5 block text-xs leading-5 text-zinc-500'>
                      {item.description}
                    </span>
                  ) : null}
                </span>

                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${active ? 'border-violet-500/30 bg-violet-500/10 text-violet-200' : 'border-zinc-700 text-zinc-500'}`}
                >
                  {active ? <Check className='h-3.5 w-3.5' /> : null}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default DropdownMenu
