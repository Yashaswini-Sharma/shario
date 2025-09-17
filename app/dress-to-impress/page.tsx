"use client"

import { useState } from 'react'
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Sparkles, 
  Play, 
  Users, 
  Clock, 
  DollarSign,
  Loader2,
  Crown,
  Palette,
  Timer,
  Trophy
} from "lucide-react"
import { useAuth } from '@/lib/auth-context'
import { useGame } from '@/lib/game-context'
import Link from 'next/link'

function GameLobby() {
  const { currentRoom, markReady, leaveGame, getCurrentPlayer, getOtherPlayers, canStartGame } = useGame()
  
  if (!currentRoom) return null

  const currentPlayer = getCurrentPlayer()
  const otherPlayers = getOtherPlayers()
  const allPlayers = Object.values(currentRoom.players)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Game Info Header */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Game Room Ready!
          </CardTitle>
          <CardDescription className="text-base">
            Players: {currentRoom.currentPlayers}/{currentRoom.maxPlayers}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Theme</span>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {currentRoom.theme}
              </Badge>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="font-medium">Budget</span>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                ${currentRoom.budget}
              </Badge>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Time Limit</span>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {currentRoom.timeLimit} min
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Players in Lobby
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              {allPlayers.filter(p => p.ready).length}/{allPlayers.length} ready
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allPlayers.map((player, index) => (
              <Card key={player.userId} className="text-center relative">
                {index === 0 && (
                  <div className="absolute -top-2 -right-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                  </div>
                )}
                <CardContent className="p-4">
                  <Avatar className="w-12 h-12 mx-auto mb-2">
                    <AvatarImage src={player.photoURL} alt={player.displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                      {player.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium truncate">{player.displayName}</p>
                  <div className="mt-2">
                    {player.ready ? (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        ✅ Ready
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        ⏳ Waiting
                      </Badge>
                    )}
                  </div>
                  {index === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Room Host</p>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Empty slots */}
            {Array.from({ length: currentRoom.maxPlayers - currentRoom.currentPlayers }).map((_, index) => (
              <Card key={`empty-${index}`} className="text-center border-dashed">
                <CardContent className="p-4">
                  <div className="w-12 h-12 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Waiting for player...</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!currentPlayer?.ready ? (
          <Button onClick={markReady} className="flex-1" size="lg">
            <Clock className="h-4 w-4 mr-2" />
            Mark Ready
          </Button>
        ) : (
          <Button disabled className="flex-1" size="lg">
            <Clock className="h-4 w-4 mr-2" />
            Ready! Waiting for others...
          </Button>
        )}
        
        <Button variant="outline" onClick={leaveGame} size="lg">
          Leave Game
        </Button>
      </div>

      {/* Game Rules */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">How to Play</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Create an outfit that matches the theme within your budget</p>
          <p>• You have {currentRoom.timeLimit} minutes to style your look</p>
          <p>• Vote for the best outfit (excluding your own)</p>
          <p>• Player with most votes wins! 🏆</p>
        </CardContent>
      </Card>
    </div>
  )
}

function StylingPhase() {
  const { currentRoom, timeRemaining } = useGame()
  
  if (!currentRoom) return null

  const progressPercentage = (timeRemaining / (currentRoom.timeLimit * 60)) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="bg-gradient-to-r from-orange-100 to-red-100 border-orange-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Palette className="h-6 w-6 text-orange-600" />
            Style Your Look!
          </CardTitle>
          <CardDescription className="text-base">
            Theme: <strong>{currentRoom.theme}</strong> • Budget: <strong>${currentRoom.budget}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">Time remaining</p>
          </div>
        </CardContent>
      </Card>

      {/* Styling Interface Placeholder */}
      <Card>
        <CardContent className="p-12 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Styling Interface</h3>
          <p className="text-muted-foreground mb-6">
            The styling interface will be built here where players can select clothing items within their budget.
          </p>
          <Button disabled size="lg">
            <Trophy className="h-4 w-4 mr-2" />
            Submit Outfit (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DressToImpressPage() {
  const { user } = useAuth()
  const { currentRoom, isSearching, gamePhase, joinGame } = useGame()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-600" />
              <h1 className="text-4xl font-bold mb-4">Sign In to Play!</h1>
              <p className="text-xl text-muted-foreground">
                Join the fashion showdown and show off your styling skills
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (gamePhase === 'lobby' && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <GameLobby />
        </main>
      </div>
    )
  }

  if (gamePhase === 'styling' && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <StylingPhase />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-16 w-16 text-purple-600 mr-4" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dress to Impress
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join random players in an epic fashion showdown! Get a theme, budget, and limited time to create the perfect outfit that will impress the judges.
            </p>
          </div>

          {/* Game Entry Card */}
          <Card className="max-w-lg mx-auto mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2">
                <Play className="h-6 w-6 text-primary" />
                Quick Match
              </CardTitle>
              <CardDescription className="text-base">
                Get matched with other players instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={joinGame} 
                size="lg" 
                className="w-full"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Finding Players...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 mr-2" />
                    Enter Game
                  </>
                )}
              </Button>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Game Features
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>4 players per game</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>5 minutes to create your look</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Random budget ($50-$200)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span>Surprise themes every game</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Creative Styling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Express your unique fashion sense with our extensive wardrobe and accessories
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Competitive Play</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Compete against other players and climb the fashion leaderboards
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 bg-pink-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="text-lg">Real-time Fun</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fast-paced matches with live voting and instant results
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}