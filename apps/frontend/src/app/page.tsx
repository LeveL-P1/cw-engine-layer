import Link from "next/link"

const featureCards = [
  {
    title: "Governed Collaboration",
    description:
      "Facilitator, contributor, and observer roles with mode-based editing control.",
  },
  {
    title: "Realtime Whiteboard",
    description:
      "Live synchronized canvas built for collaborative thinking, planning, and decisions.",
  },
  {
    title: "Actionable Analytics",
    description:
      "Session timelines, participation balance, and post-session summary insights.",
  },
]

const usageSteps = [
  "Sign in to enter your governed session lobby.",
  "Create a new session or join using an invite link.",
  "Collaborate on the whiteboard and review analytics before exporting a summary.",
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.2),transparent_45%),linear-gradient(180deg,var(--color-bg-canvas),var(--color-bg-surface))] text-[var(--color-text-primary)]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-16 pt-10 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--color-text-muted)]">
              CW-Engine
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Governed Whiteboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth?mode=signin"
              className="rounded-lg border border-[var(--color-border-soft)] px-4 py-2 text-sm text-[var(--color-text-primary)] transition hover:border-[var(--color-accent)] hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Start Collaborating
            </Link>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-[var(--color-border-soft)] px-4 py-1 text-xs uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
              Realtime Governance + Analytics
            </p>
            <h2 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              Structured collaboration for teams that need focus, accountability,
              and measurable outcomes.
            </h2>
            <p className="max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
              CW-Engine combines live whiteboarding with facilitation controls and
              session analytics so teams can ideate quickly without losing
              governance or decision context.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/auth"
                className="rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Go to Auth
              </Link>
              <a
                href="#how-it-works"
                className="rounded-xl border border-[var(--color-border-soft)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-accent)]"
              >
                How It Works
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-6">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Product Flow
            </p>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              <code>/ -&gt; /auth -&gt; /sessions -&gt; /whiteboard/[id] -&gt; /dashboard/[id] -&gt; /summary/[id]</code>
            </p>
            <p className="mt-4 text-xs text-[var(--color-text-muted)]">
              Landing explains value. Auth gates access. Sessions launch
              collaboration. Dashboard and summary close the loop with insight.
            </p>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-6"
            >
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                {card.description}
              </p>
            </article>
          ))}
        </section>

        <section
          id="how-it-works"
          className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-7"
        >
          <h3 className="text-2xl font-semibold">How To Use This App</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {usageSteps.map((step, index) => (
              <div
                key={step}
                className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-4"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-primary)]">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
