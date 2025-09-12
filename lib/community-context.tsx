"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface CommunityContextType {
  currentCommunityCode: string
  setCurrentCommunityCode: (code: string) => void
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined)

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [currentCommunityCode, setCurrentCommunityCode] = useState("")

  return (
    <CommunityContext.Provider value={{ currentCommunityCode, setCurrentCommunityCode }}>
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
