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
   * This function is triggered when the user clicks the search button.
   * It sends a POST request to the FastAPI backend with the search parameters.
   * On successful response, it stores the resulting articles in localStorage and navigates to the visualisation page.
   */

  const handleSearch = async () => {
    // Prevent search if input is empty (e.g. user clicked without typing)
    if (keyword.trim() === "") return

    try {
      // Construct the payload to send to the FastAPI backend
      const payload = {
        keywords: keyword, // Main keyword for article search
        source: source || "news", // Use selected source, fallback to "news" if none selected
        datastart: startDate?.toISOString().split("T")[0] || "2024-01-01", // Format start date or use default
        dateend: endDate?.toISOString().split("T")[0] || "2024-12-31" // Format end date or use default
      }

      // Make the POST request to the FastAPI backend
      const res = await fetch("http://127.0.0.1:8000/search-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload) // Convert payload to JSON string
      })

      // If the backend returns an error response, throw to trigger catch block
      if (!res.ok) throw new Error("Request failed")

      // Parse the JSON response from the backend
      const data = await res.json()

      // Save the article results to localStorage for retrieval on the next page
      localStorage.setItem("filteredResults", JSON.stringify(data.articles))

      // Navigate to the visualisation page to display the results
      router.push("/visualisation")
    } catch (err) {
      // Log any errors that occurred during the fetch request
      console.error("Failed to fetch from FastAPI:", err)
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