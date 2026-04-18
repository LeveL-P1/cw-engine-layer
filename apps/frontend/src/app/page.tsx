"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion"
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  Github,
  LayoutTemplate,
  Mail,
  Menu,
  MessageSquareShare,
  Sparkles,
  Users,
  WandSparkles,
  X,
} from "lucide-react"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { SectionCard } from "@/components/ui/SectionCard"
import { SurfaceCard } from "@/components/ui/SurfaceCard"

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
]

const featureCards = [
  {
    title: "Infinite whiteboard canvas",
    description:
      "Give teams a spacious realtime canvas for mapping flows, sketching ideas, and thinking visually together.",
    icon: WandSparkles,
  },
  {
    title: "Realtime collaboration",
    description:
      "Invite people into the same board, collaborate live, and keep the session feeling fast instead of blocked by heavy UI.",
    icon: Users,
  },
  {
    title: "Structured collaboration",
    description:
      "Use roles and session modes when you need focus, facilitation, or safer decision-making during important moments.",
    icon: LayoutTemplate,
  },
  {
    title: "Governed sessions",
    description:
      "Facilitators can guide discussions without letting governance take over the core whiteboard experience.",
    icon: Sparkles,
  },
  {
    title: "Session analytics",
    description:
      "Review participation balance, activity over time, and collaboration quality after the live session ends.",
    icon: CircleHelp,
  },
  {
    title: "Export-ready outcomes",
    description:
      "Turn live board work into summaries and next steps so good ideas do not vanish after the meeting ends.",
    icon: ArrowRight,
  },
]

const steps = [
  {
    number: "01",
    title: "Create board",
    description:
      "Start a new collaborative board in seconds and name the session for your class, workshop, or team discussion.",
  },
  {
    number: "02",
    title: "Invite team",
    description:
      "Share an invite link so collaborators can join the same session with the right level of access.",
  },
  {
    number: "03",
    title: "Collaborate live",
    description:
      "Brainstorm, map, sketch, and decide together on the same infinite canvas in real time.",
  },
  {
    number: "04",
    title: "Export and act",
    description:
      "Review summaries, insights, and board outcomes so ideas can move into action immediately.",
  },
]

const useCases = [
  "Project planning",
  "Retrospective",
  "User journey map",
  "Brainstorming",
  "System design",
  "Team alignment",
]

const faqs = [
  {
    question: "Is it really real-time?",
    answer:
      "Yes. The product is designed around live collaborative whiteboarding so multiple people can work on the same session together as changes happen.",
  },
  {
    question: "How many users can join while it is free?",
    answer:
      "The current product direction is free to start while usage is still being refined. The exact free tier can evolve later, but right now the goal is making adoption easy.",
  },
  {
    question: "Why does structured collaboration matter on a whiteboard?",
    answer:
      "Open whiteboards are great for exploration, but structured collaboration helps teams stay aligned, avoid chaos, and make decisions more deliberately when the moment calls for it.",
  },
  {
    question: "Why is a structured collaborative whiteboard important for teams?",
    answer:
      "It combines the speed of visual thinking with enough process to keep classes, interviews, workshops, and design discussions focused and actionable.",
  },
  {
    question: "Is governance always visible during the session?",
    answer:
      "No. The product is intentionally whiteboard first. Governance stays available but is meant to support the session, not dominate the workspace.",
  },
  {
    question: "Can I use it for classes, interviews, and workshops?",
    answer:
      "Yes. Those are core target use cases, especially when a facilitator wants a flexible board plus a little more structure than a generic whiteboard gives.",
  },
  {
    question: "Will pricing change later?",
    answer:
      "Yes. It is currently free to start, and a paid model is planned for the future once packaging and limits are more clearly defined.",
  },
]

const heroWords = ["structuring", "brainstorming", "planning", "shipping together"]

function FadeIn({
  children,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  )
}

function FaqItem({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <SurfaceCard className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[var(--color-text-primary)]">
          {question}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-[var(--color-text-muted)]" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--color-border-soft)] px-5 py-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              {answer}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SurfaceCard>
  )
}

function FlippingHeroWord() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      return
    }

    const interval = window.setInterval(() => {
      setCurrentWordIndex((value) => (value + 1) % heroWords.length)
    }, 1200)

    return () => window.clearInterval(interval)
  }, [reduceMotion])

  if (reduceMotion) {
    return <span className="text-[var(--color-accent)]">structuring</span>
  }

  return (
    <span className="relative inline-flex min-w-[6.8ch] items-center align-top text-[var(--color-accent)] sm:min-w-[8.5ch]">
      <AnimatePresence mode="wait">
        <motion.span
          key={heroWords[currentWordIndex]}
          initial={{ opacity: 0, y: 18, rotateX: -80 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -18, rotateX: 80 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="inline-block"
        >
          {heroWords[currentWordIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [contactStatus, setContactStatus] = useState<null | "success">(null)
  const reduceMotion = useReducedMotion()

  const handleContactSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const subject = encodeURIComponent(
      `CW-Engine Contact from ${contactForm.name || "Visitor"}`,
    )
    const body = encodeURIComponent(
      `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`,
    )

    window.location.href = `mailto:hello@cw-engine.app?subject=${subject}&body=${body}`
    setContactStatus("success")
  }

  return (
    <main className="min-h-screen text-[var(--color-text-primary)]">
      <motion.header
        initial={reduceMotion ? false : { y: -16, opacity: 0 }}
        animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b border-[var(--color-border-soft)] bg-[rgba(5,5,10,0.72)] backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-elevated)] shadow-[var(--shadow-soft)]">
              <span
                role="img"
                aria-label="CW-Engine temporary logo"
                className="h-6 w-6 bg-contain bg-center bg-no-repeat"
                style={{
                  backgroundImage:
                    "url('https://api.iconify.design/lucide:pen-tool.svg?color=%230f766e')",
                }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-accent)]">
                CW-ENGINE
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Structured whiteboarding
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text-primary)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/auth?mode=signin">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth?mode=signup">
              <Button size="lg" className="min-w-[10.5rem]">
                Start a Board
              </Button>
            </Link>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden border-t border-[var(--color-border-soft)] lg:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-[var(--color-text-primary)]"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="flex flex-col gap-3 pt-2">
                  <Link href="/auth?mode=signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" fullWidth>
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button fullWidth>Start a Board</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.header>

      <section
        id="product"
        className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-20"
      >
        <FadeIn>
          <div className="space-y-7">
            <Badge size="sm">Free To Start</Badge>
            <div className="space-y-5">
              <motion.h1
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl"
              >
                Infinite canvas for <FlippingHeroWord />
              </motion.h1>
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.18 }}
                className="max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg"
              >
                A real-time whiteboard for teams that actually get things done,
                combining visual collaboration, lightweight structure, and
                post-session clarity in one continuous flow.
              </motion.p>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.28 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href="/auth?mode=signup">
                <Button size="lg" className="min-w-[13rem] shadow-[var(--shadow-soft)]">
                  Start a Board
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth?mode=signin">
                <Button variant="secondary" size="lg">
                  Login
                </Button>
              </Link>
            </motion.div>

            <div className="flex flex-wrap gap-3 text-sm text-[var(--color-text-muted)]">
              <span className="rounded-full border border-[var(--color-border-soft)] px-3 py-1.5">
                Realtime whiteboard
              </span>
              <span className="rounded-full border border-[var(--color-border-soft)] px-3 py-1.5">
                Structured collaboration
              </span>
              <span className="rounded-full border border-[var(--color-border-soft)] px-3 py-1.5">
                Analytics after the session
              </span>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <motion.div
            whileHover={reduceMotion ? undefined : { y: -6 }}
            transition={{ duration: 0.25 }}
            className="relative"
          >
            <SurfaceCard className="overflow-hidden border-[var(--color-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-surface)_85%,white),var(--color-bg-elevated))] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                    Live board flow
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Whiteboard first, structure when needed
                  </h2>
                </div>
                <Badge size="sm">Realtime</Badge>
              </div>

              <div className="mt-6 grid gap-4">
                {steps.slice(0, 3).map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                    animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.32 + index * 0.08 }}
                    className="rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-soft)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                      {step.number}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                      {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </SurfaceCard>
          </motion.div>
        </FadeIn>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
              Key Features
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">
              Built for collaborative sessions that need both speed and clarity
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              Everything is designed around the board first, then layered with the right amount of structure and insight.
            </p>
          </div>
        </FadeIn>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon

            return (
              <FadeIn key={feature.title} delay={index * 0.04}>
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -8, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <SectionCard>
                    <div className="space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              </FadeIn>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <SectionCard
              title="Product Demo / How It Works"
              description="Create board, invite team, collaborate live, and export the outcome without switching mental context."
              className="h-full"
            >
              <div className="grid gap-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-5"
                  >
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-white">
                        {step.number}
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                          {step.title}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Use Cases"
              description="Designed for real team workflows, not just empty-canvas novelty."
              className="h-full"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {useCases.map((useCase, index) => (
                  <motion.div
                    key={useCase}
                    whileHover={reduceMotion ? undefined : { y: -5 }}
                    transition={{ duration: 0.18 }}
                    className="rounded-3xl border border-[var(--color-border-soft)] bg-[linear-gradient(180deg,var(--color-bg-surface),var(--color-bg-elevated))] p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      Use Case {index + 1}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">
                      {useCase}
                    </p>
                  </motion.div>
                ))}
              </div>
            </SectionCard>
          </div>
        </FadeIn>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
              Pricing Teaser
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">
              Free to start now, paid plans coming later
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              Get into the product early, start real sessions today, and grow with upcoming paid packaging later.
            </p>
          </div>
        </FadeIn>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <FadeIn>
            <motion.div whileHover={reduceMotion ? undefined : { y: -8 }} transition={{ duration: 0.2 }}>
              <SurfaceCard className="border-[var(--color-accent)] bg-[linear-gradient(180deg,rgba(68,240,255,0.16),rgba(255,75,216,0.08)_16%,var(--color-bg-surface)_55%)] p-7 shadow-[0_0_0_1px_rgba(68,240,255,0.22),0_0_48px_rgba(68,240,255,0.14),var(--shadow-panel)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      Current Plan
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold">Free to start</h3>
                  </div>
                  <Badge size="sm">Live Now</Badge>
                </div>
                <p className="mt-5 text-5xl font-semibold">$0</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
                  Start boards, invite collaborators, and experience the product while the platform is still in its early rollout stage.
                </p>
                <div className="mt-6 space-y-3 text-sm text-[var(--color-text-secondary)]">
                  <p>Includes whiteboard sessions</p>
                  <p>Includes realtime collaboration</p>
                  <p>Includes structured collaboration basics</p>
                  <p>Includes summary and analytics views</p>
                </div>
              </SurfaceCard>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <motion.div whileHover={reduceMotion ? undefined : { y: -4 }} transition={{ duration: 0.2 }}>
              <SurfaceCard className="p-7 opacity-70 saturate-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                      Future Plans
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold">Paid tiers</h3>
                  </div>
                  <Badge size="sm">Coming Soon</Badge>
                </div>
                <p className="mt-5 text-5xl font-semibold">TBD</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
                  Pricing, limits, and packaging will be introduced later as the product matures and usage patterns become clearer.
                </p>
                <div className="mt-6 space-y-3 text-sm text-[var(--color-text-secondary)]">
                  <p>Likely team-focused packaging</p>
                  <p>Likely usage and collaboration limits</p>
                  <p>Likely advanced governance and reporting options</p>
                </div>
              </SurfaceCard>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
              Contact
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">
              Reach out before or after your next collaborative session
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              Use the form to prepare a conversation, request access details, or
              share feedback while the product is still evolving.
            </p>
          </div>
        </FadeIn>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <FadeIn>
            <SurfaceCard className="p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                    Contact us
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                    Tell us what kind of team workflow, class, or workshop you are trying to support.
                  </p>
                </div>

                {contactStatus === "success" ? (
                  <AlertMessage
                    tone="success"
                    message="Your email client should open with the message draft. If it does not, use the GitHub links on the right."
                  />
                ) : null}

                <form onSubmit={handleContactSubmit} className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      id="contact-name"
                      label="Name"
                      value={contactForm.name}
                      onChange={(event) =>
                        setContactForm((previous) => ({
                          ...previous,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Your name"
                    />
                    <Input
                      id="contact-email"
                      type="email"
                      label="Email"
                      value={contactForm.email}
                      onChange={(event) =>
                        setContactForm((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                      }
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-[var(--color-text-primary)]"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      value={contactForm.message}
                      onChange={(event) =>
                        setContactForm((previous) => ({
                          ...previous,
                          message: event.target.value,
                        }))
                      }
                      rows={6}
                      placeholder="Tell us about your workflow, team, or what you want from the product."
                      className="w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-accent)_25%,transparent)]"
                    />
                  </div>

                  <Button type="submit" size="lg" className="mx-auto min-w-[14rem]">
                    <MessageSquareShare className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </div>
            </SurfaceCard>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="space-y-5">
              <SectionCard
                title="Direct links"
                description="The product is still evolving, so GitHub is currently the clearest contact path."
              >
                <div className="space-y-4">
                  <a
                    href="https://github.com/LeveL-P1/cw-engine-layer"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] px-4 py-4 text-sm text-[var(--color-text-secondary)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
                  >
                    <Github className="h-5 w-5 text-[var(--color-accent)]" />
                    Project repository
                  </a>
                  <a
                    href="https://github.com/LeveL-P1"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] px-4 py-4 text-sm text-[var(--color-text-secondary)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
                  >
                    <Users className="h-5 w-5 text-[var(--color-accent)]" />
                    P1 GitHub profile
                  </a>
                  <a
                    href="mailto:hello@cw-engine.app"
                    className="flex items-center gap-3 rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] px-4 py-4 text-sm text-[var(--color-text-secondary)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
                  >
                    <Mail className="h-5 w-5 text-[var(--color-accent)]" />
                    hello@cw-engine.app
                  </a>
                </div>
              </SectionCard>

              <SectionCard
                title="Why contact now"
                description="Good fits include early team onboarding, structured workshops, and collaborative whiteboard workflows that need a little more governance."
              >
                <div className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                  <p>Project planning and decision workshops</p>
                  <p>Online teaching and guided class sessions</p>
                  <p>Interview collaboration and system design exercises</p>
                </div>
              </SectionCard>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
              FAQ
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">
              Common questions from teams exploring structured whiteboarding
            </h2>
          </div>
        </FadeIn>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4">
          {faqs.map((faq, index) => (
            <FadeIn key={faq.question} delay={index * 0.03}>
              <FaqItem question={faq.question} answer={faq.answer} />
            </FadeIn>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--color-border-soft)] bg-[rgba(8,8,14,0.72)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-elevated)] shadow-[var(--shadow-soft)]">
                <span
                  role="img"
                  aria-label="CW-Engine temporary logo"
                  className="h-6 w-6 bg-contain bg-center bg-no-repeat"
                  style={{
                    backgroundImage:
                      "url('https://api.iconify.design/lucide:pen-tool.svg?color=%230f766e')",
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-accent)]">
                  CW-ENGINE
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Whiteboard-first structured collaboration
                </p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--color-text-muted)]">
              Built for teams that want the freedom of an infinite canvas and the clarity of a more structured collaborative workflow.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Pages
              </p>
              <div className="mt-4 grid gap-3 text-sm text-[var(--color-text-muted)]">
                <Link href="/">Home</Link>
                <Link href="/auth">Auth</Link>
                <Link href="/sessions">Sessions</Link>
                <Link href="/whiteboard">Whiteboard</Link>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/summary">Summary</Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Contact
              </p>
              <div className="mt-4 grid gap-3 text-sm text-[var(--color-text-muted)]">
                <a href="#product">Product</a>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="https://github.com/LeveL-P1/cw-engine-layer" target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Socials
            </p>
            <div className="mt-4 grid gap-3 text-sm text-[var(--color-text-muted)]">
              <a href="https://github.com/LeveL-P1/cw-engine-layer" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="https://github.com/LeveL-P1" target="_blank" rel="noreferrer">
                P1 Profile
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--color-border-soft)] px-4 py-5 text-center text-sm text-[var(--color-text-secondary)]">
          Made by{" "}
          <a
            href="https://github.com/LeveL-P1"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[var(--color-accent)] transition hover:text-[var(--color-accent-strong)]"
          >
            P1
          </a>
        </div>
      </footer>
    </main>
  )
}
