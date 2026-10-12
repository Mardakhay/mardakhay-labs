import DashboardCard from '../components/DashboardCard'

function FavoritesPage() {
  return (
    <DashboardCard title="Favorite Prompts">
      <p className="text-zinc-400">
        You have no favorite prompts yet.
      </p>
    </DashboardCard>
  )
}

export default FavoritesPage