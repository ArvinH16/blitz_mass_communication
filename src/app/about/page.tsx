'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";
import { ArrowLeft, ArrowRight, Mail, Sparkles, FileSpreadsheet, MessageSquare, QrCode, Shield, Users, Calendar } from "lucide-react";

const features = [
    { icon: Sparkles, title: 'AI column matching', desc: 'Drop in any spreadsheet — Blitz figures out which columns are which.' },
    { icon: FileSpreadsheet, title: 'CSV & Excel ready', desc: 'Native support for the formats your team already uses.' },
    { icon: MessageSquare, title: 'SMS + Email together', desc: 'One composer, both channels, deliverability optimized.' },
    { icon: Users, title: 'Smart contact mgmt', desc: 'Opt-out, deduplication, and tagging — all built-in.' },
    { icon: QrCode, title: 'QR registration', desc: 'Generate codes for events and member onboarding.' },
    { icon: Calendar, title: 'Event check-in', desc: 'Track who showed up with QR check-ins and live counts.' },
];

const audiences = [
    'Campus organizations & clubs',
    'Student government bodies',
    'Small businesses & startups',
    'Event organizers & venues',
    'Educational institutions',
    'Religious & community groups',
];

export default function AboutPage() {
    return (
        <AnimatedBackground variant="hero">
            <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-10 text-center"
                >
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        About Blitz
                    </p>
                    <h1 className="mt-3 text-5xl font-semibold tracking-tighter sm:text-6xl md:text-7xl">
                        Communication, <br />
                        <span className="brand-wordmark">simplified.</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        Blitz is the all-in-one platform that combines mass texting, email, member management, and event tools — designed for the way modern organizations actually communicate.
                    </p>
                </motion.div>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mt-16"
                >
                    <div className="grid gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/80 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <div key={f.title} className="bg-card p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                                    <f.icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 font-semibold">{f.title}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-16 grid gap-8 lg:grid-cols-2"
                >
                    <div className="rounded-2xl border border-border/80 bg-card p-8">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Built for</p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Organizations of every size</h2>
                        <ul className="mt-6 space-y-3">
                            {audiences.map((a) => (
                                <li key={a} className="flex items-start gap-3 text-sm">
                                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    <span className="text-foreground/90">{a}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border/80 bg-card p-8">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Why Blitz</p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Less chaos, more clarity</h2>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            We built Blitz because juggling spreadsheets, group chats, and ad-hoc tools was getting in the way of actually doing the work. With AI-powered file parsing, automatic opt-out handling, and a unified inbox of who said what — your team spends less time on logistics and more time on impact.
                        </p>
                        <div className="mt-6 flex items-center gap-2 rounded-lg bg-accent/60 p-3 text-xs">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="text-foreground/80">10DLC compliant · Opt-out handling · Per-org rate limits</span>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-16"
                >
                    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
                        <div className="border-b border-border/80 px-6 py-4">
                            <h2 className="text-lg font-semibold tracking-tight">See it in action</h2>
                            <p className="text-sm text-muted-foreground">A two-minute tour of how Blitz works</p>
                        </div>
                        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                            <iframe
                                src="https://www.loom.com/embed/834c84a07f884f059e370a275fb72071?sid=cc50b005-7f33-4b9d-acef-1dec6712aa47"
                                allowFullScreen
                                className="absolute top-0 left-0 h-full w-full"
                            />
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 grid gap-8 sm:grid-cols-2"
                >
                    <div className="rounded-2xl border border-border/80 bg-card p-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                            <Mail className="h-5 w-5" />
                        </div>
                        <h2 className="mt-4 text-xl font-semibold tracking-tight">Get in touch</h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Have questions, feedback, or just want to say hi? We&apos;d love to hear from you.
                        </p>
                        <a
                            href="mailto:arvin@hakakian.me"
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                            arvin@hakakian.me
                            <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                    </div>
                    <div className="rounded-2xl border border-border/80 bg-card p-8">
                        <h2 className="text-xl font-semibold tracking-tight">The team</h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Connect with us on LinkedIn.
                        </p>
                        <div className="mt-4 space-y-2">
                            {[
                                { name: 'Arvin Hakakian', url: 'https://www.linkedin.com/in/arvin-hakakian/' },
                                { name: 'Eyal Shechtman', url: 'https://www.linkedin.com/in/eyal-shechtman/' },
                            ].map((p) => (
                                <a
                                    key={p.name}
                                    href={p.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3 transition-colors hover:border-primary/40 hover:bg-accent/50"
                                >
                                    <span className="text-sm font-medium">{p.name}</span>
                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                </a>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-16"
                >
                    <div className="overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-foreground to-foreground/85 px-8 py-12 text-background sm:px-12">
                        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                            <div>
                                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Try Blitz today
                                </h3>
                                <p className="mt-2 text-sm text-background/70">
                                    Free to set up. Cancel anytime.
                                </p>
                            </div>
                            <Link
                                href="/"
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-background px-5 text-sm font-medium text-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Get started
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </motion.section>
            </div>
        </AnimatedBackground>
    );
}
