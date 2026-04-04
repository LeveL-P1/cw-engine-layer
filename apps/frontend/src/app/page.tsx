import Link from "next/link"

const featureCards = [
  {
    title: "Whiteboard First",
    description:
      "Start with a roomy realtime canvas built for classes, interviews, workshops, and design discussion.",
  },
  {
    title: "Structured When Needed",
    description:
      "Bring in facilitator roles and session modes only when the group needs more focus or control.",
  },
  {
    title: "Insights After The Session",
    description:
      "Review participation, activity, and session summaries without pulling attention away from live collaboration.",
  },
]

const audienceCards = [
  "Online classes and guided teaching sessions",
  "Interview exercises and collaborative problem-solving",
  "Design reviews, ideation, and team workshops",
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.18),transparent_28%),linear-gradient(180deg,var(--color-bg-canvas)_0%,var(--color-bg-app)_100%)] text-[var(--color-text-primary)]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-16 pt-10 sm:px-10 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
              CW-Engine
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Governed collaborative whiteboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/auth?mode=signin"
              className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)]"
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent-strong)]"
            >
              Start Whiteboarding
            </Link>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
              Whiteboard first. Governance second. Analytics third.
            </p>
            <h2 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
              A real collaborative whiteboard that stays fast during the session
              and adds structure only when it helps.
            </h2>
            <p className="max-w-3xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg">
              CW-Engine gives teams a live shared canvas first, then layers in
              facilitation controls and lightweight analytics so the board stays
              central to the experience instead of being buried under admin UI.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/auth"
                className="rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
              >
                Go to Auth
              </Link>
              <a
                href="#how-it-works"
                className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-border-strong)]"
              >
                See the flow
              </a>
            </div>
          </div>

          <div className="rounded-[var(--radius-panel)] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-panel)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Product flow
            </p>
            <div className="mt-4 rounded-2xl bg-[var(--color-bg-elevated)] p-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              <p>
                <code>/ -&gt; /auth -&gt; /sessions -&gt; /whiteboard/[id] -&gt; /dashboard/[id] -&gt; /summary/[id]</code>
              </p>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              <p>The session opens on the board, not on a dashboard.</p>
              <p>Analytics and summaries stay close by without interrupting the live workspace.</p>
              <p>Governance becomes visible when the facilitator actually needs it.</p>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[var(--radius-panel)] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-soft)]"
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
          className="rounded-[var(--radius-panel)] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-7 shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Best fit
              </p>
              <h3 className="mt-2 text-2xl font-semibold">Built for live collaborative sessions</h3>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              The product is optimized for situations where discussion and drawing
              happen together and structure should support the session instead of slowing it down.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {audienceCards.map((card, index) => (
              <div
                key={card}
                className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                  Use case {index + 1}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {card}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
