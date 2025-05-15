'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BookmarksPanelProps {
    articles: any[]
    bookmarkedArticles: number[]
}

export function BookmarksPanel({ articles, bookmarkedArticles }: BookmarksPanelProps) {
    const hasBookmarks = bookmarkedArticles.length > 0

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Bookmarks</CardTitle>
            </CardHeader>
            <CardContent>
                {hasBookmarks ? (
                    <div className="space-y-4">
                        {bookmarkedArticles.slice(0, 3).map(index => {
                            const article = articles[index]
                            return (
                                <div key={index} className="flex items-start gap-3">
                                    <img
                                        src={article?.image || "/fallback.jpg"}
                                        alt=""
                                        className="w-12 h-12 rounded object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-sm line-clamp-2">
                                            {article?.title || "Untitled Article"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {article?.source?.title || "Unknown Source"}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <Bookmark className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No bookmarks yet</p>
                    </div>
                )}
            </CardContent>
            {hasBookmarks && (
                <CardFooter>
                    <Button variant="outline" className="w-full text-sm">
                        View All Bookmarks
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}