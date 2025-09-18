"use client"

import { Search, ShoppingBag, Heart, User, Sparkles, Camera } from "lucide-react"
import { useState } from "react"
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { uploadImageAndAnalyze, type ImageData } from "@/lib/image-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useCartCount } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { ImageSearchResults } from "./image-search-results"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GameTimer } from "./game-timer"
import { useGame } from "@/lib/game-context"

function UserProfile() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sign-in">
            <User className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Sign In</span>
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/sign-up">
            <span className="hidden md:inline">Sign Up</span>
            <span className="md:hidden">Join</span>
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback>
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm">
            {user.displayName || user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.displayName || 'User'}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600">
          <User className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header() {
  const cartCount = useCartCount()
  const { gamePhase } = useGame()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchResults, setSearchResults] = useState<ImageData | null>(null)
  const [showResults, setShowResults] = useState(false)

  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsAnalyzing(true)
      setShowResults(true)
      const result = await uploadImageAndAnalyze(file)
      setSearchResults(result)
    } catch (error) {
      console.error('Error analyzing image:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <>
      <ImageSearchResults 
        open={showResults}
        onOpenChange={setShowResults}
        isAnalyzing={isAnalyzing}
        results={searchResults}
      />

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              {gamePhase === 'styling' || gamePhase === 'voting' ? (
                <GameTimer />
              ) : (
                <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
                  StyleHub
                </Link>
              )}

              <NavigationMenu className="hidden md:flex">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/mens" className="text-sm font-medium px-4 py-2 hover:text-primary transition-colors">
                        MEN
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/womens" className="text-sm font-medium px-4 py-2 hover:text-primary transition-colors">
                        WOMEN
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/browse" className="text-sm font-medium px-4 py-2 hover:text-primary transition-colors">
                        BROWSE DATASET
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/products" className="text-sm font-medium px-4 py-2 hover:text-primary transition-colors">
                        ALL PRODUCTS
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for products, brands and more"
                  className="pl-10 pr-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                />
                <input
                  type="file"
                  id="image-search"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSearch}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => document.getElementById('image-search')?.click()}
                >
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Search by image</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <UserProfile />

              <Link href="/dress-to-impress">
                <Button variant="ghost" size="sm" className="relative" title="Dress to Impress Game">
                  <Sparkles className="h-4 w-4" />
                  <span className="sr-only">Dress to Impress</span>
                </Button>
              </Link>

              <Button variant="ghost" size="sm" className="relative">
                <Heart className="h-4 w-4" />
                <span className="sr-only">Wishlist</span>
              </Button>

              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="sr-only">Shopping bag</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}