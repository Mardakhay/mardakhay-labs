import DashboardCard from '../components/DashboardCard'
import { useTheme } from '../context/ThemeContext'

function FavoritesPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <DashboardCard title='Favorite Prompts'>
      <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
        You have no favorite prompts yet.
      </p>
    </DashboardCard>
  )
}

export default FavoritesPage
