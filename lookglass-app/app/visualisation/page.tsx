'use client'

import { useEffect, useState, useRef } from "react"
import {
    Card, CardHeader, CardTitle, CardContent, CardFooter
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Collapsible, CollapsibleTrigger, CollapsibleContent
} from "@/components/ui/collapsible"
import {
    TrendingUp, ChevronDown, ChevronsUpDown, Search, Filter, Share, Bookmark, BookmarkCheck,
    Bell, MoonStar, SunMedium, Settings, Menu, X, RefreshCw, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { extractClaimLabel, getClaimColor } from "@/lib/utils"
import { toast } from "sonner"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { CLAIM_OPTIONS, CLAIM_COLORS, TOPICS, chartData } from "@/components/ArticleFeed/constants"


export default function ArticleFeed() {
    // Core state
    const [articles, setArticles] = useState<any[]>([])
    const [filteredArticles, setFilteredArticles] = useState<any[]>([])
    const [openId, setOpenId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [claimType, setClaimType] = useState<'sc' | 'bc'>('sc')
    const [selectedClaims, setSelectedClaims] = useState<string[]>([])

    // Features state
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

    // Reset dropdown filter
    useEffect(() => {
        setSelectedClaims([])
    }, [claimType])

    // Refs
    const observer = useRef<IntersectionObserver | null>(null)
    const lastArticleRef = useRef<HTMLDivElement | null>(null)

    // Toggle article expansion
    const toggleItem = (id: number) => {
        setOpenId(prev => prev === id ? null : id)
    }

    // Toggle bookmark status
    const toggleBookmark = (index: number, e: React.MouseEvent) => {
        e.stopPropagation()
        setBookmarkedArticles(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )

        const isBookmarked = bookmarkedArticles.includes(index)

        toast(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks", {
            description: articles[index]?.title || "Article",
            action: {
                label: "Undo",
                onClick: () => {
                    setBookmarkedArticles(prev =>
                        isBookmarked ? [...prev, index] : prev.filter(i => i !== index)
                    )
                }
            }
        })
    }

    // Handle article reaction
    const handleReaction = (index: number, reaction: 'like' | 'dislike', e: React.MouseEvent) => {
        e.stopPropagation()
        setLikedArticles(prev => ({
            ...prev,
            [index]: prev[index] === reaction ? null : reaction
        }))
    }

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
        document.documentElement.classList.toggle('dark')
    }

    // Mark notification as read
    const markNotificationAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(note => note.id === id ? { ...note, read: true } : note)
        )
    }

    // Clear all notifications
    const clearAllNotifications = () => {
        setNotifications([])
        setShowNotifications(false)
    }

    // Fetch data initially
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const res = await fetch('/final_combined_output.json')
                if (!res.ok) throw new Error("Failed to fetch")

                const data = await res.json()
                console.log("✅ Raw data:", data)
                console.log("✅ Extracted articles:", data.articles)

                setArticles(data.articles)
                setFilteredArticles(data.articles)
            } catch (err) {
                console.error("❌ Error loading articles:", err)
                setError("Failed to load articles. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Set up infinite scroll observer
    useEffect(() => {
        if (isLoading) return

        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && articles.length > currentPage * 10) {
                // Load more articles when scrolling to bottom
                setCurrentPage(prev => prev + 1)
            }
        })

        if (lastArticleRef.current) {
            observer.current.observe(lastArticleRef.current)
        }

        return () => {
            if (observer.current) {
                observer.current.disconnect()
            }
        }
    }, [isLoading, articles.length, currentPage])

    // Filter articles based on search and topic
    useEffect(() => {
        if (!articles.length) return

        let results = [...articles]

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            results = results.filter(article =>
                (article.title?.toLowerCase() || "").includes(query) ||
                (article.body?.toLowerCase() || "").includes(query)
            )
        }

        // Filter by topic
        if (selectedTopic !== "All") {
            results = results.filter(article => {
                const topics = Object.keys(article.claims || {}).map(key => extractClaimLabel(key))
                return topics.some(topic => topic.includes(selectedTopic))
            })
        }

        setFilteredArticles(results)
    }, [searchQuery, selectedTopic, articles])

    // Show only the current page of articles
    const paginatedArticles = filteredArticles.slice(0, currentPage * 10)

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1) // Reset to first page when searching
    }

    // Pie chart logic handling
    const pieChartData = useMemo(() => {
        const counts: Record<string, number> = {};
        let otherCount = 0;

        articles.forEach(article => {
            Object.entries(article).forEach(([key, val]) => {
                if (key.startsWith(`${claimType}_`) && key.endsWith("_sentence") && val) {
                    const claimName = key.replace(`${claimType}_`, '').replace('_sentence', '');
                    if (selectedClaims.includes(claimName)) {
                        counts[claimName] = (counts[claimName] || 0) + 1;
                    } else {
                        otherCount++;
                    }
                }
            });
        });

        const data = Object.entries(counts).map(([name, value]) => ({
            name: name.replace(/_/g, ' '),
            value,
            color: CLAIM_COLORS[name] || "#8884d8"
        }));

        if (otherCount > 0) {
            data.push({ name: "Other", value: otherCount, color: CLAIM_COLORS.other || "#FFD700" });
        }

        return data;
    }, [articles, claimType, selectedClaims]);

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

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex flex-col md:flex-row gap-6 py-6 max-w-7xl mx-auto">
                <div className="space-y-6 flex-1 max-w-2xl">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-6 w-full" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2 mb-4">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="w-full md:w-[420px]">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-48 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 max-w-7xl mx-auto">
                <div className="text-destructive text-lg font-bold mb-2">
                    <X className="h-12 w-12 mb-2 mx-auto" />
                    {error}
                </div>
                <Button onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header & Navigation */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
                <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center">
                        <Button variant="outline" size="icon" className="md:hidden mr-2">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="hidden md:flex w-full max-w-sm items-center mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search articles..."
                                className="w-full pl-8 pr-4"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell className="h-5 w-5" />
                                {notifications.some(n => !n.read) && (
                                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                                )}
                            </Button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 rounded-md bg-background border shadow-lg z-50">
                                    <div className="flex items-center justify-between p-3 border-b">
                                        <h3 className="font-medium">Notifications</h3>
                                        <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                                            Clear All
                                        </Button>
                                    </div>
                                    <ScrollArea className="h-64">
                                        {notifications.length ? (
                                            <div className="py-1">
                                                {notifications.map(note => (
                                                    <div
                                                        key={note.id}
                                                        className={`p-3 hover:bg-accent cursor-pointer ${note.read ? '' : 'bg-muted/50'}`}
                                                        onClick={() => markNotificationAsRead(note.id)}
                                                    >
                                                        <p className="text-sm">{note.text}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {note.read ? 'Read' : 'New'} • 2h ago
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                                <p className="text-muted-foreground">No notifications</p>
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            )}
                        </div>

                        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                            {darkMode ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
                        </Button>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Settings</DialogTitle>
                                    <DialogDescription>
                                        Customize your reading experience
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="dark-mode">Dark Mode</Label>
                                        <Switch
                                            id="dark-mode"
                                            checked={darkMode}
                                            onCheckedChange={toggleDarkMode}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notifications">Push Notifications</Label>
                                        <Switch id="notifications" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="email-alerts">Email Alerts</Label>
                                        <Switch id="email-alerts" />
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Mobile Search - displayed only on small screens */}
                <div className="md:hidden p-2 border-t">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search articles..."
                            className="w-full pl-8 pr-4"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container py-6 mx-auto">
                {/* Topic filters & View options */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="w-full flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Newest First</DropdownMenuItem>
                                <DropdownMenuItem>Oldest First</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Most Relevant</DropdownMenuItem>
                                <DropdownMenuItem>Most Popular</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Bookmarked</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto px-4">
                    {/* LEFT: Articles */}
                    <div className="flex-1 min-w-0">
                        {filteredArticles.length === 0 ? (
                            <Card className="p-8 text-center">
                                <p className="text-lg font-medium mb-2">No articles found</p>
                                <p className="text-muted-foreground mb-4">
                                    Try adjusting your search or filters to find what you're looking for.
                                </p>
                                <Button onClick={() => {
                                    setSearchQuery("")
                                    setSelectedTopic("All")
                                }}>
                                    Clear Filters
                                </Button>
                            </Card>
                        ) : (
                            paginatedArticles.map((item, index) => {
                                // Create a ref for the last article (for infinite scrolling)
                                const isLastArticle = index === paginatedArticles.length - 1
                                return (
                                    <Card
                                        key={index}
                                        ref={isLastArticle ? lastArticleRef : null}
                                        className="group relative"
                                    >
                                        <img
                                            src={item.image || "/fallback.jpg"}
                                            alt={item.title || "Article image"}
                                            className="rounded-md w-full max-h-56 object-cover mb-2"
                                        />
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-sm">{item.source?.title || "Unknown Source"}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {item.dateTime
                                                        ? new Date(item.dateTime).toLocaleDateString("en-GB", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        })
                                                        : "Unknown Date"}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base font-bold leading-snug">
                                                {item.title || "Untitled Article"}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="flex flex-wrap gap-2 pb-1">
                                            {Object.entries(item.claims || {})
                                                .map(([key, value]) => (
                                                    <Badge key={key} className={getClaimColor(key)}>
                                                        {(key.startsWith("sc_") ? "Subclaim: " : "Broad Claim: ") + extractClaimLabel(key)}
                                                    </Badge>
                                                ))}
                                        </CardContent>

                                        <Collapsible open={openId === index} onOpenChange={() => toggleItem(index)}>
                                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                                {/* Preview of the article body (only when collapsed) */}
                                                <p>
                                                    {openId === index
                                                        ? item.body || "No summary available."
                                                        : `${item.body?.slice(0, 200) || "No summary available."}...`}
                                                </p>

                                                {/* Always-visible claim sentence */}
                                                <p className="italic text-muted-foreground">
                                                    {String(
                                                        Object.entries(item).find(([key]) =>
                                                            key.endsWith("_sentence")
                                                        )?.[1] ?? "No claim sentence available."
                                                    )}
                                                </p>

                                                {/* Expanded content: all claim sentences */}
                                                <CollapsibleContent>
                                                    <div className="pt-2 space-y-2">
                                                        {Object.entries(item)
                                                            .filter(([key]) => key.endsWith("_sentence"))
                                                            .map(([key, value]) => (
                                                                <p key={key} className="italic">{String(value)}</p>
                                                            ))}
                                                    </div>
                                                </CollapsibleContent>
                                            </CardContent>

                                            <CardFooter className="justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={likedArticles[index] === 'like' ? 'text-green-500' : ''}
                                                        onClick={(e) => handleReaction(index, 'like', e)}
                                                    >
                                                        <ThumbsUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={likedArticles[index] === 'dislike' ? 'text-red-500' : ''}
                                                        onClick={(e) => handleReaction(index, 'dislike', e)}
                                                    >
                                                        <ThumbsDown className="h-4 w-4" />
                                                    </Button>
                                                    <Separator orientation="vertical" className="h-4" />
                                                    <Button variant="ghost" size="icon">
                                                        <Share className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => toggleBookmark(index, e)}
                                                    >
                                                        {bookmarkedArticles.includes(index)
                                                            ? <BookmarkCheck className="h-4 w-4 text-primary" />
                                                            : <Bookmark className="h-4 w-4" />
                                                        }
                                                    </Button>
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <ChevronsUpDown className="h-4 w-4" />
                                                            <span className="sr-only">Toggle full content</span>
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                </div>
                                            </CardFooter>
                                        </Collapsible>
                                    </Card>
                                )
                            })
                        )}

                        {/* Loading indicator for infinite scroll */}
                        {filteredArticles.length > paginatedArticles.length && (
                            <div className="flex justify-center py-4">
                                <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Chart Card & Widgets */}
                    <div className="w-full md:w-[400px] space-y-6">
                        {/* Chart Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Claim Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <label className="mr-2">Type:</label>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="w-40 justify-between">
                                                        {claimType === 'sc' ? 'Subclaims' : 'Broad Claims'}
                                                        <ChevronDown className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent className="w-40">
                                                    <DropdownMenuItem onSelect={() => setClaimType('sc')}>
                                                        Subclaims
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => setClaimType('bc')}>
                                                        Broad Claims
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <label>Claim:</label>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="w-full sm:w-64 justify-between">
                                                        {selectedClaims.length > 0 ? `${selectedClaims.length} selected` : "Select Claims"}
                                                        <ChevronDown className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent className="w-64 max-h-60 overflow-auto">
                                                    {availableClaims.map(claim => (
                                                        <DropdownMenuItem
                                                            key={claim}
                                                            onSelect={(e) => e.preventDefault()}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Checkbox
                                                                id={claim}
                                                                checked={selectedClaims.includes(claim)}
                                                                onCheckedChange={(checked) => {
                                                                    setSelectedClaims(prev =>
                                                                        checked ? [...prev, claim] : prev.filter(c => c !== claim)
                                                                    )
                                                                }}
                                                            />
                                                            <Label htmlFor={claim} className="capitalize">
                                                                {claim.replace(/_/g, ' ')}
                                                            </Label>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {selectedClaims.length > 0 && pieChartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        dataKey="value"
                                                        data={pieChartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={80}
                                                        label={({ value }) => `${value}`}
                                                        labelLine={false}
                                                    >
                                                        {pieChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-muted-foreground text-center pt-6 text-sm">
                                                Select claims to see data
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bookmarks Widget */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Bookmarks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bookmarkedArticles.length > 0 ? (
                                    <div className="space-y-4">
                                        {bookmarkedArticles.slice(0, 3).map(index => (
                                            <div key={index} className="flex items-start gap-3">
                                                <img
                                                    src={articles[index]?.image || "/fallback.jpg"}
                                                    alt=""
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium text-sm line-clamp-2">
                                                        {articles[index]?.title || "Untitled Article"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {articles[index]?.source?.title || "Unknown Source"}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <Bookmark className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-muted-foreground">No bookmarks yet</p>
                                    </div>
                                )}
                            </CardContent>
                            {bookmarkedArticles.length > 0 && (
                                <CardFooter>
                                    <Button variant="outline" className="w-full">View All Bookmarks</Button>
                                </CardFooter>
                            )}
                        </Card>

                        {/* Trending Topics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Trending Topics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {["AI Ethics", "Climate Change", "Global Economy", "Space Exploration", "Renewable Energy"].map((topic, i) => (
                                        <div key={topic} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{i + 1}.</span>
                                                <span>{topic}</span>
                                            </div>
                                            <Badge variant="outline">{Math.floor(Math.random() * 100) + 10}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" className="w-full text-sm">See All Topics</Button>
                            </CardFooter>
                        </Card>

                        {/* Newsletter Signup */}
                        <Card className="bg-primary/5">
                            <CardHeader>
                                <CardTitle>Stay Updated</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Get the latest news and insights delivered to your inbox.
                                </p>
                                <div className="space-y-2">
                                    <Input placeholder="Your email address" type="email" />
                                    <Button className="w-full">Subscribe</Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    We respect your privacy. Unsubscribe at any time.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Pagination - as a fallback for older browsers without IntersectionObserver */}
                {filteredArticles.length > 10 && !window.IntersectionObserver && (
                    <div className="flex justify-center mt-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {Array.from({ length: Math.min(5, Math.ceil(filteredArticles.length / 10)) }, (_, i) => (
                                <Button
                                    key={i}
                                    variant={currentPage === i + 1 ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="icon"
                                disabled={currentPage >= Math.ceil(filteredArticles.length / 10)}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="flex-1 container py-6 mx-auto">
                <div className="flex-1 container py-6 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-semibold mb-4">Categories</h4>
                            <ul className="space-y-2 text-sm">
                                {TOPICS.slice(1).map(topic => (
                                    <li key={topic}>
                                        <a href="#" className="text-muted-foreground hover:text-foreground">
                                            {topic}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-muted-foreground hover:text-foreground">About Us</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Connect</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="text-muted-foreground hover:text-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                                    <span className="sr-only">Twitter</span>
                                </a>
                                <a href="#" className="text-muted-foreground hover:text-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                    <span className="sr-only">Facebook</span>
                                </a>
                                <a href="#" className="text-muted-foreground hover:text-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                                    <span className="sr-only">Instagram</span>
                                </a>
                                <a href="#" className="text-muted-foreground hover:text-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                    <span className="sr-only">LinkedIn</span>
                                </a>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground">
                                    © 2025 Steven Nguyen. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}