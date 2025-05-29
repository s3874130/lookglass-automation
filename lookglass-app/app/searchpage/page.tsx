'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

import Header from "@/components/ArticleFeed/Header"
import Footer from "@/components/ArticleFeed/Footer"

const SearchArticlePage = () => {
  const router = useRouter()

  // Search input state
  const [keyword, setKeyword] = useState("")

  // Date range filters
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Drop down value for article sources (News, blogs  etc.)
  const [source, setSource] = useState("")

  /**
   * Fetch and filter articles based on the current search form inputs.
   * Stores the filtered results in memory (LocalStorage) for retrieval in the visualisation page
   */
  const handleSearch = async () => {

    // Prevents empty searches - Does nothing when input is empty and user clicks search
    if (keyword.trim() === "") return

    try {
      
      // Load the JSON file containing all articles
      const res = await fetch("/final_combined_output.json")
      const data = await res.json()

      // Applying client side filtering 
      const filtered = data.articles.filter((article: any) => {
        const articleDate = new Date(article.date)

        // Keyword must be included in either the title or body (case-insensitive, wild-card search)
        const matchesKeyword =
          article.title.toLowerCase().includes(keyword.toLowerCase()) ||
          article.body.toLowerCase().includes(keyword.toLowerCase())

        // Source filters (News, blogs etc.)
        const matchesSource =
          source === "" || article.source.uri.toLowerCase().includes(source.toLowerCase())

        // Date range filtering 
        const matchesDate =
          (!startDate || articleDate >= startDate) &&
          (!endDate || articleDate <= endDate)
        
        // Return all articles that meet keyword, source and date range criteria
        return matchesKeyword && matchesSource && matchesDate
      })

      // Save results to memory so the visualisation page can read
      localStorage.setItem("filteredResults", JSON.stringify(filtered))

      // Navigate to results page
      router.push("/visualisation")
    } catch (err) {

      // Catch unexpected parsing or fetching errors
      console.error("Failed to search articles:", err)
    }
  }

  return (
    <>
      <Header />

      {/* PAGE CONTENT CONTAINER */}
      <main className="flex flex-col min-h-[calc(100vh-160px)] justify-center px-4 py-12">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-center">Search Article</h1>

          {/* SEARCH BAR */}
          <div className="w-full">
            <Input
              placeholder="Search here"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full text-lg p-6 h-12"
            />
          </div>

          {/* DATE RANGE  */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* START DATE - Left Side*/}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {startDate ? startDate.toDateString() : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* END DATE - Right Side */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {endDate ? endDate.toDateString() : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* SOURCE SELECTION */}
          <div className="w-full">
            <label className="text-sm font-medium block mb-2">Source</label>
            <Select onValueChange={setSource} value={source}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="news">News Articles</SelectItem>
                <SelectItem value="blogs">Blogs</SelectItem>
                <SelectItem value="academic">Academic Papers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SEARCH BUTTON */}
          <div className="flex justify-center">
            <Button className="w-48 mt-6" onClick={handleSearch}>Search</Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default SearchArticlePage