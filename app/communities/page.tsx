"use client"

import { useState } from "react"
import { Plus, Users, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CommunityCreateForm } from "@/components/community-create-form"
import { CommunityDiscovery } from "@/components/community-discovery"
import { Community } from "@/lib/firebase-community-service"

export default function CommunitiesPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)

  const handleCommunityCreated = (community: Community, joinCode: string) => {
    setShowCreateDialog(false)
    setSelectedCommunity(community)
  }

  const handleCommunityJoined = (community: Community) => {
    setSelectedCommunity(community)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fashion Communities
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with fellow fashion enthusiasts, share your style, and discover new trends. 
            Create your own community or join existing ones to chat in real-time.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Community
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <CardTitle>Real-time Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Chat with community members in real-time, share pages, and discuss fashion trends instantly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-8 w-8 mx-auto mb-2 text-pink-600" />
              <CardTitle>Public & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create public communities for everyone to discover, or private ones accessible only with join codes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Plus className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <CardTitle>Easy to Join</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Join communities with simple 6-character codes or discover public communities by browsing.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {selectedCommunity ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      {selectedCommunity.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedCommunity.description || "No description"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCommunity(null)}
                  >
                    Back to Communities
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Community chat will be implemented here</p>
                  <p className="text-sm mt-2">
                    Navigate to /communities/{selectedCommunity.id} for the full chat experience
                  </p>
                  <Button
                    className="mt-4"
                    asChild
                  >
                    <a href={`/communities/${selectedCommunity.id}`}>
                      Open Chat
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CommunityDiscovery
              onCommunityJoined={handleCommunityJoined}
            />
          )}
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