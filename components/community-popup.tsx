"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Code, Copy, Check, AlertCircle, ExternalLink, Calendar, User } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { createCommunity, joinCommunity, generateInviteCode, getUserCommunities } from "@/lib/firebase-services"
import { CommunityMessaging } from "./community-messaging"
import { useCommunity } from "@/lib/community-context"
import { Community } from "@/lib/types"

interface CommunityPopupProps {
  isOpen: boolean
  onClose: () => void
  autoJoinCode?: string | null
}

export function CommunityPopup({ isOpen, onClose, autoJoinCode }: CommunityPopupProps) {
  const [activeTab, setActiveTab] = useState("my-communities")
  const [communityName, setCommunityName] = useState("")
  const [communityDescription, setCommunityDescription] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userCommunities, setUserCommunities] = useState<Community[]>([])
  const [loadingCommunities, setLoadingCommunities] = useState(false)

  const { user } = useAuth()
  const { currentCommunityCode, setCurrentCommunityCode } = useCommunity()

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  const generateCommunityLink = (inviteCode: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}?join=${inviteCode}`
    }
    return `https://your-domain.com?join=${inviteCode}`
  }

  const loadUserCommunities = async () => {
    if (!user) return
    
    setLoadingCommunities(true)
    try {
      const communities = await getUserCommunities()
      setUserCommunities(communities)
    } catch (error) {
      console.error('Failed to load communities:', error)
    } finally {
      setLoadingCommunities(false)
    }
  }

  useEffect(() => {
    if (isOpen && user) {
      loadUserCommunities()
    }
  }, [isOpen, user])

  // Handle auto-join when URL has join parameter
  useEffect(() => {
    if (autoJoinCode && isOpen && user) {
      setInviteCode(autoJoinCode)
      setActiveTab("join")
      // Automatically trigger join if user is signed in
      const timer = setTimeout(() => {
        handleJoinCommunity()
      }, 500) // Small delay to ensure UI is ready
      
      return () => clearTimeout(timer)
    } else if (autoJoinCode && isOpen && !user) {
      // If not signed in, pre-fill the code and show join tab
      setInviteCode(autoJoinCode)
      setActiveTab("join")
      setError("Please sign in to join the community")
    }
  }, [autoJoinCode, isOpen, user])

  const handleCreateCommunity = async () => {
    if (!user) {
      setError("Please sign in to create a community")
      return
    }

    if (!communityName.trim() || !communityDescription.trim()) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    clearMessages()

    try {
      const result = await createCommunity(communityName.trim(), communityDescription.trim())
      const shareableLink = generateCommunityLink(result.inviteCode)
      
      setGeneratedCode(result.inviteCode)
      setGeneratedLink(shareableLink)
      setCurrentCommunityCode(result.inviteCode)
      setSuccess(`Community "${communityName}" created successfully!`)
      setCommunityName("")
      setCommunityDescription("")
      
      // Reload user communities to show the new one
      await loadUserCommunities()
      
      // Switch to generate tab to show the shareable link
      setActiveTab("generate")
    } catch (error: any) {
      setError(error.message || "Failed to create community")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCommunity = async () => {
    if (!user) {
      setError("Please sign in to join a community")
      return
    }

    if (!inviteCode.trim()) {
      setError("Please enter an invite code")
      return
    }

    setLoading(true)
    clearMessages()

    try {
      const communityId = await joinCommunity(inviteCode.trim().toUpperCase())
      setSuccess("Successfully joined the community!")
      setCurrentCommunityCode(inviteCode.trim().toUpperCase())
      setInviteCode("")
      
      // Reload user communities to show the newly joined one
      await loadUserCommunities()
      
      // Switch to my communities tab to see the joined community
      setActiveTab("my-communities")
    } catch (error: any) {
      setError(error.message || "Failed to join community")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCode = async (communityId?: string) => {
    if (!user) {
      setError("Please sign in to generate invite codes")
      return
    }

    setLoading(true)
    clearMessages()

    try {
      // For now, we'll generate a code for the most recent community
      // In a real app, you'd want to select which community
      const code = await generateInviteCode(communityId || "default")
      setGeneratedCode(code)
      setSuccess("Invite code generated successfully!")
    } catch (error: any) {
      setError(error.message || "Failed to generate invite code")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyLinkToClipboard = async (link: string) => {
    await navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community
          </SheetTitle>
          <SheetDescription>
            Join existing communities or create your own fashion community
          </SheetDescription>
        </SheetHeader>

        {!user && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access community features.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4">
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="my-communities">My Communities</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="generate">Share</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

            <TabsContent value="my-communities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Communities</CardTitle>
                  <CardDescription>
                    Communities you've joined or created
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingCommunities ? (
                    <div className="text-center py-4">Loading communities...</div>
                  ) : userCommunities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>You haven't joined any communities yet.</p>
                      <p className="text-sm">Create one or join using an invite code!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userCommunities.map((community) => (
                        <div key={community.id} className="p-4 border rounded-lg space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{community.name}</h4>
                              <p className="text-sm text-muted-foreground">{community.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {community.members.length} members
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(community.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {community.creatorId === user?.uid && (
                                <Badge variant="secondary">Owner</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentCommunityCode(community.inviteCodes[0])
                                setActiveTab("chat")
                              }}
                            >
                              Open Chat
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = generateCommunityLink(community.inviteCodes[0])
                                copyLinkToClipboard(link)
                              }}
                            >
                              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              {copiedLink ? "Copied!" : "Share Link"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="join" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Join a Community</CardTitle>
                  <CardDescription>
                    Enter an invite code to join the community chat channel. The same code serves as both the invite and chat room identifier.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-code">Community Channel Code</Label>
                    <Input
                      id="invite-code"
                      placeholder="Enter channel code (e.g., ABC123XY)"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleJoinCommunity}
                    className="w-full"
                    disabled={!inviteCode.trim() || loading || !user}
                  >
                    {loading ? "Joining..." : "Join Community"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create a Community</CardTitle>
                  <CardDescription>
                    Start your own fashion community and invite others to join
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="community-name">Community Name</Label>
                    <Input
                      id="community-name"
                      placeholder="e.g., Streetwear Enthusiasts"
                      value={communityName}
                      onChange={(e) => setCommunityName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="community-description">Description</Label>
                    <Input
                      id="community-description"
                      placeholder="Describe your community"
                      value={communityDescription}
                      onChange={(e) => setCommunityDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCreateCommunity}
                    className="w-full"
                    disabled={!communityName.trim() || !communityDescription.trim() || loading || !user}
                  >
                    {loading ? "Creating..." : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Community
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share Community</CardTitle>
                  <CardDescription>
                    Share your community channel with others. The invite code doubles as the chat room identifier.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedCode && (
                    <>
                      <div className="space-y-2">
                        <Label>Community Channel Code</Label>
                        <div className="flex gap-2">
                          <Input
                            value={generatedCode}
                            readOnly
                            className="font-mono"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={copyToClipboard}
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This code is also your WebSocket channel identifier for real-time chat
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Shareable Link</Label>
                        <div className="flex gap-2">
                          <Input
                            value={generatedLink}
                            readOnly
                            className="text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyLinkToClipboard(generatedLink)}
                          >
                            {copiedLink ? <Check className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Anyone with this link can join your community and chat in the same channel
                        </p>
                      </div>
                    </>
                  )}
                  
                  {!generatedCode && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Create a community first to generate sharing options</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handleGenerateCode()}
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Generate New Code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <CommunityMessaging
                communityId={currentCommunityCode}
                communityName="Fashion Community"
                inviteCode={currentCommunityCode}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
