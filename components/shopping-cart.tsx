"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, X, ShoppingBag, ArrowRight, Tag } from "lucide-react"
import Link from "next/link"

// Mock cart data
const initialCartItems = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    brand: "StyleCo",
    price: 29.99,
    originalPrice: 39.99,
    image: "/premium-cotton-t-shirt-fashion.jpg",
    color: "White",
    size: "M",
    quantity: 2,
    inStock: true,
  },
  {
    id: 2,
    name: "Denim Jacket Classic",
    brand: "UrbanWear",
    price: 89.99,
    originalPrice: 119.99,
    image: "/classic-denim-jacket-fashion.jpg",
    color: "Blue",
    size: "L",
    quantity: 1,
    inStock: true,
  },
  {
    id: 3,
    name: "Casual Sneakers",
    brand: "ComfortFeet",
    price: 69.99,
    originalPrice: 89.99,
    image: "/casual-sneakers-shoes-fashion.jpg",
    color: "White",
    size: "9",
    quantity: 1,
    inStock: false,
  },
]

export function ShoppingCart() {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "save10") {
      setAppliedPromo("SAVE10")
      setPromoCode("")
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const savings = cartItems.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0)
  const promoDiscount = appliedPromo ? subtotal * 0.1 : 0
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = (subtotal - promoDiscount) * 0.08
  const total = subtotal - promoDiscount + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
          </p>
          <Link href="/catalog">
            <Button size="lg">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">{cartItems.length} items in your cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                        <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Color: {item.color}</span>
                          <span>Size: {item.size}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Stock Status */}
                    {!item.inStock && (
                      <Badge variant="destructive" className="mb-2">
                        Out of Stock
                      </Badge>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={!item.inStock}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 py-1 min-w-[2.5rem] text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={!item.inStock}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                        {item.originalPrice > item.price && (
                          <div className="text-sm text-muted-foreground line-through">
                            ${(item.originalPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Continue Shopping */}
          <div className="pt-4">
            <Link href="/catalog">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Promo Code */}
              <div>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={applyPromoCode}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                {appliedPromo && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Tag className="h-3 w-3" />
                    <span>Promo code "{appliedPromo}" applied</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>You saved</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}

                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Promo discount (10%)</span>
                    <span>-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Free Shipping Notice */}
              {shipping > 0 && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </div>
              )}

              {/* Checkout Button */}
              <Link href="/checkout">
                <Button className="w-full" size="lg" disabled={cartItems.some((item) => !item.inStock)}>
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              {/* Security Notice */}
              <div className="text-xs text-muted-foreground text-center">Secure checkout with SSL encryption</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
