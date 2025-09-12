"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useWebSocket } from "@/lib/websocket-context"
import { useCommunity } from "@/lib/community-context"

interface CommunityMember {
  id: string
  name: string
  avatar?: string
}

interface CommunityMembersProps {
  // No longer need props since we use context
}

export function CommunityMembers({}: CommunityMembersProps) {
  const [members, setMembers] = useState<CommunityMember[]>([])
  const { user } = useAuth()
  const { communityMembers, isConnected } = useWebSocket()
  const { currentCommunityCode } = useCommunity()

  useEffect(() => {
    if (user && currentCommunityCode && isConnected) {
      // Use real community members from WebSocket, but limit to top 3
      setMembers(communityMembers.slice(0, 3))
    } else {
      setMembers([])
    }
  }, [user, currentCommunityCode, isConnected, communityMembers])

  if (!user || !currentCommunityCode || members.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="flex -space-x-2">
        {members.map((member, index) => (
          <Avatar
            key={member.id}
            className="w-10 h-10 border-2 border-background hover:z-10 transition-transform hover:scale-110"
            style={{ zIndex: members.length - index }}
            title={member.name}
          >
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className="text-xs">
              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {members.length >= 3 && (
          <div className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium hover:bg-muted/80 transition-colors">
            +{members.length - 2}
          </div>
        )}
      </div>
    </div>
  )
}
