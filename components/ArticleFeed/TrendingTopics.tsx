'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function TrendingTopics() {
    const topics = [
        "AI Ethics",
        "Climate Change",
        "Global Economy",
        "Space Exploration",
        "Renewable Energy",
        "Data Privacy",
        "Healthcare Innovation",
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {topics.map((topic, i) => (
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
                <Button variant="ghost" className="w-full text-sm">
                    See All Topics
                </Button>
            </CardFooter>
        </Card>
    )
}