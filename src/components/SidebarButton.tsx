type SidebarButtonProps = {
  title: string
  active?: boolean
  onClick?: () => void
}

function SidebarButton({
  title,
  active = false,
  onClick,
}: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full rounded-lg px-4 py-2 text-left transition-colors
        ${active ? 'bg-zinc-800' : 'hover:bg-zinc-900'}
      `}
    >
      {title}
    </button>
  )
}

export default SidebarButton