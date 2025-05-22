"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Header() {
  return (
    <header className="w-full bg-card text-card-foreground border-b px-4 py-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">LookGlass</h1>
        <div className="flex gap-4 items-center">
          <Link href="/searchpage">
            <Button variant="ghost" size="sm">Search Page</Button>
          </Link>
          <Button variant="ghost" size="sm">About</Button>
          <Button variant="ghost" size="sm">Contact</Button>
        </div>
      </div>
    </header>
  )
}

