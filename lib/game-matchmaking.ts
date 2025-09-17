import { 
  ref, 
  push, 
  onValue, 
  off, 
  update, 
  get, 
  remove,
  query,
  orderByChild,
  equalTo,
  limitToFirst,
  serverTimestamp,
  onDisconnect,
  runTransaction
} from 'firebase/database'
import { realtimeDb, auth } from './firebase'
import { 
  GameRoom, 
  GamePlayer, 
  GAME_THEMES, 
  BUDGET_OPTIONS, 
  GAME_CONFIG,
  GameTheme 
} from './game-types'

export class GameMatchmaking {
      /**
   * Join the matchmaking queue - Simple approach without transactions
   */
  static async joinQueue(userId: string, displayName: string, photoURL?: string): Promise<string> {
    console.log(`🔍 ${displayName} (${userId}) joining matchmaking queue...`)
    
    try {
      // First, clean up any empty rooms
      await this.cleanupEmptyRooms()
      
      // Find all available rooms
      const roomsRef = ref(realtimeDb, 'gameRooms')
      const snapshot = await get(roomsRef)
      
      if (snapshot.exists()) {
        const rooms = snapshot.val()
        
        // Look for available rooms
        for (const [roomId, roomData] of Object.entries(rooms)) {
          const room = roomData as any
          
          // Check if room is available and has space
          if (room.status === 'waiting' && room.players) {
            const playerCount = Object.keys(room.players).length
            
            console.log(`🔎 Room ${roomId}: ${playerCount}/4 players`)
            
            if (playerCount < 4) {
              console.log(`✨ Trying to join room ${roomId}...`)
              
              // Try to add player directly - simple approach
              try {
                const playerRef = ref(realtimeDb, `gameRooms/${roomId}/players/${userId}`)
                await update(playerRef, {
                  userId,
                  displayName,
                  photoURL,
                  ready: false,
                  joinedAt: Date.now(),
                  votes: 0,
                  hasVoted: false
                })
                
                // Update player count
                const newPlayerCount = playerCount + 1
                await update(ref(realtimeDb, `gameRooms/${roomId}`), {
                  currentPlayers: newPlayerCount
                })
                
                console.log(`✅ Successfully joined room ${roomId} (${newPlayerCount}/4 players)`)
                await this.setupDisconnectHandler(roomId, userId)
                return roomId
                
              } catch (error) {
                console.log(`❌ Failed to join room ${roomId}, trying next...`)
                // Continue to next room
              }
            }
          }
        }
      }
      
      // No available rooms, create new one
      console.log('🆕 No available rooms found, creating new room...')
      const roomId = await this.createRoom(userId, displayName, photoURL)
      console.log(`✅ Created new room: ${roomId}`)
      return roomId
      
    } catch (error) {
      console.error('💥 Error in joinQueue:', error)
      throw new Error(`Failed to join game: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Add user to waiting room
   */
  static async addToWaitingRoom(userId: string, displayName: string, photoURL?: string): Promise<void> {
    try {
      const waitingRoomRef = ref(realtimeDb, `waitingRoom/${userId}`)
      await update(waitingRoomRef, {
        userId,
        displayName,
        photoURL,
        joinedAt: Date.now(),
        status: 'searching'
      })
    } catch (error) {
      console.error('Error adding to waiting room:', error)
    }
  }

  /**
   * Remove user from waiting room
   */
  static async removeFromWaitingRoom(userId: string): Promise<void> {
    try {
      const waitingRoomRef = ref(realtimeDb, `waitingRoom/${userId}`)
      await remove(waitingRoomRef)
    } catch (error) {
      console.error('Error removing from waiting room:', error)
    }
  }

  /**
   * Find available rooms that are waiting for players
   */
  static async findAvailableRooms(): Promise<GameRoom[]> {
    try {
      const roomsRef = ref(realtimeDb, 'gameRooms')
      const snapshot = await get(roomsRef)
      
      if (snapshot.exists()) {
        const rooms = snapshot.val()
        
        // Convert to array and sort by creation time (oldest first for better filling)
        const roomArray = Object.entries(rooms)
          .map(([id, room]: [string, any]) => ({ ...room, id }))
          .filter(room => {
            const isWaiting = room.status === 'waiting'
            const hasSpace = room.currentPlayers < room.maxPlayers
            const isValid = room.currentPlayers > 0 && room.currentPlayers <= room.maxPlayers
            const notTooOld = Date.now() - room.createdAt < (GAME_CONFIG.ROOM_TIMEOUT_MINUTES * 60 * 1000)
            
            const result = isWaiting && hasSpace && isValid && notTooOld
            
            console.log(`Room ${room.id}: status=${room.status}, players=${room.currentPlayers}/${room.maxPlayers}, age=${Math.round((Date.now() - room.createdAt) / 1000)}s, valid=${result}`)
            
            return result
          })
          // Sort by current players (fill rooms closer to capacity first) then by creation time
          .sort((a, b) => {
            // Primary sort: rooms with more players first (to fill them up faster)
            if (b.currentPlayers !== a.currentPlayers) {
              return b.currentPlayers - a.currentPlayers
            }
            // Secondary sort: older rooms first
            return a.createdAt - b.createdAt
          })
        
        console.log(`Found ${roomArray.length} available rooms`)
        return roomArray
      }
      
      console.log('No available rooms found')
      return []
    } catch (error) {
      console.error('Error finding available rooms:', error)
      return []
    }
  }

  /**
   * Find an available room that's waiting for players (legacy method)
   */
  static async findAvailableRoom(): Promise<GameRoom | null> {
    const rooms = await this.findAvailableRooms()
    return rooms.length > 0 ? rooms[0] : null
  }

  /**
   * Create a new game room
   */
  static async createRoom(userId: string, displayName: string, photoURL?: string): Promise<string> {
    try {
      // Select random theme and budget
      const randomTheme = GAME_THEMES[Math.floor(Math.random() * GAME_THEMES.length)]
      const randomBudget = BUDGET_OPTIONS[Math.floor(Math.random() * BUDGET_OPTIONS.length)]

      const newRoom: Omit<GameRoom, 'id'> = {
        status: 'waiting',
        theme: randomTheme.name,
        budget: randomBudget,
        maxPlayers: GAME_CONFIG.MAX_PLAYERS,
        currentPlayers: 1,
        timeLimit: GAME_CONFIG.TIME_LIMIT_MINUTES,
        players: {
          [userId]: {
            userId,
            displayName,
            photoURL,
            ready: false,
            joinedAt: Date.now(),
            votes: 0,
            hasVoted: false
          }
        },
        createdAt: Date.now()
      }

      console.log(`🆕 Creating new room for ${displayName} with theme: ${randomTheme.name}, budget: $${randomBudget}`)

      const roomsRef = ref(realtimeDb, 'gameRooms')
      const newRoomRef = push(roomsRef, newRoom)
      
      if (!newRoomRef.key) {
        throw new Error('Failed to create room')
      }

      console.log(`✅ Successfully created room ${newRoomRef.key} (1/${GAME_CONFIG.MAX_PLAYERS} players)`)

      // Set up disconnect handler
      await this.setupDisconnectHandler(newRoomRef.key, userId)

      return newRoomRef.key
    } catch (error) {
      console.error('Error creating room:', error)
      throw new Error('Failed to create game room')
    }
  }

  /**
   * Join an existing room - Simple direct approach
   */
  static async joinRoom(roomId: string, userId: string, displayName: string, photoURL?: string): Promise<void> {
    try {
      // Simple approach: just add the player directly
      const playerRef = ref(realtimeDb, `gameRooms/${roomId}/players/${userId}`)
      
      // Add player to room
      await update(playerRef, {
        userId,
        displayName,
        photoURL,
        ready: false,
        joinedAt: Date.now(),
        votes: 0,
        hasVoted: false
      })
      
      // Get current room to update player count
      const roomRef = ref(realtimeDb, `gameRooms/${roomId}`)
      const snapshot = await get(roomRef)
      
      if (snapshot.exists()) {
        const room = snapshot.val()
        const playerCount = room.players ? Object.keys(room.players).length : 0
        
        // Update player count
        await update(roomRef, {
          currentPlayers: playerCount
        })
        
        console.log(`✅ Joined room ${roomId} (${playerCount}/4 players)`)
        
        // Set up disconnect handler
        await this.setupDisconnectHandler(roomId, userId)
      }

    } catch (error) {
      console.error('Error joining room:', error)
      throw error
    }
  }

  /**
   * Leave a room
   */
  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      const roomRef = ref(realtimeDb, `gameRooms/${roomId}`)
      const snapshot = await get(roomRef)

      if (!snapshot.exists()) return

      const room = snapshot.val() as GameRoom

      // Remove player
      const playerRef = ref(realtimeDb, `gameRooms/${roomId}/players/${userId}`)
      await remove(playerRef)

      // Update player count
      const newPlayerCount = room.currentPlayers - 1
      
      if (newPlayerCount === 0) {
        // Remove empty room
        await remove(roomRef)
      } else {
        // Update player count
        await update(roomRef, { currentPlayers: newPlayerCount })
      }

    } catch (error) {
      console.error('Error leaving room:', error)
    }
  }

  /**
   * Mark player as ready
   */
  static async markPlayerReady(roomId: string, userId: string): Promise<void> {
    try {
      const playerRef = ref(realtimeDb, `gameRooms/${roomId}/players/${userId}`)
      await update(playerRef, { ready: true })

      // Check if all players are ready
      await this.checkGameStart(roomId)
    } catch (error) {
      console.error('Error marking player ready:', error)
      throw error
    }
  }

  /**
   * Check if game should start (all players ready)
   */
  static async checkGameStart(roomId: string): Promise<void> {
    try {
      const roomRef = ref(realtimeDb, `gameRooms/${roomId}`)
      const snapshot = await get(roomRef)

      if (!snapshot.exists()) return

      const room = snapshot.val() as GameRoom
      const players = Object.values(room.players)
      
      // Check if we have minimum players and all are ready
      if (players.length >= GAME_CONFIG.MIN_PLAYERS && 
          players.every(player => player.ready)) {
        
        // Start the game
        await update(roomRef, {
          status: 'active',
          startTime: Date.now(),
          endTime: Date.now() + (GAME_CONFIG.TIME_LIMIT_MINUTES * 60 * 1000)
        })
      }
    } catch (error) {
      console.error('Error checking game start:', error)
    }
  }

  /**
   * Subscribe to room updates
   */
  static subscribeToRoom(roomId: string, callback: (room: GameRoom | null) => void): () => void {
    const roomRef = ref(realtimeDb, `gameRooms/${roomId}`)
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const room = { ...snapshot.val(), id: roomId } as GameRoom
        callback(room)
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('Error subscribing to room:', error)
      callback(null)
    })

    return () => off(roomRef, 'value', unsubscribe)
  }

  /**
   * Submit outfit selection
   */
  static async submitOutfit(roomId: string, userId: string, outfit: any): Promise<void> {
    try {
      const playerRef = ref(realtimeDb, `gameRooms/${roomId}/players/${userId}`)
      await update(playerRef, { 
        outfit,
        ready: true // Mark as ready for voting phase
      })
    } catch (error) {
      console.error('Error submitting outfit:', error)
      throw error
    }
  }

  /**
   * Submit vote for another player
   */
  static async submitVote(roomId: string, voterId: string, votedForId: string): Promise<void> {
    try {
      const voterRef = ref(realtimeDb, `gameRooms/${roomId}/players/${voterId}`)
      const votedForRef = ref(realtimeDb, `gameRooms/${roomId}/players/${votedForId}`)

      // Get current votes
      const votedForSnapshot = await get(votedForRef)
      if (votedForSnapshot.exists()) {
        const player = votedForSnapshot.val()
        
        // Update both players
        await Promise.all([
          update(voterRef, { 
            hasVoted: true,
            votedFor: votedForId 
          }),
          update(votedForRef, { 
            votes: (player.votes || 0) + 1 
          })
        ])
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      throw error
    }
  }

  /**
   * Setup disconnect handler to remove player when they leave
   */
  static async setupDisconnectHandler(roomId: string, userId: string): Promise<void> {
    try {
      const playerRef = ref(realtimeDb, `gameRooms/${roomId}/players/${userId}`)
      const roomRef = ref(realtimeDb, `gameRooms/${roomId}`)
      
      // Remove player on disconnect
      const disconnectRef = onDisconnect(playerRef)
      await disconnectRef.remove()

      // Also handle room cleanup on disconnect
      const roomDisconnectRef = onDisconnect(roomRef)
      roomDisconnectRef.update({
        currentPlayers: serverTimestamp() // This will need custom logic
      })
      
    } catch (error) {
      console.error('Error setting up disconnect handler:', error)
    }
  }

  /**
   * Clean up empty rooms
   */
  static async cleanupEmptyRooms(): Promise<void> {
    try {
      const roomsRef = ref(realtimeDb, 'gameRooms')
      const snapshot = await get(roomsRef)
      
      if (snapshot.exists()) {
        const rooms = snapshot.val()
        
        for (const roomId in rooms) {
          const room = rooms[roomId]
          const actualPlayerCount = room.players ? Object.keys(room.players).length : 0
          
          // Remove empty rooms
          if (actualPlayerCount === 0) {
            console.log(`🧹 Cleaning up empty room ${roomId}`)
            await remove(ref(realtimeDb, `gameRooms/${roomId}`))
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up empty rooms:', error)
    }
  }

  /**
   * Clean up old rooms (call periodically)
   */
  static async cleanupOldRooms(): Promise<void> {
    try {
      const roomsRef = ref(realtimeDb, 'gameRooms')
      const snapshot = await get(roomsRef)
      
      if (snapshot.exists()) {
        const rooms = snapshot.val()
        const cutoffTime = Date.now() - (GAME_CONFIG.ROOM_TIMEOUT_MINUTES * 60 * 1000)
        
        for (const roomId in rooms) {
          const room = rooms[roomId]
          const actualPlayerCount = room.players ? Object.keys(room.players).length : 0
          
          // Remove empty rooms or rooms with no actual players
          if (actualPlayerCount === 0 || room.createdAt < cutoffTime && room.status !== 'active') {
            console.log(`🧹 Cleaning up room ${roomId} (${actualPlayerCount} players, age: ${Math.round((Date.now() - room.createdAt) / 1000)}s)`)
            await remove(ref(realtimeDb, `gameRooms/${roomId}`))
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old rooms:', error)
    }
  }

  /**
   * Get room info without subscribing
   */
  static async getRoom(roomId: string): Promise<GameRoom | null> {
    try {
      const roomRef = ref(realtimeDb, `gameRooms/${roomId}`)
      const snapshot = await get(roomRef)
      
      if (snapshot.exists()) {
        return { ...snapshot.val(), id: roomId } as GameRoom
      }
      
      return null
    } catch (error) {
      console.error('Error getting room:', error)
      return null
    }
  }
}