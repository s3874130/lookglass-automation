'use client'

import React, { RefObject } from "react"
import { ArticleCard } from "./ArticleCard"

interface ArticleListProps {
    articles: any[]
    openId: number | null
    toggleItemAction: (id: number) => void
    handleReactionAction: (index: number, reaction: 'like' | 'dislike', e: React.MouseEvent) => void
    likedArticles: { [key: number]: 'like' | 'dislike' | null }
    bookmarkedArticles: number[]
    toggleBookmarkAction: (index: number, e: React.MouseEvent) => void
    currentPage: number
    lastArticleRef: React.RefObject<HTMLDivElement | null>
}

export function ArticleList({
    articles,
    openId,
    toggleItemAction,
    handleReactionAction,
    likedArticles,
    bookmarkedArticles,
    toggleBookmarkAction,
    currentPage,
    lastArticleRef,
}: ArticleListProps) {
    const paginatedArticles = articles.slice(0, currentPage * 10)

    if (paginatedArticles.length === 0) {
        return (
            <div className="p-8 text-center border rounded-lg">
                <p className="text-lg font-medium mb-2">No articles found</p>
                <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters to find what you're looking for.
                </p>
            </div>
        )
    }

    return (
        <>
            {paginatedArticles.map((item, index) => {
                const isLastArticle = index === paginatedArticles.length - 1

                return (
                    <ArticleCard
                        key={index}
                        item={item}
                        index={index}
                        openId={openId}
                        toggleItemAction={toggleItemAction}
                        handleReactionAction={handleReactionAction}
                        likedArticles={likedArticles}
                        bookmarkedArticles={bookmarkedArticles}
                        toggleBookmarkAction={toggleBookmarkAction}
                        lastArticleRef={isLastArticle ? lastArticleRef : undefined}
                    />
                )
            })}
        </>
    )
}