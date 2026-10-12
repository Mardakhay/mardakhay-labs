import { useQuery } from '@tanstack/react-query'

import DashboardCard from '../components/DashboardCard'

import {
  fetchPosts,
  type Post,
} from '../api/posts'

function DashboardPage() {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  return (
    <div className="grid grid-cols-3 gap-6">
      {isLoading ? (
        <p>Loading posts...</p>
      ) : error ? (
        <p>Something went wrong.</p>
      ) : (
        posts?.map((post) => (
          <DashboardCard
            key={post.id}
            title={post.title}
          >
            <p className="text-zinc-400">
              {post.body}
            </p>
          </DashboardCard>
        ))
      )}
    </div>
  )
}

export default DashboardPage