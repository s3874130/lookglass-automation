'use client'

import { useState, useEffect, useMemo, useRef } from "react"
import { CLAIM_COLORS } from "./constants"
import { extractClaimLabel } from "@/lib/utils"

export function useArticleFeed() {
    const [articles, setArticles] = useState<any[]>([])
    const [filteredArticles, setFilteredArticles] = useState<any[]>([])
    const [openId, setOpenId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [claimType, setClaimType] = useState<'sc' | 'bc'>('sc')
    const [selectedClaims, setSelectedClaims] = useState<string[]>([])

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTopic, setSelectedTopic] = useState("All")
    const [bookmarkedArticles, setBookmarkedArticles] = useState<number[]>([])
    const [likedArticles, setLikedArticles] = useState<{ [key: number]: 'like' | 'dislike' | null }>({})
    const [currentPage, setCurrentPage] = useState(1)
    const [darkMode, setDarkMode] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState([
        { id: 1, text: "New trending article about AI", read: false },
        { id: 2, text: "Your saved article has been updated", read: true }
    ])

    const observer = useRef<IntersectionObserver | null>(null)
    const lastArticleRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        setSelectedClaims([])
    }, [claimType])

    // Fetch data
    useEffect(() => {
        const loadArticles = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Check localStorage first to see if data exists in filteredresults
                const localData = typeof window !== "undefined" && localStorage.getItem("filteredResults")
                if (localData) {
                    const parsed = JSON.parse(localData)
                    setArticles(parsed)
                    setFilteredArticles(parsed)
                    localStorage.removeItem("filteredResults") // clear it after loading
                } else {
                    setError("No filtered results found. Please return to the search page.")
                }
            } catch (err) {
                setError("Failed to load articles. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }

        loadArticles()
    }, [])

    // Infinite scroll
    useEffect(() => {
        if (isLoading) return

        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && articles.length > currentPage * 10) {
                setCurrentPage(prev => prev + 1)
            }
        })

        if (lastArticleRef.current) {
            observer.current.observe(lastArticleRef.current)
        }

        return () => {
            if (observer.current) observer.current.disconnect()
        }
    }, [isLoading, articles.length, currentPage])

    // Filtering
    useEffect(() => {
        if (!articles.length) return

        let results = [...articles]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            results = results.filter(article =>
                (article.title?.toLowerCase() || "").includes(query) ||
                (article.body?.toLowerCase() || "").includes(query)
            )
        }

        if (selectedTopic !== "All") {
            results = results.filter(article => {
                const topics = Object.keys(article.claims || {}).map(key => extractClaimLabel(key))
                return topics.some(topic => topic.includes(selectedTopic))
            })
        }

        setFilteredArticles(results)
    }, [searchQuery, selectedTopic, articles])

    // Pie chart data
    const pieChartData = useMemo(() => {
        const counts: Record<string, number> = {}
        let otherCount = 0

        articles.forEach(article => {
            Object.entries(article).forEach(([key, val]) => {
                if (key.startsWith(`${claimType}_`) && key.endsWith("_sentence") && val) {
                    const claimName = key.replace(`${claimType}_`, '').replace('_sentence', '')
                    if (selectedClaims.includes(claimName)) {
                        counts[claimName] = (counts[claimName] || 0) + 1
                    } else {
                        otherCount++
                    }
                }
            })
        })

        const data = Object.entries(counts).map(([name, value]) => ({
            name: name.replace(/_/g, ' '),
            value,
            color: CLAIM_COLORS[name] || "#8884d8"
        }))

        if (otherCount > 0) {
            data.push({ name: "Other", value: otherCount, color: CLAIM_COLORS.other || "#FFD700" })
        }

        return data
    }, [articles, claimType, selectedClaims])

    const availableClaims = useMemo(() => {
        const claimsSet = new Set<string>()

        articles.forEach(article => {
            Object.entries(article).forEach(([key, value]) => {
                if (key.startsWith(`${claimType}_`) && key.endsWith("_sentence") && value) {
                    const clean = key.replace(`${claimType}_`, '').replace('_sentence', '')
                    claimsSet.add(clean)
                }
            })
        })

        return Array.from(claimsSet)
    }, [articles, claimType])

    // Notifications
    const markNotificationAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(note => note.id === id ? { ...note, read: true } : note)
        )
    }

    const clearAllNotifications = () => {
        setNotifications([])
        setShowNotifications(false)
    }

    const toggleItem = (id: number) => {
        setOpenId(prev => prev === id ? null : id)
    }

    const toggleBookmark = (index: number, e: React.MouseEvent) => {
        e.stopPropagation()
        setBookmarkedArticles(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    const handleReaction = (
        index: number,
        reaction: 'like' | 'dislike',
        e: React.MouseEvent
    ) => {
        e.stopPropagation()
        setLikedArticles(prev => ({
            ...prev,
            [index]: prev[index] === reaction ? null : reaction
        }))
    }

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
        document.documentElement.classList.toggle('dark')
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1)
    }

    return {
        // core
        articles,
        filteredArticles,
        isLoading,
        error,

        // pagination & refs
        currentPage,
        setCurrentPage,
        lastArticleRef,

        // filters
        searchQuery,
        handleSearch,
        selectedTopic,
        setSelectedTopic,
        claimType,
        setClaimType,
        selectedClaims,
        setSelectedClaims,
        availableClaims,

        // UI state
        openId,
        toggleItem,
        bookmarkedArticles,
        toggleBookmark,
        likedArticles,
        handleReaction,
        darkMode,
        toggleDarkMode,

        // notifications
        showNotifications,
        setShowNotifications,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,

        // chart
        pieChartData,
    }
}