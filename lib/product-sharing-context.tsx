"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface Product {
  id: number | string
  name: string
  price: number
  image?: string
  brand?: string
  category?: string
  [key: string]: any
}

interface ProductSharingContextType {
  currentProduct: Product | null
  setCurrentProduct: (product: Product | null) => void
  shareProduct: (product: Product, communityId: string) => void
}

const ProductSharingContext = createContext<ProductSharingContextType | undefined>(undefined)

export function ProductSharingProvider({ children }: { children: ReactNode }) {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)

  const shareProduct = (product: Product, communityId: string) => {
    // This will be used by the community sidebar to share products
    setCurrentProduct(product)
  }

  return (
    <ProductSharingContext.Provider value={{
      currentProduct,
      setCurrentProduct,
      shareProduct
    }}>
      {children}
    </ProductSharingContext.Provider>
  )
}

export function useProductSharing() {
  const context = useContext(ProductSharingContext)
  if (context === undefined) {
    throw new Error('useProductSharing must be used within a ProductSharingProvider')
  }
  return context
}
