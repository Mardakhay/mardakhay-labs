import DashboardCard from '../components/DashboardCard'
import { useTheme } from '../context/ThemeContext'

function SettingsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const buttonClassName = isDark
    ? 'rounded-lg bg-zinc-800 px-4 py-2 text-white transition-colors hover:bg-zinc-700'
    : 'rounded-lg bg-zinc-100 px-4 py-2 text-zinc-950 transition-colors hover:bg-zinc-200'

  return (
    <DashboardCard title='Settings'>
      <div className='space-y-4'>
        <button className={buttonClassName}>
          Dark Theme
        </button>

        <button className={buttonClassName}>
          Account Settings
        </button>
      </div>
    </DashboardCard>
  )
}

export default SettingsPage
