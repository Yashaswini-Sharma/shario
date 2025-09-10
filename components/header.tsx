"use client"

import { useState } from "react"
import { Search, ShoppingBag, User, Heart, Menu, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CommunityPopup } from "./community-popup"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCommunityOpen, setIsCommunityOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-2xl font-bold text-primary">Share.io</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Men
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Women
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Kids
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Accessories
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Sale
            </a>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search for products, brands and more" className="pl-10 bg-muted/50" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex"
              onClick={() => setIsCommunityOpen(true)}
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                2
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search for products, brands and more" className="pl-10 bg-muted/50" />
              </div>
              <nav className="flex flex-col space-y-2">
                <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">
                  Men
                </a>
                <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">
                  Women
                </a>
                <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">
                  Kids
                </a>
                <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">
                  Accessories
                </a>
                <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">
                  Sale
                </a>
              </nav>
              <div className="flex items-center space-x-4 pt-4 border-t">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsCommunityOpen(true)}
                >
                  <Users className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <CommunityPopup isOpen={isCommunityOpen} onClose={() => setIsCommunityOpen(false)} />
    </header>
  )
}
