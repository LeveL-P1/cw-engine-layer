"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { StatePanel } from "@/components/ui/StatePanel"
import { SurfaceCard } from "@/components/ui/SurfaceCard"

type AuthMode = "signin" | "signup"

function AuthContent() {
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
    <div className="min-h-screen px-4 py-10 text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <SurfaceCard className="grid w-full overflow-hidden md:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-center bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.16),transparent_40%),linear-gradient(180deg,var(--color-bg-strong),#10203a)] p-7 text-white md:p-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200">
                Whiteboard First
              </p>
              <h1 className="max-w-sm text-3xl font-semibold leading-tight">
                Sign in and get to the board fast.
              </h1>
              <p className="max-w-sm text-sm leading-6 text-slate-200/85">
                Authenticate once, then create or join a session without extra friction.
              </p>
            </div>
          </div>

          <div className="p-7 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  router.replace("/auth?mode=signin")
                }}
                className={`min-w-[6.6rem] rounded-lg ${
                  mode === "signin"
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                Sign In
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  router.replace("/auth?mode=signup")
                }}
                className={`min-w-[6.6rem] rounded-lg ${
                  mode === "signup"
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                Sign Up
              </Button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h2>
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
                  placeholder="John Doe"
                />
              ) : null}

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm text-[var(--color-text-secondary)]">
                    Password
                  </label>
                  {mode === "signin" ? (
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-strong)]"
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
                  placeholder="Confirm your password"
                />
              ) : null}

              <Button
                type="submit"
                disabled={isLoading}
                fullWidth
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

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <StatePanel
          title="Loading authentication"
          message="Preparing the sign-in form..."
          loading
        />
      }
    >
      <AuthContent />
    </Suspense>
  )
}
