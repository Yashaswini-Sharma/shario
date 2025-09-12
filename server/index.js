const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Store active users and their communities
const activeUsers = new Map()
const communityUsers = new Map()
const communityMembers = new Map() // Track actual members per community

app.use(cors())

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Handle user authentication
  socket.on('authenticate', (userData) => {
    activeUsers.set(socket.id, userData)
    console.log('User authenticated:', userData.userName)
  })

  // Handle joining a community
  socket.on('join_community', (communityId) => {
    const userData = activeUsers.get(socket.id)
    if (userData) {
      socket.join(communityId)

      // Add user to community tracking
      if (!communityUsers.has(communityId)) {
        communityUsers.set(communityId, new Set())
      }
      communityUsers.get(communityId).add(socket.id)

      // Add user to community members
      if (!communityMembers.has(communityId)) {
        communityMembers.set(communityId, new Map())
      }
      communityMembers.get(communityId).set(socket.id, {
        id: userData.userId,
        name: userData.userName,
        avatar: null // Could be extended to include avatar
      })

      console.log(`${userData.userName} joined community: ${communityId}`)

      // Notify others in the community
      socket.to(communityId).emit('user_joined', {
        userName: userData.userName,
        communityId
      })

      // Send updated member list to all users in the community
      const memberList = Array.from(communityMembers.get(communityId).values())
      io.to(communityId).emit('community_members', {
        communityId,
        members: memberList
      })

      // Also send the member list to the newly joined user
      socket.emit('community_members', {
        communityId,
        members: memberList
      })
    }
  })

  // Handle leaving a community
  socket.on('leave_community', (communityId) => {
    const userData = activeUsers.get(socket.id)
    if (userData) {
      socket.leave(communityId)

      // Remove user from community tracking
      if (communityUsers.has(communityId)) {
        communityUsers.get(communityId).delete(socket.id)
      }

      // Remove user from community members
      if (communityMembers.has(communityId)) {
        communityMembers.get(communityId).delete(socket.id)

        // Send updated member list to remaining users in the community
        const memberList = Array.from(communityMembers.get(communityId).values())
        io.to(communityId).emit('community_members', {
          communityId,
          members: memberList
        })
      }

      console.log(`${userData.userName} left community: ${communityId}`)
    }
  })

  // Handle sending messages
  socket.on('send_message', (messageData) => {
    const userData = activeUsers.get(socket.id)
    if (userData) {
      const message = {
        id: Date.now().toString(),
        communityId: messageData.communityId,
        userId: userData.userId,
        userName: userData.userName,
        content: messageData.content,
        timestamp: new Date(),
        type: 'message'
      }

      // Send to all users in the community
      io.to(messageData.communityId).emit('message', message)
      console.log(`Message from ${userData.userName} in ${messageData.communityId}: ${messageData.content}`)
    }
  })

  // Handle page sharing
  socket.on('share_page', (shareData) => {
    const userData = activeUsers.get(socket.id)
    if (userData) {
      // Send page share notification to all users in the community
      socket.to(shareData.communityId).emit('page_share', {
        communityId: shareData.communityId,
        pageUrl: shareData.pageUrl,
        pageTitle: shareData.pageTitle,
        userName: userData.userName
      })

      // Also send a message about the page share
      const message = {
        id: Date.now().toString(),
        communityId: shareData.communityId,
        userId: userData.userId,
        userName: userData.userName,
        content: `Shared: ${shareData.pageTitle}`,
        timestamp: new Date(),
        type: 'page_share',
        pageUrl: shareData.pageUrl,
        pageTitle: shareData.pageTitle
      }

      io.to(shareData.communityId).emit('message', message)
      console.log(`${userData.userName} shared page: ${shareData.pageTitle}`)
    }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    const userData = activeUsers.get(socket.id)
    if (userData) {
      console.log('User disconnected:', userData.userName)

      // Remove from all communities
      communityUsers.forEach((users, communityId) => {
        if (users.has(socket.id)) {
          users.delete(socket.id)

          // Remove from community members and notify others
          if (communityMembers.has(communityId)) {
            communityMembers.get(communityId).delete(socket.id)
            const memberList = Array.from(communityMembers.get(communityId).values())
            socket.to(communityId).emit('community_members', {
              communityId,
              members: memberList
            })
          }
        }
      })

      activeUsers.delete(socket.id)
    }
  })
})

const PORT = process.env.PORT || 3003

server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})
