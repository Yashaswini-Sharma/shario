// Existing product models
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  brand: string;
  description?: string;
}

// Contest-related models
export interface Contest {
  id: string;
  theme: string;
  budget: number;
  timeLimit: number; // in minutes
  status: 'waiting' | 'active' | 'voting' | 'completed';
  startTime: Date;
  endTime: Date;
  votingEndTime: Date;
  participants: string[]; // user IDs
  createdAt: Date;
}

export interface ClothingItem {
  id: string;
  name: string;
  type: 'dress' | 'top' | 'bottom' | 'shoes' | 'accessory' | 'hair' | 'makeup';
  price: number;
  image: string;
  color: string;
  style: string;
  tags: string[];
}

export interface Design {
  id: string;
  contestId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  items: ClothingItem[];
  totalCost: number;
  submittedAt: Date;
  votes: number;
  voters: string[]; // user IDs who voted
}

export interface Vote {
  id: string;
  contestId: string;
  designId: string;
  userId: string;
  rating: number; // 1-5 stars
  createdAt: Date;
}

export interface ContestResult {
  contestId: string;
  winner: Design;
  topDesigns: Design[];
  totalParticipants: number;
  totalVotes: number;
}

// User model extension for contests
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  contestsWon: number;
  contestsParticipated: number;
  totalVotes: number;
}