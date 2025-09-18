"use client"

import { useState, useEffect } from "react"
import { Plus, Users, MessageCircle, Search, Globe, Lock, Hash, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CommunityCreateForm } from "@/components/community-create-form"
import { Community, getPublicCommunities, getUserCommunities, joinCommunityByCode } from "@/lib/firebase-community-service"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function CommunitiesPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [publicCommunities, setPublicCommunities] = useState<Community[]>([])
  const [userCommunities, setUserCommunities] = useState<Community[]>([])
  const [joinCode, setJoinCode] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState<string | null>(null)
  
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

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
      console.error("Error loading communities:", error)
      toast({
        title: "Error",
        description: "Failed to load communities. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return
    
    setIsJoining("code")
    try {
      const result = await joinCommunityByCode(joinCode.trim().toUpperCase(), user!.uid, user!.displayName || "User")
      
      if (result.success && result.community) {
        toast({
          title: "Joined Community!",
          description: `Welcome to ${result.community.name}`,
        })
        
        // Navigate to the community chat
        router.push(`/communities/${result.community.id}`)
      } else {
        throw new Error(result.error || "Failed to join community")
      }
      
    } catch (error: any) {
      toast({
        title: "Failed to Join",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsJoining(null)
      setJoinCode("")
    }
  }

  const handleJoinCommunity = async (community: Community) => {
    setIsJoining(community.id)
    try {
      const result = await joinCommunityByCode(community.joinCode, user!.uid, user!.displayName || "User")
      
      if (result.success && result.community) {
        toast({
          title: "Joined Community!",
          description: `Welcome to ${result.community.name}`,
        })
        
        // Navigate to the community chat
        router.push(`/communities/${community.id}`)
      } else {
        throw new Error(result.error || "Failed to join community")
      }
      
    } catch (error: any) {
      toast({
        title: "Failed to Join",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsJoining(null)
    }
  }

  const handleCommunityCreated = (community: Community, joinCode: string) => {
    setShowCreateDialog(false)
    loadCommunities() // Refresh the list
    
    toast({
      title: "Community Created!",
      description: `${community.name} is ready for members`,
    })
    
    // Navigate to the new community
    router.push(`/communities/${community.id}`)
  }

  const filteredPublicCommunities = publicCommunities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <CardTitle>Join Fashion Communities</CardTitle>
            <CardDescription>
              Sign in to create communities, join discussions, and chat with fellow fashion enthusiasts.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/sign-in">Sign In to Continue</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fashion Communities
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Connect with fellow fashion enthusiasts, share your style, and discover new trends through real-time chat.
          </p>
          
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Community
          </Button>
        </div>

        {/* Main Tabs */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="public" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="public" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Public Communities
              </TabsTrigger>
              <TabsTrigger value="your" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Your Communities
              </TabsTrigger>
              <TabsTrigger value="join" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Join with Code
              </TabsTrigger>
            </TabsList>

            {/* Public Communities Tab */}
            <TabsContent value="public" className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading communities...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPublicCommunities.map((community) => (
                    <Card key={community.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg line-clamp-1">{community.name}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">
                              {community.description}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {community.memberCount}/{community.maxMembers} members
                            </span>
                            <span>by {community.createdByName}</span>
                          </div>
                          
                          {(community.tags || []).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(community.tags || []).slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {(community.tags || []).length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{(community.tags || []).length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <Button 
                            onClick={() => handleJoinCommunity(community)}
                            disabled={isJoining === community.id}
                            className="w-full"
                          >
                            {isJoining === community.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Joining...
                              </>
                            ) : (
                              <>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Join & Chat
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredPublicCommunities.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-12">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No communities found</h3>
                      <p className="text-gray-500">
                        {searchQuery 
                          ? "Try adjusting your search terms" 
                          : "Be the first to create a public community!"
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Your Communities Tab */}
            <TabsContent value="your" className="space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading your communities...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userCommunities.map((community) => (
                    <Card key={community.id} className="hover:shadow-lg transition-shadow border-purple-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg line-clamp-1">{community.name}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">
                              {community.description}
                            </CardDescription>
                          </div>
                          <Badge variant={community.type === 'public' ? 'default' : 'secondary'}>
                            {community.type === 'public' ? (
                              <><Globe className="h-3 w-3 mr-1" />Public</>
                            ) : (
                              <><Lock className="h-3 w-3 mr-1" />Private</>
                            )}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {community.memberCount}/{community.maxMembers} members
                            </span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{community.joinCode}</code>
                          </div>
                          
                          {(community.tags || []).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(community.tags || []).slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <Button 
                            onClick={() => router.push(`/communities/${community.id}`)}
                            className="w-full"
                            variant="outline"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Open Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {userCommunities.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-12">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No communities yet</h3>
                      <p className="text-gray-500 mb-4">
                        Create your first community or join an existing one to get started.
                      </p>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Community
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Join with Code Tab */}
            <TabsContent value="join" className="space-y-6">
              <Card className="max-w-md mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Hash className="h-5 w-5" />
                    Join with Code
                  </CardTitle>
                  <CardDescription>
                    Enter a 6-character community code to join a private community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="join-code">Community Code</Label>
                    <Input
                      id="join-code"
                      placeholder="ABC123"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="text-center text-lg font-mono tracking-widest"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleJoinByCode}
                    disabled={joinCode.length !== 6 || isJoining === "code"}
                    className="w-full"
                  >
                    {isJoining === "code" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Join Community
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Community Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
              <DialogDescription>
                Start your own fashion community and invite others to join the conversation.
              </DialogDescription>
            </DialogHeader>
            <CommunityCreateForm
              onCommunityCreated={handleCommunityCreated}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}