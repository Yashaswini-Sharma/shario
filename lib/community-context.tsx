"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'
import { getProductPrice } from './pricing-utils'
import { 
  Community, 
  getUserCommunities, 
  leaveCommunity as leaveCommunityService,
  joinCommunityByCode as joinCommunityByCodeService,
  shareProductToCommunity as shareProductToCommunityService
} from './firebase-community-service'
import { toast } from '@/hooks/use-toast'

interface CommunityContextType {
  currentCommunityCode: string | null
  setCurrentCommunityCode: (code: string | null) => void
  userCommunities: Community[]
  currentCommunity: Community | null
  loading: boolean
  joinCommunity: (joinCode: string) => Promise<boolean>
  leaveCommunity: () => Promise<boolean>
  shareProductToCommunity: (product: any) => Promise<boolean>
  refreshCommunities: () => Promise<void>
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined)

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentCommunityCode, setCurrentCommunityCode] = useState<string | null>(null)
  const [userCommunities, setUserCommunities] = useState<Community[]>([])
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(false)

  // Load user communities on auth state change
  useEffect(() => {
    if (user?.uid) {
      refreshCommunities()
    } else {
      setUserCommunities([])
      setCurrentCommunity(null)
      setCurrentCommunityCode(null)
    }
  }, [user])

  // Update current community when code changes
  useEffect(() => {
    if (currentCommunityCode) {
      const community = userCommunities.find(c => c.joinCode === currentCommunityCode)
      setCurrentCommunity(community || null)
    } else {
      setCurrentCommunity(null)
    }
  }, [currentCommunityCode, userCommunities])

  const refreshCommunities = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const communities = await getUserCommunities(user.uid)
      setUserCommunities(communities)
      
      // If we have a current community code but it's not in our communities anymore, clear it
      if (currentCommunityCode && !communities.find(c => c.joinCode === currentCommunityCode)) {
        setCurrentCommunityCode(null)
      }
    } catch (error) {
      console.error('Error loading communities:', error)
      toast({
        title: "Error",
        description: "Failed to load communities",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const joinCommunity = async (joinCode: string): Promise<boolean> => {
    if (!user?.uid || !user?.displayName) {
      toast({
        title: "Error",
        description: "You must be logged in to join a community",
        variant: "destructive"
      })
      return false
    }

    try {
      setLoading(true)
      const result = await joinCommunityByCodeService(joinCode, user.uid, user.displayName)
      
      if (result.success && result.community) {
        setCurrentCommunityCode(joinCode)
        await refreshCommunities()
        toast({
          title: "Success!",
          description: `Joined ${result.community.name} community`,
          variant: "default"
        })
        return true
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to join community",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error joining community:', error)
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const leaveCommunity = async (): Promise<boolean> => {
    if (!user?.uid || !user?.displayName || !currentCommunity) {
      toast({
        title: "Error",
        description: "No community to leave",
        variant: "destructive"
      })
      return false
    }

    try {
      setLoading(true)
      await leaveCommunityService(currentCommunity.id, user.uid, user.displayName)
      
      setCurrentCommunityCode(null)
      setCurrentCommunity(null)
      await refreshCommunities()
      
      toast({
        title: "Left Community",
        description: `You have left ${currentCommunity.name}`,
        variant: "default"
      })
      return true
    } catch (error) {
      console.error('Error leaving community:', error)
      toast({
        title: "Error",
        description: "Failed to leave community",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const shareProductToCommunity = async (product: any): Promise<boolean> => {
    if (!user?.uid || !user?.displayName || !currentCommunity) {
      toast({
        title: "Error",
        description: "You must be in a community to share products",
        variant: "destructive"
      })
      return false
    }

    try {
      await shareProductToCommunityService(
        currentCommunity.id,
        user.uid,
        user.displayName,
        {
          id: product.id,
          name: product.name,
          price: getProductPrice(product), // Use consistent pricing
          image: product.image,
          brand: product.brand || 'Unknown',
          category: product.articleType || product.category || 'Fashion'
        }
      )

      toast({
        title: "Product Shared!",
        description: `Shared ${product.name} to ${currentCommunity.name}`,
        variant: "default"
      })
      return true
    } catch (error) {
      console.error('Error sharing product:', error)
      toast({
        title: "Error",
        description: "Failed to share product",
        variant: "destructive"
      })
      return false
    }
  }

  return (
    <CommunityContext.Provider value={{
      currentCommunityCode,
      setCurrentCommunityCode,
      userCommunities,
      currentCommunity,
      loading,
      joinCommunity,
      leaveCommunity,
      shareProductToCommunity,
      refreshCommunities
    }}>
      {children}
    </CommunityContext.Provider>
  )
}

export function useCommunity() {
  const context = useContext(CommunityContext)
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider')
  }
  return context
}
