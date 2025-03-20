// API endpoint to fetch all posts with optional filtering

import { getAllPosts } from '../../utils/mdx'

const POSTS_PER_PAGE = 30

export default async function handler(req, res) {
  const { page = 1 } = req.query
  const pageNumber = parseInt(page, 10)

  try {
    // Get all posts and sort them by date
    const allPosts = await getAllPosts()
    const sortedPosts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date))

    // Calculate pagination
    const start = (pageNumber - 1) * POSTS_PER_PAGE
    const end = start + POSTS_PER_PAGE
    const paginatedPosts = sortedPosts.slice(start, end)

    // Trim post data to essential fields
    const trimmedPosts = paginatedPosts.map(post => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      image: post.image,
      readingTime: post.readingTime,
      category: post.category,
      metadata: {
        featured: post.metadata?.featured || false,
        trending: post.metadata?.trending || false
      }
    }))

    // Return paginated data
    res.status(200).json({
      posts: trimmedPosts,
      hasMore: end < sortedPosts.length,
      totalPosts: sortedPosts.length
    })
  } catch (error) {
    console.error('Error in posts API:', error)
    res.status(500).json({ error: 'Error fetching posts' })
  }
} 