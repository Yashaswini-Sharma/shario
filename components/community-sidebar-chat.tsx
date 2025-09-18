"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, Users, Share2, X, ArrowLeft, Send, Hash, LogOut, ExternalLink, Image as ImageIcon, Paperclip } from "lucide-react"
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  const { user } = useAuth()
  const { currentProduct, setCurrentProduct } = useProductSharing()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    console.log('Image selected:', file?.name, file?.size)
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        })
        return
      }
      
      setSelectedImage(file)
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
      console.log('Image preview created:', preview)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSendImage = async () => {
    if (!selectedCommunity || !user || !selectedImage) return

    console.log('Sending image:', selectedImage.name, 'to community:', selectedCommunity.name)
    setIsUploadingImage(true)
    try {
      const base64Image = await convertImageToBase64(selectedImage)
      console.log('Image converted to base64, length:', base64Image.length)
      
      await sendMessageToCommunity(
        selectedCommunity.id,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        newMessage.trim() || "Shared an image",
        'image',
        undefined,
        undefined,
        base64Image,
        selectedImage.name
      )
      
      console.log('Image message sent successfully')
      setNewMessage("")
      handleRemoveImage()
      
      toast({
        title: "Image sent",
        description: "Your image was sent to the community"
      })
    } catch (error) {
      console.error('Error sending image:', error)
      toast({
        title: "Error",
        description: "Failed to send image",
        variant: "destructive"
      })
    } finally {
      setIsUploadingImage(false)
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

    console.log('Sharing product:', currentProduct, 'to community:', selectedCommunity.name)
    setIsSharingProduct(true)
    try {
      await shareProductToCommunity(
        selectedCommunity.id,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        {
          id: currentProduct.id,
          name: currentProduct.title || currentProduct.name || 'Product',
          price: currentProduct.price,
          image: currentProduct.image,
          brand: currentProduct.brand,
          category: currentProduct.category
        }
      )
      
      toast({
        title: "Product shared!",
        description: `Shared "${currentProduct.title || currentProduct.name}" to ${selectedCommunity.name}`
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
      if (selectedImage) {
        handleSendImage()
      } else {
        handleSendMessage()
      }
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
        <div className="fixed inset-y-0 right-0 z-[9998] w-72 min-w-72 max-w-72 bg-white border-l shadow-xl">
          <div className="flex flex-col h-full w-full">
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
                    <div className="space-y-3 w-full">
                      {messages.map((message) => (
                        <div key={message.id} className="bg-gray-50 rounded-lg p-3 w-full max-w-full break-words">
                          <div className="flex items-center justify-between mb-1 w-full">
                            <span className="font-medium text-sm text-purple-800 truncate max-w-[120px]">
                              {message.userName}
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {formatMessageTime(message.timestamp)}
                            </span>
                          </div>
                          {message.type === 'page_share' ? (
                            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400 w-full max-w-full">
                              <p className="text-xs text-blue-600 font-medium mb-2">
                                🔗 Shared a link:
                              </p>
                              {message.pageTitle && (
                                <p className="text-sm font-medium text-blue-800 mb-1 break-words">
                                  {message.pageTitle}
                                </p>
                              )}
                              <p className="text-sm text-gray-700 mb-2 break-words">{message.content}</p>
                              {message.pageUrl && (
                                <a
                                  href={message.pageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline break-all"
                                >
                                  Visit Page
                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </a>
                              )}
                            </div>
                          ) : message.type === 'image' ? (
                            <div className="w-full max-w-full">
                              {message.imageUrl && (
                                <div className="mb-2">
                                  <img 
                                    src={message.imageUrl} 
                                    alt={message.imageName || "Shared image"} 
                                    className="max-w-full h-auto rounded-lg shadow-sm max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(message.imageUrl, '_blank')}
                                  />
                                  {message.imageName && (
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                      📷 {message.imageName}
                                    </p>
                                  )}
                                </div>
                              )}
                              {message.content && message.content !== "Shared an image" && (
                                <p className="text-sm text-gray-700 break-words">{message.content}</p>
                              )}
                            </div>
                          ) : message.type === 'product_share' ? (
                            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400 w-full max-w-full">
                              <p className="text-xs text-green-600 font-medium mb-3">
                                🛍️ Shared a product:
                              </p>
                              {message.productData && (
                                <div className="space-y-3">
                                  {/* Product Image */}
                                  {message.productData.image && (
                                    <div className="mb-3">
                                      <img 
                                        src={message.productData.image} 
                                        alt={message.productData.name} 
                                        className="w-full h-32 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(`/products/${message.productData?.id}`, '_blank')}
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Product Details */}
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-green-800 break-words">
                                      {message.productData.name}
                                    </h4>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className="text-lg font-bold text-green-700">
                                        ₹{message.productData.price?.toFixed(2)}
                                      </span>
                                      {message.productData.brand && (
                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                          {message.productData.brand}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {message.productData.category && (
                                      <p className="text-xs text-green-600">
                                        📂 {message.productData.category}
                                      </p>
                                    )}
                                    
                                    <div className="pt-2">
                                      <a
                                        href={`/products/${message.productData.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 underline font-medium"
                                      >
                                        View Product
                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700 break-words">{message.content}</p>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Product Sharing Alert */}
                  {currentProduct && (
                    <div className="p-3 bg-blue-50 border-t w-full max-w-full">
                      <div className="flex items-start gap-3 w-full">
                        {currentProduct.image && (
                          <img 
                            src={currentProduct.image} 
                            alt={currentProduct.title} 
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-800 mb-1">Share this product?</p>
                          <p className="text-xs font-medium text-gray-800 truncate">{currentProduct.title}</p>
                          {currentProduct.price && (
                            <p className="text-xs text-blue-600">₹{currentProduct.price}</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
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

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="p-3 border-t bg-purple-50 w-full max-w-full">
                      <div className="text-xs text-purple-700 mb-2 font-medium">📷 Image ready to send:</div>
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full h-20 object-cover rounded-lg border-2 border-purple-200"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={handleSendImage}
                          disabled={isUploadingImage}
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {isUploadingImage ? 'Sending...' : 'Send Image'}
                        </Button>
                      </div>
                      {selectedImage && (
                        <p className="text-xs text-purple-600 mt-1">
                          {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="p-4 border-t w-full max-w-full">
                    {!selectedImage && (
                      <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        Click the 📎 button to attach images
                      </div>
                    )}
                    <div className="flex gap-2 w-full">
                      <div className="flex gap-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={!!selectedImage}
                          className="flex-shrink-0 hover:bg-purple-50 border-purple-200"
                          title="Attach image"
                        >
                          <Paperclip className="h-4 w-4 text-purple-600" />
                        </Button>
                      </div>
                      <Input
                        placeholder={selectedImage ? "Add caption (optional)..." : "Type a message..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 min-w-0"
                      />
                      <Button
                        onClick={selectedImage ? handleSendImage : handleSendMessage}
                        disabled={selectedImage ? isUploadingImage : !newMessage.trim()}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        {selectedImage ? (
                          isUploadingImage ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                          ) : (
                            <ImageIcon className="h-4 w-4" />
                          )
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
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
