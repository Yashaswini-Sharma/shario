"use client"

import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { GameProvider } from '@/lib/game-context'
import { ProductSharingProvider } from '@/lib/product-sharing-context-new'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <GameProvider>
          <ProductSharingProvider>
            {children}
            <Toaster />
          </ProductSharingProvider>
        </GameProvider>
      </CartProvider>
    </AuthProvider>
  )
}