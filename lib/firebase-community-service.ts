import { ref, push, set, get, onValue, off, remove, query, orderByChild, equalTo, serverTimestamp } from 'firebase/database'
import { realtimeDb } from './firebase'

// Community data structure
export interface Community {
  id: string
  name: string
  description: string
  type: 'public' | 'private'
  joinCode: string
  createdBy: string
  createdByName: string
  createdAt: number
  memberCount: number
  maxMembers: number
  tags?: string[] // Make tags optional to handle legacy data
}

export interface CommunityMember {
  userId: string
  userName: string
  joinedAt: number
  role: 'admin' | 'member'
  isActive: boolean
}

export interface CommunityMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: number
  type: 'message' | 'page_share' | 'system' | 'image' | 'product_share'
  pageUrl?: string
  pageTitle?: string
  imageUrl?: string
  imageName?: string
  productData?: {
    id: number | string
    name: string
    price: number
    image?: string
    brand?: string
    category?: string
  }
}

// Generate a random 6-character join code
function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Check if join code is unique
async function isJoinCodeUnique(code: string): Promise<boolean> {
  try {
    const communitiesRef = ref(realtimeDb, 'communities')
    const snapshot = await get(communitiesRef)
    
    if (!snapshot.exists()) {
      return true
    }
    
    const communities = snapshot.val()
    
    // Check if any community has this join code
    for (const communityId in communities) {
      if (communities[communityId].joinCode === code) {
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('Error checking join code uniqueness:', error)
    // Fallback to allowing the code if there's an error
    return true
  }
}

// Generate unique join code
async function generateUniqueJoinCode(): Promise<string> {
  let code = generateJoinCode()
  while (!(await isJoinCodeUnique(code))) {
    code = generateJoinCode()
  }
  return code
}

// Create a new community
export async function createCommunity(
  name: string,
  description: string,
  type: 'public' | 'private',
  createdBy: string,
  createdByName: string,
  maxMembers: number = 100,
  tags: string[] = []
): Promise<{ community: Community; joinCode: string }> {
  const joinCode = await generateUniqueJoinCode()
  const communityRef = push(ref(realtimeDb, 'communities'))
  const communityId = communityRef.key!

  const community: Community = {
    id: communityId,
    name,
    description,
    type,
    joinCode,
    createdBy,
    createdByName,
    createdAt: Date.now(),
    memberCount: 1,
    maxMembers,
    tags
  }

  // Create community
  await set(communityRef, community)

  // Add creator as admin member
  const memberRef = ref(realtimeDb, `communityMembers/${communityId}/${createdBy}`)
  await set(memberRef, {
    userId: createdBy,
    userName: createdByName,
    joinedAt: Date.now(),
    role: 'admin',
    isActive: true
  })

  // Add system message
  await addSystemMessage(communityId, `Community "${name}" created by ${createdByName}`)

  return { community, joinCode }
}

// Join a community by code
export async function joinCommunityByCode(
  joinCode: string,
  userId: string,
  userName: string
): Promise<{ success: boolean; community?: Community; error?: string }> {
  try {
    // Find community by join code
    const communitiesRef = ref(realtimeDb, 'communities')
    const snapshot = await get(communitiesRef)

    if (!snapshot.exists()) {
      return { success: false, error: 'No communities found' }
    }

    const communities = snapshot.val()
    let communityData: Community | null = null
    let communityId: string | null = null

    // Search for community with matching join code
    for (const id in communities) {
      if (communities[id].joinCode === joinCode) {
        communityData = communities[id]
        communityId = id
        break
      }
    }

    if (!communityData || !communityId) {
      return { success: false, error: 'Invalid join code' }
    }

    // Check if user is already a member
    const memberRef = ref(realtimeDb, `communityMembers/${communityId}/${userId}`)
    const memberSnapshot = await get(memberRef)

    if (memberSnapshot.exists()) {
      return { success: false, error: 'You are already a member of this community' }
    }

    // Check if community is full
    if (communityData.memberCount >= communityData.maxMembers) {
      return { success: false, error: 'Community is full' }
    }

    // Add user as member
    await set(memberRef, {
      userId,
      userName,
      joinedAt: Date.now(),
      role: 'member',
      isActive: true
    })

    // Update member count
    const communityRef = ref(realtimeDb, `communities/${communityId}/memberCount`)
    await set(communityRef, communityData.memberCount + 1)

    // Add system message
    await addSystemMessage(communityId, `${userName} joined the community`)

    return { success: true, community: { ...communityData, id: communityId } }
  } catch (error) {
    return { success: false, error: 'Failed to join community' }
  }
}

// Get public communities
export async function getPublicCommunities(): Promise<Community[]> {
  try {
    const communitiesRef = ref(realtimeDb, 'communities')
    const snapshot = await get(communitiesRef)

    if (!snapshot.exists()) {
      return []
    }

    const communities = snapshot.val()
    const publicCommunities: Community[] = []

    // Filter for public communities
    for (const [id, data] of Object.entries(communities)) {
      const community = data as Community
      if (community.type === 'public') {
        publicCommunities.push({ ...community, id })
      }
    }

    return publicCommunities
  } catch (error) {
    console.error('Error fetching public communities:', error)
    return []
  }
}

// Get user's communities
export async function getUserCommunities(userId: string): Promise<Community[]> {
  const communities: Community[] = []
  
  // Get all community memberships for user
  const membershipRef = ref(realtimeDb, 'communityMembers')
  const snapshot = await get(membershipRef)

  if (!snapshot.exists()) {
    return []
  }

  const membershipData = snapshot.val()
  
  // Find communities where user is a member
  for (const [communityId, members] of Object.entries(membershipData)) {
    if ((members as any)[userId]) {
      // Get community details
      const communityRef = ref(realtimeDb, `communities/${communityId}`)
      const communitySnapshot = await get(communityRef)
      
      if (communitySnapshot.exists()) {
        communities.push({
          ...communitySnapshot.val(),
          id: communityId
        })
      }
    }
  }

  return communities
}

// Send message to community
export async function sendMessageToCommunity(
  communityId: string,
  userId: string,
  userName: string,
  content: string,
  type: 'message' | 'page_share' | 'image' | 'product_share' = 'message',
  pageUrl?: string,
  pageTitle?: string,
  imageUrl?: string,
  imageName?: string,
  productData?: {
    id: number | string
    name: string
    price: number
    image?: string
    brand?: string
    category?: string
  }
): Promise<void> {
  const messageRef = push(ref(realtimeDb, `communityMessages/${communityId}`))
  
  const message: CommunityMessage = {
    id: messageRef.key!,
    userId,
    userName,
    content,
    timestamp: Date.now(),
    type,
    ...(pageUrl && { pageUrl }),
    ...(pageTitle && { pageTitle }),
    ...(imageUrl && { imageUrl }),
    ...(imageName && { imageName }),
    ...(productData && { productData })
  }

  await set(messageRef, message)
}

// Add system message
export async function addSystemMessage(communityId: string, content: string): Promise<void> {
  const messageRef = push(ref(realtimeDb, `communityMessages/${communityId}`))
  
  const message: CommunityMessage = {
    id: messageRef.key!,
    userId: 'system',
    userName: 'System',
    content,
    timestamp: Date.now(),
    type: 'system'
  }

  await set(messageRef, message)
}

// Listen to community messages
export function listenToCommunityMessages(
  communityId: string,
  callback: (messages: CommunityMessage[]) => void
): () => void {
  const messagesRef = ref(realtimeDb, `communityMessages/${communityId}`)
  
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const messagesData = snapshot.val()
      const messages = Object.entries(messagesData)
        .map(([id, data]) => ({ ...(data as CommunityMessage), id }))
        .sort((a, b) => a.timestamp - b.timestamp)
      
      callback(messages)
    } else {
      callback([])
    }
  })

  return () => off(messagesRef, 'value', unsubscribe)
}

// Listen to community members
export function listenToCommunityMembers(
  communityId: string,
  callback: (members: CommunityMember[]) => void
): () => void {
  const membersRef = ref(realtimeDb, `communityMembers/${communityId}`)
  
  const unsubscribe = onValue(membersRef, (snapshot) => {
    if (snapshot.exists()) {
      const membersData = snapshot.val()
      const members = Object.values(membersData) as CommunityMember[]
      callback(members)
    } else {
      callback([])
    }
  })

  return () => off(membersRef, 'value', unsubscribe)
}

// Leave community
export async function leaveCommunity(communityId: string, userId: string, userName: string): Promise<void> {
  // Remove member
  const memberRef = ref(realtimeDb, `communityMembers/${communityId}/${userId}`)
  await remove(memberRef)

  // Update member count
  const communityRef = ref(realtimeDb, `communities/${communityId}`)
  const communitySnapshot = await get(communityRef)
  
  if (communitySnapshot.exists()) {
    const community = communitySnapshot.val()
    const memberCountRef = ref(realtimeDb, `communities/${communityId}/memberCount`)
    await set(memberCountRef, Math.max(0, community.memberCount - 1))
  }

  // Add system message
  await addSystemMessage(communityId, `${userName} left the community`)
}

// Get community details
export async function getCommunity(communityId: string): Promise<Community | null> {
  const communityRef = ref(realtimeDb, `communities/${communityId}`)
  const snapshot = await get(communityRef)
  
  if (snapshot.exists()) {
    return { ...snapshot.val(), id: communityId }
  }
  
  return null
}

// Check if user is member of community
export async function isUserMember(communityId: string, userId: string): Promise<boolean> {
  const memberRef = ref(realtimeDb, `communityMembers/${communityId}/${userId}`)
  const snapshot = await get(memberRef)
  return snapshot.exists()
}

// Share product to community
export async function shareProductToCommunity(
  communityId: string,
  userId: string,
  userName: string,
  product: {
    id: number | string
    name: string
    price: number
    image?: string
    brand?: string
    category?: string
  }
): Promise<void> {
  const productMessage = `🛍️ Check out this amazing product!`
  
  await sendMessageToCommunity(
    communityId,
    userId,
    userName,
    productMessage,
    'product_share',
    undefined,
    undefined,
    undefined,
    undefined,
    product
  )
}