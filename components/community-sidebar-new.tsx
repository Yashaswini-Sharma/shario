"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Users, Plus, Share2, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useProductSharing } from "@/lib/product-sharing-context-new"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function CommunitySidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const { currentProduct, setCurrentProduct } = useProductSharing()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render on server side
  if (!mounted) {
    return null
  }

  // Don't show if user not logged in
  if (!user) {
    return null
  }

  const clearCurrentProduct = () => {
    setCurrentProduct(null)
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
                  Communities
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

              <div className="space-y-4 flex-1">
                {/* Product to Share Section */}
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
                        <Plus className="h-4 w-4 mr-2" />
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
                    💡 <strong>Tip:</strong> Click the share button on product cards to add them here, then visit communities to share with others!
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100">
                  <h3 className="font-semibold text-gray-800 mb-2">Quick Actions</h3>
                  <div className="space-y-2 text-sm">
                    <Link href="/dress-to-impress" className="block text-amber-700 hover:text-amber-800 transition-colors">
                      🎮 Play Dress to Impress
                    </Link>
                    <Link href="/cart" className="block text-amber-700 hover:text-amber-800 transition-colors">
                      🛍️ View Shopping Cart
                    </Link>
                    <Link href="/products" className="block text-amber-700 hover:text-amber-800 transition-colors">
                      👗 Browse All Products
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Welcome, {user.displayName || user.email}! 
                  <br />
                  Start connecting with the fashion community.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
