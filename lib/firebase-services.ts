import {
  collection,
  doc,
  addDoc,
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
export const createCommunity = async (name: string, description: string): Promise<string> => {
  if (!auth.currentUser) throw new Error('User must be authenticated')

  const communityData: Omit<Community, 'id'> = {
    name,
    description,
    creatorId: auth.currentUser.uid,
    creatorName: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous',
    members: [auth.currentUser.uid],
    inviteCodes: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const docRef = await addDoc(collection(db, 'communities'), {
    ...communityData,
    createdAt: Timestamp.fromDate(communityData.createdAt),
    updatedAt: Timestamp.fromDate(communityData.updatedAt)
  })

  // Update user's communities
  await updateUserCommunities(auth.currentUser.uid, docRef.id)

  return docRef.id
}

export const joinCommunity = async (inviteCode: string): Promise<string> => {
  if (!auth.currentUser) throw new Error('User must be authenticated')

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
  if (inviteData.expiresAt && (inviteData.expiresAt as any).toDate() < new Date()) {
    throw new Error('Invite code has expired')
  }

  // Get community
  const communityDoc = await getDoc(doc(db, 'communities', inviteData.communityId))
  if (!communityDoc.exists()) {
    throw new Error('Community not found')
  }

  const communityData = communityDoc.data() as Community

  // Check if user is already a member
  if (communityData.members.includes(auth.currentUser!.uid)) {
    throw new Error('You are already a member of this community')
  }

  // Add user to community
  await updateDoc(doc(db, 'communities', inviteData.communityId), {
    members: [...communityData.members, auth.currentUser!.uid],
    updatedAt: Timestamp.fromDate(new Date())
  })

  // Update user's communities
  await updateUserCommunities(auth.currentUser!.uid, inviteData.communityId)

  // Mark invite code as used
  await updateDoc(doc(db, 'inviteCodes', inviteDoc.id), {
    usedBy: [...(inviteData.usedBy || []), auth.currentUser!.uid]
  })

  return inviteData.communityId
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

  const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
  if (!userDoc.exists()) return []

  const userData = userDoc.data() as User
  const communities: Community[] = []

  for (const communityId of userData.communities) {
    const communityDoc = await getDoc(doc(db, 'communities', communityId))
    if (communityDoc.exists()) {
      communities.push({
        id: communityDoc.id,
        ...communityDoc.data(),
        createdAt: communityDoc.data().createdAt.toDate(),
        updatedAt: communityDoc.data().updatedAt.toDate()
      } as Community)
    }
  }

  return communities
}

// Helper function to update user's communities
const updateUserCommunities = async (userId: string, communityId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId))

  if (userDoc.exists()) {
    const userData = userDoc.data() as User
    if (!userData.communities.includes(communityId)) {
      await updateDoc(doc(db, 'users', userId), {
        communities: [...userData.communities, communityId]
      })
    }
  } else {
    // Create user document
    await addDoc(collection(db, 'users'), {
      id: userId,
      email: auth.currentUser?.email,
      displayName: auth.currentUser?.displayName,
      photoURL: auth.currentUser?.photoURL,
      communities: [communityId],
      createdAt: Timestamp.fromDate(new Date())
    })
  }
}
