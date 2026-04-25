'use client';

import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import { GetStartedDialog } from './GetStartedDialog';
import Link from 'next/link';
import AnimatedBackground from './AnimatedBackground';
import { ArrowRight, MessageSquare, Mail, Users, Zap, Calendar, Shield } from 'lucide-react';

const features = [
    { icon: MessageSquare, title: 'Mass SMS', desc: 'Send personalized texts to thousands in seconds.' },
    { icon: Mail, title: 'Beautiful Email', desc: 'AI-crafted emails with templated layouts.' },
    { icon: Users, title: 'Smart Contacts', desc: 'CSV upload, opt-out handling, deduplication.' },
    { icon: Calendar, title: 'Event Check‑In', desc: 'QR-based attendance with live attendee lists.' },
    { icon: Zap, title: 'AI Assistant', desc: 'Compose and refine messages with one click.' },
    { icon: Shield, title: 'Compliant by default', desc: '10DLC, opt-out, and per-org rate limits.' },
];

export function LandingPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <Fragment>
            <AnimatedBackground variant="hero">
                {/* NAV */}
                <nav className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-md shadow-violet-500/30" />
                        <span className="text-lg font-semibold tracking-tight">Blitz</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link
                            href="/about"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                        >
                            About
                        </Link>
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-all hover:bg-foreground/90 hover:shadow-md"
                        >
                            Get started
                        </button>
                    </div>
                </nav>

                {/* HERO */}
                <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-12 pb-20 sm:pt-20 sm:pb-28">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        Built for organizations that move fast
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center text-5xl font-semibold tracking-tighter sm:text-6xl md:text-7xl lg:text-[88px] lg:leading-[0.95]"
                    >
                        Reach every member.
                        <br />
                        <span className="brand-wordmark">Instantly.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
                    >
                        Blitz is the all-in-one communication platform for clubs, chapters, and teams.
                        Send mass texts, beautiful emails, run events, and manage members — without the chaos.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
                    >
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-foreground px-6 text-[15px] font-medium text-background shadow-lg shadow-foreground/20 transition-all hover:shadow-xl hover:shadow-foreground/30 active:scale-[0.98]"
                        >
                            Get started free
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                        <Link
                            href="/about"
                            className="inline-flex h-12 items-center gap-2 rounded-xl border border-border/80 bg-surface/80 px-6 text-[15px] font-medium text-foreground backdrop-blur transition-all hover:bg-accent active:scale-[0.98]"
                        >
                            See it in action
                        </Link>
                    </motion.div>

                    {/* PRODUCT MOCK */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative mt-16 w-full max-w-5xl"
                    >
                        <div className="absolute -inset-x-8 -top-8 -bottom-8 rounded-[32px] bg-gradient-to-b from-violet-500/20 via-transparent to-transparent blur-2xl" />
                        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-elevated">
                            <div className="flex items-center gap-1.5 border-b border-border/80 bg-muted/40 px-4 py-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                                <div className="ml-3 text-xs text-muted-foreground">blitz.app / dashboard</div>
                            </div>
                            <div className="grid gap-4 p-6 sm:grid-cols-3">
                                {[
                                    { label: 'Members', value: '1,284', delta: '+24 this week' },
                                    { label: 'Texts sent', value: '8.2k', delta: '+312 today' },
                                    { label: 'Open rate', value: '94%', delta: 'Email last 7d' },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-xl border border-border/60 bg-background p-4"
                                    >
                                        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            {stat.label}
                                        </div>
                                        <div className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</div>
                                        <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                            {stat.delta}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
                                <div className="rounded-xl border border-border/60 bg-background p-5">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">Compose text</span>
                                    </div>
                                    <div className="mt-3 rounded-lg bg-muted/60 p-3 text-sm text-foreground/80">
                                        Hi {'{name}'}! Pizza & politics tonight at 7pm in Engineering 1140. See you there 🍕
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>1,284 recipients</span>
                                        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary">
                                            Ready to send
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-border/60 bg-background p-5">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">Upcoming event</span>
                                    </div>
                                    <div className="mt-3 text-sm font-semibold">Spring Kickoff</div>
                                    <div className="text-xs text-muted-foreground">Tonight · 7:00 PM</div>
                                    <div className="mt-3 flex -space-x-2">
                                        {['oklch(0.7_0.16_30)', 'oklch(0.7_0.16_180)', 'oklch(0.7_0.16_300)', 'oklch(0.7_0.16_120)'].map((c, i) => (
                                            <div
                                                key={i}
                                                className="h-7 w-7 rounded-full border-2 border-background"
                                                style={{ background: `var(--c, ${c.replace(/_/g, ' ')})` }}
                                            />
                                        ))}
                                        <div className="grid h-7 w-7 place-items-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground">
                                            +42
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* FEATURES */}
                <section className="relative mx-auto w-full max-w-6xl px-6 py-20">
                    <div className="mb-12 max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Everything you need</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                            One platform. Every channel.
                        </h2>
                        <p className="mt-3 text-base text-muted-foreground">
                            Stop juggling tools. Blitz combines messaging, member management, and events into a single, refined workspace.
                        </p>
                    </div>
                    <div className="grid gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/80 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="group flex flex-col gap-3 bg-card p-6 transition-colors hover:bg-accent/40"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                                    <f.icon className="h-5 w-5" />
                                </div>
                                <div className="text-base font-semibold">{f.title}</div>
                                <div className="text-sm leading-relaxed text-muted-foreground">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="relative mx-auto w-full max-w-6xl px-6 pb-24">
                    <div className="overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-foreground to-foreground/85 px-8 py-14 text-background shadow-elevated sm:px-14">
                        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                            <div className="max-w-xl">
                                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Ready to send your first blitz?
                                </h3>
                                <p className="mt-2 text-sm text-background/70 sm:text-base">
                                    Set up your organization in minutes. No credit card required.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsDialogOpen(true)}
                                className="inline-flex h-12 items-center gap-2 rounded-xl bg-background px-6 text-[15px] font-medium text-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Create your organization
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="border-t border-border/80 bg-background/50 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500" />
                            <span className="font-medium text-foreground">Blitz</span>
                            <span>· The communication platform for organizations</span>
                        </div>
                        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                            About & Contact →
                        </Link>
                    </div>
                </footer>
            </AnimatedBackground>

            <GetStartedDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
        </Fragment>
    );
}
