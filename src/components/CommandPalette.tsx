import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FilePlus2,
  Heart,
  LayoutDashboard,
  Library,
  Search,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

import type { Prompt } from '../api/prompts'

type CommandPaletteProps = {
  open: boolean
  prompts: Prompt[]
  onClose: () => void
  onCreatePrompt: () => void
  onNavigate: (path: string) => void
  onOpenPrompt: (promptId: number) => void
}

type CommandItem = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  action: () => void
}

function CommandPalette({
  open,
  prompts,
  onClose,
  onCreatePrompt,
  onNavigate,
  onOpenPrompt,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  function resetState() {
    setQuery('')
    setActiveIndex(-1)
  }

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        resetState()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.setTimeout(() => inputRef.current?.focus(), 0)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  const items = useMemo<CommandItem[]>(() => {
    const baseItems: CommandItem[] = [
      {
        id: 'new-prompt',
        label: 'Create prompt',
        description: 'Open the prompt editor.',
        icon: FilePlus2,
        action: onCreatePrompt,
      },
      {
        id: 'dashboard',
        label: 'Go to dashboard',
        description: 'Open workspace overview.',
        icon: LayoutDashboard,
        action: () => onNavigate('/'),
      },
      {
        id: 'prompts',
        label: 'Go to prompts',
        description: 'Open the prompt library.',
        icon: Library,
        action: () => onNavigate('/prompts'),
      },
      {
        id: 'favorites',
        label: 'Go to favorites',
        description: 'Open starred prompts.',
        icon: Heart,
        action: () => onNavigate('/favorites'),
      },
      {
        id: 'settings',
        label: 'Go to settings',
        description: 'Open workspace settings.',
        icon: Settings,
        action: () => onNavigate('/settings'),
      },
    ]

    const promptItems = prompts.slice(0, 20).map((prompt) => ({
      id: `prompt-${prompt.id}`,
      label: prompt.title || prompt.content.slice(0, 48),
      description: 'Open prompt detail.',
      icon: Sparkles,
      action: () => onOpenPrompt(prompt.id),
    }))

    return [...baseItems, ...promptItems]
  }, [onCreatePrompt, onNavigate, onOpenPrompt, prompts])

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return items

    return items.filter((item) =>
      `${item.label} ${item.description}`.toLowerCase().includes(normalizedQuery)
    )
  }, [items, query])

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => {
        const next = prev < filteredItems.length - 1 ? prev + 1 : 0
        window.setTimeout(() => itemRefs.current[next]?.focus(), 0)
        return next
      })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredItems.length - 1
        window.setTimeout(() => itemRefs.current[next]?.focus(), 0)
        return next
      })
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      const item = filteredItems[activeIndex]
      if (item) {
        item.action()
        resetState()
        onClose()
      }
    }
  }

  if (!open) return null

  return (
    <div
      className='app-modal-backdrop fixed inset-0 z-[80] flex items-start justify-center bg-black/65 px-3 pt-20 backdrop-blur-sm sm:pt-28'
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          resetState()
          onClose()
        }
      }}
    >
      <div className='app-modal-panel w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60'>
        <label className='flex min-h-14 items-center gap-3 border-b border-white/5 px-4 text-white sm:px-5'>
          <Search className='h-4 w-4 text-zinc-500' />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(-1)
            }}
            onKeyDown={handleInputKeyDown}
            placeholder='Search commands and prompts...'
            aria-label='Search commands and prompts'
            className='w-full bg-transparent text-sm outline-none placeholder:text-zinc-500'
          />
        </label>

        <div className='max-h-[min(70vh,34rem)] overflow-y-auto p-2'>
          {filteredItems.length === 0 ? (
            <div className='px-4 py-10 text-center text-sm text-zinc-500'>No command found.</div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon
              const highlighted = index === activeIndex
              return (
                <button
                  key={item.id}
                  ref={(el) => { itemRefs.current[index] = el }}
                  type='button'
                  onClick={() => {
                    item.action()
                    resetState()
                    onClose()
                  }}
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault()
                      const next = index < filteredItems.length - 1 ? index + 1 : 0
                      setActiveIndex(next)
                      itemRefs.current[next]?.focus()
                    } else if (event.key === 'ArrowUp') {
                      event.preventDefault()
                      if (index === 0) {
                        setActiveIndex(-1)
                        inputRef.current?.focus()
                      } else {
                        const prev = index - 1
                        setActiveIndex(prev)
                        itemRefs.current[prev]?.focus()
                      }
                    } else if (event.key === 'Enter') {
                      event.preventDefault()
                      item.action()
                      onClose()
                    }
                  }}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left transition-colors ${
                    highlighted ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200'>
                    <Icon className='h-4 w-4' />
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-sm font-medium text-white'>{item.label}</span>
                    <span className='mt-0.5 block truncate text-xs text-zinc-500'>{item.description}</span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
