"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'
import { GameMatchmaking } from './game-matchmaking'
import { GameRoom, GamePlayer, OutfitSelection } from './game-types'
import { toast } from '@/hooks/use-toast'

interface GameContextType {
  // State
  currentRoom: GameRoom | null
  isSearching: boolean
  gamePhase: 'lobby' | 'styling' | 'voting' | 'results' | null
  timeRemaining: number
  error: string | null

  // Actions
  joinGame: () => Promise<void>
  leaveGame: () => Promise<void>
  markReady: () => Promise<void>
  submitOutfit: (outfit: OutfitSelection) => Promise<void>
  submitVote: (playerId: string) => Promise<void>
  
  // Helpers
  getCurrentPlayer: () => GamePlayer | null
  getOtherPlayers: () => GamePlayer[]
  isGameCreator: () => boolean
  canStartGame: () => boolean
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [gamePhase, setGamePhase] = useState<'lobby' | 'styling' | 'voting' | 'results' | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [roomSubscription, setRoomSubscription] = useState<(() => void) | null>(null)

  // Game timer effect
  useEffect(() => {
    if (!currentRoom || gamePhase !== 'styling') return

    const timer = setInterval(() => {
      if (currentRoom.endTime) {
        const remaining = Math.max(0, currentRoom.endTime - Date.now())
        setTimeRemaining(Math.ceil(remaining / 1000))
        
        if (remaining <= 0) {
          setGamePhase('voting')
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [currentRoom, gamePhase])

  // Update game phase based on room status
  useEffect(() => {
    if (!currentRoom) {
      setGamePhase(null)
      return
    }

    if (currentRoom.status === 'waiting') {
      setGamePhase('lobby')
    } else if (currentRoom.status === 'active') {
      // Check if all players submitted outfits
      const players = Object.values(currentRoom.players)
      const allSubmitted = players.every(p => p.outfit)
      
      if (allSubmitted) {
        setGamePhase('voting')
      } else {
        setGamePhase('styling')
      }
    } else if (currentRoom.status === 'finished') {
      setGamePhase('results')
    }
  }, [currentRoom])

  // Join game queue
  const joinGame = async () => {
    if (!user) {
      setError('Please sign in to join the game')
      toast({
        title: "Authentication Required",
        description: "Please sign in to join the game.",
        variant: "destructive"
      })
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      // Wait a bit to ensure Firebase auth is fully loaded
      await new Promise(resolve => setTimeout(resolve, 100))

      const roomId = await GameMatchmaking.joinQueue(
        user.uid,
        user.displayName || user.email || 'Player',
        user.photoURL || undefined
      )

      // Subscribe to room updates
      const unsubscribe = GameMatchmaking.subscribeToRoom(roomId, (room) => {
        if (room) {
          setCurrentRoom(room)
          setIsSearching(false)
          
          toast({
            title: "Game Found!",
            description: `Joined room with ${room.currentPlayers}/${room.maxPlayers} players`,
          })
        } else {
          // Room was deleted or doesn't exist
          setCurrentRoom(null)
          setIsSearching(false)
          toast({
            title: "Game Ended",
            description: "The game room was closed or could not be found.",
            variant: "destructive"
          })
        }
      })

      setRoomSubscription(() => unsubscribe)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game'
      setError(errorMessage)
      setIsSearching(false)
      
      console.error('Join game error:', err)
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Leave current game
  const leaveGame = async () => {
    if (!user || !currentRoom) return

    try {
      await GameMatchmaking.leaveRoom(currentRoom.id, user.uid)
      
      // Cleanup subscription
      if (roomSubscription) {
        roomSubscription()
        setRoomSubscription(null)
      }
      
      setCurrentRoom(null)
      setGamePhase(null)
      setTimeRemaining(0)
      setError(null)

      toast({
        title: "Left Game",
        description: "You've left the game room.",
      })

    } catch (err) {
      console.error('Error leaving game:', err)
      toast({
        title: "Error",
        description: "Failed to leave game properly.",
        variant: "destructive"
      })
    }
  }

  // Mark player as ready
  const markReady = async () => {
    if (!user || !currentRoom) return

    try {
      await GameMatchmaking.markPlayerReady(currentRoom.id, user.uid)
      
      toast({
        title: "Ready!",
        description: "Waiting for other players...",
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark ready'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Submit outfit selection
  const submitOutfit = async (outfit: OutfitSelection) => {
    if (!user || !currentRoom) return

    try {
      await GameMatchmaking.submitOutfit(currentRoom.id, user.uid, outfit)
      
      toast({
        title: "Outfit Submitted!",
        description: "Your look has been submitted for voting.",
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit outfit'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Submit vote for another player
  const submitVote = async (playerId: string) => {
    if (!user || !currentRoom || playerId === user.uid) return

    try {
      await GameMatchmaking.submitVote(currentRoom.id, user.uid, playerId)
      
      toast({
        title: "Vote Submitted!",
        description: "Your vote has been recorded.",
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit vote'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Helper functions
  const getCurrentPlayer = (): GamePlayer | null => {
    if (!user || !currentRoom) return null
    return currentRoom.players[user.uid] || null
  }

  const getOtherPlayers = (): GamePlayer[] => {
    if (!user || !currentRoom) return []
    return Object.values(currentRoom.players).filter(p => p.userId !== user.uid)
  }

  const isGameCreator = (): boolean => {
    if (!user || !currentRoom) return false
    const players = Object.values(currentRoom.players)
    const creator = players.sort((a, b) => a.joinedAt - b.joinedAt)[0]
    return creator?.userId === user.uid
  }

  const canStartGame = (): boolean => {
    if (!currentRoom) return false
    const players = Object.values(currentRoom.players)
    return players.length >= 2 && players.every(p => p.ready)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomSubscription) {
        roomSubscription()
      }
    }
  }, [roomSubscription])

  const value: GameContextType = {
    // State
    currentRoom,
    isSearching,
    gamePhase,
    timeRemaining,
    error,

    // Actions
    joinGame,
    leaveGame,
    markReady,
    submitOutfit,
    submitVote,

    // Helpers
    getCurrentPlayer,
    getOtherPlayers,
    isGameCreator,
    canStartGame
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}