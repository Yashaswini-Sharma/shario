"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useCommunity } from '@/lib/community-context'
import { useAuth } from '@/lib/auth-context'
import { Users, LogOut, Plus, MessageCircle } from 'lucide-react'

export function CommunityManager() {
  const { user } = useAuth()
  const { 
    userCommunities, 
    currentCommunity, 
    currentCommunityCode,
    setCurrentCommunityCode,
    joinCommunity, 
    leaveCommunity, 
    loading 
  } = useCommunity()
  
  const [joinCode, setJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to manage communities</p>
        </CardContent>
      </Card>
    )
  }

  const handleJoinCommunity = async () => {
    if (!joinCode.trim()) return
    
    setIsJoining(true)
    const success = await joinCommunity(joinCode.trim().toUpperCase())
    if (success) {
      setJoinCode('')
      setShowJoinDialog(false)
    }
    setIsJoining(false)
  }

  const handleLeaveCommunity = async () => {
    setIsLeaving(true)
    await leaveCommunity()
    setIsLeaving(false)
  }

  const switchToCommunity = (communityCode: string) => {
    setCurrentCommunityCode(communityCode)
  }

  return (
    <div className="space-y-4">
      {/* Current Community */}
      {currentCommunity ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-green-800">
                  Currently Active: {currentCommunity.name}
                </CardTitle>
                <CardDescription className="text-green-600">
                  {currentCommunity.description}
                </CardDescription>
              </div>
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-green-700">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {currentCommunity.memberCount}/{currentCommunity.maxMembers} members
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  Code: {currentCommunity.joinCode}
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleLeaveCommunity}
              disabled={isLeaving}
              variant="destructive"
              size="sm"
            >
              {isLeaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Leaving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Leave Community
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <Users className="w-12 h-12 mx-auto text-amber-600 mb-2" />
              <p className="text-amber-800 font-medium">No Active Community</p>
              <p className="text-amber-600 text-sm">Join a community to start sharing products!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Communities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Communities ({userCommunities.length})</CardTitle>
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Join New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Community</DialogTitle>
                  <DialogDescription>
                    Enter the 6-character join code to join a community
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter join code (e.g., ABC123)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center font-mono text-lg tracking-wider"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleJoinCommunity}
                      disabled={isJoining || !joinCode.trim()}
                      className="flex-1"
                    >
                      {isJoining ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Joining...
                        </div>
                      ) : (
                        'Join Community'
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowJoinDialog(false)}
                      disabled={isJoining}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading communities...</p>
            </div>
          ) : userCommunities.length > 0 ? (
            <div className="space-y-3">
              {userCommunities.map((community) => (
                <div
                  key={community.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    currentCommunityCode === community.joinCode
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{community.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {community.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {community.memberCount}/{community.maxMembers}
                        </span>
                        <span>Code: {community.joinCode}</span>
                        <Badge variant="outline" className="text-xs">
                          {community.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {currentCommunityCode === community.joinCode ? (
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => switchToCommunity(community.joinCode)}
                          variant="outline"
                          size="sm"
                        >
                          Switch To
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium mb-1">No Communities Yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Join your first community to start sharing products
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
