"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'

export default function CartPage() {
  const { items, summary, loading, updateQuantity, removeFromCart, clearCart } = useCart()
  const { user } = useAuth()
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set())

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    setProcessingItems(prev => new Set([...prev, itemId]))
    try {
      await updateQuantity(itemId, newQuantity)
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setProcessingItems(prev => new Set([...prev, itemId]))
    try {
      await removeFromCart(itemId)
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-8">
              Please sign in to view your shopping cart and saved items.
            </p>
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="space-y-4">
                <Card className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven&apos;t added anything to your cart yet. Start shopping to fill it up!
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button variant="ghost" size="sm" asChild className="mb-2">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">Shopping Cart ({summary.totalItems} items)</h1>
            </div>
            {items.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCart}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className={processingItems.has(item.id) ? 'opacity-50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg truncate">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={processingItems.has(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Product Options */}
                        <div className="flex gap-4 mb-4">
                          {item.selectedColor !== 'default' && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-muted-foreground">Color:</span>
                              <Badge variant="outline">{item.selectedColor}</Badge>
                            </div>
                          )}
                          {item.selectedSize !== 'default' && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-muted-foreground">Size:</span>
                              <Badge variant="outline">{item.selectedSize}</Badge>
                            </div>
                          )}
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={processingItems.has(item.id) || item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={processingItems.has(item.id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </div>
                            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                              <div className="text-sm text-muted-foreground line-through">
                                ${(item.product.originalPrice * item.quantity).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4 mr-2" />
                        Save for Later
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Trust Indicators */}
              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                      <span className="text-sm font-medium">Secure Checkout</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="h-6 w-6 text-blue-600" />
                      <span className="text-sm font-medium">Free Shipping Over $100</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <RotateCcw className="h-6 w-6 text-purple-600" />
                      <span className="text-sm font-medium">30-Day Returns</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({summary.totalItems} items)</span>
                      <span>${summary.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>
                        {summary.shipping === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `$${summary.shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${summary.tax?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${summary.totalPrice.toFixed(2)}</span>
                  </div>

                  {summary.shipping === 0 && summary.subtotal < 100 && (
                    <div className="text-sm text-muted-foreground">
                      Add ${(100 - summary.subtotal).toFixed(2)} more for free shipping!
                    </div>
                  )}

                  <Button className="w-full" size="lg" disabled={loading}>
                    Proceed to Checkout
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    Secure SSL encrypted checkout
                  </div>
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Promo Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                    <Button variant="outline" size="sm">Apply</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}