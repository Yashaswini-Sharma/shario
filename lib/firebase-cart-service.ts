import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  runTransaction,
  writeBatch
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { CartItem, Cart, Product, CartSummary } from './types'

// Cart Collection Constants
const CARTS_COLLECTION = 'carts'
const CART_ITEMS_COLLECTION = 'cartItems'
const PRODUCTS_COLLECTION = 'products'

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  return timestamp?.toDate ? timestamp.toDate() : new Date()
}

// Add item to cart
export const addToCart = async (
  productId: string, 
  quantity: number = 1,
  selectedColor: string,
  selectedSize: string
): Promise<CartItem> => {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to add items to cart')
  }

  const userId = auth.currentUser.uid

  try {
    // Get product details
    const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId))
    if (!productDoc.exists()) {
      throw new Error('Product not found')
    }

    const product = {
      id: productDoc.id,
      ...productDoc.data(),
      createdAt: convertTimestamp(productDoc.data().createdAt),
      updatedAt: convertTimestamp(productDoc.data().updatedAt)
    } as Product

    // Check if item already exists in cart
    const cartItemsQuery = query(
      collection(db, CART_ITEMS_COLLECTION),
      where('userId', '==', userId),
      where('productId', '==', productId),
      where('selectedColor', '==', selectedColor),
      where('selectedSize', '==', selectedSize)
    )

    const existingItems = await getDocs(cartItemsQuery)

    if (!existingItems.empty) {
      // Update existing item quantity
      const existingItem = existingItems.docs[0]
      const currentQuantity = existingItem.data().quantity
      const newQuantity = currentQuantity + quantity

      await updateDoc(existingItem.ref, {
        quantity: newQuantity,
        updatedAt: Timestamp.fromDate(new Date())
      })

      return {
        id: existingItem.id,
        ...existingItem.data(),
        quantity: newQuantity,
        product,
        addedAt: convertTimestamp(existingItem.data().addedAt),
        updatedAt: new Date()
      } as CartItem
    } else {
      // Add new item to cart
      const cartItemData = {
        productId,
        userId,
        quantity,
        selectedColor,
        selectedSize,
        addedAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      }

      const docRef = await addDoc(collection(db, CART_ITEMS_COLLECTION), cartItemData)

      return {
        id: docRef.id,
        ...cartItemData,
        product,
        addedAt: new Date(),
        updatedAt: new Date()
      } as CartItem
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    throw error
  }
}

// Remove item from cart
export const removeFromCart = async (cartItemId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated')
  }

  try {
    await deleteDoc(doc(db, CART_ITEMS_COLLECTION, cartItemId))
  } catch (error) {
    console.error('Error removing from cart:', error)
    throw error
  }
}

// Update cart item quantity
export const updateCartItemQuantity = async (
  cartItemId: string, 
  quantity: number
): Promise<CartItem> => {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated')
  }

  if (quantity <= 0) {
    await removeFromCart(cartItemId)
    throw new Error('Item removed from cart')
  }

  try {
    await updateDoc(doc(db, CART_ITEMS_COLLECTION, cartItemId), {
      quantity,
      updatedAt: Timestamp.fromDate(new Date())
    })

    // Get updated item with product details
    const updatedItem = await getCartItem(cartItemId)
    return updatedItem
  } catch (error) {
    console.error('Error updating cart item quantity:', error)
    throw error
  }
}

// Get single cart item with product details
export const getCartItem = async (cartItemId: string): Promise<CartItem> => {
  try {
    const cartItemDoc = await getDoc(doc(db, CART_ITEMS_COLLECTION, cartItemId))
    
    if (!cartItemDoc.exists()) {
      throw new Error('Cart item not found')
    }

    const cartItemData = cartItemDoc.data()
    
    // Get product details
    const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, cartItemData.productId))
    if (!productDoc.exists()) {
      throw new Error('Product not found')
    }

    const product = {
      id: productDoc.id,
      ...productDoc.data(),
      createdAt: convertTimestamp(productDoc.data().createdAt),
      updatedAt: convertTimestamp(productDoc.data().updatedAt)
    } as Product

    return {
      id: cartItemDoc.id,
      ...cartItemData,
      product,
      addedAt: convertTimestamp(cartItemData.addedAt),
      updatedAt: convertTimestamp(cartItemData.updatedAt)
    } as CartItem
  } catch (error) {
    console.error('Error getting cart item:', error)
    throw error
  }
}

// Get all cart items for current user
export const getCartItems = async (): Promise<CartItem[]> => {
  if (!auth.currentUser) {
    return []
  }

  const userId = auth.currentUser.uid

  try {
    const cartItemsQuery = query(
      collection(db, CART_ITEMS_COLLECTION),
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    )

    const querySnapshot = await getDocs(cartItemsQuery)
    const cartItems: CartItem[] = []

    // Get all cart items with their product details
    for (const cartItemDoc of querySnapshot.docs) {
      const cartItemData = cartItemDoc.data()
      
      // Get product details
      const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, cartItemData.productId))
      if (productDoc.exists()) {
        const product = {
          id: productDoc.id,
          ...productDoc.data(),
          createdAt: convertTimestamp(productDoc.data().createdAt),
          updatedAt: convertTimestamp(productDoc.data().updatedAt)
        } as Product

        cartItems.push({
          id: cartItemDoc.id,
          ...cartItemData,
          product,
          addedAt: convertTimestamp(cartItemData.addedAt),
          updatedAt: convertTimestamp(cartItemData.updatedAt)
        } as CartItem)
      }
    }

    return cartItems
  } catch (error) {
    console.error('Error getting cart items:', error)
    throw error
  }
}

// Get cart summary (totals, counts)
export const getCartSummary = async (): Promise<CartSummary> => {
  try {
    const cartItems = await getCartItems()
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    
    // Calculate tax (example: 8.5% tax rate)
    const taxRate = 0.085
    const tax = subtotal * taxRate
    
    // Calculate shipping (free shipping over $100, otherwise $10)
    const shipping = subtotal >= 100 ? 0 : 10
    
    const totalPrice = subtotal + tax + shipping

    return {
      totalItems,
      totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping,
      discount: 0 // Placeholder for future discount logic
    }
  } catch (error) {
    console.error('Error calculating cart summary:', error)
    return {
      totalItems: 0,
      totalPrice: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0
    }
  }
}

// Clear entire cart
export const clearCart = async (): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated')
  }

  const userId = auth.currentUser.uid

  try {
    const cartItemsQuery = query(
      collection(db, CART_ITEMS_COLLECTION),
      where('userId', '==', userId)
    )

    const querySnapshot = await getDocs(cartItemsQuery)
    const batch = writeBatch(db)

    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
  } catch (error) {
    console.error('Error clearing cart:', error)
    throw error
  }
}

// Get cart count (total number of items)
export const getCartCount = async (): Promise<number> => {
  try {
    const summary = await getCartSummary()
    return summary.totalItems
  } catch (error) {
    console.error('Error getting cart count:', error)
    return 0
  }
}

// Move item from cart to wishlist (placeholder for future implementation)
export const moveToWishlist = async (cartItemId: string): Promise<void> => {
  // This would implement moving an item from cart to wishlist
  // For now, just remove from cart
  await removeFromCart(cartItemId)
}

// Sync cart with local storage (for offline support)
export const syncCartWithLocalStorage = async (): Promise<void> => {
  try {
    const cartItems = await getCartItems()
    localStorage.setItem('cart_backup', JSON.stringify(cartItems))
  } catch (error) {
    console.error('Error syncing cart with local storage:', error)
  }
}