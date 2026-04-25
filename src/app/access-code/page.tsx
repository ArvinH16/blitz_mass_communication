'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import TransitionAnimation from '@/components/TransitionAnimation';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion } from 'framer-motion';

export default function AccessCodePage() {
    const router = useRouter();
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showTransition, setShowTransition] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessCode }),
            });

            const data = await response.json();

            if (response.ok) {
                setShowTransition(true);
                setTimeout(() => router.push('/mass-text'), 1000);
            } else {
                setError(data.message || 'Invalid access code');
                setIsLoading(false);
            }
        } catch {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <>
            {showTransition && <TransitionAnimation />}
            <AnimatedBackground variant="hero">
                <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6">
                    <Link
                        href="/"
                        className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Home
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{
                            opacity: isVisible ? 1 : 0,
                            y: isVisible ? 0 : 20,
                            scale: isVisible ? 1 : 0.98,
                        }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full"
                    >
                        <div className="rounded-2xl border border-border/80 bg-card/90 p-8 shadow-elevated backdrop-blur-xl">
                            <div className="flex items-center justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                                    <KeyRound className="h-6 w-6" />
                                </div>
                            </div>
                            <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight">
                                Enter access code
                            </h1>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Enter your organization&apos;s access code to continue.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value)}
                                        className="h-11 text-center text-base tracking-[0.3em]"
                                        autoFocus
                                        required
                                    />
                                </div>
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Continue'
                                    )}
                                </Button>
                            </form>
                        </div>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Don&apos;t have an organization yet?{' '}
                            <Link href="/register" className="font-medium text-primary hover:underline">
                                Register one
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </AnimatedBackground>
        </>
    );
}
