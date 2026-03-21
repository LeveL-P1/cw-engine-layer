"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { verifyEmail, resendVerificationEmail, isLoading } = useAuth()

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(!!token)

  useEffect(() => {
    if (token) {
      verifyEmailToken()
    }
  }, [token])

  const verifyEmailToken = async () => {
    try {
      await verifyEmail(token!)
      setSuccess("Email verified successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Email verification failed")
      setIsVerifying(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email) return
    try {
      await resendVerificationEmail(email)
      setSuccess("Verification email sent! Please check your inbox.")
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
        <p className="text-slate-400 mb-6">
          {token ? "Verifying your email..." : "Complete your sign up by verifying your email address"}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {isVerifying && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {!token && !isVerifying && (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm bg-slate-700/50 p-4 rounded-lg">
              We&apos;ve sent a verification link to your email address. Click the link to verify your email and complete your sign up.
            </p>

            {email && (
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Didn&apos;t receive an email?</p>
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50"
                >
                  Resend verification email
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            Already verified?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
