"use client"

import { useState } from "react"
import { Plus, Users, Lock, Globe, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { createCommunity } from "@/lib/firebase-community-service"
import { useToast } from "@/hooks/use-toast"

interface CommunityCreateFormProps {
  onCommunityCreated?: (community: any, joinCode: string) => void
  onCancel?: () => void
}

export function CommunityCreateForm({ onCommunityCreated, onCancel }: CommunityCreateFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<'public' | 'private'>('public')
  const [maxMembers, setMaxMembers] = useState("100")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  
  const { user } = useAuth()
  const { toast } = useToast()

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create a community",
        variant: "destructive"
      })
      return
    }

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Community name is required",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)

    try {
      const result = await createCommunity(
        name.trim(),
        description.trim(),
        type,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        parseInt(maxMembers) || 100,
        tags
      )

      if (result && result.community && result.joinCode) {
        toast({
          title: "Success!",
          description: `Community "${name}" created successfully! Join code: ${result.joinCode}`,
        })

        onCommunityCreated?.(result.community, result.joinCode)

        // Reset form
        setName("")
        setDescription("")
        setType('public')
        setMaxMembers("100")
        setTags([])
        setTagInput("")
      } else {
        throw new Error("Invalid response from server")
      }

    } catch (error) {
      console.error('Error creating community:', error)
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Community
        </CardTitle>
        <CardDescription>
          Build a community around fashion, trends, or any topic you're passionate about
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Fashion Enthusiasts"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what your community is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          {/* Community Type */}
          <div className="space-y-3">
            <Label>Community Type</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as 'public' | 'private')}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="public" id="public" />
                <Globe className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <Label htmlFor="public" className="font-medium">Public Community</Label>
                  <p className="text-xs text-muted-foreground">
                    Anyone can discover and join this community
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="private" id="private" />
                <Lock className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <Label htmlFor="private" className="font-medium">Private Community</Label>
                  <p className="text-xs text-muted-foreground">
                    Only people with the join code can access this community
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Max Members */}
          <div className="space-y-2">
            <Label htmlFor="maxMembers">Maximum Members</Label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Input
                id="maxMembers"
                type="number"
                min="2"
                max="1000"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                className="w-32"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={20}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Add up to 5 tags to help others discover your community
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="flex-1"
            >
              {isCreating ? "Creating..." : "Create Community"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}