'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NewsletterSignup() {
    return (
        <Card className="bg-primary/5">
            <CardHeader>
                <CardTitle>Stay Updated</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Get the latest news and insights delivered to your inbox.
                </p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement)?.value
                        if (email) {
                            // TODO: hook this up to backend or newsletter API
                            alert(`Subscribed with ${email}`)
                        }
                    }}
                >
                    <div className="space-y-2">
                        <Input
                            id="email"
                            name="email"
                            placeholder="Your email address"
                            type="email"
                            required
                        />
                        <Button type="submit" className="w-full">
                            Subscribe
                        </Button>
                    </div>
                </form>
                <p className="text-xs text-muted-foreground mt-2">
                    We respect your privacy. Unsubscribe at any time.
                </p>
            </CardContent>
        </Card>
    )
}