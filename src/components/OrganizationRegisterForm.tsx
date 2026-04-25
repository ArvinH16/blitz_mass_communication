'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle2, Loader2 } from 'lucide-react';

const formSchema = z.object({
    organizationName: z.string().min(2, {
        message: "Organization name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, {
        message: "Please enter a valid phone number.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function OrganizationRegisterForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            organizationName: '',
            email: '',
            phoneNumber: '',
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch('/api/register-org', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to register organization');
            }

            setSubmitSuccess(true);
            setTimeout(() => router.push('/'), 2000);
        } catch (error: Error | unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'An error occurred while submitting the form';
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-elevated">
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold tracking-tight">You&apos;re in!</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Registration successful. We&apos;ll review your information and get back to you shortly.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-elevated">
            <div className="flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                    <Building2 className="h-6 w-6" />
                </div>
            </div>
            <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight">
                Register your organization
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
                Set things up in under a minute.
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="organizationName">Organization name</Label>
                    <Input
                        id="organizationName"
                        {...form.register('organizationName')}
                        placeholder="e.g. TAMID at UW"
                    />
                    {form.formState.errors.organizationName && (
                        <p className="text-xs text-destructive">
                            {form.formState.errors.organizationName.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        placeholder="you@org.com"
                    />
                    {form.formState.errors.email && (
                        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber">Phone number</Label>
                    <Input
                        id="phoneNumber"
                        {...form.register('phoneNumber')}
                        placeholder="+1 555 555 5555"
                    />
                    {form.formState.errors.phoneNumber && (
                        <p className="text-xs text-destructive">
                            {form.formState.errors.phoneNumber.message}
                        </p>
                    )}
                </div>

                {submitError && (
                    <Alert variant="destructive">
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Register organization'
                    )}
                </Button>
            </form>
        </div>
    );
}
