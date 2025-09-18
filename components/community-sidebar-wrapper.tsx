"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { CommunitySidebarChat } from './community-sidebar-chat'

// Create context for managing sidebar state globally
const SidebarContext = createContext<{
  isOpen: boolean
  toggle: () => void
}>({
  isOpen: false,
  toggle: () => {}
})

export const useSidebar = () => useContext(SidebarContext)

export function CommunitySidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggle = () => setIsOpen(!isOpen)

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
      <CommunitySidebarChat isOpen={isOpen} onToggle={toggle} />
    </SidebarContext.Provider>
  )
}

export function CommunitySidebarWrapper() {
  return null // This is now handled by the provider
}

export default CommunitySidebarWrapper
