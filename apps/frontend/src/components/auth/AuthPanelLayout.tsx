"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { SurfaceCard } from "@/components/ui/SurfaceCard"

interface AuthPanelLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthPanelLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthPanelLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.14),transparent_28%),linear-gradient(180deg,var(--color-bg-canvas)_0%,var(--color-bg-app)_100%)] px-4 py-10 text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <SurfaceCard className="grid w-full overflow-hidden md:grid-cols-[1fr_0.92fr]">
          <div className="flex flex-col justify-between bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.16),transparent_40%),linear-gradient(180deg,var(--color-bg-strong),#10203a)] p-8 text-white md:p-10">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.32em] text-teal-200">
                {eyebrow}
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight">
                {title}
              </h1>
              <p className="max-w-md text-sm leading-6 text-slate-200/85">
                {description}
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-200/85">
              <p>Session flow:</p>
              <p>/auth -&gt; /sessions -&gt; /whiteboard/[sessionId] -&gt; /dashboard/[sessionId] -&gt; /summary/[sessionId]</p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {children}
            {footer ? (
              <div className="mt-6 border-t border-[var(--color-border-soft)] pt-6 text-center text-sm text-[var(--color-text-muted)]">
                {footer}
              </div>
            ) : (
              <div className="mt-6 border-t border-[var(--color-border-soft)] pt-6 text-center text-sm text-[var(--color-text-muted)]">
                <p>
                  Ready to return?{" "}
                  <Link
                    href="/auth?mode=signin"
                    className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-strong)]"
                  >
                    Go to sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}
