'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function JoinOrgForm({ orgSlug }: { orgSlug: string }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setError(null);
        const res = await fetch('/api/join-org', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, orgSlug }),
        });
        const data = await res.json();
        if (res.ok) setStatus('success');
        else {
            setStatus('error');
            setError(data.error || 'Failed to join organization.');
        }
    };

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base font-medium">You&apos;re in!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    You&apos;ve been added to the organization.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@school.edu"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 555 555 5555"
                    value={form.phone}
                    onChange={handleChange}
                    required
                />
            </div>
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={status === 'submitting'}>
                {status === 'submitting' ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Joining…
                    </>
                ) : (
                    'Join organization'
                )}
            </Button>
        </form>
    );
}
