import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

type MenuPosition = {
  top: number
  left: number
  right: number | 'auto'
  width: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
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
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null)

  const selectedLabel = useMemo(
    () => items.find((item) => item.value === value)?.label ?? label,
    [items, label, value]
  )

  function updateMenuPosition() {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const margin = 8
    const gap = 8
    const minWidth = Math.max(rect.width, 288)
    const maxWidth = viewportWidth - margin * 2
    const width = Math.min(minWidth, maxWidth)

    const desiredLeft =
      align === 'right' ? rect.right - width : rect.left

    const left = clamp(desiredLeft, margin, viewportWidth - width - margin)
    const right =
      align === 'right'
        ? clamp(viewportWidth - rect.right, margin, viewportWidth - margin)
        : 'auto'

    setMenuPosition({
      top: rect.bottom + gap,
      left,
      right,
      width,
    })
  }

  useLayoutEffect(() => {
    if (!open) return

    updateMenuPosition()
  }, [open, items.length, align])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null
      const insideTrigger = Boolean(rootRef.current?.contains(target))
      const insideMenu = Boolean(menuRef.current?.contains(target))

      if (!insideTrigger && !insideMenu) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    function handleReposition() {
      updateMenuPosition()
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [open, align])

  function handleSelect(nextValue: T) {
    onChange(nextValue)
    setOpen(false)
  }

  const menu = open && menuPosition ? (
    <div
      ref={menuRef}
      role='menu'
      aria-label={label}
      className='app-menu fixed z-[120] min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl'
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        right: menuPosition.right === 'auto' ? 'auto' : `${menuPosition.right}px`,
        width: `${menuPosition.width}px`,
        maxWidth: 'calc(100vw - 16px)',
      }}
    >
      {items.map((item) => {
        const active = item.value === value

        return (
          <button
            key={item.value}
            type='button'
            onClick={() => handleSelect(item.value)}
            className={`flex min-h-12 w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
              active
                ? 'bg-violet-500/10 text-violet-100'
                : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
            }`}
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
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                active
                  ? 'border-violet-500/30 bg-violet-500/10 text-violet-200'
                  : 'border-zinc-700 text-zinc-500'
              }`}
            >
              {active ? <Check className='h-3.5 w-3.5' /> : null}
            </span>
          </button>
        )
      })}
    </div>
  ) : null

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
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
          <Icon
            className={`h-4 w-4 shrink-0 transition-colors ${
              open ? 'text-violet-200' : 'text-zinc-500'
            }`}
          />
          <span className='min-w-0 truncate text-sm font-medium'>
            {selectedLabel}
          </span>
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${
            open ? 'rotate-180 text-violet-200' : ''
          }`}
        />
      </button>

      {typeof document !== 'undefined'
        ? open
          ? createPortal(menu, document.body)
          : null
        : menu}
    </div>
  )
}

export default DropdownMenu
