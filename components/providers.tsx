"use client"

import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { GameProvider } from '@/lib/game-context'
import { CommunityProvider } from '@/lib/community-context'
import { ProductSharingProvider } from '@/lib/product-sharing-context-new'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <GameProvider>
          <CommunityProvider>
            <ProductSharingProvider>
              {children}
              <Toaster />
            </ProductSharingProvider>
          </CommunityProvider>
        </GameProvider>
      </CartProvider>
    </AuthProvider>
  )
}