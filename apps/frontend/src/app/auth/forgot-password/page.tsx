"use client"

import { useState } from "react"
import Link from "next/link"
import { AuthPanelLayout } from "@/components/auth/AuthPanelLayout"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuth } from "@/context/auth-context"

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await forgotPassword(email)
      setSuccess(
        "Password reset instructions were sent. Check your inbox and spam folder.",
      )
      setEmail("")
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to send reset email"
      setError(message)
    }
  }

  return (
    <AuthPanelLayout
      eyebrow="Account Recovery"
      title="Reset your password without leaving the flow"
      description="Use the email linked to your account and we will send a secure reset link so you can get back to your session lobby."
      footer={
        <p>
          Remember your password?{" "}
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
            Send reset email
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            We will email a recovery link to the address you use for this whiteboard account.
          </p>
        </div>

        {error ? <AlertMessage message={error} tone="error" /> : null}
        {success ? <AlertMessage message={success} tone="success" /> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <Button type="submit" disabled={isLoading} fullWidth size="lg">
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </AuthPanelLayout>
  )
}
