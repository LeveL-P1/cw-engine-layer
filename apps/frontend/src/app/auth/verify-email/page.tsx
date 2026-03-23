"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const { resendVerificationEmail, isLoading } = useAuth()

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleResendEmail = async () => {
    if (!email) return
    try {
      await resendVerificationEmail(email)
      setSuccess("Verification email sent! Please check your inbox.")
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to resend verification email"
      setError(message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
        <p className="text-slate-400 mb-6">
          {token
            ? "Your verification link was opened. Continue to sign in after Supabase confirms your email."
            : "Complete your sign up by verifying your email address"}
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

        {token ? (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm bg-slate-700/50 p-4 rounded-lg">
              If your email has been verified successfully, you can continue to sign in.
            </p>
            <Link
              href="/auth?mode=signin"
              className="block w-full rounded-lg bg-blue-600 py-2 text-center font-medium text-white transition hover:bg-blue-700"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
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
            <Link href="/auth?mode=signin" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
