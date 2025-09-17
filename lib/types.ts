// User Types
export interface User {
  id: string
  email?: string
  displayName?: string
  photoURL?: string
  communities: string[]
  createdAt: Date
}

// Community Types (Firebase-based)
export interface FirebaseCommunity {
  id: string
  name: string
  description: string
  type: 'public' | 'private'
  joinCode: string
  createdBy: string
  createdByName: string
  createdAt: number
  memberCount: number
  maxMembers: number
  tags: string[]
}

export interface FirebaseCommunityMember {
  userId: string
  userName: string
  joinedAt: number
  role: 'admin' | 'member'
  isActive: boolean
}

export interface FirebaseCommunityMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: number
  type: 'message' | 'page_share' | 'system'
  pageUrl?: string
  pageTitle?: string
}

// Legacy Community Types (WebSocket-based - kept for backward compatibility)
export interface Community {
  id: string
  name: string
  description: string
  creatorId: string
  creatorName: string
  members: string[]
  inviteCodes: string[]
  createdAt: Date
  updatedAt: Date
}

export interface InviteCode {
  id: string
  code: string
  communityId: string
  createdBy: string
  usedBy: string[]
  expiresAt: Date
  createdAt: Date
}

// Product Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  subcategory?: string
  brand?: string
  colors: string[]
  sizes: string[]
  inStock: boolean
  rating?: number
  reviews?: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Cart Types
export interface CartItem {
  id: string
  productId: string
  userId: string
  product: Product
  quantity: number
  selectedColor: string
  selectedSize: string
  addedAt: Date
  updatedAt: Date
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  totalItems: number
  totalPrice: number
  createdAt: Date
  updatedAt: Date
}

export interface CartSummary {
  totalItems: number
  totalPrice: number
  subtotal: number
  tax?: number
  shipping?: number
  discount?: number
}

// Order Types (for future use)
export interface Order {
  id: string
  userId: string
  items: CartItem[]
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  totalAmount: number
  shippingAddress: Address
  paymentMethod: string
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phoneNumber?: string
}

// Wishlist Types (for future use)
export interface WishlistItem {
  id: string
  productId: string
  userId: string
  product: Product
  addedAt: Date
}