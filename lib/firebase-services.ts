import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { Community, User, InviteCode } from './types'

// Community Services
export const createCommunity = async (name: string, description: string): Promise<{communityId: string, inviteCode: string}> => {
  if (!auth.currentUser) throw new Error('User must be authenticated')

  try {
    // Generate unique community code (6 characters)
    const communityCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const currentTime = Timestamp.now()

    // Create community document
    const communityData = {
      name: name.trim(),
      description: description.trim(),
      creatorId: auth.currentUser.uid,
      creatorName: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous',
      members: [auth.currentUser.uid],
      inviteCodes: [communityCode],
      createdAt: currentTime,
      updatedAt: currentTime
    }

    const docRef = await addDoc(collection(db, 'communities'), communityData)

    // Create the invite code document
    const inviteData = {
      code: communityCode,
      communityId: docRef.id,
      createdBy: auth.currentUser.uid,
      usedBy: [],
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
      createdAt: currentTime
    }

    await addDoc(collection(db, 'inviteCodes'), inviteData)

    // Update user's communities
    await updateUserCommunities(auth.currentUser.uid, docRef.id)

    return { communityId: docRef.id, inviteCode: communityCode }
  } catch (error) {
    console.error('Error creating community:', error)
    throw new Error('Failed to create community. Please try again.')
  }
}

export const joinCommunity = async (inviteCode: string): Promise<string> => {
  if (!auth.currentUser) throw new Error('User must be authenticated')

  try {
    // Find the invite code
    const inviteQuery = query(
      collection(db, 'inviteCodes'),
      where('code', '==', inviteCode.toUpperCase())
    )
    const inviteSnapshot = await getDocs(inviteQuery)

    if (inviteSnapshot.empty) {
      throw new Error('Invalid invite code')
    }

    const inviteDoc = inviteSnapshot.docs[0]
    const inviteData = inviteDoc.data() as InviteCode

    // Check if code is expired
    if (inviteData.expiresAt) {
      const expiryDate = inviteData.expiresAt instanceof Date 
        ? inviteData.expiresAt 
        : (inviteData.expiresAt as any).toDate()
      
      if (expiryDate < new Date()) {
        throw new Error('Invite code has expired')
      }
    }

    // Get community
    const communityDoc = await getDoc(doc(db, 'communities', inviteData.communityId))
    if (!communityDoc.exists()) {
      throw new Error('Community not found')
    }

    const communityData = communityDoc.data() as Community

    // Check if user is already a member
    if (communityData.members.includes(auth.currentUser.uid)) {
      throw new Error('You are already a member of this community')
    }

    // Add user to community
    await updateDoc(doc(db, 'communities', inviteData.communityId), {
      members: [...communityData.members, auth.currentUser.uid],
      updatedAt: Timestamp.now()
    })

    // Update user's communities
    await updateUserCommunities(auth.currentUser.uid, inviteData.communityId)

    // Mark invite code as used
    const currentUsedBy = inviteData.usedBy || []
    if (!currentUsedBy.includes(auth.currentUser.uid)) {
      await updateDoc(doc(db, 'inviteCodes', inviteDoc.id), {
        usedBy: [...currentUsedBy, auth.currentUser.uid]
      })
    }

    return inviteData.communityId
  } catch (error) {
    console.error('Error joining community:', error)
    throw error
  }
}

export const generateInviteCode = async (communityId: string): Promise<string> => {
  if (!auth.currentUser) throw new Error('User must be authenticated')

  // Verify user is a member of the community
  const communityDoc = await getDoc(doc(db, 'communities', communityId))
  if (!communityDoc.exists()) {
    throw new Error('Community not found')
  }

  const communityData = communityDoc.data() as Community
  if (!communityData.members.includes(auth.currentUser.uid)) {
    throw new Error('You are not a member of this community')
  }

  // Generate unique code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()

  const inviteData: Omit<InviteCode, 'id'> = {
    code,
    communityId,
    createdBy: auth.currentUser.uid,
    usedBy: [],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdAt: new Date()
  }

  await addDoc(collection(db, 'inviteCodes'), {
    ...inviteData,
    expiresAt: inviteData.expiresAt ? Timestamp.fromDate(inviteData.expiresAt) : null,
    createdAt: Timestamp.fromDate(inviteData.createdAt)
  })

  // Update community's invite codes
  await updateDoc(doc(db, 'communities', communityId), {
    inviteCodes: [...communityData.inviteCodes, code],
    updatedAt: Timestamp.fromDate(new Date())
  })

  return code
}

export const getUserCommunities = async (): Promise<Community[]> => {
  if (!auth.currentUser) return []

  try {
    const user = auth.currentUser
    const communitiesRef = collection(db, 'communities')
    
    // Query communities where user is creator or member
    const creatorQuery = query(communitiesRef, where('creatorId', '==', user.uid))
    const memberQuery = query(communitiesRef, where('members', 'array-contains', user.uid))
    
    const [creatorSnapshot, memberSnapshot] = await Promise.all([
      getDocs(creatorQuery),
      getDocs(memberQuery)
    ])

    const communities: Community[] = []
    const communityIds = new Set<string>()

    // Add communities where user is creator
    creatorSnapshot.forEach((doc) => {
      if (!communityIds.has(doc.id)) {
        const data = doc.data()
        communities.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Community)
        communityIds.add(doc.id)
      }
    })

    // Add communities where user is member (but not already added as creator)
    memberSnapshot.forEach((doc) => {
      if (!communityIds.has(doc.id)) {
        const data = doc.data()
        communities.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Community)
        communityIds.add(doc.id)
      }
    })

    return communities
  } catch (error) {
    console.error('Error fetching user communities:', error)
    throw new Error('Failed to load communities')
  }
}

// Helper function to update user's communities
const updateUserCommunities = async (userId: string, communityId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      const userData = userDoc.data() as User
      const currentCommunities = userData.communities || []
      
      if (!currentCommunities.includes(communityId)) {
        await updateDoc(userDocRef, {
          communities: [...currentCommunities, communityId],
          updatedAt: Timestamp.now()
        })
      }
    } else {
      // Create user document
      const newUserData = {
        id: userId,
        email: auth.currentUser?.email || '',
        displayName: auth.currentUser?.displayName || '',
        photoURL: auth.currentUser?.photoURL || '',
        communities: [communityId],
        createdAt: Timestamp.now()
      }
      
      await setDoc(userDocRef, newUserData)
    }
  } catch (error) {
    console.error('Error updating user communities:', error)
    throw error
  }
}
