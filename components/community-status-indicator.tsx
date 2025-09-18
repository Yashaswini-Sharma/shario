"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Users, LogOut, Settings, Plus } from 'lucide-react'
import { useCommunity } from '@/lib/community-context'
import { useAuth } from '@/lib/auth-context'
import { CommunityManager } from './community-manager'

export function CommunityStatusIndicator() {
  const { user } = useAuth()
  const { currentCommunity, leaveCommunity } = useCommunity()
  const [showManager, setShowManager] = useState(false)

  if (!user) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {currentCommunity ? (
          <>
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <Users className="w-3 h-3 mr-1" />
              {currentCommunity.name}
            </Badge>
            <Dialog open={showManager} onOpenChange={setShowManager}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  <Settings className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Community Management</DialogTitle>
                  <DialogDescription>
                    Manage your communities, switch between them, or join new ones
                  </DialogDescription>
                </DialogHeader>
                <CommunityManager />
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Dialog open={showManager} onOpenChange={setShowManager}>
            <DialogTrigger asChild>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <Plus className="w-3 h-3 mr-1" />
                Join Community
              </Badge>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Join a Community</DialogTitle>
                <DialogDescription>
                  Join a community to start sharing products and chatting with other users
                </DialogDescription>
              </DialogHeader>
              <CommunityManager />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  )
}
