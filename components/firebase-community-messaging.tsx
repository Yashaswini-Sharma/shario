"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Share2, MessageCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { 
  getCommunityMessages, 
  sendCommunityMessage, 
  subscribeToMessages,
  CommunityMessage,
  Community,
  getCommunity
} from "@/lib/firebase-community-service"

interface FirebaseCommunityMessagingProps {
  communityId: string
}

export function FirebaseCommunityMessaging({ communityId }: FirebaseCommunityMessagingProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [community, setCommunity] = useState<Community | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!communityId || !user) return

    const loadCommunityAndMessages = async () => {
      try {
        const [communityData, initialMessages] = await Promise.all([
          getCommunity(communityId),
          getCommunityMessages(communityId)
        ])
        
        setCommunity(communityData)
        setMessages(initialMessages)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading community data:', error)
        setIsLoading(false)
      }
    }

    loadCommunityAndMessages()

    // Subscribe to real-time message updates
    const unsubscribe = subscribeToMessages(communityId, (newMessages) => {
      setMessages(newMessages)
      scrollToBottom()
    })

    return unsubscribe
  }, [communityId, user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !communityId) return

    try {
      await sendCommunityMessage(
        communityId,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        message.trim(),
        'message'
      )
      setMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (isLoading) {
    return (
      <Card className="flex-1 bg-white/5 backdrop-blur-xl border-0 rounded-3xl">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
            <p className="text-gray-300">Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex-1 bg-white/5 backdrop-blur-xl border-0 rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 py-4">
        <CardTitle className="flex items-center gap-3 text-gray-100">
          <MessageCircle className="h-6 w-6 text-purple-400" />
          <span>Community Chat</span>
          {community && (
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-300">
              <Users className="h-4 w-4" />
              <span>{community.memberCount} members</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-[500px]">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-300 text-lg">No messages yet</p>
                <p className="text-gray-400">Be the first to start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {msg.type === 'system' ? (
                    <div className="text-center py-2">
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                        {msg.content}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex ${msg.userId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.userId === user?.uid
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                            : 'bg-white/10 text-gray-100'
                        }`}
                      >
                        {msg.userId !== user?.uid && (
                          <div className="text-xs text-gray-300 mb-1 font-medium">
                            {msg.userName}
                          </div>
                        )}
                        <div className="text-sm">{msg.content}</div>
                        <div
                          className={`text-xs mt-1 ${
                            msg.userId === user?.uid
                              ? 'text-purple-200'
                              : 'text-gray-400'
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-white/10 border-0 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 rounded-xl px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
