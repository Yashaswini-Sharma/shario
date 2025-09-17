// Game Types for Dress to Impress

export interface GameRoom {
  id: string
  status: 'waiting' | 'active' | 'finished'
  theme: string
  budget: number
  maxPlayers: number
  currentPlayers: number
  players: { [userId: string]: GamePlayer }
  createdAt: number
  startTime?: number
  endTime?: number
  timeLimit: number // in minutes
}

export interface GamePlayer {
  userId: string
  displayName: string
  photoURL?: string
  ready: boolean
  joinedAt: number
  outfit?: OutfitSelection
  votes: number
  hasVoted: boolean
  votedFor?: string // userId they voted for
}

export interface OutfitSelection {
  items: OutfitItem[]
  totalCost: number
  submittedAt: number
  description?: string
}

export interface OutfitItem {
  productId: string
  name: string
  price: number
  imageUrl: string
  category: string
}

export interface GameTheme {
  name: string
  description: string
  suggestedCategories: string[]
}

export interface VotingResult {
  playerId: string
  playerName: string
  votes: number
  outfit: OutfitSelection
}

// Game configuration
export const GAME_THEMES: GameTheme[] = [
  {
    name: 'Retro Glam',
    description: 'Channel vintage Hollywood glamour with classic pieces',
    suggestedCategories: ['Dresses', 'Blazers', 'Accessories']
  },
  {
    name: 'Beach Party',
    description: 'Fun and flowy outfits perfect for summer vibes',
    suggestedCategories: ['Swimwear', 'Shorts', 'Sandals']
  },
  {
    name: 'Office Chic',
    description: 'Professional yet stylish workwear',
    suggestedCategories: ['Blazers', 'Trousers', 'Shirts']
  },
  {
    name: 'Gothic Romance',
    description: 'Dark and dramatic pieces with romantic touches',
    suggestedCategories: ['Dresses', 'Boots', 'Accessories']
  },
  {
    name: 'Kawaii Style',
    description: 'Cute and colorful Japanese-inspired fashion',
    suggestedCategories: ['Dresses', 'Skirts', 'Accessories']
  },
  {
    name: 'Streetwear',
    description: 'Urban and trendy casual wear',
    suggestedCategories: ['Hoodies', 'Sneakers', 'Jeans']
  },
  {
    name: 'Boho Chic',
    description: 'Free-spirited and artistic bohemian style',
    suggestedCategories: ['Dresses', 'Jewelry', 'Sandals']
  },
  {
    name: 'Cyber Punk',
    description: 'Futuristic and edgy tech-inspired looks',
    suggestedCategories: ['Jackets', 'Boots', 'Accessories']
  }
]

export const BUDGET_OPTIONS = [50, 75, 100, 125, 150, 200]

export const GAME_CONFIG = {
  MAX_PLAYERS: 4,
  MIN_PLAYERS: 2,
  TIME_LIMIT_MINUTES: 5,
  VOTING_TIME_MINUTES: 2,
  ROOM_TIMEOUT_MINUTES: 10
}