import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import { useState, useEffect, useMemo, useCallback } from 'react'
import Header from '../components/Header'
import TopicNav from '../components/home/TopicNav'
import NewsletterSection from '../components/home/NewsletterSection'
import CommunitySection from '../components/home/CommunitySection'
import WatchSection from '../components/home/WatchSection'
import NewArrivalsSection from '../components/home/NewArrivalsSection'
import InfiniteArticles from '../components/home/InfiniteArticles'
import { HotTakeSection, DailyDigestSection, MindblownSection, QuickBitesSection, TrendingDebatesSection, TechInsightsSection, AIFrontierSection, NicheTopicsSection, KnowledgeHubSection } from '../components/home/ViralSections'
import Footer from '../components/layout/Footer'
import CompactCard from '../components/CompactCard'

export default function Home({ posts: serverPosts, hasMore, totalPosts }) {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [posts, setPosts] = useState(serverPosts)
  const [isLoadingMoreNew, setIsLoadingMoreNew] = useState(false)
  const [newArrivalsPage, setNewArrivalsPage] = useState(1)
  const [infinitePosts, setInfinitePosts] = useState([])
  const [isLoadingInfinite, setIsLoadingInfinite] = useState(false)
  const [infinitePage, setInfinitePage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(hasMore)
  const [isClientSideReady, setIsClientSideReady] = useState(false)

  // For demonstration, return a simple page
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Trendiz - AI-powered Tech Trends Blog</title>
        <meta name="description" content="Discover the latest tech trends and insights powered by AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      
      <main className="px-4 py-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to Trendiz</h1>
        <p className="text-xl text-center mb-12">Your AI-powered tech trends blog</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Placeholder cards */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold mb-4">Article {item}</h2>
              <p className="text-gray-600 mb-4">This is a placeholder for an exciting tech article about the latest trends in AI, blockchain, and more.</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">March 19, 2025</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Read more →</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-300"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  )
}

export async function getStaticProps() {
  // In a real app, you'd fetch posts from a database or API
  // For now, return empty data
  return {
    props: {
      posts: [],
      hasMore: false,
      totalPosts: 0
    },
    // Revalidate the page every hour
    revalidate: 3600,
  }
}