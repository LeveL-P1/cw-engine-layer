"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { StatePanel } from "@/components/ui/StatePanel"
import { SurfaceCard } from "@/components/ui/SurfaceCard"

type AuthMode = "signin" | "signup"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register, isLoading, isAuthenticated } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  })
  const requestedMode = searchParams.get("mode")
  const mode: AuthMode = requestedMode === "signup" ? "signup" : "signin"

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/sessions")
    }
  }, [isAuthenticated, router])

  if (isLoading && !isAuthenticated) {
    return (
      <StatePanel
        title="Loading authentication"
        message="Checking your session and preparing sign-in options..."
        loading
      />
    )
  }

  if (isAuthenticated) {
    return (
      <StatePanel
        title="Redirecting"
        message="Your account is active. Moving you to the session lobby..."
        loading
      />
    )
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      if (mode === "signin") {
        await login(formData.email, formData.password)
        router.push("/sessions")
        return
      }

      await register(
        formData.email,
        formData.name,
        formData.password,
        formData.confirmPassword,
      )

      setSuccess("Registration successful. Please verify your email.")
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Authentication failed"
      setError(message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <SurfaceCard className="grid w-full overflow-hidden border-slate-700 bg-slate-900/80 backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,1))] p-8 md:p-10">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300">
                Governed Whiteboard
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight">
                Structured collaboration with live governance and analytics.
              </h1>
              <p className="max-w-md text-sm leading-6 text-slate-300">
                Sign in to continue an existing workflow or create an account to
                start a governed whiteboard session.
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <p>Current app flow:</p>
              <p>/ -&gt; /auth -&gt; /sessions -&gt; /whiteboard/[sessionId] -&gt; /dashboard/[sessionId] -&gt; /summary/[sessionId]</p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="mb-6 flex rounded-xl bg-slate-800 p-1">
              <Button
                type="button"
                onClick={() => {
                  router.replace("/auth?mode=signin")
                }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === "signin"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Sign In
              </Button>
              <Button
                type="button"
                onClick={() => {
                  router.replace("/auth?mode=signup")
                }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Sign Up
              </Button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {mode === "signin"
                  ? "Sign in to reach your session lobby."
                  : "Register first, then continue through email verification."}
              </p>
            </div>

            {error ? (
              <div className="mb-4">
                <AlertMessage message={error} tone="error" />
              </div>
            ) : null}

            {success ? (
              <div className="mb-4">
                <AlertMessage message={success} tone="success" />
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-slate-700 bg-slate-950 text-white"
                placeholder="you@example.com"
              />

              {mode === "signup" ? (
                <Input
                  id="name"
                  name="name"
                  type="text"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border-slate-700 bg-slate-950 text-white"
                  placeholder="John Doe"
                />
              ) : null}

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm text-slate-300">
                    Password
                  </label>
                  {mode === "signin" ? (
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-blue-300 hover:text-blue-200"
                    >
                      Forgot password?
                    </Link>
                  ) : null}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border-slate-700 bg-slate-950 text-white"
                  placeholder="Enter your password"
                />
              </div>

              {mode === "signup" ? (
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="border-slate-700 bg-slate-950 text-white"
                  placeholder="Confirm your password"
                />
              ) : null}

              <Button
                type="submit"
                disabled={isLoading}
                fullWidth
                className="bg-blue-600 hover:bg-blue-500"
              >
                {isLoading
                  ? mode === "signin"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </form>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}
