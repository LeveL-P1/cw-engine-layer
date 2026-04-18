"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AuthPanelLayout } from "@/components/auth/AuthPanelLayout"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/context/auth-context"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const { resendVerificationEmail, isLoading } = useAuth()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleResendEmail = async () => {
    if (!email) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await resendVerificationEmail(email)
      setSuccess("Verification email sent. Please check your inbox again.")
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to resend verification email"
      setError(message)
    }
  }

  return (
    <AuthPanelLayout
      eyebrow="Email Verification"
      title="Confirm your email and continue to the session lobby"
      description="Verification is the last step before you can launch or join collaborative whiteboard sessions."
      footer={
        <p>
          Already verified?{" "}
          <Link
            href="/auth?mode=signin"
            className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-strong)]"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {token ? "Verification link opened" : "Check your inbox"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            {token
              ? "If Supabase has confirmed your address successfully, you can head straight back to sign in."
              : "Open the verification email we sent and confirm your address to unlock the full session flow."}
          </p>
        </div>

        {error ? <AlertMessage message={error} tone="error" /> : null}
        {success ? <AlertMessage message={success} tone="success" /> : null}

        {token ? (
          <Link
            href="/auth?mode=signin"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-accent-strong)]"
          >
            Go to Sign In
          </Link>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-panel)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              We&apos;ve sent a verification link to your email address. Verify
              first, then return to the sign-in flow.
            </div>

            {email ? (
              <Button
                type="button"
                onClick={handleResendEmail}
                disabled={isLoading}
                variant="secondary"
                fullWidth
                size="lg"
              >
                {isLoading ? "Sending..." : "Resend Verification Email"}
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </AuthPanelLayout>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthPanelLayout
          eyebrow="Email Verification"
          title="Preparing verification"
          description="We are checking the verification link before showing the next step."
        >
          <div className="h-32 animate-pulse rounded-lg border border-[var(--color-border-soft)] bg-white/5" />
        </AuthPanelLayout>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
