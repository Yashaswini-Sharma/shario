"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './auth-context'

interface Message {
  id: string
  communityId: string
  userId: string
  userName: string
  content: string
  timestamp: Date
  type: 'message' | 'page_share' | 'system'
  pageUrl?: string
  pageTitle?: string
}

interface CommunityMember {
  id: string
  name: string
  avatar?: string
}

interface WebSocketContextType {
  socket: Socket | null
  messages: Message[]
  communityMembers: CommunityMember[]
  sendMessage: (communityId: string, content: string) => void
  sharePage: (communityId: string, pageUrl: string, pageTitle: string) => void
  joinCommunity: (communityId: string) => void
  leaveCommunity: (communityId: string) => void
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user && !socket) {
      // Initialize socket connection
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth: {
          userId: user.uid,
          userName: user.displayName || user.email
        }
      })

      newSocket.on('connect', () => {
        setIsConnected(true)
        console.log('Connected to WebSocket server')
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
        console.log('Disconnected from WebSocket server')
      })

      newSocket.on('message', (message: Message) => {
        setMessages(prev => [...prev, message])
      })

      newSocket.on('page_share', (data: { communityId: string, pageUrl: string, pageTitle: string, userName: string }) => {
        // Handle page share notification
        if (window.location.pathname !== data.pageUrl) {
          const shouldNavigate = confirm(`${data.userName} shared a page: ${data.pageTitle}. Would you like to navigate there?`)
          if (shouldNavigate) {
            window.location.href = data.pageUrl
          }
        }
      })

      newSocket.on('community_members', (data: { communityId: string, members: CommunityMember[] }) => {
        setCommunityMembers(data.members)
      })

      setSocket(newSocket)
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [user, socket])

  const sendMessage = (communityId: string, content: string) => {
    if (socket && user) {
      socket.emit('send_message', {
        communityId,
        content,
        userId: user.uid,
        userName: user.displayName || user.email
      })
    }
  }

  const sharePage = (communityId: string, pageUrl: string, pageTitle: string) => {
    if (socket && user) {
      socket.emit('share_page', {
        communityId,
        pageUrl,
        pageTitle,
        userId: user.uid,
        userName: user.displayName || user.email
      })
    }
  }

  const joinCommunity = (communityId: string) => {
    if (socket) {
      socket.emit('join_community', communityId)
    }
  }

  const leaveCommunity = (communityId: string) => {
    if (socket) {
      socket.emit('leave_community', communityId)
    }
  }

  const value = {
    socket,
    messages,
    communityMembers,
    sendMessage,
    sharePage,
    joinCommunity,
    leaveCommunity,
    isConnected
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}
