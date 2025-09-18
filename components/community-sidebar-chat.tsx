"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, Users, Share2, X, ArrowLeft, Send, Hash, LogOut, ExternalLink, Image as ImageIcon, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useProductSharing } from "@/lib/product-sharing-context-new"
import { Community, CommunityMessage, getUserCommunities, sendMessageToCommunity, shareProductToCommunity, listenToCommunityMessages, leaveCommunity } from "@/lib/firebase-community-service"
import { uploadImageAndAnalyze } from "@/lib/image-service"
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
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [imageAnalysisResults, setImageAnalysisResults] = useState<any>(null)
  
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

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      
      // Automatically analyze the image using our AI service
      setIsAnalyzingImage(true)
      try {
        const analysisResults = await uploadImageAndAnalyze(file, 'other')
        setImageAnalysisResults(analysisResults)
        console.log('Image analysis completed:', analysisResults)
        
        toast({
          title: "Image analyzed!",
          description: `Found ${analysisResults.tags.length} tags and ${analysisResults.similarItems?.length || 0} similar items`,
        })
      } catch (error) {
        console.error('Error analyzing image:', error)
        toast({
          title: "Analysis failed",
          description: "Could not analyze image, but you can still send it",
          variant: "destructive"
        })
      } finally {
        setIsAnalyzingImage(false)
      }
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
    setImageAnalysisResults(null)
    setIsAnalyzingImage(false)
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
      
      // Create an enriched message with analysis results
      let messageText = newMessage.trim() || "Shared an image"
      
      if (imageAnalysisResults) {
        if (imageAnalysisResults.tags && imageAnalysisResults.tags.length > 0) {
          messageText += `\n🏷️ Tags: ${imageAnalysisResults.tags.slice(0, 3).join(', ')}`
        }
        if (imageAnalysisResults.caption) {
          messageText += `\n💭 ${imageAnalysisResults.caption.slice(0, 100)}${imageAnalysisResults.caption.length > 100 ? '...' : ''}`
        }
        if (imageAnalysisResults.similarItems && imageAnalysisResults.similarItems.length > 0) {
          messageText += `\n🔍 Found ${imageAnalysisResults.similarItems.length} similar items in our collection`
        }
      }
      
      await sendMessageToCommunity(
        selectedCommunity.id,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        messageText,
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
        description: imageAnalysisResults ? 
          `Image sent with AI analysis: ${imageAnalysisResults.tags?.length || 0} tags detected` :
          "Your image was sent to the community"
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
      {/* Professional Sidebar Chat Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-[9998] w-72 min-w-72 max-w-[18vw] bg-white border-l border-gray-200 shadow-2xl overflow-hidden">
          <div className="flex flex-col h-full w-full">
            {/* Professional Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {selectedCommunity && !showCommunityList && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={backToCommunityList}
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-all duration-200 flex-shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4 text-gray-600" />
                  </Button>
                )}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-900 text-sm leading-tight truncate">
                      {selectedCommunity && !showCommunityList 
                        ? selectedCommunity.name 
                        : 'Communities'
                      }
                    </span>
                    {selectedCommunity && !showCommunityList && (
                      <span className="text-xs text-gray-500 truncate">
                        {selectedCommunity.memberCount} members • Active
                      </span>
                    )}
                  </div>
                </div>
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

            {/* Scrollable Content Area with Beautiful Scrollbar */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                {!user ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Join the Conversation</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                      Sign in to connect with fashion communities and share your style inspiration.
                    </p>
                    <Link href="/sign-in">
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg px-6 py-2 rounded-xl font-medium transition-all duration-200">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                ) : userCommunities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg mb-6">
                      <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">No Communities Yet</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                      Discover and join fashion communities to start chatting with like-minded enthusiasts.
                    </p>
                    <Link href="/communities">
                      <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg px-6 py-2 rounded-xl font-medium transition-all duration-200">
                        <Users className="h-4 w-4 mr-2" />
                        Browse Communities
                      </Button>
                    </Link>
                  </div>
              ) : showCommunityList ? (
                /* Community List with Beautiful Scrollbar */
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-blue-300 hover:scrollbar-thumb-blue-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                  <div className="p-4 space-y-3">
                    {userCommunities.map((community) => (
                      <Card key={community.id} className="cursor-pointer hover:bg-gray-50 transition-colors duration-200" onClick={() => selectCommunity(community)}>
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
                </div>
              ) : (
                /* Chat Interface with Beautiful Scrollbar */
                <div className="flex flex-col h-full">
                  {/* Messages with Beautiful Scrollbar */}
                  <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-indigo-300 hover:scrollbar-thumb-indigo-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                    <div className="space-y-3 w-full">
                      {messages.map((message) => (
                        <div key={message.id} className="bg-white rounded-xl p-3 max-w-[240px] break-words shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between mb-2 w-full">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-semibold">
                                  {message.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium text-xs text-gray-900 truncate">
                                {message.userName}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2 bg-gray-50 px-2 py-1 rounded-full">
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
                  </div>

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
                      <div className="text-xs text-purple-700 mb-2 font-medium">
                        📷 {isAnalyzingImage ? 'Analyzing image...' : 'Image ready to send:'}
                      </div>
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full h-20 object-cover rounded-lg border-2 border-purple-200"
                        />
                        {isAnalyzingImage && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Analysis Results */}
                      {imageAnalysisResults && (
                        <div className="mt-2 space-y-2">
                          {imageAnalysisResults.tags && imageAnalysisResults.tags.length > 0 && (
                            <div>
                              <div className="text-xs text-purple-600 font-medium mb-1">🏷️ Detected tags:</div>
                              <div className="flex flex-wrap gap-1">
                                {imageAnalysisResults.tags.slice(0, 3).map((tag: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {imageAnalysisResults.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    +{imageAnalysisResults.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {imageAnalysisResults.similarItems && imageAnalysisResults.similarItems.length > 0 && (
                            <div>
                              <div className="text-xs text-purple-600 font-medium mb-1">
                                🔍 Found {imageAnalysisResults.similarItems.length} similar items
                              </div>
                            </div>
                          )}
                          
                          {imageAnalysisResults.caption && (
                            <div>
                              <div className="text-xs text-purple-600 font-medium mb-1">💭 AI caption:</div>
                              <div className="text-xs text-gray-700 italic">
                                "{imageAnalysisResults.caption.slice(0, 60)}{imageAnalysisResults.caption.length > 60 ? '...' : ''}"
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={handleSendImage}
                          disabled={isUploadingImage || isAnalyzingImage}
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {isUploadingImage ? 'Sending...' : isAnalyzingImage ? 'Analyzing...' : 'Send Image'}
                        </Button>
                      </div>
                      {selectedImage && (
                        <p className="text-xs text-purple-600 mt-1">
                          {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Professional Message Input - Fixed at Bottom */}
                  <div className="p-4 border-t bg-white w-full max-w-full flex-shrink-0 shadow-lg">
                    {!selectedImage && (
                      <div className="text-xs text-gray-500 mb-3 flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                        <Paperclip className="h-3 w-3 text-gray-400" />
                        <span>Click 📎 to attach images or type a message</span>
                      </div>
                    )}
                    <div className="flex gap-3 w-full">
                      <div className="flex gap-2">
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
                          className="flex-shrink-0 hover:bg-blue-50 border-blue-200 transition-all duration-200 rounded-lg"
                          title="Attach image"
                        >
                          <Paperclip className="h-4 w-4 text-blue-600" />
                        </Button>
                      </div>
                      <Input
                        placeholder={selectedImage ? "Add caption (optional)..." : "Type a message..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 min-w-0 border-gray-200 focus:border-blue-300 focus:ring-blue-100 transition-all duration-200 rounded-lg"
                      />
                      <Button
                        onClick={selectedImage ? handleSendImage : handleSendMessage}
                        disabled={selectedImage ? isUploadingImage : !newMessage.trim()}
                        size="sm"
                        className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-sm transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      )}
    </>
  )
}
