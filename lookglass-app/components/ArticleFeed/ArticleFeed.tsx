'use client'

import Header from "@/components/ArticleFeed/Header"
import Footer from "@/components/ArticleFeed/Footer"

import { useArticleFeed } from "./useArticleFeed"
import { ArticleList } from "./ArticleList"
import { ClaimPieChart } from "./ClaimPieChart"
import { BookmarksPanel } from "./BookmarksPanel"
import { TrendingTopics } from "./TrendingTopics"
import { NewsletterSignup } from "./NewsLetterSignup"
import { SearchInput } from "./SearchInput"
import { NotificationsPanel } from "./NotificationsPanel"
import {Card, CardHeader, CardTitle,CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MoonStar, SunMedium, Settings, RefreshCw, Filter, ChevronDown } from "lucide-react"
import Link from 'next/link'

export default function ArticleFeed() {
    const {
        articles,
        filteredArticles,
        isLoading,
        error,
        currentPage,
        lastArticleRef,
        openId,
        toggleItem,
        bookmarkedArticles,
        toggleBookmark,
        likedArticles,
        handleReaction,
        searchQuery,
        handleSearch,
        claimType,
        setClaimType,
        selectedClaims,
        setSelectedClaims,
        availableClaims,
        pieChartData,
        darkMode,
        toggleDarkMode,
        notifications,
        showNotifications,
        setShowNotifications,
        markNotificationAsRead,
        clearAllNotifications,
    } = useArticleFeed()

    if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-10 text-center">
        <p>Loading articles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-10 text-center">
        <p className="text-destructive font-semibold">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Nav */}
        <div className="w-full flex items-center justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <NotificationsPanel
              notifications={notifications}
              showNotifications={showNotifications}
              toggleShowAction={() => setShowNotifications(!showNotifications)}
              markNotificationAsReadAction={markNotificationAsRead}
              clearAllNotificationsAction={clearAllNotifications}
            />
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
                  <DialogDescription>Customize your reading experience</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
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

        {/* Search Bar */}
        <div className="w-full flex justify-center mb-8">
          <div className="w-full max-w-xl">
            <SearchInput searchQuery={searchQuery} handleSearchAction={handleSearch} />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-2">
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
                <DropdownMenuItem>Most Relevant</DropdownMenuItem>
                <DropdownMenuItem>Bookmarked</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Body Layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Article List */}
          <div className="flex-1">
            <ArticleList
              articles={filteredArticles}
              openId={openId}
              toggleItemAction={toggleItem}
              handleReactionAction={handleReaction}
              likedArticles={likedArticles}
              bookmarkedArticles={bookmarkedArticles}
              toggleBookmarkAction={toggleBookmark}
              currentPage={currentPage}
              lastArticleRef={lastArticleRef}
            />
          </div>

          {/* Right Sidebar */}
          <div className="w-full md:w-[455px] space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Claim Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="overflow-visible">
                <ClaimPieChart
                  claimType={claimType}
                  setClaimTypeAction={setClaimType}
                  selectedClaims={selectedClaims}
                  setSelectedClaimsAction={setSelectedClaims}
                  availableClaims={availableClaims}
                  pieChartData={pieChartData}
                />
              </CardContent>
            </Card>

            <BookmarksPanel articles={articles} bookmarkedArticles={bookmarkedArticles} />
            <TrendingTopics />
            <NewsletterSignup />
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}