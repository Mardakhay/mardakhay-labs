import { useEffect, useState } from 'react'

import DashboardCard from '../components/DashboardCard'

import {
  fetchPosts,
  type Post,
} from '../api/posts'

function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await fetchPosts()

        setPosts(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  return (
    <div className="grid grid-cols-3 gap-6">
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        posts.map((post) => (
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