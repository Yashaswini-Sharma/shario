export interface Community {
  id: string
  name: string
  description: string
  creatorId: string
  creatorName: string
  members: string[]
  inviteCodes: string[]
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  communities: string[]
  createdAt: Date
}

export interface InviteCode {
  id: string
  code: string
  communityId: string
  createdBy: string
  usedBy?: string[]
  expiresAt?: Date
  createdAt: Date
}
