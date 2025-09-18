"use client"

import { useState, useEffect } from 'react'
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
  ShoppingBag
} from "lucide-react"
import { useAuth } from '@/lib/auth-context'
import { useGame } from '@/lib/game-context'
import { FirebaseGameCartService } from '@/lib/firebase-game-cart-service'
import Link from 'next/link'

function GameLobby() {
  const { currentRoom, markReady, leaveGame, getCurrentPlayer, getOtherPlayers, canStartGame } = useGame()
  
  if (!currentRoom) return null

  const currentPlayer = getCurrentPlayer()
  const otherPlayers = getOtherPlayers()
  const allPlayers = Object.values(currentRoom.players)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Game Info Header */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Game Room Ready!
          </CardTitle>
          <CardDescription className="text-base">
            Players: {currentRoom.currentPlayers}/{currentRoom.maxPlayers}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Theme</span>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {currentRoom.theme}
              </Badge>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="font-medium">Budget</span>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                ₹{currentRoom.budget}
              </Badge>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Time Limit</span>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {currentRoom.timeLimit} min
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Players in Lobby
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              {allPlayers.filter(p => p.ready).length}/{allPlayers.length} ready
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allPlayers.map((player, index) => (
              <Card key={player.userId} className="text-center relative">
                {index === 0 && (
                  <div className="absolute -top-2 -right-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                  </div>
                )}
                <CardContent className="p-4">
                  <Avatar className="w-12 h-12 mx-auto mb-2">
                    <AvatarImage src={player.photoURL} alt={player.displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                      {player.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium truncate">{player.displayName}</p>
                  <div className="mt-2">
                    {player.ready ? (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        ✅ Ready
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        ⏳ Waiting
                      </Badge>
                    )}
                  </div>
                  {index === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Room Host</p>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Empty slots */}
            {Array.from({ length: currentRoom.maxPlayers - currentRoom.currentPlayers }).map((_, index) => (
              <Card key={`empty-${index}`} className="text-center border-dashed">
                <CardContent className="p-4">
                  <div className="w-12 h-12 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Waiting for player...</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!currentPlayer?.ready ? (
          <Button onClick={markReady} className="flex-1" size="lg">
            <Clock className="h-4 w-4 mr-2" />
            Mark Ready
          </Button>
        ) : (
          <Button disabled className="flex-1" size="lg">
            <Clock className="h-4 w-4 mr-2" />
            Ready! Waiting for others...
          </Button>
        )}
        
        <Button variant="outline" onClick={leaveGame} size="lg">
          Leave Game
        </Button>
      </div>

      {/* Game Rules */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">How to Play</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Create an outfit that matches the theme within your budget</p>
          <p>• You have {currentRoom.timeLimit} minutes to style your look</p>
          <p>• Vote for the best outfit (excluding your own)</p>
          <p>• Player with most votes wins! 🏆</p>
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
        // Add random prices to items
        const itemsWithPrices = data.items.map((item: any) => ({
          ...item,
          price: Math.floor(Math.random() * 1500) + 500, // $5-20 range
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
          title: "Budget Exceeded!",
          description: `Adding this item would exceed your budget of ₹${currentRoom.budget}`,
          variant: "destructive",
        })
        return
      }

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
        title: "Added to Cart!",
        description: `${item.name} has been added to your game cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to cart",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFromCart = async (productId: string) => {
    try {
      await removeFromGameCart(productId)
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart.",
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
        title: "Cannot Submit",
        description: "Please add at least one item to your cart before submitting.",
        variant: "destructive",
      })
      return
    }

    try {
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
        title: "Outfit Submitted!",
        description: "Your outfit has been submitted successfully. Waiting for other players...",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit outfit. Please try again.",
        variant: "destructive",
      })
    }
  }

  const categories = ['all', 'Topwear', 'Bottomwear', 'Dress', 'Shoes', 'Bags', 'Accessories']
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.articleType === selectedCategory || item.category === selectedCategory)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card className="bg-gradient-to-r from-orange-100 to-red-100 border-orange-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Palette className="h-6 w-6 text-orange-600" />
            Style Your Look!
          </CardTitle>
          <CardDescription className="text-base">
            Theme: <strong>{currentRoom.theme}</strong> • Budget: <strong>₹{currentRoom.budget}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">Time remaining</p>
          </div>
          
          {/* Budget Display */}
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600">${myCartTotal}</div>
              <div className="text-muted-foreground">Spent</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">₹{remainingBudget}</div>
              <div className="text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{cartItems.length}</div>
              <div className="text-muted-foreground">Items</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Product Browsing */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Browse Products</CardTitle>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'All' : category}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg'
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-600">${item.price}</span>
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(item)}
                              disabled={myCartTotal + item.price > currentRoom.budget}
                            >
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              Add
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

        {/* Shopping Cart */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                My Outfit ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No items selected</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
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
                        <h5 className="text-xs font-medium line-clamp-2">{item.name}</h5>
                        <p className="text-xs text-green-600 font-semibold">${item.price}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveFromCart(item.productId)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Submit Button */}
              <Button 
                className="w-full"
                disabled={cartItems.length === 0 || timeRemaining <= 0}
                size="lg"
                onClick={handleSubmitOutfit}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Submit Outfit
              </Button>
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
  }

  const handleSubmitVotes = async () => {
    try {
      const ratingsToSubmit = Object.entries(selectedRatings).filter(([_, rating]) => rating > 0)
      
      if (ratingsToSubmit.length === 0) {
        toast({
          title: "No Ratings",
          description: "Please rate at least one outfit before submitting.",
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
        title: "All Votes Submitted!",
        description: `You've rated ${ratingsToSubmit.length} outfits. Waiting for other players to finish voting...`,
      })
    } catch (error) {
      console.error('Voting error:', error)
      toast({
        title: "Error",
        description: "Failed to submit votes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const StarRating = ({ rating, onRatingChange, disabled = false }: { rating: number, onRatingChange: (rating: number) => void, disabled?: boolean }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !disabled && onRatingChange(star)}
            disabled={disabled}
            className={`text-2xl transition-colors ${
              star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-200'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-purple-600" />
            Rate the Outfits!
          </CardTitle>
          <CardDescription className="text-base">
            Rate each player's outfit from 1-5 stars • Progress: {playersVoted}/{totalPlayers} voted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <Progress value={(timeRemaining / 180) * 100} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">Time remaining to vote</p>
          </div>
        </CardContent>
      </Card>

      {hasVoted ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2">Votes Submitted!</h3>
            <p className="text-muted-foreground">
              Waiting for other players to finish voting...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherPlayers.map((player) => {
            const playerCart = playersGameCarts[player.userId] || []
            const cartTotal = playerCart.reduce((sum, item) => sum + item.price, 0)
            
            return (
              <Card key={player.userId} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={player.photoURL} alt={player.displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                        {player.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{player.displayName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        ${cartTotal} spent • {playerCart.length} items
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Outfit Items */}
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {playerCart.map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
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
                          <h5 className="text-xs font-medium line-clamp-1">{item.name}</h5>
                          <p className="text-xs text-green-600">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {playerCart.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No items in outfit</p>
                    </div>
                  )}

                  {/* Rating Section */}
                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">Rate this outfit:</p>
                      <StarRating
                        rating={selectedRatings[player.userId] || 0}
                        onRatingChange={(rating) => handleRatingChange(player.userId, rating)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!hasVoted && (
        <div className="text-center">
          <Button 
            onClick={handleSubmitVotes}
            size="lg"
            disabled={Object.keys(selectedRatings).length === 0 || Object.values(selectedRatings).some(r => r === 0)}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Submit All Ratings
          </Button>
        </div>
      )}
    </div>
  )
}

function ResultsPhase() {
  const { currentRoom, playersGameCarts, cartVotingResults, leaveGame } = useGame()
  const [autoLeaveCountdown, setAutoLeaveCountdown] = useState(10) // 10 second countdown
  const [votingResults, setVotingResults] = useState<{[playerId: string]: { totalScore: number, averageScore: number, voteCount: number, comments: string[], playerName: string, cart: any[] }} | null>(null)
  
  // Fetch voting results when component mounts
  useEffect(() => {
    if (currentRoom?.id) {
      const fetchResults = async () => {
        try {
          const results = await FirebaseGameCartService.getCartVotingResults(currentRoom.id)
          setVotingResults(results)
        } catch (error) {
          console.error('Error fetching voting results:', error)
        }
      }
      fetchResults()
    }
  }, [currentRoom?.id])
  
  // Auto-leave room after 10 seconds
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
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= Math.round(rating) 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-600" />
            Game Results!
          </CardTitle>
          <CardDescription className="text-lg">
            {winners.length > 1 
              ? `We have ${winners.length} joint winners!` 
              : winners.length === 1 
                ? `${winners[0].player.displayName} wins!`
                : 'No winners this round'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Winners Section */}
      {winners.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">
            🏆 {winners.length > 1 ? 'Winners' : 'Winner'} 🏆
          </h2>
          <div className={`grid gap-6 ${winners.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
            {winners.map((result) => (
              <Card key={result.player.userId} className="border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={result.player.photoURL} alt={result.player.displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-400 text-white text-xl">
                          {result.player.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2">
                        <Crown className="h-8 w-8 text-yellow-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{result.player.displayName}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>${result.cartTotal} spent</span>
                        <span>{result.cart.length} items</span>
                        <span>{result.totalVotes} votes</span>
                      </div>
                      <StarDisplay rating={result.averageRating} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {result.cart.map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="flex items-center gap-2 p-2 bg-white/50 rounded">
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
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
                          <h5 className="text-xs font-medium line-clamp-1">{item.name}</h5>
                          <p className="text-xs text-green-600">${item.price}</p>
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

      {/* All Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center">Final Rankings</h2>
        <div className="space-y-4">
          {playerResults.map((result, index) => {
            const isWinner = winners.some(winner => winner.player.userId === result.player.userId)
            
            return (
              <Card key={result.player.userId} className={`${isWinner ? 'border-yellow-400 bg-yellow-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={result.player.photoURL} alt={result.player.displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                          {result.player.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{result.player.displayName}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>${result.cartTotal}</span>
                          <span>{result.cart.length} items</span>
                        </div>
                      </div>
                      <StarDisplay rating={result.averageRating} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <div className="bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-lg font-semibold text-red-700 mb-2">
            🚀 Game Complete! 
          </p>
          <p className="text-sm text-red-600">
            Automatically leaving room in {autoLeaveCountdown} seconds...
          </p>
        </div>
        
        <Button onClick={leaveGame} size="lg" className="min-w-48">
          Leave Room Now
        </Button>
        <p className="text-sm text-muted-foreground">
          Thanks for playing Dress to Impress!
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-600" />
              <h1 className="text-4xl font-bold mb-4">Sign In to Play!</h1>
              <p className="text-xl text-muted-foreground">
                Join the fashion showdown and show off your styling skills
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (gamePhase === 'lobby' && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <GameLobby />
        </main>
      </div>
    )
  }

  if (gamePhase === 'styling' && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <StylingPhase />
        </main>
      </div>
    )
  }

  if (gamePhase === 'voting' && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <VotingPhase />
        </main>
      </div>
    )
  }

  if (gamePhase === 'results' && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <ResultsPhase />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-16 w-16 text-purple-600 mr-4" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dress to Impress
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join random players in an epic fashion showdown! Get a theme, budget, and limited time to create the perfect outfit that will impress the judges.
            </p>
          </div>

          {/* Game Entry Card */}
          <Card className="max-w-lg mx-auto mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2">
                <Play className="h-6 w-6 text-primary" />
                Quick Match
              </CardTitle>
              <CardDescription className="text-base">
                Get matched with other players instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={joinGame} 
                size="lg" 
                className="w-full"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Finding Players...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 mr-2" />
                    Enter Game
                  </>
                )}
              </Button>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Game Features
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>4 players per game</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>5 minutes to create your look</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Random budget ($50-$200)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span>Surprise themes every game</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Creative Styling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Express your unique fashion sense with our extensive wardrobe and accessories
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Competitive Play</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Compete against other players and climb the fashion leaderboards
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 bg-pink-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="text-lg">Real-time Fun</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fast-paced matches with live voting and instant results
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}