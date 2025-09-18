"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, Users, Share2, X, ArrowLeft, Send, Hash, LogOut, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useProductSharing } from "@/lib/product-sharing-context-new"
import { Community, CommunityMessage, getUserCommunities, sendMessageToCommunity, shareProductToCommunity, listenToCommunityMessages, leaveCommunity } from "@/lib/firebase-community-service"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CommunitySidebarChatProps {
  isOpen: boolean
  onToggle: () => void
}

export function CommunitySidebarChat({ isOpen, onToggle }: CommunitySidebarChatProps) {
  const [mounted, setMounted] = useState(false)
  const [userCommunities, setUserCommunities] = useState<Community[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSharingProduct, setIsSharingProduct] = useState(false)
  const [showCommunityList, setShowCommunityList] = useState(true)
  
  const { user } = useAuth()
  const { currentProduct, setCurrentProduct } = useProductSharing()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setMounted(true)
    if (user) {
      loadUserCommunities()
    }
  }, [user])

  // Listen to messages when a community is selected
  useEffect(() => {
    if (selectedCommunity) {
      const unsubscribe = listenToCommunityMessages(selectedCommunity.id, (newMessages) => {
        setMessages(newMessages)
      })
      return unsubscribe
    }
  }, [selectedCommunity])

  const loadUserCommunities = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const communities = await getUserCommunities(user.uid)
      setUserCommunities(communities)
      
      // Auto-select first community if available
      if (communities.length > 0 && !selectedCommunity) {
        setSelectedCommunity(communities[0])
        setShowCommunityList(false)
      }
    } catch (error) {
      console.error('Error loading communities:', error)
      toast({
        title: "Error",
        description: "Failed to load your communities",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedCommunity || !user || !newMessage.trim()) return

    try {
      await sendMessageToCommunity(
        selectedCommunity.id,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        newMessage.trim(),
        'message'
      )
      setNewMessage("")
      
      toast({
        title: "Message sent",
        description: "Your message was sent to the community"
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }

  const handleShareProduct = async () => {
    if (!selectedCommunity || !user || !currentProduct) return

    setIsSharingProduct(true)
    try {
      await shareProductToCommunity(
        selectedCommunity.id,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        currentProduct
      )
      
      toast({
        title: "Product shared!",
        description: `Shared "${currentProduct.title}" to ${selectedCommunity.name}`
      })
      setCurrentProduct(null)
    } catch (error) {
      console.error('Error sharing product:', error)
      toast({
        title: "Error",
        description: "Failed to share product",
        variant: "destructive"
      })
    } finally {
      setIsSharingProduct(false)
    }
  }

  const handleShareCurrentPage = async () => {
    if (!selectedCommunity || !user) return

    const currentUrl = window.location.href
    const currentTitle = document.title

    // Check if we're on a product page
    if (currentUrl.includes('/products/')) {
      // Extract product info from URL or page
      const productId = currentUrl.split('/products/')[1]?.split('?')[0]
      
      try {
        await sendMessageToCommunity(
          selectedCommunity.id,
          user.uid,
          user.displayName || user.email || 'Anonymous',
          `🔗 Check out this product: ${currentTitle}\n${currentUrl}`,
          'page_share',
          currentUrl,
          currentTitle
        )
        
        toast({
          title: "Page shared!",
          description: `Shared "${currentTitle}" to ${selectedCommunity.name}`
        })
      } catch (error) {
        console.error('Error sharing page:', error)
        toast({
          title: "Error",
          description: "Failed to share page",
          variant: "destructive"
        })
      }
    } else {
      // Share general page
      try {
        await sendMessageToCommunity(
          selectedCommunity.id,
          user.uid,
          user.displayName || user.email || 'Anonymous',
          `🔗 Check out this page: ${currentTitle}\n${currentUrl}`,
          'page_share',
          currentUrl,
          currentTitle
        )
        
        toast({
          title: "Page shared!",
          description: `Shared "${currentTitle}" to ${selectedCommunity.name}`
        })
      } catch (error) {
        console.error('Error sharing page:', error)
        toast({
          title: "Error",
          description: "Failed to share page",
          variant: "destructive"
        })
      }
    }
  }

  const handleLeaveCommunity = async () => {
    if (!selectedCommunity || !user) return

    try {
      await leaveCommunity(
        selectedCommunity.id,
        user.uid,
        user.displayName || user.email || 'Anonymous'
      )
      
      toast({
        title: "Left community",
        description: `You have left ${selectedCommunity.name}`
      })
      
      // Refresh communities list and go back to community selection
      await loadUserCommunities()
      setShowCommunityList(true)
      setSelectedCommunity(null)
    } catch (error) {
      console.error('Error leaving community:', error)
      toast({
        title: "Error",
        description: "Failed to leave community",
        variant: "destructive"
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectCommunity = (community: Community) => {
    setSelectedCommunity(community)
    setShowCommunityList(false)
  }

  const backToCommunityList = () => {
    setShowCommunityList(true)
    setSelectedCommunity(null)
  }

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!mounted) return null

  return (
    <>
      {/* Sidebar Chat Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-[9998] w-80 bg-white border-l shadow-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-purple-50">
              <div className="flex items-center gap-2">
                {selectedCommunity && !showCommunityList && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={backToCommunityList}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">
                  {selectedCommunity && !showCommunityList 
                    ? selectedCommunity.name 
                    : 'Communities'
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedCommunity && !showCommunityList && (
                  <>
                    {/* Share Current Page Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShareCurrentPage}
                      title="Share current page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
                    {/* Leave Community Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Leave community"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Leave Community</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to leave "{selectedCommunity.name}"? 
                            You'll need to rejoin to access this community again.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLeaveCommunity}>
                            Leave Community
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {!user ? (
                <div className="p-4 text-center">
                  <p className="text-gray-600 mb-4">Please sign in to chat with communities</p>
                  <Link href="/sign-in">
                    <Button className="w-full">Sign In</Button>
                  </Link>
                </div>
              ) : userCommunities.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-gray-600 mb-4">You haven't joined any communities yet</p>
                  <Link href="/communities">
                    <Button className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Browse Communities
                    </Button>
                  </Link>
                </div>
              ) : showCommunityList ? (
                /* Community List */
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-3">
                    {userCommunities.map((community) => (
                      <Card key={community.id} className="cursor-pointer hover:bg-gray-50" onClick={() => selectCommunity(community)}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-sm">{community.name}</h3>
                              <p className="text-xs text-gray-600">{community.memberCount} members</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {community.tags?.[0] || community.type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                /* Chat Interface */
                <div className="flex flex-col h-full">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div key={message.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-purple-800">
                              {message.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(message.timestamp)}
                            </span>
                          </div>
                          {message.type === 'page_share' ? (
                            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                              <p className="text-xs text-blue-600 font-medium mb-2">
                                🔗 Shared a link:
                              </p>
                              {message.pageTitle && (
                                <p className="text-sm font-medium text-blue-800 mb-1">
                                  {message.pageTitle}
                                </p>
                              )}
                              <p className="text-sm text-gray-700 mb-2">{message.content}</p>
                              {message.pageUrl && (
                                <a
                                  href={message.pageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  Visit Page
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700">{message.content}</p>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Product Sharing Alert */}
                  {currentProduct && (
                    <div className="p-3 bg-blue-50 border-t">
                      <div className="flex items-start gap-3">
                        {currentProduct.image && (
                          <img 
                            src={currentProduct.image} 
                            alt={currentProduct.title} 
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800 mb-1">Share this product?</p>
                          <p className="text-xs font-medium text-gray-800">{currentProduct.title}</p>
                          {currentProduct.price && (
                            <p className="text-xs text-blue-600">₹{currentProduct.price}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleShareProduct}
                            disabled={isSharingProduct}
                          >
                            <Share2 className="h-3 w-3 mr-1" />
                            {isSharingProduct ? 'Sharing...' : 'Share'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCurrentProduct(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
