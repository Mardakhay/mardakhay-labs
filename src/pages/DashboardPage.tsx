import { useQuery } from '@tanstack/react-query'

import {
  fetchPosts,
  type Post,
} from '../api/posts'
import DashboardCard from '../components/DashboardCard'

function DashboardPage() {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery<Post[], Error>({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  if (isLoading) {
    return <p>Loading posts...</p>
  }

  if (error) {
    return <p>Something went wrong.</p>
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
      {posts?.map((post) => (
        <DashboardCard key={post.id} title={post.title}>
          <p className='text-zinc-400'>{post.body}</p>
        </DashboardCard>
      ))}
    </div>
  )
}

export default DashboardPage
