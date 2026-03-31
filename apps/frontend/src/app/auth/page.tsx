"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"

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
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/80 shadow-2xl backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
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
              <button
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
              </button>
              <button
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
              </button>
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
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              {mode === "signup" ? (
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm text-slate-300">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
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
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>

              {mode === "signup" ? (
                <div>
                  <label htmlFor="confirmPassword" className="mb-1 block text-sm text-slate-300">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Confirm your password"
                  />
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? mode === "signin"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
