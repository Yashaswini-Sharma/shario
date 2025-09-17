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
  onDisconnect
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
   * Join the matchmaking queue - either join existing room or create new one
   */
  static async joinQueue(userId: string, displayName: string, photoURL?: string): Promise<string> {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User must be authenticated to join game')
      }

      // First, add user to waiting room
      await this.addToWaitingRoom(userId, displayName, photoURL)

      // Look for available room first
      const availableRoom = await this.findAvailableRoom()
      
      if (availableRoom) {
        await this.joinRoom(availableRoom.id, userId, displayName, photoURL)
        // Remove from waiting room since they joined a game
        await this.removeFromWaitingRoom(userId)
        return availableRoom.id
      } else {
        // Create new room and remove from waiting room
        const roomId = await this.createRoom(userId, displayName, photoURL)
        await this.removeFromWaitingRoom(userId)
        return roomId
      }
    } catch (error) {
      console.error('Error joining queue:', error)
      // If there's an error, make sure they stay in waiting room
      await this.addToWaitingRoom(userId, displayName, photoURL)
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
   * Find an available room that's waiting for players
   */
  static async findAvailableRoom(): Promise<GameRoom | null> {
    try {
      const roomsRef = ref(realtimeDb, 'gameRooms')
      const waitingRoomsQuery = query(
        roomsRef,
        orderByChild('status'),
        equalTo('waiting'),
        limitToFirst(10)
      )
      
      const snapshot = await get(waitingRoomsQuery)
      
      if (snapshot.exists()) {
        const rooms = snapshot.val()
        
        // Find room with space
        for (const roomId in rooms) {
          const room = rooms[roomId]
          if (room.currentPlayers < room.maxPlayers) {
            return { ...room, id: roomId }
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Error finding available room:', error)
      return null
    }
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

      const roomsRef = ref(realtimeDb, 'gameRooms')
      const newRoomRef = push(roomsRef, newRoom)
      
      if (!newRoomRef.key) {
        throw new Error('Failed to create room')
      }

      // Set up disconnect handler
      await this.setupDisconnectHandler(newRoomRef.key, userId)

      return newRoomRef.key
    } catch (error) {
      console.error('Error creating room:', error)
      throw new Error('Failed to create game room')
    }
  }

  /**
   * Join an existing room
   */
  static async joinRoom(roomId: string, userId: string, displayName: string, photoURL?: string): Promise<void> {
    try {
      const roomRef = ref(realtimeDb, `gameRooms/${roomId}`)
      const snapshot = await get(roomRef)

      if (!snapshot.exists()) {
        throw new Error('Room not found')
      }

      const room = snapshot.val() as GameRoom
      
      if (room.currentPlayers >= room.maxPlayers) {
        throw new Error('Room is full')
      }

      if (room.status !== 'waiting') {
        throw new Error('Game already in progress')
      }

      // Add player to room
      const updates: any = {}
      updates[`players/${userId}`] = {
        userId,
        displayName,
        photoURL,
        ready: false,
        joinedAt: Date.now(),
        votes: 0,
        hasVoted: false
      }
      updates['currentPlayers'] = room.currentPlayers + 1

      await update(roomRef, updates)

      // Set up disconnect handler
      await this.setupDisconnectHandler(roomId, userId)

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
          if (room.createdAt < cutoffTime && room.status !== 'active') {
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