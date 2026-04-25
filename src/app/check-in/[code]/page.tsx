'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, User, Mail, Phone, ShieldCheck } from 'lucide-react';
import { submitAttendance } from '@/app/actions/attendance';
import { useParams } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

const phoneSchema = z.object({
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
});

const detailsSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type DetailsFormValues = z.infer<typeof detailsSchema>;

export default function CheckInPage() {
    const params = useParams();
    const eventCode = params.code as string;
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [phoneData, setPhoneData] = useState<PhoneFormValues | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [memberName, setMemberName] = useState<string | null>(null);

    const {
        register: registerPhone,
        handleSubmit: handleSubmitPhone,
        formState: { errors: phoneErrors },
    } = useForm<PhoneFormValues>({ resolver: zodResolver(phoneSchema) });

    const {
        register: registerDetails,
        handleSubmit: handleSubmitDetails,
        formState: { errors: detailsErrors },
    } = useForm<DetailsFormValues>({ resolver: zodResolver(detailsSchema) });

    const onSubmitPhone = async (data: PhoneFormValues) => {
        setLoading(true);
        setErrorMessage(null);
        setPhoneData(data);

        try {
            const formData = new FormData();
            formData.append('eventCode', eventCode);
            formData.append('phoneNumber', data.phoneNumber);

            const result = await submitAttendance(formData);

            if (result.success) {
                setMemberName(result.memberName || 'Guest');
                setStep(3);
            } else if ('status' in result && result.status === 'DETAILS_REQUIRED') {
                setStep(2);
            } else if ('error' in result) {
                setErrorMessage(result.error);
            }
        } catch {
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onSubmitDetails = async (data: DetailsFormValues) => {
        if (!phoneData) return;
        setLoading(true);
        setErrorMessage(null);

        try {
            const formData = new FormData();
            formData.append('eventCode', eventCode);
            formData.append('phoneNumber', phoneData.phoneNumber);
            formData.append('firstName', data.firstName);
            formData.append('lastName', data.lastName);
            formData.append('email', data.email);

            const result = await submitAttendance(formData);

            if (result.success) {
                setMemberName(result.memberName || `${data.firstName} ${data.lastName}`);
                setStep(3);
            } else {
                if ('error' in result) setErrorMessage(result.error);
            }
        } catch {
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedBackground variant="hero">
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full"
                >
                    <div className="rounded-2xl border border-border/80 bg-card/90 p-8 shadow-elevated backdrop-blur-xl">
                        <div className="flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-5 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">Event check-in</h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {step === 1 && 'Enter your phone number to get started.'}
                                {step === 2 && "We don't have you yet — quick details below."}
                                {step === 3 && "You're all set. Enjoy the event!"}
                            </p>
                        </div>

                        <div className="mt-6">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.form
                                        key="step1"
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 16 }}
                                        onSubmit={handleSubmitPhone(onSubmitPhone)}
                                        className="space-y-5"
                                    >
                                        <div className="space-y-1.5">
                                            <label htmlFor="phoneNumber" className="text-sm font-medium">
                                                Phone number
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <input
                                                    {...registerPhone('phoneNumber')}
                                                    type="tel"
                                                    placeholder="(555) 123-4567"
                                                    className="h-11 w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm shadow-xs outline-none transition-all hover:border-input/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
                                                />
                                            </div>
                                            {phoneErrors.phoneNumber && (
                                                <p className="flex items-center gap-1 text-xs text-destructive">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {phoneErrors.phoneNumber.message}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
                                        >
                                            {loading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    Continue <ArrowRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </button>
                                    </motion.form>
                                )}

                                {step === 2 && (
                                    <motion.form
                                        key="step2"
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 16 }}
                                        onSubmit={handleSubmitDetails(onSubmitDetails)}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium">First name</label>
                                                <div className="relative">
                                                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <input
                                                        {...registerDetails('firstName')}
                                                        placeholder="Jane"
                                                        className="h-11 w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
                                                    />
                                                </div>
                                                {detailsErrors.firstName && (
                                                    <p className="text-xs text-destructive">
                                                        {detailsErrors.firstName.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium">Last name</label>
                                                <div className="relative">
                                                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <input
                                                        {...registerDetails('lastName')}
                                                        placeholder="Doe"
                                                        className="h-11 w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
                                                    />
                                                </div>
                                                {detailsErrors.lastName && (
                                                    <p className="text-xs text-destructive">
                                                        {detailsErrors.lastName.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <input
                                                    {...registerDetails('email')}
                                                    type="email"
                                                    placeholder="jane@example.com"
                                                    className="h-11 w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
                                                />
                                            </div>
                                            {detailsErrors.email && (
                                                <p className="text-xs text-destructive">
                                                    {detailsErrors.email.message}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
                                        >
                                            {loading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'Complete check-in'
                                            )}
                                        </button>
                                    </motion.form>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center text-center"
                                    >
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                            <CheckCircle2 className="h-8 w-8" />
                                        </div>
                                        <h2 className="mt-4 text-xl font-semibold tracking-tight">
                                            Checked in!
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Welcome,{' '}
                                            <span className="font-medium text-primary">{memberName}</span>.
                                        </p>
                                        <div className="mt-5 w-full rounded-lg border border-border/80 bg-accent/40 p-3 text-center">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                Event code
                                            </p>
                                            <p className="mt-0.5 font-mono text-sm tracking-widest text-foreground">
                                                {eventCode}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-5 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                            >
                                <AlertCircle className="h-4 w-4 shrink-0 translate-y-0.5 text-destructive" />
                                <p className="text-sm text-destructive">{errorMessage}</p>
                            </motion.div>
                        )}
                    </div>

                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Blitz · Mass Communication
                    </p>
                </motion.div>
            </div>
        </AnimatedBackground>
    );
}
