"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AuthPanelLayout } from "@/components/auth/AuthPanelLayout"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuth } from "@/context/auth-context"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { resetPassword, isLoading } = useAuth()
  const token = searchParams.get("token")
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (!token) {
      setError("This reset link is invalid or expired.")
      return
    }

    try {
      await resetPassword(token, formData.newPassword, formData.confirmPassword)
      setSuccess("Password reset successfully. Redirecting to sign in...")
      window.setTimeout(() => {
        router.push("/auth?mode=signin")
      }, 1800)
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Password reset failed"
      setError(message)
    }
  }

  return (
    <AuthPanelLayout
      eyebrow="Password Reset"
      title="Set a new password and return to the board"
      description="Choose a strong password so you can get back into your session flow without losing access."
      footer={
        <p>
          Already recovered your account?{" "}
          <Link
            href="/auth?mode=signin"
            className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-strong)]"
          >
            Sign in
          </Link>
        </p>
      }
    >
      {!token ? (
        <div className="space-y-5">
          <AlertMessage
            message="This password reset link is invalid or expired."
            tone="error"
          />
          <Link
            href="/auth/forgot-password"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-accent-strong)]"
          >
            Request New Reset Link
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Choose a new password
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Use at least 8 characters with a mix of uppercase, lowercase, and numbers.
            </p>
          </div>

          {error ? <AlertMessage message={error} tone="error" /> : null}
          {success ? <AlertMessage message={success} tone="success" /> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              label="New password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter a strong password"
              helperText="Minimum 8 characters recommended."
              required
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
            />

            <Button type="submit" disabled={isLoading} fullWidth size="lg">
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
      )}
    </AuthPanelLayout>
  )
}
