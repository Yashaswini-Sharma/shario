"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { Chrome, UserPlus, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  const { user, signInWithGoogle, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign up error:', error)
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
                <UserPlus className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Join StyleHub</CardTitle>
              <CardDescription className="text-base">
                Create your account and start your fashion journey today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={handleGoogleSignUp}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                <Chrome className="h-5 w-5 mr-2" />
                Sign Up with Google
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Member Benefits</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Personalized shopping experience</li>
                  <li>• Early access to new collections</li>
                  <li>• Member-only discounts and offers</li>
                  <li>• Style recommendations just for you</li>
                  <li>• Fast and secure checkout</li>
                </ul>
              </div>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/sign-in" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}