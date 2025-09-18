"use client"

import { useState, useEffect } from "react"
import { getProductPrice } from "@/lib/pricing-utils"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { 
  Sparkles, 
  Play, 
  Users, 
  Clock, 
  DollarSign,
  Loader2,
  Crown,
  Palette,
  Timer,
  Trophy,
  ShoppingBag,
  Star,
  Heart,
  Zap,
  Target,
  Gift,
  TrendingUp,
  Award
} from "lucide-react"
import { useAuth } from '@/lib/auth-context'
import { useGame } from '@/lib/game-context'
import { FirebaseGameCartService } from '@/lib/firebase-game-cart-service'
import Link from 'next/link'

function GameLobby() {
  const { currentRoom, markReady, leaveGame, getCurrentPlayer, getOtherPlayers, canStartGame } = useGame()
  const { user } = useAuth()
  const [isAnimating, setIsAnimating] = useState(false)
  
  if (!currentRoom) return null

  const currentPlayer = getCurrentPlayer()
  const otherPlayers = getOtherPlayers()
  const allPlayers = Object.values(currentRoom.players)

  const handleMarkReady = async () => {
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in to play the game.",
        variant: "destructive"
      })
      return
    }

    if (!currentRoom) {
      toast({
        title: "No Game Room",
        description: "Please join a game room first.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsAnimating(true)
      await markReady()
      toast({
        title: "Success!",
        description: "You're ready to style! Waiting for other players...",
      })
    } catch (error) {
      console.error('Error marking ready:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark as ready. Please try again.",
        variant: "destructive"
      })
    } finally {
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }

  const handleLeaveGame = async () => {
    try {
      console.log('🚪 Leaving game...', { roomId: currentRoom?.id, userId: user?.uid })
      await leaveGame()
      console.log('✅ Successfully left game!')
      toast({
        title: "Left Arena",
        description: "You've left the fashion arena.",
      })
    } catch (error) {
      console.error('❌ Error leaving game:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to leave game. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Status Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Game Status:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>Player: {user?.email || 'Not signed in'} | Ready: {currentPlayer?.ready ? '✅' : '❌'}</p>
          <p>Room: {currentRoom?.id} | Players: {allPlayers.length}/{currentRoom.maxPlayers}</p>
          <p>Ready Players: {allPlayers.filter(p => p.ready).length}</p>
          <p>markReady function: {typeof markReady}</p>
          <p>Current User ID: {user?.uid}</p>
          <p>Current Player User ID: {currentPlayer?.userId}</p>
          <p>User Match: {user?.uid === currentPlayer?.userId ? '✅' : '❌'}</p>
        </div>
      </div>

      {/* Game Info Header with Enhanced Design */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 animate-gradient-x"></div>
        <CardHeader className="text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Sparkles className="h-10 w-10 text-yellow-300 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <CardTitle className="text-4xl font-bold text-gray-800 tracking-tight">
              Fashion Arena Ready!
            </CardTitle>
            <div className="relative">
              <Crown className="h-10 w-10 text-yellow-300 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
          </div>
          <CardDescription className="text-xl text-gray-700 font-medium">
            Players Joined: {currentRoom.currentPlayers}/{currentRoom.maxPlayers} • Ready to Style!
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="group flex flex-col items-center space-y-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-gray-800 text-lg">Theme Challenge</span>
              </div>
              <Badge className="text-base px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                {currentRoom.theme}
              </Badge>
            </div>
            <div className="group flex flex-col items-center space-y-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-gray-800 text-lg">Style Budget</span>
              </div>
              <Badge className="text-base px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                ₹{currentRoom.budget}
              </Badge>
            </div>
            <div className="group flex flex-col items-center space-y-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Timer className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-gray-800 text-lg">Time Limit</span>
              </div>
              <Badge className="text-base px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-0 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                {currentRoom.timeLimit} minutes
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Players Grid */}
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <CardTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Fashion Contestants
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-medium text-gray-700">
                {allPlayers.filter(p => p.ready).length}/{allPlayers.length} styled up
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {allPlayers.map((player, index) => (
              <Card key={player.userId} 
                   className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-purple-300 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="relative">
                      <Crown className="h-8 w-8 text-yellow-500 filter drop-shadow-lg animate-bounce" />
                      <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
                    </div>
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-16 h-16 mx-auto border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <AvatarImage src={player.photoURL} alt={player.displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white text-xl font-bold">
                        {player.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {player.ready && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                        <Zap className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-lg font-bold text-gray-800 truncate group-hover:text-purple-600 transition-colors duration-300">
                    {player.displayName}
                  </p>
                  <div className="mt-3">
                    {player.ready ? (
                      <Badge className="text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 text-white shadow-md px-4 py-1 animate-pulse">
                        ✨ Ready to Slay!
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-sm px-4 py-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700">
                        🎨 Getting Ready...
                      </Badge>
                    )}
                  </div>
                  {index === 0 && (
                    <div className="mt-2">
                      <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1">
                        👑 Style Captain
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Enhanced Empty Slots */}
            {Array.from({ length: currentRoom.maxPlayers - currentRoom.currentPlayers }).map((_, index) => (
              <Card key={`empty-${index}`} 
                   className="border-2 border-dashed border-gray-300 hover:border-purple-400 bg-gradient-to-br from-gray-50 to-white rounded-2xl transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Waiting for a stylist...</p>
                  <div className="mt-2 w-8 h-1 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mx-auto animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={(e) => {
            console.log('🔥 READY BUTTON CLICKED!', e)
            e.preventDefault()
            e.stopPropagation()
            handleMarkReady()
          }} 
          onMouseDown={(e) => {
            console.log('👆 Button mouse down')
            e.preventDefault()
          }}
          onMouseUp={() => console.log('👆 Button mouse up')}
          className={`flex-1 h-16 text-lg font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 border-0 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 text-white ${isAnimating ? 'animate-bounce' : ''}`}
          disabled={isAnimating}
          type="button"
          style={{ 
            zIndex: 1000,
            position: 'relative',
            pointerEvents: 'all'
          }}
        >
          {isAnimating ? (
            <>
              <Loader2 className="h-6 w-6 mr-3 animate-spin" />
              Styling Up...
            </>
          ) : currentPlayer?.ready ? (
            <>
              <Heart className="h-6 w-6 mr-3 animate-pulse" />
              Ready! Waiting for others...
            </>
          ) : (
            <>
              <Sparkles className="h-6 w-6 mr-3" />
              I'm Ready to Style! ✨
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleLeaveGame} 
          className="h-16 px-8 text-lg font-medium bg-white/80 hover:bg-red-50 border-2 border-gray-300 hover:border-red-300 rounded-2xl transition-all duration-300 hover:shadow-lg"
        >
          <Target className="h-5 w-5 mr-2" />
          Leave Arena
        </Button>
      </div>

      {/* Enhanced Game Rules */}
      <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-0 shadow-xl rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 to-pink-100/20"></div>
        <CardHeader className="relative z-10 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-purple-600" />
            How to Dominate the Style Arena
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg text-gray-700 relative z-10">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold">1</span>
              </div>
              <p>Create a stunning <strong>{currentRoom.theme}</strong> outfit within your ₹{currentRoom.budget} budget</p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold">2</span>
              </div>
              <p>Race against time - you have <strong>{currentRoom.timeLimit} minutes</strong> to style your look</p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold">3</span>
              </div>
              <p>Vote for the most <strong>creative and stylish</strong> outfits (can't vote for yourself!)</p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold">4</span>
              </div>
              <p>Most votes wins the crown! <strong>Become the Style Champion! 👑</strong></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StylingPhase() {
  const { currentRoom, timeRemaining, getMyCartTotal, getRemainingBudget, addToGameCart, removeFromGameCart, getCurrentPlayer, submitOutfit } = useGame()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [cartItems, setCartItems] = useState<any[]>([])
  const [addingItem, setAddingItem] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  if (!currentRoom) return null

  const progressPercentage = (timeRemaining / (currentRoom.timeLimit * 60)) * 100
  const currentPlayer = getCurrentPlayer()
  const myCartTotal = getMyCartTotal()
  const remainingBudget = getRemainingBudget()

  // Load products when component mounts
  useEffect(() => {
    loadProducts()
  }, [])

  // Subscribe to cart changes
  useEffect(() => {
    if (currentPlayer?.gameCart) {
      setCartItems(currentPlayer.gameCart)
    }
  }, [currentPlayer?.gameCart])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dataset?limit=50&gender=Women')
      const data = await response.json()
      if (data.items) {
        // Add consistent prices to items
        const itemsWithPrices = data.items.map((item: any) => ({
          ...item,
          price: getProductPrice(item), // Use consistent pricing
        }))
        setItems(itemsWithPrices)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (item: any) => {
    try {
      if (myCartTotal + item.price > currentRoom.budget) {
        toast({
          title: "Budget Alert! 💸",
          description: `This gorgeous piece would exceed your ₹${currentRoom.budget} styling budget!`,
          variant: "destructive",
        })
        return
      }

      setAddingItem(item.id)
      setTimeout(() => setAddingItem(null), 1000)

      await addToGameCart({
        productId: item.id,
        name: item.name,
        imageUrl: item.image,
        price: item.price,
        category: item.articleType || item.category,
        quantity: 1,
        selectedColor: item.color
      })

      toast({
        title: "Style Added! ✨",
        description: `${item.name} is now part of your stunning outfit!`,
      })
    } catch (error) {
      setAddingItem(null)
      toast({
        title: "Oops! 😅",
        description: error instanceof Error ? error.message : "Failed to add this fabulous item to your cart",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFromCart = async (productId: string) => {
    try {
      await removeFromGameCart(productId)
      toast({
        title: "Item Removed 👋",
        description: "No worries, keep building your perfect look!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      })
    }
  }

  const handleSubmitOutfit = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Wait! 🛍️",
        description: "Your outfit needs at least one fabulous piece to complete the look!",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      // Convert cart items to outfit format
      const outfit = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          category: item.category
        })),
        totalCost: myCartTotal,
        submittedAt: Date.now(),
        description: `${currentRoom.theme} themed outfit`
      }

      await submitOutfit(outfit)
      
      toast({
        title: "Outfit Submitted! 🎉",
        description: "Your stunning creation is ready for the judges! Waiting for other stylists...",
      })
    } catch (error) {
      toast({
        title: "Submission Error 😔",
        description: "Failed to submit your outfit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const categories = ['all', 'Topwear', 'Bottomwear', 'Dress', 'Shoes', 'Bags', 'Accessories']
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.articleType === selectedCategory || item.category === selectedCategory)

  const getTimeWarningColor = () => {
    if (timeRemaining < 60) return 'from-red-500 to-pink-500'
    if (timeRemaining < 120) return 'from-orange-500 to-yellow-500'
    return 'from-emerald-500 to-teal-500'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Enhanced Styling Header */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 animate-gradient-x"></div>
        <CardHeader className="text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <Palette className="h-12 w-12 text-yellow-200 animate-spin-slow" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <CardTitle className="text-4xl font-bold text-gray-800 tracking-tight">
              Style Your Masterpiece!
            </CardTitle>
            <div className="relative">
              <Sparkles className="h-12 w-12 text-yellow-200 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
          </div>
          <CardDescription className="text-xl text-gray-700 font-medium">
            Theme: <strong className="text-purple-700">{currentRoom.theme}</strong> • 
            Budget: <strong className="text-green-700">₹{currentRoom.budget}</strong> • 
            <strong className="text-blue-700">Create Your Vision!</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="text-center">
            <div className={`text-5xl font-bold bg-gradient-to-r ${getTimeWarningColor()} bg-clip-text text-transparent mb-4 animate-pulse`}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="w-full h-4 bg-white/20 rounded-full overflow-hidden"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-30 animate-pulse rounded-full"></div>
            </div>
            <p className="text-gray-700 text-lg font-medium mt-3">
              {timeRemaining < 60 ? '⚡ Final Sprint!' : timeRemaining < 120 ? '🔥 Time is Flying!' : '✨ You\'ve Got This!'}
            </p>
          </div>
          
          {/* Enhanced Budget Display */}
          <div className="flex justify-center gap-8 text-gray-800">
            <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300">
              <div className="text-2xl font-bold text-gray-800">₹{myCartTotal}</div>
              <div className="text-gray-700 font-medium">Invested</div>
              <div className="w-full h-2 bg-white/40 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(myCartTotal / currentRoom.budget) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300">
              <div className="text-2xl font-bold text-gray-800">₹{remainingBudget}</div>
              <div className="text-gray-700 font-medium">Available</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="h-4 w-4 text-blue-600 animate-pulse" />
              </div>
            </div>
            <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300">
              <div className="text-2xl font-bold text-gray-800">{cartItems.length}</div>
              <div className="text-gray-700 font-medium">Pieces</div>
              <div className="flex items-center justify-center mt-2">
                <Heart className="h-4 w-4 text-purple-600 animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Enhanced Product Browsing */}
        <div className="lg:col-span-3">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-purple-600" />
                Fashion Collection
              </CardTitle>
              <div className="flex gap-3 flex-wrap mt-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                      selectedCategory === category 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105' 
                        : 'bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 text-purple-600 hover:scale-105'
                    }`}
                  >
                    <span className="capitalize">{category === 'all' ? '✨ All Styles' : `👗 ${category}`}</span>
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl animate-pulse shadow-lg">
                      <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="group cursor-pointer bg-white border-2 border-gray-100 hover:border-purple-300 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl overflow-hidden">
                      <CardContent className="p-0">
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg'
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                            <span className="text-sm font-bold text-green-600">₹{item.price}</span>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <h4 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                            {item.name}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              ₹{item.price}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(item)}
                              disabled={myCartTotal + item.price > currentRoom.budget || addingItem === item.id}
                              className={`px-4 py-2 rounded-2xl font-medium transition-all duration-300 ${
                                myCartTotal + item.price > currentRoom.budget 
                                  ? 'bg-red-100 text-red-600 border-2 border-red-300 cursor-not-allowed opacity-90 hover:bg-red-100'
                                  : addingItem === item.id
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-110 shadow-lg'
                              }`}
                            >
                              {addingItem === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : myCartTotal + item.price > currentRoom.budget ? (
                                <>
                                  <ShoppingBag className="h-4 w-4 mr-1" />
                                  Over Budget
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="h-4 w-4 mr-1" />
                                  Add
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Shopping Cart */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-purple-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    My Outfit
                  </div>
                  <div className="text-sm text-gray-500 font-normal">
                    {cartItems.length} {cartItems.length === 1 ? 'piece' : 'pieces'}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-purple-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-600 mb-2">Your Canvas Awaits</p>
                  <p className="text-sm text-gray-400">Start adding pieces to create your masterpiece!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                  {cartItems.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="group flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.jpg'
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold line-clamp-2 text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                          {item.name}
                        </h5>
                        <p className="text-sm font-bold text-green-600 mt-1 bg-green-100 px-2 py-1 rounded-full inline-block">
                          ₹{item.price}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveFromCart(item.productId)}
                        className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border-2 border-red-200 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Enhanced Submit Button */}
              <div className="pt-4 border-t border-purple-100">
                <Button 
                  className={`w-full h-14 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-300 ${
                    cartItems.length === 0 || timeRemaining <= 0 || submitting
                      ? 'bg-red-100 text-red-600 border-2 border-red-300 cursor-not-allowed opacity-90 hover:bg-red-100'
                      : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white hover:scale-105 animate-pulse'
                  }`}
                  disabled={cartItems.length === 0 || timeRemaining <= 0 || submitting}
                  onClick={handleSubmitOutfit}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                      Submitting Magic...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-6 w-6 mr-3" />
                      Submit My Masterpiece! ✨
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function VotingPhase() {
  const { currentRoom, timeRemaining, playersGameCarts, submitCartVote, markAllVotingComplete, getCurrentPlayer } = useGame()
  const [selectedRatings, setSelectedRatings] = useState<{[playerId: string]: number}>({})
  const [hasVoted, setHasVoted] = useState(false)
  const [votingAnimation, setVotingAnimation] = useState<string | null>(null)
  
  if (!currentRoom) return null

  const currentPlayer = getCurrentPlayer()
  const otherPlayers = Object.values(currentRoom.players).filter(p => p.userId !== currentPlayer?.userId)
  
  // Calculate voting progress
  const allPlayers = Object.values(currentRoom.players)
  const playersVoted = allPlayers.filter(p => p.hasVoted).length
  const totalPlayers = allPlayers.length

  const handleRatingChange = (playerId: string, rating: number) => {
    setSelectedRatings(prev => ({
      ...prev,
      [playerId]: rating
    }))
    
    // Trigger animation for the player being rated
    setVotingAnimation(playerId)
    setTimeout(() => setVotingAnimation(null), 800)
  }

  const handleSubmitVotes = async () => {
    try {
      const ratingsToSubmit = Object.entries(selectedRatings).filter(([_, rating]) => rating > 0)
      
      if (ratingsToSubmit.length === 0) {
        toast({
          title: "Rate Some Outfits! ⭐",
          description: "Please rate at least one fabulous outfit before submitting your votes.",
          variant: "destructive",
        })
        return
      }

      // Submit votes for all rated players
      for (const [playerId, rating] of ratingsToSubmit) {
        await submitCartVote(playerId, rating)
      }
      
      // Mark voting complete for this player
      await markAllVotingComplete()
      
      setHasVoted(true)
      toast({
        title: "All Votes Submitted! 🎉",
        description: `You've rated ${ratingsToSubmit.length} stunning ${ratingsToSubmit.length === 1 ? 'outfit' : 'outfits'}. Results coming soon...`,
      })
    } catch (error) {
      console.error('Voting error:', error)
      toast({
        title: "Voting Error 😔",
        description: "Failed to submit votes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const StarRating = ({ rating, onRatingChange, disabled = false, playerId }: { rating: number, onRatingChange: (rating: number) => void, disabled?: boolean, playerId?: string }) => {
    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !disabled && onRatingChange(star)}
            disabled={disabled}
            className={`text-3xl transition-all duration-300 transform hover:scale-125 ${
              star <= rating 
                ? 'text-yellow-400 drop-shadow-lg animate-pulse' 
                : 'text-gray-300 hover:text-yellow-200'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:rotate-12 active:scale-150'} ${
              votingAnimation === playerId && star <= rating ? 'animate-bounce' : ''
            }`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Enhanced Voting Header */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-red-400 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 animate-gradient-x"></div>
        <CardHeader className="text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <Trophy className="h-12 w-12 text-yellow-200 animate-bounce" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <CardTitle className="text-4xl font-bold text-gray-800 tracking-tight">
              Judge the Fashion Show!
            </CardTitle>
            <div className="relative">
              <Star className="h-12 w-12 text-yellow-200 animate-spin-slow" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
          </div>
          <CardDescription className="text-xl text-gray-700 font-medium">
            Rate each stunning creation from <strong className="text-purple-700">1-5 stars</strong> • 
            Progress: <strong className="text-blue-700">{playersVoted}/{totalPlayers} judges voted</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800 mb-4 animate-pulse">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="relative">
              <Progress value={(timeRemaining / 180) * 100} className="w-full h-4 bg-white/20 rounded-full" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-30 animate-pulse rounded-full"></div>
            </div>
            <p className="text-gray-700 text-lg font-medium mt-3 flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 animate-pulse" />
              Time to make your choices!
            </p>
          </div>
          
          {/* Voting Progress */}
          <div className="flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 px-6 py-4">
              <div className="flex items-center gap-3 text-gray-800">
                <Users className="h-6 w-6 text-purple-600" />
                <div className="text-lg font-bold">
                  {playersVoted} of {totalPlayers} Judges Voted
                </div>
                <div className="w-24 h-2 bg-white/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(playersVoted / totalPlayers) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasVoted ? (
        <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-16 text-center">
            <div className="space-y-6">
              <div className="relative">
                <Trophy className="h-24 w-24 mx-auto text-green-500 animate-bounce" />
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Votes Submitted Successfully! 🎉
                </h3>
                <p className="text-xl text-gray-600 max-w-md mx-auto">
                  Thank you for judging! Waiting for other fashion critics to finish their evaluations...
                </p>
                <div className="flex justify-center items-center gap-3 text-lg">
                  <Loader2 className="h-6 w-6 text-green-500 animate-spin" />
                  <span className="text-green-600 font-medium">Results coming soon...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherPlayers.map((player) => {
              const playerCart = playersGameCarts[player.userId] || []
              const cartTotal = playerCart.reduce((sum, item) => sum + item.price, 0)
              
              return (
                <Card key={player.userId} className={`group overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl rounded-3xl transition-all duration-500 hover:scale-105 ${
                  votingAnimation === player.userId ? 'animate-pulse border-4 border-yellow-400' : ''
                }`}>
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-purple-100">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-16 h-16 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <AvatarImage src={player.photoURL} alt={player.displayName} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white text-xl font-bold">
                            {player.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                          <Award className="h-4 w-4 text-purple-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                          {player.displayName}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-lg">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span className="font-bold text-green-600">₹{cartTotal}</span>
                            <span className="text-gray-500">invested</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4 text-blue-500" />
                            <span className="font-bold text-blue-600">{playerCart.length}</span>
                            <span className="text-gray-500">{playerCart.length === 1 ? 'piece' : 'pieces'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Outfit Items */}
                    {playerCart.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto custom-scrollbar">
                        {playerCart.map((item, index) => (
                          <div key={`${item.productId}-${index}`} 
                               className="group/item flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 hover:from-purple-50 hover:to-pink-50 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
                            <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.jpg'
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-bold line-clamp-1 text-gray-800 group-hover/item:text-purple-600 transition-colors duration-300">
                                {item.name}
                              </h5>
                              <p className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full inline-block">
                                ₹{item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No items in this outfit</p>
                      </div>
                    )}

                    {/* Enhanced Rating Section */}
                    <div className="pt-6 border-t border-gray-100">
                      <div className="text-center space-y-4">
                        <p className="text-lg font-bold text-gray-800 flex items-center justify-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          Rate this fabulous creation:
                        </p>
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                          <StarRating
                            rating={selectedRatings[player.userId] || 0}
                            onRatingChange={(rating) => handleRatingChange(player.userId, rating)}
                            playerId={player.userId}
                          />
                          {selectedRatings[player.userId] && (
                            <p className="text-yellow-600 font-bold mt-3 animate-bounce">
                              {selectedRatings[player.userId] === 1 ? 'Nice Try! 🌟' :
                               selectedRatings[player.userId] === 2 ? 'Good Effort! ⭐⭐' :
                               selectedRatings[player.userId] === 3 ? 'Pretty Good! ⭐⭐⭐' :
                               selectedRatings[player.userId] === 4 ? 'Great Style! ⭐⭐⭐⭐' :
                               'Absolutely Stunning! ⭐⭐⭐⭐⭐'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Enhanced Submit Votes Button */}
          <div className="text-center pt-8">
            <Button 
              onClick={handleSubmitVotes}
              disabled={Object.keys(selectedRatings).length === 0 || Object.values(selectedRatings).some(r => r === 0)}
              className={`px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-110 ${
                Object.keys(selectedRatings).length === 0 || Object.values(selectedRatings).some(r => r === 0)
                  ? 'bg-red-100 text-red-600 border-2 border-red-300 cursor-not-allowed opacity-90 hover:bg-red-100'
                  : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white animate-pulse hover:animate-bounce'
              }`}
            >
              <Trophy className="h-6 w-6 mr-3" />
              Submit All My Votes! 🏆
              {Object.keys(selectedRatings).length > 0 && (
                <Badge className="ml-3 bg-gray-800/90 text-white border-0">
                  {Object.keys(selectedRatings).length} rated
                </Badge>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultsPhase() {
  const { currentRoom, playersGameCarts, cartVotingResults, leaveGame } = useGame()
  const [autoLeaveCountdown, setAutoLeaveCountdown] = useState(15) // 15 second countdown
  const [votingResults, setVotingResults] = useState<{[playerId: string]: { totalScore: number, averageScore: number, voteCount: number, comments: string[], playerName: string, cart: any[] }} | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Fetch voting results when component mounts
  useEffect(() => {
    if (currentRoom?.id) {
      const fetchResults = async () => {
        try {
          const results = await FirebaseGameCartService.getCartVotingResults(currentRoom.id)
          setVotingResults(results)
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 5000) // Show confetti for 5 seconds
        } catch (error) {
          console.error('Error fetching voting results:', error)
        }
      }
      fetchResults()
    }
  }, [currentRoom?.id])
  
  // Auto-leave room after countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoLeaveCountdown(prev => {
        if (prev <= 1) {
          // Auto leave when countdown reaches 0
          leaveGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [leaveGame])
  
  if (!currentRoom) return null

  // Calculate results from voting using the fetched results
  const playerResults = Object.values(currentRoom.players).map(player => {
    const playerCart = playersGameCarts[player.userId] || []
    const cartTotal = playerCart.reduce((sum, item) => sum + item.price, 0)
    
    // Get voting results for this player
    const playerVoteResult = votingResults?.[player.userId]
    const averageRating = playerVoteResult?.averageScore || 0
    const voteCount = playerVoteResult?.voteCount || 0

    return {
      player,
      cart: playerCart,
      cartTotal,
      averageRating,
      totalVotes: voteCount
    }
  }).sort((a, b) => b.averageRating - a.averageRating)

  // Find winners (could be multiple if tied)
  const highestRating = playerResults[0]?.averageRating || 0
  const winners = playerResults.filter(result => result.averageRating === highestRating && result.averageRating > 0)
  
  const StarDisplay = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-2xl transition-all duration-300 ${
              star <= Math.round(rating) 
                ? 'text-yellow-400 drop-shadow-lg animate-pulse' 
                : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-3 text-xl font-bold text-gray-700 bg-white/50 px-3 py-1 rounded-full">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0: return { icon: '🥇', color: 'from-yellow-400 to-yellow-600', label: '1st Place' }
      case 1: return { icon: '🥈', color: 'from-gray-400 to-gray-600', label: '2nd Place' }
      case 2: return { icon: '🥉', color: 'from-amber-600 to-amber-800', label: '3rd Place' }
      default: return { icon: '🏅', color: 'from-purple-400 to-purple-600', label: `${position + 1}th Place` }
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '✨', '🌟', '💫', '🎈'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Results Header */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 animate-gradient-x"></div>
        <CardHeader className="text-center relative z-10 py-12">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="relative">
              <Crown className="h-16 w-16 text-yellow-200 animate-bounce" />
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-300 rounded-full animate-ping"></div>
            </div>
            <CardTitle className="text-5xl font-bold text-gray-800 tracking-tight drop-shadow-lg">
              Fashion Showdown Results!
            </CardTitle>
            <div className="relative">
              <Trophy className="h-16 w-16 text-yellow-200 animate-bounce" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-300 rounded-full animate-ping"></div>
            </div>
          </div>
          <CardDescription className="text-2xl text-gray-700 font-bold">
            {winners.length > 1 
              ? `🎊 We have ${winners.length} joint champions! 🎊` 
              : winners.length === 1 
                ? `👑 ${winners[0].player.displayName} is the Style Champion! 👑`
                : '🎨 What an amazing fashion show! 🎨'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Enhanced Winners Section */}
      {winners.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent flex items-center justify-center gap-4">
            <Star className="h-12 w-12 text-yellow-500 animate-spin-slow" />
            {winners.length > 1 ? 'Style Champions' : 'Style Champion'}
            <Star className="h-12 w-12 text-yellow-500 animate-spin-slow" />
          </h2>
          <div className={`grid gap-8 ${winners.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
            {winners.map((result) => (
              <Card key={result.player.userId} className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-4 border-yellow-400 shadow-2xl rounded-3xl transform hover:scale-105 transition-all duration-500">
                {/* Winner Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 animate-pulse" />
                    WINNER
                    <Crown className="h-5 w-5 animate-pulse" />
                  </div>
                </div>
                
                <CardHeader className="pt-12">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-yellow-400 shadow-xl">
                        <AvatarImage src={result.player.photoURL} alt={result.player.displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white text-2xl font-bold">
                          {result.player.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2 animate-bounce">
                        <Crown className="h-12 w-12 text-yellow-500 filter drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-orange-700 bg-clip-text text-transparent">
                        {result.player.displayName}
                      </CardTitle>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3">
                          <div className="text-2xl font-bold text-green-600">₹{result.cartTotal}</div>
                          <div className="text-sm text-gray-600 font-medium">Invested</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3">
                          <div className="text-2xl font-bold text-blue-600">{result.cart.length}</div>
                          <div className="text-sm text-gray-600 font-medium">{result.cart.length === 1 ? 'Piece' : 'Pieces'}</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3">
                          <div className="text-2xl font-bold text-purple-600">{result.totalVotes}</div>
                          <div className="text-sm text-gray-600 font-medium">{result.totalVotes === 1 ? 'Vote' : 'Votes'}</div>
                        </div>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                        <StarDisplay rating={result.averageRating} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="grid grid-cols-2 gap-4">
                    {result.cart.map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="group flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-2xl border border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-bold line-clamp-1 text-gray-800 group-hover:text-yellow-700 transition-colors duration-300">
                            {item.name}
                          </h5>
                          <p className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full inline-block">
                            ₹{item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced All Results */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Trophy className="h-8 w-8 text-purple-600" />
          Complete Leaderboard
        </h2>
        <div className="space-y-4">
          {playerResults.map((result, index) => {
            const isWinner = winners.some(winner => winner.player.userId === result.player.userId)
            const medal = getMedalIcon(index)
            
            return (
              <Card key={result.player.userId} 
                   className={`group overflow-hidden transition-all duration-500 hover:shadow-2xl rounded-2xl ${
                     isWinner 
                       ? 'border-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 transform hover:scale-105' 
                       : 'border-2 border-gray-200 hover:border-purple-300 bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                   }`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Position Badge */}
                    <div className={`relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${medal.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-2xl">{medal.icon}</span>
                      <div className="absolute -bottom-1 text-xs font-bold bg-white/90 text-gray-700 px-2 py-1 rounded-full">
                        #{index + 1}
                      </div>
                    </div>
                    
                    {/* Player Avatar */}
                    <Avatar className="w-16 h-16 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <AvatarImage src={result.player.photoURL} alt={result.player.displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white text-xl font-bold">
                        {result.player.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Player Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-2xl font-bold ${isWinner ? 'text-yellow-700' : 'text-gray-800 group-hover:text-purple-600'} transition-colors duration-300`}>
                          {result.player.displayName}
                        </h3>
                        <div className="flex items-center gap-4 text-lg">
                          <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-700">₹{result.cartTotal}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
                            <ShoppingBag className="h-4 w-4 text-blue-600" />
                            <span className="font-bold text-blue-700">{result.cart.length}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span className="font-bold text-purple-700">{result.totalVotes}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-3">
                        <StarDisplay rating={result.averageRating} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="text-center space-y-6 py-8">
        <Card className="bg-gradient-to-r from-red-100 via-pink-100 to-purple-100 border-2 border-red-200 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Sparkles className="h-8 w-8 text-red-500 animate-pulse" />
              <p className="text-2xl font-bold text-red-700">
                Fashion Show Complete! 
              </p>
              <Sparkles className="h-8 w-8 text-red-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="text-6xl font-bold text-red-600 animate-pulse">
                {autoLeaveCountdown}
              </div>
              <p className="text-lg text-red-600 font-medium">
                Automatically leaving the runway in...
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          onClick={leaveGame} 
          className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300"
        >
          <Trophy className="h-6 w-6 mr-3" />
          Leave Fashion Arena Now
        </Button>
        <p className="text-lg text-gray-600 font-medium flex items-center justify-center gap-2">
          <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
          Thanks for playing Dress to Impress!
          <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
        </p>
      </div>
    </div>
  )
}

export default function DressToImpressPage() {
  const { user } = useAuth()
  const { currentRoom, isSearching, gamePhase, joinGame } = useGame()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 right-32 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-40 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-20 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <Header />
        <main className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12 space-y-8">
              <div className="relative">
                <div className="flex items-center justify-center gap-6 mb-8">
                  <div className="relative">
                    <Sparkles className="h-20 w-20 text-yellow-400 animate-spin-slow" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="text-center">
                    <h1 className="text-7xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl animate-gradient-x">
                      Dress to Impress
                    </h1>
                    <div className="mt-4 text-2xl font-bold text-gray-800">
                      The Ultimate Fashion Arena
                    </div>
                  </div>
                  <div className="relative">
                    <Crown className="h-20 w-20 text-yellow-400 animate-bounce" />
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
                  </div>
                </div>
                
                <p className="text-2xl text-gray-800 max-w-3xl mx-auto leading-relaxed font-medium">
                  Join fashion enthusiasts worldwide in the most exciting style competition! 
                  Create stunning outfits, showcase your creativity, and compete for the crown!
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Button asChild size="lg" className="h-16 text-xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600 border-0 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300">
                <Link href="/sign-in" className="flex items-center gap-3">
                  <Zap className="h-6 w-6" />
                  Sign In to Style
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="h-16 text-xl font-bold bg-white/80 hover:bg-white/90 border-2 border-gray-300 hover:border-gray-400 text-gray-800 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110">
                <Link href="/sign-up" className="flex items-center gap-3">
                  <Gift className="h-6 w-6" />
                  Join the Arena
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (gamePhase === 'lobby' && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-pink-900 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
        <Header />
        <main className="container mx-auto px-4 py-12 relative z-10">
          <GameLobby />
        </main>
      </div>
    )
  }

  if (gamePhase === 'styling' && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-pink-900 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10"></div>
        <Header />
        <main className="container mx-auto px-4 py-12 relative z-10">
          <StylingPhase />
        </main>
      </div>
    )
  }

  if (gamePhase === 'voting' && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10"></div>
        <Header />
        <main className="container mx-auto px-4 py-12 relative z-10">
          <VotingPhase />
        </main>
      </div>
    )
  }

  if (gamePhase === 'results' && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-800 to-red-900 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-red-500/10"></div>
        <Header />
        <main className="container mx-auto px-4 py-12 relative z-10">
          <ResultsPhase />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-32 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-40 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-spin-slow"></div>
      </div>
      
      <Header />
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Page Header */}
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-8">
              <div className="relative mr-8">
                <Sparkles className="h-24 w-24 text-yellow-400 animate-spin-slow" />
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <div className="text-center">
                <h1 className="text-8xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl mb-4 animate-gradient-x">
                  Dress to Impress
                </h1>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  The Ultimate Fashion Showdown
                </div>
              </div>
              <div className="relative ml-8">
                <Crown className="h-24 w-24 text-yellow-400 animate-bounce" />
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            <p className="text-2xl text-gray-800 max-w-4xl mx-auto leading-relaxed font-medium">
              Join fashion enthusiasts in epic style battles! Get random themes, work within budgets, 
              and create outfits that will leave judges speechless. Ready to dominate the runway?
            </p>
          </div>

          {/* Enhanced Game Entry Card */}
          <Card className="max-w-2xl mx-auto mb-16 bg-white/10 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 animate-gradient-x"></div>
            <CardHeader className="text-center py-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20">
              <CardTitle className="text-4xl font-bold flex items-center justify-center gap-4 text-gray-800 mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-xl">
                  <Play className="h-8 w-8 text-white" />
                </div>
                Quick Match Arena
              </CardTitle>
              <CardDescription className="text-xl text-gray-700 font-medium">
                Get matched with style competitors instantly and show your fashion prowess!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-12">
              <Button 
                onClick={joinGame} 
                disabled={isSearching}
                className={`w-full h-20 text-2xl font-bold rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-110 ${
                  isSearching 
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 animate-pulse'
                }`}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-8 w-8 mr-4 animate-spin" />
                    Finding Style Warriors...
                  </>
                ) : (
                  <>
                    <Users className="h-8 w-8 mr-4" />
                    Enter the Fashion Arena! ✨
                  </>
                )}
              </Button>
              
              {/* Enhanced Game Features */}
              <div className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-3xl border border-gray-600/50">
                <h4 className="text-2xl font-bold text-gray-100 mb-6 text-center flex items-center justify-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  Arena Features
                </h4>
                <div className="grid grid-cols-2 gap-6 text-gray-100">
                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">4 Stylists</div>
                      <div className="text-gray-200">per battle</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-full">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">5 Minutes</div>
                      <div className="text-gray-200">to create magic</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">₹50-₹200</div>
                      <div className="text-gray-200">surprise budgets</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full">
                      <Palette className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Random Themes</div>
                      <div className="text-gray-200">every game</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Feature Cards */}
          <div className="grid md:grid-cols-3 gap-10">
            <Card className="group text-center bg-gray-800/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-500 hover:scale-105 hover:bg-gray-700/90">
              <CardHeader className="py-10">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <Palette className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-100 group-hover:text-yellow-400 transition-colors duration-300">
                  Creative Expression
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-10">
                <p className="text-lg text-gray-300 leading-relaxed">
                  Unleash your inner designer with thousands of fashion pieces. 
                  Mix, match, and create looks that define your unique style vision.
                </p>
              </CardContent>
            </Card>

            <Card className="group text-center bg-gray-800/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-500 hover:scale-105 hover:bg-gray-700/90">
              <CardHeader className="py-10">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-100 group-hover:text-yellow-400 transition-colors duration-300">
                  Competitive Glory
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-10">
                <p className="text-lg text-gray-300 leading-relaxed">
                  Battle against fashion enthusiasts worldwide. Climb leaderboards, 
                  earn recognition, and establish yourself as a style legend.
                </p>
              </CardContent>
            </Card>

            <Card className="group text-center bg-gray-800/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-500 hover:scale-105 hover:bg-gray-700/90">
              <CardHeader className="py-10">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-100 group-hover:text-yellow-400 transition-colors duration-300">
                  Real-time Thrills
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-10">
                <p className="text-lg text-gray-300 leading-relaxed">
                  Experience heart-pounding fashion battles with live voting, 
                  instant feedback, and results that celebrate true creativity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}