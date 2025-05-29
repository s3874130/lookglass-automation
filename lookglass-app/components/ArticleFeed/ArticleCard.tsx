'use client'

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
    ThumbsUp,
    ThumbsDown,
    Share,
    Bookmark,
    BookmarkCheck,
    ChevronsUpDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { extractClaimTypes, getClaimSentence, highlightClaimsInBody } from "@/lib/utils"


interface ArticleCardProps {
    item: any
    index: number
    openId: number | null
    toggleItemAction: (id: number) => void
    handleReactionAction: (index: number, reaction: 'like' | 'dislike', e: React.MouseEvent) => void
    likedArticles: { [key: number]: 'like' | 'dislike' | null }
    bookmarkedArticles: number[]
    toggleBookmarkAction: (index: number, e: React.MouseEvent) => void
    lastArticleRef?: React.RefObject<HTMLDivElement | null>
}

export function ArticleCard({
    item,
    index,
    openId,
    toggleItemAction,
    handleReactionAction,
    likedArticles,
    bookmarkedArticles,
    toggleBookmarkAction,
    lastArticleRef,
}: ArticleCardProps) {
    const isOpen = openId === index
    const claimTypes = extractClaimTypes(item)
    const claimSentences = getClaimSentence(item)
    console.log(claimTypes)
    console.log(claimSentences)
    return (
        <Card
            ref={lastArticleRef && index === openId ? lastArticleRef : null}
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

                {/* First Claim Badge */}
                <div className="flex flex-wrap gap-2">
                    {claimTypes.map((claim, index) => (
                        <Badge key={index}>{claim}</Badge>
                    ))}
                </div>


                <h3 className="text-base font-bold leading-snug">
                    {item.title || "Untitled Article"}
                </h3>
            </CardHeader>

            <Collapsible open={isOpen} onOpenChange={() => toggleItemAction(index)}>
                <CardContent className="text-sm text-muted-foreground space-y-2">

                    <p
                        dangerouslySetInnerHTML={{
                            __html: isOpen
                                ? highlightClaimsInBody(item.body || "", claimSentences)
                                : `${item.body?.slice(0, 200) || "No summary available."}... <span class="underline text-red-600">${claimSentences[0] || ""}</span>`
                        }}
                    />

                </CardContent>

                <CardFooter className="justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={likedArticles[index] === 'like' ? 'text-green-500' : ''}
                            onClick={(e) => handleReactionAction(index, 'like', e)}
                        >
                            <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={likedArticles[index] === 'dislike' ? 'text-red-500' : ''}
                            onClick={(e) => handleReactionAction(index, 'dislike', e)}
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
                            onClick={(e) => toggleBookmarkAction(index, e)}
                        >
                            {bookmarkedArticles.includes(index)
                                ? <BookmarkCheck className="h-4 w-4 text-primary" />
                                : <Bookmark className="h-4 w-4" />}
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
}