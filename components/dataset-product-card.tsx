"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProcessedFashionItem } from "@/lib/huggingface-dataset"
import { Upload, ShoppingCart, Gamepad2, Share2 } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useGame } from "@/lib/game-context"
import { useCommunity } from "@/lib/community-context"
import { getProductPrice, formatPrice } from "@/lib/pricing-utils"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

interface DatasetProductCardProps {
  item: ProcessedFashionItem & { isUploaded?: boolean }
  onClick?: (item: ProcessedFashionItem & { isUploaded?: boolean }) => void
}

export function DatasetProductCard({ item, onClick }: DatasetProductCardProps) {
  const { addToCart } = useCart()
  const { addToGameCart, currentRoom, gamePhase } = useGame()
  const { shareProductToCommunity, currentCommunity } = useCommunity()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Get consistent price for this product
  const productPrice = getProductPrice(item)

  // Determine if we're in game mode
  const isInGame = currentRoom && (gamePhase === 'styling' || gamePhase === 'lobby')

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card onClick
    setIsAddingToCart(true)

    try {
      if (isInGame) {
        // Add to game cart (Firebase Realtime Database)
        await addToGameCart({
          productId: item.id,
          name: item.name,
          imageUrl: item.image, // Fixed property name
          price: productPrice, // Use consistent pricing
          category: item.articleType, // Using articleType as category
          quantity: 1,
          selectedColor: item.color
        })
        toast({
          title: "Added to Game Cart!",
          description: `${item.name} has been added to your game cart.`,
          variant: "default",
        })
      } else {
        // Add to regular cart (Firebase Firestore)
        await addToCart(item.id, 1, item.color, "M") // Default size
        toast({
          title: "Added to Cart!",
          description: `${item.name} has been added to your cart.`,
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleShareProduct = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card onClick
    
    if (!currentCommunity) {
      toast({
        title: "No Community",
        description: "Join a community first to share products.",
        variant: "destructive",
      })
      return
    }

    setIsSharing(true)

    try {
      await shareProductToCommunity(item)
    } catch (error) {
      console.error('Error sharing product:', error)
      toast({
        title: "Error",
        description: "Failed to share product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg">
      <div onClick={() => onClick?.(item)}>
        <CardContent className="p-0">
          <div className="aspect-square overflow-hidden rounded-t-lg relative">
            <Image
              src={item.image}
              alt={item.name}
              width={300}
              height={300}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.jpg';
              }}
            />
            {item.isUploaded && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                <Upload className="w-3 h-3" />
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-start gap-2 p-4">
          <div className="w-full">
            <h3 className="font-semibold text-sm line-clamp-2 mb-2">
              {item.name}
            </h3>
            
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant="secondary" className="text-xs">
                {item.articleType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.gender}
              </Badge>
              {item.isUploaded && (
                <Badge variant="default" className="text-xs bg-green-500">
                  AI Tagged
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 mb-3">
              {/* Price Display */}
              <div className="flex justify-between text-sm font-medium text-primary mb-2">
                <span>Price:</span>
                <span>{formatPrice(productPrice)}</span>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Color:</span>
                <span className="font-medium">{item.color}</span>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Category:</span>
                <span className="font-medium">{item.category}</span>
              </div>
              
              {item.subcategory && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Type:</span>
                  <span className="font-medium">{item.subcategory}</span>
                </div>
              )}
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Season:</span>
                <span className="font-medium">{item.season}</span>
              </div>
              
              {item.usage && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Usage:</span>
                  <span className="font-medium">{item.usage}</span>
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      </div>
      
      {/* Action Buttons - Outside of clickable area */}
      <div className="px-4 pb-4 space-y-2">
        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={`w-full ${isInGame 
            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
          size="sm"
        >
          {isAddingToCart ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Adding...
            </div>
          ) : isInGame ? (
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Add to Game Cart
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </div>
          )}
        </Button>

        {/* Share Button */}
        <Button
          onClick={handleShareProduct}
          disabled={isSharing}
          variant="outline"
          className="w-full"
          size="sm"
        >
          {isSharing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Sharing...
            </div>
          ) : currentCommunity ? (
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share to {currentCommunity.name}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share to Community
            </div>
          )}
        </Button>
      </div>
    </Card>
  )
}
