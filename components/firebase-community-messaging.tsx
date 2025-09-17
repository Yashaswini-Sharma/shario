"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Share2, MessageCircle, Users, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { 
  sendMessageToCommunity, 
  listenToCommunityMessages, 
  listenToCommunityMembers,
  getCommunity,
  isUserMember,
  CommunityMessage,
  CommunityMember,
  Community
} from "@/lib/firebase-community-service"
import { useToast } from "@/hooks/use-toast"

interface FirebaseCommunityMessagingProps {
  communityId: string
}

export function FirebaseCommunityMessaging({ communityId }: FirebaseCommunityMessagingProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [community, setCommunity] = useState<Community | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user && communityId) {
      checkMembershipAndLoadCommunity()
    }
  }, [user, communityId])

  useEffect(() => {
    if (user && communityId && isMember) {
      // Listen to messages
      const unsubscribeMessages = listenToCommunityMessages(communityId, (newMessages) => {
        setMessages(newMessages)
      })

      // Listen to members
      const unsubscribeMembers = listenToCommunityMembers(communityId, (newMembers) => {
        setMembers(newMembers)
      })

      return () => {
        unsubscribeMessages()
        unsubscribeMembers()
      }
    }
  }, [user, communityId, isMember])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const checkMembershipAndLoadCommunity = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const [communityData, membershipStatus] = await Promise.all([
        getCommunity(communityId),
        isUserMember(communityId, user.uid)
      ])

      setCommunity(communityData)
      setIsMember(membershipStatus)
    } catch (error) {
      console.error('Error checking membership:', error)
      toast({
        title: "Error",
        description: "Failed to load community information",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !isMember) return

    try {
      await sendMessageToCommunity(
        communityId,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        message.trim()
      )
      setMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }

  const handleSharePage = async () => {
    if (!user || !isMember) return

    const currentUrl = window.location.pathname
    const pageTitle = document.title || "Shared Page"

    try {
      await sendMessageToCommunity(
        communityId,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        `Shared: ${pageTitle}`,
        'page_share',
        currentUrl,
        pageTitle
      )
    } catch (error) {
      console.error('Error sharing page:', error)
      toast({
        title: "Error",
        description: "Failed to share page",
        variant: "destructive"
      })
    }
  }

  const copyJoinCode = () => {
    if (community) {
      navigator.clipboard.writeText(community.joinCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
      toast({
        title: "Copied!",
        description: "Join code copied to clipboard",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const groupMessagesByDate = (messages: CommunityMessage[]) => {
    const groups: { [date: string]: CommunityMessage[] } = {}
    
    messages.forEach(message => {
      const date = formatDate(message.timestamp)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please sign in to access community messaging</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading community...</p>
        </CardContent>
      </Card>
    )
  }

  if (!community) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Community not found</p>
        </CardContent>
      </Card>
    )
  }

  if (!isMember) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground mb-4">
                You need to be a member to access this community's chat
              </p>
              <Button asChild>
                <a href="/communities">Browse Communities</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Chat Area */}
      <div className="lg:col-span-3">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {community.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSharePage}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share Page
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {members.length} members
              <Separator orientation="vertical" className="h-4" />
              <span>Join code: {community.joinCode}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyJoinCode}
                className="p-1 h-auto"
              >
                {copiedCode ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {Object.entries(messageGroups).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  Object.entries(messageGroups).map(([date, dateMessages]) => (
                    <div key={date}>
                      <div className="flex items-center my-4">
                        <Separator className="flex-1" />
                        <Badge variant="secondary" className="mx-4 text-xs">
                          {date}
                        </Badge>
                        <Separator className="flex-1" />
                      </div>
                      
                      <div className="space-y-3">
                        {dateMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.userId === user.uid ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-3 py-2 ${
                                msg.type === 'system' 
                                  ? 'bg-muted text-muted-foreground text-center text-sm w-full max-w-full'
                                  : msg.userId === user.uid
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {msg.type === 'system' ? (
                                <div>{msg.content}</div>
                              ) : msg.type === 'page_share' ? (
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">
                                    📢 Shared a page
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
                                  <div className="text-xs opacity-70 mt-1">
                                    {msg.userName} • {formatTime(msg.timestamp)}
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
                        ))}
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
                  disabled={!message.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] px-4">
              <div className="space-y-2">
                {members
                  .sort((a, b) => (a.role === 'admin' ? -1 : b.role === 'admin' ? 1 : 0))
                  .map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{member.userName}</div>
                        {member.role === 'admin' && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          member.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}