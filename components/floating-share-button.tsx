"use client"

import { useState } from "react"
import { Share2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useWebSocket } from "@/lib/websocket-context"
import { CommunityPopup } from "./community-popup"

export function FloatingShareButton() {
  const [isCommunityOpen, setIsCommunityOpen] = useState(false)
  const { user } = useAuth()
  const { sharePage, isConnected } = useWebSocket()

  const handleQuickShare = () => {
    if (user && isConnected) {
      const currentUrl = window.location.pathname
      const pageTitle = document.title || "Shared Page"
      // Share to default community - in a real app, you'd let users choose
      sharePage("default-community", currentUrl, pageTitle)
    } else {
      setIsCommunityOpen(true)
    }
  }

  if (!user) return null

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col gap-3">
          {/* Quick Share Button */}
          <Button
            onClick={handleQuickShare}
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title={isConnected ? "Share this page with your community" : "Open community chat"}
          >
            <Share2 className="h-5 w-5" />
          </Button>

          {/* Community Button */}
          <Button
            onClick={() => setIsCommunityOpen(true)}
            size="lg"
            variant="outline"
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow bg-background"
            title="Open community panel"
          >
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <CommunityPopup
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
      />
    </>
  )
}
