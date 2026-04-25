'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import JoinOrgForm from '@/components/JoinOrgForm';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Loader2, AlertCircle, Users } from 'lucide-react';

function JoinPageContent() {
    const params = useSearchParams();
    const orgSlug = params.get('org');
    const [org, setOrg] = useState<{ name: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orgSlug) {
            setError('No organization specified.');
            setLoading(false);
            return;
        }
        fetch(`/api/org-info?slug=${encodeURIComponent(orgSlug)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) setError(data.error);
                else setOrg(data.org);
            })
            .catch(() => setError('Failed to load organization.'))
            .finally(() => setLoading(false));
    }, [orgSlug]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">Loading organization…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6">
                <div className="rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-elevated">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h1 className="mt-4 text-xl font-semibold tracking-tight">Couldn&apos;t load org</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    if (!org) return null;

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
            <div className="w-full rounded-2xl border border-border/80 bg-card p-8 shadow-elevated">
                <div className="flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                        <Users className="h-6 w-6" />
                    </div>
                </div>
                <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight">
                    Join {org.name}
                </h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Enter your info below to become a member.
                </p>
                <div className="mt-6">
                    <JoinOrgForm orgSlug={orgSlug!} />
                </div>
            </div>
        </div>
    );
}

export default function JoinPage() {
    return (
        <AnimatedBackground variant="hero">
            <Suspense
                fallback={
                    <div className="flex min-h-screen items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                }
            >
                <JoinPageContent />
            </Suspense>
        </AnimatedBackground>
    );
}
