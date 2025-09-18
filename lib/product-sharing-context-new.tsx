"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

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
  shareProduct: (product: Product, communityId: string) => Promise<void>
}

const ProductSharingContext = createContext<ProductSharingContextType | undefined>(undefined)

export function ProductSharingProvider({ children }: { children: ReactNode }) {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const shareProduct = async (product: Product, communityId: string) => {
    try {
      // This will be used by the community sidebar to share products
      setCurrentProduct(product)
      
      // Here we can add actual sharing logic later
      // For now, just set the current product
      console.log('Sharing product:', product, 'to community:', communityId)
    } catch (error) {
      console.error('Error sharing product:', error)
    }
  }

  const contextValue: ProductSharingContextType = {
    currentProduct,
    setCurrentProduct,
    shareProduct
  }

  // Don't render on server side
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ProductSharingContext.Provider value={contextValue}>
      {children}
    </ProductSharingContext.Provider>
  )
}

export function useProductSharing(): ProductSharingContextType {
  const context = useContext(ProductSharingContext)
  if (context === undefined) {
    // Return a default implementation instead of throwing error
    return {
      currentProduct: null,
      setCurrentProduct: () => {},
      shareProduct: async () => {}
    }
  }
  return context
}
