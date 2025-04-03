"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Users, Check, X } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function RegisterPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [passwordFocused, setPasswordFocused] = useState(false)
  const passwordLength = password.length >= 8
  const passwordUppercase = /[A-Z]/.test(password)
  const passwordNumber = /\d/.test(password)
  const passwordValid = passwordLength && passwordUppercase && passwordNumber

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!passwordValid) {
      setError("Please ensure your password meets all requirements.")
      return
    }

    setLoading(true)

    try {
      await api.post("/users/register", {
        name,
        email,
        password,
      })

      router.push("/auth/signin")
    } catch (_) {
      setError("An error occurred. Please try again.")
    }
    setLoading(false)
  }

  useEffect(() => {
    if (session) {
      router.push("/")
    }
  }, [session, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-primary rounded-lg p-2">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">BuddyUp</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join our community</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(password.length !== 0)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="h-11"
                />

                {passwordFocused && (
                  <div className="mt-2 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      {passwordLength ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={passwordLength ? "text-green-500" : "text-muted-foreground"}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordUppercase ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={passwordUppercase ? "text-green-500" : "text-muted-foreground"}>
                        At least one uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordNumber ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={passwordNumber ? "text-green-500" : "text-muted-foreground"}>
                        At least one number
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11 mt-2">
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-11">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-11">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
                Facebook
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center p-6 bg-muted/50 gap-2 rounded-b-lg">
            <p className="text-sm text-muted-foreground">Already have an account?</p>
            <Link href="/auth/signin">
              <Button variant="link" className="p-0">
                Sign in
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

