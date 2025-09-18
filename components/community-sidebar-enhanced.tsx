"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, Users, Share2, X, ArrowRight, Send, Hash, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useProductSharing } from "@/lib/product-sharing-context-new"
import { Community, CommunityMessage, getUserCommunities, sendMessageToCommunity, shareProductToCommunity, listenToCommunityMessages } from "@/lib/firebase-community-service"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

export function CommunityEnhancedSidebar() {
  const [isOpen, setIsOpen] = useState(false)
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
        newMessage.trim(),
        user.displayName || user.email || 'Anonymous',
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
        currentProduct,
        user.displayName || user.email || 'Anonymous'
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
  }, [])

  useEffect(() => {
    if (user && mounted) {
      loadUserCommunities()
    }
  }, [user, mounted])

  const loadUserCommunities = async () => {
    if (!user) return
    
    try {
      const communities = await getUserCommunities(user.uid)
      setUserCommunities(communities)
      
      // Auto-select first community if available
      if (communities.length > 0 && !selectedCommunity) {
        setSelectedCommunity(communities[0])
      }
    } catch (error) {
      console.error("Error loading user communities:", error)
    }
  }

  const sendMessage = async () => {
    if (!selectedCommunity || !user || !message.trim()) return
    
    setIsLoading(true)
    try {
      await sendMessageToCommunity(
        selectedCommunity.id,
        user.uid,
        user.displayName || user.email || "User",
        message.trim()
      )
      
      setMessage("")
      toast({
        title: "Message sent!",
        description: `Your message was sent to ${selectedCommunity.name}`,
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const shareProductToCommunityHandler = async (community: Community) => {
    if (!currentProduct || !user) return
    
    setIsSharingProduct(true)
    try {
      await shareProductToCommunity(
        community.id,
        user.uid,
        user.displayName || user.email || "User",
        currentProduct
      )
      
      setCurrentProduct(null)
      toast({
        title: "Product shared!",
        description: `${currentProduct.name} was shared with ${community.name}`,
      })
    } catch (error) {
      console.error("Error sharing product:", error)
      toast({
        title: "Error",
        description: "Failed to share product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharingProduct(false)
    }
  }

  const clearCurrentProduct = () => {
    setCurrentProduct(null)
  }

  // Don't render on server side
  if (!mounted) {
    return null
  }

  // Don't show if user not logged in
  if (!user) {
    return null
  }

  return (
    <>
      {/* Floating Button - Show notification badge if product is ready to share */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          {currentProduct && (
            <div className="absolute -top-2 -right-2">
              <div className="bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs animate-pulse">
                1
              </div>
            </div>
          )}
          {userCommunities.length > 0 && (
            <div className="absolute -bottom-1 -right-1">
              <Badge className="bg-green-500 text-white text-xs px-1 py-0 min-w-[20px] h-5">
                {userCommunities.length}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="ml-auto relative bg-white w-96 h-full shadow-2xl overflow-hidden">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {userCommunities.length > 0 ? "My Communities" : "Communities"}
                </h2>
                <Button 
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 flex-1 overflow-auto">
                {/* Product to Share Section - Enhanced for joined communities */}
                {currentProduct && userCommunities.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Share2 className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-800">Share Product</h3>
                      </div>
                      <Button 
                        onClick={clearCurrentProduct}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex space-x-3 mb-3">
                      <img 
                        src={currentProduct.image || "/placeholder.jpg"} 
                        alt={currentProduct.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">
                          {currentProduct.name}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          ₹{currentProduct.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-green-700 font-medium">Share with:</p>
                      <div className="grid gap-2">
                        {userCommunities.map((community) => (
                          <Button
                            key={community.id}
                            onClick={() => shareProductToCommunityHandler(community)}
                            disabled={isSharingProduct}
                            className="w-full justify-start text-left h-auto py-2 px-3 bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Hash className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="truncate">{community.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* If user has joined communities - show chat interface */}
                {userCommunities.length > 0 ? (
                  <>
                    {/* Community Selector */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Select Community</Label>
                      <div className="grid gap-2">
                        {userCommunities.map((community) => (
                          <Card 
                            key={community.id}
                            className={`cursor-pointer transition-all ${
                              selectedCommunity?.id === community.id 
                                ? 'border-purple-500 bg-purple-50' 
                                : 'hover:border-purple-300'
                            }`}
                            onClick={() => setSelectedCommunity(community)}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center">
                                <Hash className="h-4 w-4 mr-2" />
                                {community.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {community.memberCount || 0} members
                                </span>
                                <Button
                                  asChild
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                >
                                  <Link href={`/communities/${community.id}`}>
                                    Open Chat
                                  </Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Quick Message Section */}
                    {selectedCommunity && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-2 mb-3">
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                          <h3 className="font-medium text-gray-800">Quick Message</h3>
                        </div>
                        <div className="space-y-3">
                          <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Send a message to ${selectedCommunity.name}...`}
                            rows={3}
                            className="resize-none"
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={sendMessage}
                              disabled={!message.trim() || isLoading}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              size="sm"
                            >
                              {isLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="h-3 w-3 mr-2" />
                                  Send
                                </>
                              )}
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="px-3"
                            >
                              <Link href={`/communities/${selectedCommunity.id}`}>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Original interface when no communities joined */
                  <>
                    {/* Product to Share Section - Original */}
                    {currentProduct && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Share2 className="h-5 w-5 text-green-600" />
                            <h3 className="font-semibold text-green-800">Ready to Share!</h3>
                          </div>
                          <Button 
                            onClick={clearCurrentProduct}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex space-x-3 mb-3">
                          <img 
                            src={currentProduct.image || "/placeholder.jpg"} 
                            alt={currentProduct.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-2">
                              {currentProduct.name}
                            </p>
                            <p className="text-sm text-green-600 font-medium">
                              ₹{currentProduct.price?.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <Button 
                          asChild
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Link href="/communities">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Go to Communities to Share
                          </Link>
                        </Button>
                      </div>
                    )}

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center space-x-3 mb-3">
                        <Users className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-800">Fashion Communities</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Connect with fashion enthusiasts, share your favorite products, and discover new styles!
                      </p>
                      
                      <div className="space-y-2">
                        <Button 
                          asChild
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Link href="/communities">
                            <Users className="h-4 w-4 mr-2" />
                            Browse Communities
                          </Link>
                        </Button>
                        
                        <Button 
                          asChild
                          variant="outline"
                          className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <Link href="/communities/create">
                            <Users className="h-4 w-4 mr-2" />
                            Create Community
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center space-x-3 mb-3">
                        <Share2 className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-800">Product Sharing</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Share products you love with your communities and get recommendations from others.
                      </p>
                      <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                        💡 <strong>Tip:</strong> Click the share button on product cards to add them here, then join communities to share with others!
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Welcome, {user.displayName || user.email}! 
                  {userCommunities.length > 0 && (
                    <>
                      <br />
                      Connected to {userCommunities.length} {userCommunities.length === 1 ? 'community' : 'communities'}.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
