"use client"

import { useState, useEffect } from "react"
import { Search, Users, Globe, Lock, Hash, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { 
  getPublicCommunities, 
  joinCommunityByCode, 
  getUserCommunities, 
  Community 
} from "@/lib/firebase-community-service"
import { useToast } from "@/hooks/use-toast"

interface CommunityDiscoveryProps {
  onCommunityJoined?: (community: Community) => void
}

export function CommunityDiscovery({ onCommunityJoined }: CommunityDiscoveryProps) {
  const [publicCommunities, setPublicCommunities] = useState<Community[]>([])
  const [userCommunities, setUserCommunities] = useState<Community[]>([])
  const [joinCode, setJoinCode] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState<string | null>(null)
  
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadCommunities()
    }
  }, [user])

  const loadCommunities = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const [publicComms, userComms] = await Promise.all([
        getPublicCommunities(),
        getUserCommunities(user.uid)
      ])
      
      setPublicCommunities(publicComms)
      setUserCommunities(userComms)
    } catch (error) {
      console.error('Error loading communities:', error)
      toast({
        title: "Error",
        description: "Failed to load communities",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinByCode = async () => {
    if (!joinCode.trim() || !user) return

    setIsJoining('code')
    try {
      const result = await joinCommunityByCode(
        joinCode.trim().toUpperCase(),
        user.uid,
        user.displayName || user.email || 'Anonymous'
      )

      if (result.success && result.community) {
        toast({
          title: "Success!",
          description: `Joined "${result.community.name}" successfully!`,
        })
        
        setJoinCode("")
        onCommunityJoined?.(result.community)
        await loadCommunities()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to join community",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error joining community:', error)
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive"
      })
    } finally {
      setIsJoining(null)
    }
  }

  const handleJoinPublicCommunity = async (community: Community) => {
    if (!user) return

    setIsJoining(community.id)
    try {
      const result = await joinCommunityByCode(
        community.joinCode,
        user.uid,
        user.displayName || user.email || 'Anonymous'
      )

      if (result.success) {
        toast({
          title: "Success!",
          description: `Joined "${community.name}" successfully!`,
        })
        
        onCommunityJoined?.(community)
        await loadCommunities()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to join community",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error joining community:', error)
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive"
      })
    } finally {
      setIsJoining(null)
    }
  }

  const filteredPublicCommunities = publicCommunities.filter(community => {
    const query = searchQuery.toLowerCase()
    return (
      community.name.toLowerCase().includes(query) ||
      community.description.toLowerCase().includes(query) ||
      community.tags.some(tag => tag.toLowerCase().includes(query))
    )
  })

  const availablePublicCommunities = filteredPublicCommunities.filter(
    community => !userCommunities.some(userComm => userComm.id === community.id)
  )

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please sign in to discover and join communities</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="join-code">Join by Code</TabsTrigger>
          <TabsTrigger value="my-communities">My Communities</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Public Communities
              </CardTitle>
              <CardDescription>
                Discover and join public communities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading communities...</span>
                </div>
              ) : availablePublicCommunities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No communities found matching your search' : 'No public communities available'}
                </div>
              ) : (
                <div className="grid gap-4">
                  {availablePublicCommunities.map((community) => (
                    <Card key={community.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{community.name}</h3>
                            <Globe className="h-4 w-4 text-green-500" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {community.description || "No description"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {community.memberCount}/{community.maxMembers} members
                            </div>
                            <span>Created by {community.createdByName}</span>
                          </div>
                          {community.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {community.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleJoinPublicCommunity(community)}
                          disabled={isJoining === community.id || community.memberCount >= community.maxMembers}
                          className="ml-4"
                        >
                          {isJoining === community.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : community.memberCount >= community.maxMembers ? (
                            'Full'
                          ) : (
                            <>
                              Join <ArrowRight className="h-4 w-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="join-code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Join with Code
              </CardTitle>
              <CardDescription>
                Enter a 6-character code to join a private community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode">Community Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="joinCode"
                    placeholder="ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="font-mono text-center tracking-wider"
                  />
                  <Button
                    onClick={handleJoinByCode}
                    disabled={!joinCode.trim() || isJoining === 'code'}
                  >
                    {isJoining === 'code' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Join'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Community codes are case-insensitive and 6 characters long
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-communities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Communities
              </CardTitle>
              <CardDescription>
                Communities you've joined or created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading your communities...</span>
                </div>
              ) : userCommunities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  You haven't joined any communities yet
                </div>
              ) : (
                <div className="grid gap-4">
                  {userCommunities.map((community) => (
                    <Card key={community.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{community.name}</h3>
                            {community.type === 'public' ? (
                              <Globe className="h-4 w-4 text-green-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {community.description || "No description"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {community.memberCount}/{community.maxMembers} members
                            </div>
                            <span>Code: {community.joinCode}</span>
                          </div>
                          {community.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {community.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button variant="outline" asChild>
                          <a href={`/communities/${community.id}`}>
                            Open <ArrowRight className="h-4 w-4 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}