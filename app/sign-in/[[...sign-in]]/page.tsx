"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { Chrome, Sparkles } from 'lucide-react'

export default function SignInPage() {
  const { user, signInWithGoogle, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome to StyleHub</CardTitle>
              <CardDescription className="text-base">
                Sign in to access your cart, wishlist, and exclusive fashion deals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                <Chrome className="h-5 w-5 mr-2" />
                Continue with Google
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Why sign in?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Save items to your cart across devices</li>
                  <li>• Track your order history</li>
                  <li>• Get personalized recommendations</li>
                  <li>• Access exclusive member deals</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}