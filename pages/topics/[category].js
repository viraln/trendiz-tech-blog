import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import CompactCard from '../../components/CompactCard'

// Category icons mapping
const categoryIcons = {
  'latest': '📰',
  'ai': '🤖',
  'tech': '💻',
  'blockchain': '🔗',
  'cloud': '☁️',
  'security': '🔒',
  'mobile': '📱',
  'data': '📊',
  'devops': '⚙️',
  'gaming': '🎮',
  'business': '💼',
  'startups': '🚀',
  'finance': '💰',
  'crypto': '₿',
  'markets': '📈',
  'economy': '🏦',
  'science': '🔬',
  'health': '🏥',
  'space': '🚀',
  'climate': '🌍',
  'biology': '🧬',
  'medicine': '💊',
  'entertainment': '🎬',
  'movies': '🎥',
  'music': '🎵',
  'tv': '📺',
  'streaming': '🎯',
  'social': '👥',
  'lifestyle': '🌟',
  'food': '🍳',
  'travel': '✈️',
  'fashion': '👗',
  'sports': '⚽',
  'fitness': '💪',
  'education': '📚',
  'career': '💼',
  'skills': '🎯',
  'learning': '🎓',
  'art': '🎨',
  'design': '✏️',
  'photography': '📸',
  'architecture': '🏛️',
  'society': '🌐',
  'politics': '🏛️',
  'culture': '🎭',
  'environment': '🌱',
  'innovation': '💡',
  'future': '🔮',
  'trends': '📈',
  'research': '🔍',
  'default': '📚'
};

// Background color gradients for different categories
const categoryGradients = {
  'ai': 'from-purple-500 to-indigo-500',
  'tech': 'from-blue-500 to-cyan-500',
  'blockchain': 'from-indigo-500 to-blue-500',
  'cloud': 'from-cyan-500 to-blue-500',
  'security': 'from-gray-700 to-gray-900',
  'gaming': 'from-purple-600 to-pink-500',
  'business': 'from-emerald-500 to-teal-500',
  'finance': 'from-green-500 to-emerald-500',
  'crypto': 'from-yellow-400 to-orange-500',
  'science': 'from-blue-500 to-indigo-600',
  'health': 'from-green-400 to-teal-500',
  'climate': 'from-green-500 to-emerald-600',
  'entertainment': 'from-pink-500 to-rose-500',
  'lifestyle': 'from-orange-400 to-pink-500',
  'food': 'from-orange-500 to-amber-500',
  'travel': 'from-cyan-500 to-blue-500',
  'sports': 'from-blue-600 to-indigo-600',
  'education': 'from-blue-500 to-indigo-500',
  'default': 'from-indigo-600 to-purple-600'
};

export default function CategoryPage({ posts: serverPosts }) {
  const router = useRouter()
  const { category } = router.query
  const [posts, setPosts] = useState(serverPosts || [])
  const [sortBy, setSortBy] = useState('date')
  const [loading, setLoading] = useState(!serverPosts)
  
  const categoryName = category ? 
    category.charAt(0).toUpperCase() + category.slice(1) : 
    'Articles'
    
  const categoryIcon = category && categoryIcons[category.toLowerCase()] || categoryIcons.default
  const gradientClass = category && categoryGradients[category.toLowerCase()] || categoryGradients.default

  // Client-side post enhancement and filtering
  useEffect(() => {
    if (serverPosts) {
      const enhancedPosts = serverPosts.map(post => ({
        ...post,
        trending: Math.random() > 0.7,
        views: Math.floor(Math.random() * 1000) + 100
      }))
      
      setPosts(enhancedPosts)
      setLoading(false)
    } else if (category) {
      // Fetch posts if we're on the client side and don't have server posts
      // First try the new dedicated topics API endpoint
      fetch(`/api/topics?category=${encodeURIComponent(category)}`)
        .then(res => res.json())
        .then(data => {
          // Check if we got posts from the new API
          if (data && data.posts && data.posts.length > 0) {
            // Add client-side only data
            const enhancedPosts = data.posts.map(post => ({
              ...post,
              trending: Math.random() > 0.7,
              views: Math.floor(Math.random() * 1000) + 100
            }))
            
            setPosts(enhancedPosts)
            setLoading(false)
          } else {
            // Fall back to the posts API as before
            return fetch('/api/posts')
              .then(res => res.json())
              .then(data => {
                // Filter by category
                const filteredPosts = data.posts ? data.posts.filter(
                  post => post.category?.toLowerCase() === category.toLowerCase()
                ) : [];
                
                // Add client-side only data
                const enhancedPosts = filteredPosts.map(post => ({
                  ...post,
                  trending: Math.random() > 0.7,
                  views: Math.floor(Math.random() * 1000) + 100
                }))
                
                setPosts(enhancedPosts)
                setLoading(false)
              });
          }
        })
        .catch(error => {
          console.error('Failed to fetch posts from topics API, trying posts API as fallback:', error)
          // Fall back to the posts API
          fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
              // Filter by category
              const filteredPosts = data.posts ? data.posts.filter(
                post => post.category?.toLowerCase() === category.toLowerCase()
              ) : [];
              
              // Add client-side only data
              const enhancedPosts = filteredPosts.map(post => ({
                ...post,
                trending: Math.random() > 0.7,
                views: Math.floor(Math.random() * 1000) + 100
              }))
              
              setPosts(enhancedPosts)
              setLoading(false)
            })
            .catch(err => {
              console.error('Failed to fetch posts:', err)
              setLoading(false)
            });
        })
    }
  }, [serverPosts, category])

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value)
    
    // Sort posts
    const sortedPosts = [...posts]
    if (value === 'date') {
      sortedPosts.sort((a, b) => new Date(b.date) - new Date(a.date))
    } else if (value === 'trending') {
      sortedPosts.sort((a, b) => b.trending ? 1 : -1)
    } else if (value === 'views') {
      sortedPosts.sort((a, b) => (b.views || 0) - (a.views || 0))
    }
    
    setPosts(sortedPosts)
  }

  // Generate SEO metadata
  const pageTitle = `${categoryName} Articles | Trendiingz`
  const pageDescription = `Discover the latest ${categoryName.toLowerCase()} trends and insights. Expert analysis and in-depth coverage on Trendiingz.`

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${category}, trends, articles, news, insights, analysis, Trendiingz`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Trendiingz" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Category Header */}
        <div className={`bg-gradient-to-r ${gradientClass} text-white py-12`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3 mb-3">
              <Link href="/" className="text-white/80 hover:text-white transition-colors duration-200">
                Home
              </Link>
              <svg className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white/80">{categoryName}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{categoryIcon}</span>
              <h1 className="text-3xl font-bold">{categoryName}</h1>
            </div>
            <p className="mt-3 text-white/80 max-w-2xl">
              Discover the latest trends, insights, and analysis in {categoryName.toLowerCase()}.
              Stay informed with expert perspectives and cutting-edge developments.
            </p>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {posts.length} {posts.length === 1 ? 'Article' : 'Articles'} in {categoryName}
              </h2>
            </div>
            <div className="flex space-x-2">
              <label htmlFor="sort" className="sr-only">Sort by</label>
              <select 
                id="sort" 
                className="rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="date">Newest first</option>
                <option value="trending">Trending</option>
                <option value="views">Most viewed</option>
              </select>
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <CompactCard key={post.slug} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-6">We couldn't find any articles in this category yet.</p>
              <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Explore all articles
              </Link>
            </div>
          )}
        </main>

        {/* Related Categories */}
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.keys(categoryIcons)
                .filter(cat => cat !== category?.toLowerCase())
                .slice(0, 12)
                .map(cat => (
                  <Link 
                    key={cat} 
                    href={`/topics/${cat.toLowerCase()}`}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                  >
                    <span className="text-2xl mb-2">{categoryIcons[cat]}</span>
                    <span className="text-sm font-medium capitalize">{cat}</span>
                  </Link>
                ))
              }
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 border-t text-center py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Trendiingz. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  // Generate paths for only the main categories to avoid too many pages at build time
  // Others will be generated on-demand
  const mainCategories = [
    // Common main categories
    'ai', 'tech', 'business', 'science', 'entertainment', 
    // Common pet-related categories 
    'cats', 'dogs', 'pets', 'animals',
    // Common specific categories
    'Feline Communication', 'Pet Psychology', 'Animal Behavior',
    'Body Language', 'Dog Training', 'Pet Care'
  ]
  
  const paths = mainCategories.map(category => ({
    params: { category }
  }))
  
  return {
    paths,
    fallback: 'blocking' // Generate other category pages on-demand
  }
}

export async function getStaticProps({ params }) {
  try {
    // Dynamic import the getAllPosts function
    const { getAllPosts } = await import('../../utils/mdx')
    const allPosts = getAllPosts()
    
    // Filter posts by category
    const categorySlug = params.category.toLowerCase()
    const filteredPosts = allPosts.filter(post => {
      // Check the primary category
      const postCategory = post.category?.toLowerCase() || ''
      
      // Check the categories array (if it exists)
      const hasMatchingCategory = post.categories?.some(cat => 
        cat.name?.toLowerCase() === categorySlug
      ) || false
      
      return postCategory === categorySlug || 
             hasMatchingCategory || 
             (categorySlug === 'latest' && post.isNew)
    })

    return {
      props: { 
        posts: filteredPosts
      }
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    // Return empty posts array if there's an error
    return {
      props: { 
        posts: []
      }
    }
  }
} 