"use client"

import { useState } from "react"
import { Users, Plus, Code, Copy, Check } from "lucide-react"
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

interface CommunityPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function CommunityPopup({ isOpen, onClose }: CommunityPopupProps) {
  const [activeTab, setActiveTab] = useState("join")
  const [communityName, setCommunityName] = useState("")
  const [communityDescription, setCommunityDescription] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [copied, setCopied] = useState(false)

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setGeneratedCode(code)
  }

  const copyToClipboard = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreateCommunity = () => {
    // Here you would typically make an API call to create the community
    console.log("Creating community:", { name: communityName, description: communityDescription })
    // Reset form
    setCommunityName("")
    setCommunityDescription("")
    // Switch to generate code tab
    setActiveTab("generate")
    generateInviteCode()
  }

  const handleJoinCommunity = () => {
    // Here you would typically make an API call to join the community
    console.log("Joining community with code:", inviteCode)
    // Reset form
    setInviteCode("")
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

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="join">Join</TabsTrigger>
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="generate">Generate Code</TabsTrigger>
            </TabsList>

            <TabsContent value="join" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Join a Community</CardTitle>
                  <CardDescription>
                    Enter an invite code to join an existing fashion community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-code">Invite Code</Label>
                    <Input
                      id="invite-code"
                      placeholder="Enter invite code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleJoinCommunity}
                    className="w-full"
                    disabled={!inviteCode.trim()}
                  >
                    Join Community
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
                    disabled={!communityName.trim() || !communityDescription.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Community
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generate Invite Code</CardTitle>
                  <CardDescription>
                    Create an invite code to share with others
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Generated Code</Label>
                    <div className="flex gap-2">
                      <Input
                        value={generatedCode}
                        readOnly
                        placeholder="Click generate to create code"
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                        disabled={!generatedCode}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={generateInviteCode}
                    variant="outline"
                    className="w-full"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Generate New Code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
