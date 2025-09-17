"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  addToCart as addToCartService,
  removeFromCart as removeFromCartService,
  updateCartItemQuantity as updateCartItemQuantityService,
  getCartItems,
  getCartSummary,
  clearCart as clearCartService,
  getCartCount,
  syncCartWithLocalStorage
} from './firebase-cart-service'
import { CartItem, CartSummary } from './types'
import { useAuth } from './auth-context'
import { toast } from '@/hooks/use-toast'

interface CartContextType {
  // State
  items: CartItem[]
  summary: CartSummary
  loading: boolean
  error: string | null

  // Actions
  addToCart: (productId: string, quantity?: number, selectedColor?: string, selectedSize?: string) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [summary, setSummary] = useState<CartSummary>({
    totalItems: 0,
    totalPrice: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()

  // Load cart data when user changes
  useEffect(() => {
    if (user) {
      refreshCart()
    } else {
      // Clear cart data when user logs out
      setItems([])
      setSummary({
        totalItems: 0,
        totalPrice: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0
      })
    }
  }, [user])

  // Refresh cart data
  const refreshCart = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const [cartItems, cartSummary] = await Promise.all([
        getCartItems(),
        getCartSummary()
      ])

      setItems(cartItems)
      setSummary(cartSummary)
      
      // Sync with local storage for offline support
      await syncCartWithLocalStorage()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cart'
      setError(errorMessage)
      console.error('Error refreshing cart:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add item to cart
  const addToCart = async (
    productId: string, 
    quantity: number = 1,
    selectedColor: string = 'default',
    selectedSize: string = 'default'
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      await addToCartService(productId, quantity, selectedColor, selectedSize)
      await refreshCart()
      
      toast({
        title: "Added to Cart",
        description: `Item added to your cart successfully.`
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Remove item from cart
  const removeFromCart = async (cartItemId: string) => {
    setLoading(true)
    setError(null)

    try {
      await removeFromCartService(cartItemId)
      await refreshCart()
      
      toast({
        title: "Removed from Cart",
        description: "Item removed from your cart."
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Update item quantity
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    setLoading(true)
    setError(null)

    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId)
      } else {
        await updateCartItemQuantityService(cartItemId, quantity)
        await refreshCart()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quantity'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    setLoading(true)
    setError(null)

    try {
      await clearCartService()
      await refreshCart()
      
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart."
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const value: CartContextType = {
    // State
    items,
    summary,
    loading,
    error,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Custom hook to get cart count only (lighter weight)
export function useCartCount() {
  const { summary } = useCart()
  return summary.totalItems
}