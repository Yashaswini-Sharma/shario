"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Share2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWebSocket } from "@/lib/websocket-context"
import { useAuth } from "@/lib/auth-context"

interface Message {
  id: string
  communityId: string
  userId: string
  userName: string
  content: string
  timestamp: Date
  type: 'message' | 'page_share' | 'system'
  pageUrl?: string
  pageTitle?: string
}

interface CommunityMessagingProps {
  communityId: string
  communityName: string
}

export function CommunityMessaging({ communityId, communityName }: CommunityMessagingProps) {
  const [message, setMessage] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const { user } = useAuth()
  const { messages, sendMessage, sharePage, joinCommunity, leaveCommunity, isConnected } = useWebSocket()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter messages for this community
  const communityMessages = messages.filter(msg => msg.communityId === communityId)

  useEffect(() => {
    if (user && communityId && !isJoined) {
      joinCommunity(communityId)
      setIsJoined(true)
    }

    return () => {
      if (isJoined) {
        leaveCommunity(communityId)
        setIsJoined(false)
      }
    }
  }, [user, communityId, isJoined, joinCommunity, leaveCommunity])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [communityMessages])

  const handleSendMessage = () => {
    if (message.trim() && user) {
      sendMessage(communityId, message.trim())
      setMessage("")
    }
  }

  const handleSharePage = () => {
    const currentUrl = window.location.pathname
    const pageTitle = document.title || "Shared Page"
    sharePage(communityId, currentUrl, pageTitle)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-center text-muted-foreground">Please sign in to access community messaging</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {communityName} Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSharePage}
              className="ml-2"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share Page
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {communityMessages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              communityMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.userId === user.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      msg.userId === user.uid
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.type === 'page_share' ? (
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          📢 {msg.userName} shared a page
                        </div>
                        <div className="text-sm opacity-90">
                          <a
                            href={msg.pageUrl}
                            className="underline hover:no-underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {msg.pageTitle}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs opacity-70 mb-1">
                          {msg.userName} • {formatTime(msg.timestamp)}
                        </div>
                        <div className="text-sm">{msg.content}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
