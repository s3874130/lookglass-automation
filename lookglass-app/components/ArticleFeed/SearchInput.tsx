'use client'

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchInputProps {
    searchQuery: string
    handleSearchAction: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function SearchInput({ searchQuery, handleSearchAction }: SearchInputProps) {
    return (
        <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search articles..."
                className="w-full pl-8 pr-4"
                value={searchQuery}
                onChange={handleSearchAction}
            />
        </div>
    )
}