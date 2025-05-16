'use client'

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
    id: number
    text: string
    read: boolean
}

interface NotificationsPanelProps {
    notifications: Notification[]
    showNotifications: boolean
    toggleShowAction: () => void
    markNotificationAsReadAction: (id: number) => void
    clearAllNotificationsAction: () => void
}

export function NotificationsPanel({
    notifications,
    showNotifications,
    toggleShowAction,
    markNotificationAsReadAction,
    clearAllNotificationsAction
}: NotificationsPanelProps) {
    return (
        <div className="relative">
            <Button variant="ghost" size="icon" onClick={toggleShowAction}>
                <Bell className="h-5 w-5" />
                {notifications.some(n => !n.read) && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                )}
            </Button>

            {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-md bg-background border shadow-lg z-50">
                    <div className="flex items-center justify-between p-3 border-b">
                        <h3 className="font-medium">Notifications</h3>
                        <Button variant="ghost" size="sm" onClick={clearAllNotificationsAction}>
                            Clear All
                        </Button>
                    </div>
                    <ScrollArea className="h-64">
                        {notifications.length > 0 ? (
                            <div className="py-1">
                                {notifications.map(note => (
                                    <div
                                        key={note.id}
                                        className={`p-3 hover:bg-accent cursor-pointer ${note.read ? '' : 'bg-muted/50'
                                            }`}
                                        onClick={() => markNotificationAsReadAction(note.id)}
                                    >
                                        <p className="text-sm">{note.text}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {note.read ? 'Read' : 'New'} • 2h ago
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <p className="text-muted-foreground">No notifications</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    )
}