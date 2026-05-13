export type Post = {
  id: number
  title: string
  body: string
}

export async function fetchPosts() {
  const response = await fetch(
    'https://jsonplaceholder.typicode.com/posts?_limit=3'
  )

  if (!response.ok) {
    throw new Error('Failed to fetch posts')
  }

  return response.json() as Promise<Post[]>
}