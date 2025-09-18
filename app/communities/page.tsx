"use client"

import { useState, useEffect } from "react"
import { Plus, Users, MessageCircle, Search, Globe, Lock, Hash, ArrowRight, Loader2, Sparkles, Crown, Star, Heart, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CommunityCreateForm } from "@/components/community-create-form"
import { CommunityManager } from "@/components/community-manager"
import { Community, getPublicCommunities, getUserCommunities, joinCommunityByCode } from "@/lib/firebase-community-service"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"

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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 right-32 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-40 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-20 w-36 h-36 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        <Header />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <Card className="max-w-lg mx-4 bg-white/10 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
            <CardHeader className="text-center py-12">
              <div className="relative mb-6">
                <MessageCircle className="h-20 w-20 mx-auto text-cyan-400 animate-bounce" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Fashion Communities
              </CardTitle>
              <CardDescription className="text-xl text-gray-300 leading-relaxed">
                Sign in to create communities, join discussions, and chat with fellow fashion enthusiasts worldwide.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-12">
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 border-0 text-white shadow-2xl text-lg px-8 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300"
              >
                <a href="/sign-in">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Sign In to Continue
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-32 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-40 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-spin-slow"></div>
      </div>
      
      <Header />
      
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Hero Section */}
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-8">
              <div className="relative mr-6">
                <Users className="h-20 w-20 text-cyan-400 animate-spin-slow" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <div className="text-center">
                <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl mb-4 animate-gradient-x">
                  Fashion Communities
                </h1>
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  Connect • Share • Style Together
                </div>
              </div>
              <div className="relative ml-6">
                <MessageCircle className="h-20 w-20 text-pink-400 animate-bounce" />
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-pink-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            <p className="text-xl text-gray-800 max-w-4xl mx-auto leading-relaxed font-medium mb-8">
              Connect with fellow fashion enthusiasts worldwide, share your style inspiration, 
              and discover new trends through vibrant real-time conversations.
            </p>
            
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 shadow-2xl text-lg px-8 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-6 w-6 mr-3" />
              Create Your Community
              <Sparkles className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Enhanced Main Tabs */}
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="public" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/10 backdrop-blur-xl border-0 rounded-2xl p-2 shadow-2xl">
                <TabsTrigger 
                  value="public" 
                  className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 px-6 transition-all duration-300"
                >
                  <Globe className="h-4 w-4" />
                  Public Communities
                </TabsTrigger>
                <TabsTrigger 
                  value="your" 
                  className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl py-3 px-6 transition-all duration-300"
                >
                  <Users className="h-4 w-4" />
                  Your Communities
                </TabsTrigger>
                <TabsTrigger 
                  value="join" 
                  className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-xl py-3 px-6 transition-all duration-300"
                >
                  <Hash className="h-4 w-4" />
                  Join with Code
                </TabsTrigger>
                <TabsTrigger 
                  value="manage" 
                  className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-xl py-3 px-6 transition-all duration-300"
                >
                  <MessageCircle className="h-4 w-4" />
                  Manage
                </TabsTrigger>
              </TabsList>

              {/* Enhanced Public Communities Tab */}
              <TabsContent value="public" className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search fashion communities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 bg-white/10 backdrop-blur-xl border-0 text-white placeholder-gray-400 rounded-xl py-4 text-lg focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-cyan-400" />
                    <p className="text-gray-300 text-xl">Discovering amazing communities...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPublicCommunities.map((community) => (
                      <Card key={community.id} className="group bg-white/10 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-500 hover:scale-105 overflow-hidden">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl text-gray-100 line-clamp-1 group-hover:text-cyan-400 transition-colors duration-300">
                                {community.name}
                              </CardTitle>
                              <CardDescription className="line-clamp-2 mt-2 text-gray-300 text-base leading-relaxed">
                                {community.description}
                              </CardDescription>
                            </div>
                            <Badge className="ml-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 text-white shadow-lg">
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between text-sm text-gray-300">
                              <span className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                                <Users className="h-4 w-4 text-cyan-400" />
                                <span className="font-medium">{community.memberCount}/{community.maxMembers}</span>
                              </span>
                              <span className="text-gray-400">by {community.createdByName}</span>
                            </div>
                            
                            {(community.tags || []).length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {(community.tags || []).slice(0, 3).map((tag, index) => (
                                  <Badge key={index} className="bg-white/20 hover:bg-white/30 text-gray-200 border-0 text-xs px-3 py-1 rounded-full">
                                    {tag}
                                  </Badge>
                                ))}
                                {(community.tags || []).length > 3 && (
                                  <Badge className="bg-white/20 hover:bg-white/30 text-gray-200 border-0 text-xs px-3 py-1 rounded-full">
                                    +{(community.tags || []).length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <Button 
                              onClick={() => handleJoinCommunity(community)}
                              disabled={isJoining === community.id}
                              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 border-0 text-white shadow-xl rounded-xl py-3 text-base font-medium transform hover:scale-105 transition-all duration-300"
                            >
                              {isJoining === community.id ? (
                                <>
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  Joining...
                                </>
                              ) : (
                                <>
                                  <ArrowRight className="h-5 w-5 mr-2" />
                                  Join & Chat
                                  <Sparkles className="h-4 w-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {filteredPublicCommunities.length === 0 && !isLoading && (
                      <div className="col-span-full text-center py-20">
                        <div className="relative mb-8">
                          <MessageCircle className="h-20 w-20 mx-auto text-gray-400 animate-bounce" />
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-400 rounded-full animate-ping opacity-50"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-300 mb-4">No communities found</h3>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto">
                          {searchQuery 
                            ? "Try adjusting your search terms or explore different topics" 
                            : "Be the first to create a public community and start the conversation!"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </TabsContent>

              {/* Enhanced Your Communities Tab */}
              <TabsContent value="your" className="space-y-8">
                {isLoading ? (
                  <div className="text-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-purple-400" />
                    <p className="text-gray-300 text-xl">Loading your communities...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {userCommunities.map((community) => (
                      <Card key={community.id} className="group bg-white/10 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-500 hover:scale-105 overflow-hidden border-purple-300/20">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl text-gray-100 line-clamp-1 group-hover:text-purple-400 transition-colors duration-300">
                                {community.name}
                              </CardTitle>
                              <CardDescription className="line-clamp-2 mt-2 text-gray-300 text-base leading-relaxed">
                                {community.description}
                              </CardDescription>
                            </div>
                            <Badge className={`ml-3 border-0 text-white shadow-lg ${
                              community.type === 'public' 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                                : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                            }`}>
                              {community.type === 'public' ? (
                                <><Globe className="h-3 w-3 mr-1" />Public</>
                              ) : (
                                <><Lock className="h-3 w-3 mr-1" />Private</>
                              )}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between text-sm text-gray-300">
                              <span className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                                <Users className="h-4 w-4 text-purple-400" />
                                <span className="font-medium">{community.memberCount}/{community.maxMembers}</span>
                              </span>
                              <code className="bg-white/20 text-cyan-300 px-3 py-1 rounded-lg text-xs font-mono tracking-wider">
                                {community.joinCode}
                              </code>
                            </div>
                            
                            {(community.tags || []).length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {(community.tags || []).slice(0, 3).map((tag, index) => (
                                  <Badge key={index} className="bg-white/20 hover:bg-white/30 text-gray-200 border-0 text-xs px-3 py-1 rounded-full">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <Button 
                              onClick={() => router.push(`/communities/${community.id}`)}
                              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 text-white shadow-xl rounded-xl py-3 text-base font-medium transform hover:scale-105 transition-all duration-300"
                            >
                              <MessageCircle className="h-5 w-5 mr-2" />
                              Open Chat
                              <Heart className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {userCommunities.length === 0 && !isLoading && (
                      <div className="col-span-full text-center py-20">
                        <div className="relative mb-8">
                          <Users className="h-20 w-20 mx-auto text-gray-400 animate-bounce" />
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-400 rounded-full animate-ping opacity-50"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-300 mb-4">No communities yet</h3>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto mb-8">
                          Create your first community or join an existing one to start building connections.
                        </p>
                        <Button 
                          onClick={() => setShowCreateDialog(true)}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-xl rounded-xl px-8 py-4 text-lg font-medium transform hover:scale-105 transition-all duration-300"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Create Community
                          <Sparkles className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
            </TabsContent>

              {/* Enhanced Join with Code Tab */}
              <TabsContent value="join" className="space-y-8">
                <Card className="max-w-lg mx-auto bg-white/10 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
                  <CardHeader className="text-center py-12 bg-gradient-to-br from-pink-500/20 to-red-500/20">
                    <div className="relative mb-6">
                      <Hash className="h-16 w-16 mx-auto text-pink-400 animate-bounce" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
                      Join with Code
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-lg leading-relaxed">
                      Enter a 6-character community code to join a private fashion community
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="join-code" className="text-gray-300 font-medium text-base">
                        Community Code
                      </Label>
                      <Input
                        id="join-code"
                        placeholder="ABC123"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="text-center text-2xl font-mono tracking-[0.5em] bg-white/10 backdrop-blur-xl border-0 text-white placeholder-gray-400 rounded-xl py-6 focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleJoinByCode}
                      disabled={joinCode.length !== 6 || isJoining === "code"}
                      className="w-full bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 border-0 text-white shadow-xl rounded-xl py-4 text-lg font-medium transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isJoining === "code" ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Joining Community...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-5 w-5 mr-2" />
                          Join Community
                          <Star className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Manage Communities Tab */}
              <TabsContent value="manage" className="space-y-8">
                <div className="max-w-4xl mx-auto">
                  <Card className="bg-white/10 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 py-8">
                      <CardTitle className="text-2xl font-bold text-gray-100 text-center">
                        Community Management
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-center text-lg">
                        Manage your communities and moderate discussions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <CommunityManager />
                    </CardContent>
                  </Card>
                </div>
            </TabsContent>
            </Tabs>
          </div>

          {/* Enhanced Create Community Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl bg-white/10 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-100">Create New Community</DialogTitle>
                <DialogDescription className="text-gray-300 text-base">
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
      </main>
    </div>
  )
}