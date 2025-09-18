import { 
  ref, 
  push, 
  update, 
  remove,
  onValue,
  off,
  get,
  serverTimestamp 
} from 'firebase/database'
import { realtimeDb } from './firebase'
import { GameCartItem, GameCartVote, GAME_CONFIG } from './game-types'

export class FirebaseGameCartService {
  
  /**
   * Add item to player's game cart
   */
  static async addToGameCart(
    roomId: string, 
    playerId: string, 
    item: Omit<GameCartItem, 'addedAt'>
  ): Promise<void> {
    try {
      const cartRef = ref(realtimeDb, `gameRooms/${roomId}/players/${playerId}/gameCart`)
      const snapshot = await get(cartRef)
      const currentCart = snapshot.val() || []
      
      // Check if item already exists
      const existingIndex = currentCart.findIndex((cartItem: GameCartItem) => 
        cartItem.productId === item.productId
      )
      
      if (existingIndex >= 0) {
        // Item already in cart, don't add duplicate
        throw new Error('Item already in your game cart')
      }
      
      // Check budget constraint
      const currentTotal = currentCart.reduce((sum: number, cartItem: GameCartItem) => 
        sum + cartItem.price, 0
      )
      
      // Get room budget
      const roomRef = ref(realtimeDb, `gameRooms/${roomId}`)
      const roomSnapshot = await get(roomRef)
      const room = roomSnapshot.val()
      
      if (currentTotal + item.price > room.budget) {
        throw new Error(`Adding this item would exceed your budget of ₹${room.budget}`)
      }
      
      const newCartItem: GameCartItem = {
        ...item,
        addedAt: Date.now()
      }
      
      const updatedCart = [...currentCart, newCartItem]
      await update(ref(realtimeDb, `gameRooms/${roomId}/players/${playerId}`), {
        gameCart: updatedCart
      })
      
    } catch (error) {
      console.error('Error adding to game cart:', error)
      throw error
    }
  }
  
  /**
   * Remove item from player's game cart
   */
  static async removeFromGameCart(
    roomId: string, 
    playerId: string, 
    productId: string
  ): Promise<void> {
    try {
      const cartRef = ref(realtimeDb, `gameRooms/${roomId}/players/${playerId}/gameCart`)
      const snapshot = await get(cartRef)
      const currentCart = snapshot.val() || []
      
      const updatedCart = currentCart.filter((item: GameCartItem) => 
        item.productId !== productId
      )
      
      await update(ref(realtimeDb, `gameRooms/${roomId}/players/${playerId}`), {
        gameCart: updatedCart
      })
      
    } catch (error) {
      console.error('Error removing from game cart:', error)
      throw error
    }
  }
  
  /**
   * Clear player's game cart
   */
  static async clearGameCart(roomId: string, playerId: string): Promise<void> {
    try {
      await update(ref(realtimeDb, `gameRooms/${roomId}/players/${playerId}`), {
        gameCart: []
      })
    } catch (error) {
      console.error('Error clearing game cart:', error)
      throw error
    }
  }
  
  /**
   * Get total cost of player's cart
   */
  static async getCartTotal(roomId: string, playerId: string): Promise<number> {
    try {
      const cartRef = ref(realtimeDb, `gameRooms/${roomId}/players/${playerId}/gameCart`)
      const snapshot = await get(cartRef)
      const cart = snapshot.val() || []
      
      return cart.reduce((sum: number, item: GameCartItem) => sum + item.price, 0)
    } catch (error) {
      console.error('Error calculating cart total:', error)
      return 0
    }
  }
  
  /**
   * Subscribe to all players' carts in real-time
   */
  static subscribeToGameCarts(
    roomId: string, 
    callback: (playersWithCarts: { [playerId: string]: GameCartItem[] }) => void
  ): () => void {
    const playersRef = ref(realtimeDb, `gameRooms/${roomId}/players`)
    
    const unsubscribe = onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        const players = snapshot.val()
        const playersWithCarts: { [playerId: string]: GameCartItem[] } = {}
        
        Object.entries(players).forEach(([playerId, player]: [string, any]) => {
          playersWithCarts[playerId] = player.gameCart || []
        })
        
        callback(playersWithCarts)
      }
    })
    
    return () => off(playersRef, 'value', unsubscribe)
  }
  
  /**
   * Submit vote for another player's cart
   */
  static async submitCartVote(
    roomId: string, 
    voterId: string, 
    targetPlayerId: string, 
    cartScore: number, 
    comment?: string
  ): Promise<void> {
    try {
      if (cartScore < 1 || cartScore > 5) {
        throw new Error('Cart score must be between 1 and 5')
      }
      
      if (voterId === targetPlayerId) {
        throw new Error('Cannot vote for your own cart')
      }
      
      const vote: GameCartVote = {
        voterId,
        targetPlayerId,
        cartScore,
        votedAt: Date.now(),
        ...(comment && { comment }) // Only include comment if it exists
      }
      
      const voteRef = push(ref(realtimeDb, `gameRooms/${roomId}/gameCartVotes`))
      await update(voteRef, vote)
      
    } catch (error) {
      console.error('Error submitting cart vote:', error)
      throw error
    }
  }
  
  /**
   * Mark a player as having completed all their voting and check for game completion
   */
  static async markVotingComplete(roomId: string, voterId: string): Promise<void> {
    try {
      // Mark the voter as having voted
      const voterRef = ref(realtimeDb, `gameRooms/${roomId}/players/${voterId}`)
      await update(voterRef, { hasVoted: true })
      
      // Check if all players have completed voting
      await this.checkVotingCompletion(roomId)
      
    } catch (error) {
      console.error('Error marking voting complete:', error)
      throw error
    }
  }
  
  /**
   * Check if all players have completed voting and transition to results phase
   */
  static async checkVotingCompletion(roomId: string): Promise<void> {
    try {
      // Get current room state
      const roomRef = ref(realtimeDb, `gameRooms/${roomId}`)
      const roomSnapshot = await get(roomRef)
      
      if (!roomSnapshot.exists()) return
      
      const room = roomSnapshot.val()
      const players = Object.values(room.players || {}) as any[]
      
      // Check if all players have voted
      // All players in the room should vote (not just those with outfits)
      const allPlayersInRoom = players
      const playersWhoVoted = allPlayersInRoom.filter(p => p.hasVoted === true)
      
      console.log(`🗳️ Voting progress in room ${roomId}: ${playersWhoVoted.length}/${allPlayersInRoom.length} players voted`)
      
      // End voting when ALL players in room have voted
      if (playersWhoVoted.length >= allPlayersInRoom.length && allPlayersInRoom.length >= 1) {
        // Transition to finished status to trigger results phase
        await update(roomRef, {
          status: 'finished',
          votingEndTime: Date.now()
        })
        
        console.log(`🏆 All players voted in room ${roomId}, transitioning to results`)
      }
      
    } catch (error) {
      console.error('Error checking voting completion:', error)
    }
  }
  
  /**
   * Get voting results for all players
   */
  static async getCartVotingResults(roomId: string): Promise<{
    [playerId: string]: {
      totalScore: number
      averageScore: number
      voteCount: number
      comments: string[]
      playerName: string
      cart: GameCartItem[]
    }
  }> {
    try {
      const [votesSnapshot, playersSnapshot] = await Promise.all([
        get(ref(realtimeDb, `gameRooms/${roomId}/gameCartVotes`)),
        get(ref(realtimeDb, `gameRooms/${roomId}/players`))
      ])
      
      const votes = votesSnapshot.val() || {}
      const players = playersSnapshot.val() || {}
      
      const results: any = {}
      
      // Initialize results for all players
      Object.entries(players).forEach(([playerId, player]: [string, any]) => {
        results[playerId] = {
          totalScore: 0,
          averageScore: 0,
          voteCount: 0,
          comments: [],
          playerName: player.displayName || 'Unknown',
          cart: player.gameCart || []
        }
      })
      
      // Process votes
      Object.values(votes).forEach((vote: any) => {
        const { targetPlayerId, cartScore, comment } = vote
        
        if (results[targetPlayerId]) {
          results[targetPlayerId].totalScore += cartScore
          results[targetPlayerId].voteCount += 1
          
          if (comment) {
            results[targetPlayerId].comments.push(comment)
          }
        }
      })
      
      // Calculate averages
      Object.keys(results).forEach(playerId => {
        const result = results[playerId]
        if (result.voteCount > 0) {
          result.averageScore = result.totalScore / result.voteCount
        }
      })
      
      return results
    } catch (error) {
      console.error('Error getting cart voting results:', error)
      throw error
    }
  }
  
  /**
   * Start cart voting phase
   */
  static async startCartVoting(roomId: string): Promise<void> {
    try {
      const votingEndTime = Date.now() + (GAME_CONFIG.CART_VOTING_TIME_MINUTES * 60 * 1000)
      
      await update(ref(realtimeDb, `gameRooms/${roomId}`), {
        status: 'voting',
        votingStartTime: Date.now(),
        votingEndTime,
        votingTimeLimit: GAME_CONFIG.CART_VOTING_TIME_MINUTES
      })
    } catch (error) {
      console.error('Error starting cart voting:', error)
      throw error
    }
  }
  
  /**
   * End game and show results
   */
  static async endGame(roomId: string): Promise<void> {
    try {
      await update(ref(realtimeDb, `gameRooms/${roomId}`), {
        status: 'finished',
        endTime: Date.now()
      })
    } catch (error) {
      console.error('Error ending game:', error)
      throw error
    }
  }
}