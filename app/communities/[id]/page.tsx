"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Users, Globe, Lock, Copy, Check, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FirebaseCommunityMessaging } from "@/components/firebase-community-messaging"
import { useAuth } from "@/lib/auth-context"
import { getCommunity, isUserMember, Community } from "@/lib/firebase-community-service"
import { useToast } from "@/hooks/use-toast"

interface CommunityPageProps {
  params: {
    id: string
  }
}

export default function CommunityPage({ params }: CommunityPageProps) {
  const [community, setCommunity] = useState<Community | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user && params.id) {
      loadCommunityData()
    }
  }, [user, params.id])

  const loadCommunityData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const [communityData, membershipStatus] = await Promise.all([
        getCommunity(params.id),
        isUserMember(params.id, user.uid)
      ])

      setCommunity(communityData)
      setIsMember(membershipStatus)
    } catch (error) {
      console.error('Error loading community:', error)
      toast({
        title: "Error",
        description: "Failed to load community",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyJoinCode = () => {
    if (community) {
      navigator.clipboard.writeText(community.joinCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
      toast({
        title: "Copied!",
        description: "Join code copied to clipboard",
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Please sign in to access communities</p>
              <Button className="mt-4" asChild>
                <a href="/sign-in">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading community...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Community Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This community doesn't exist or may have been deleted.
              </p>
              <Button asChild>
                <a href="/communities">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Communities
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/communities">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
                <p className="text-muted-foreground">
                  {community.description || "No description available"}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {community.type === 'public' ? (
                    <>
                      <Globe className="h-4 w-4 text-green-500" />
                      <span>Public Community</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-blue-500" />
                      <span>Private Community</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{community.memberCount} members</span>
                </div>
              </div>

              {(community.tags || []).length > 0 && (
                <div className="flex gap-2 justify-center flex-wrap">
                  {(community.tags || []).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="border rounded-lg p-6 bg-muted/50">
                <h3 className="text-lg font-semibold mb-2">Join Required</h3>
                <p className="text-muted-foreground mb-4">
                  You need to be a member to access this community's chat and features.
                </p>
                <Button asChild>
                  <a href="/communities">
                    Browse & Join Communities
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/communities">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Communities
                  </a>
                </Button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-2xl">{community.name}</CardTitle>
                    {community.type === 'public' ? (
                      <Globe className="h-5 w-5 text-green-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <CardDescription>
                    {community.description || "No description"}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  Code: {community.joinCode}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyJoinCode}
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {community.memberCount}/{community.maxMembers} members
              </div>
              <span>Created by {community.createdByName}</span>
              <span>
                {new Date(community.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            {(community.tags || []).length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {(community.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Main Chat Area */}
        <FirebaseCommunityMessaging communityId={params.id} />
      </div>
    </div>
  )
}