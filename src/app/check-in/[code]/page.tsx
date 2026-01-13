'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, User, Mail, Phone } from 'lucide-react';
import { submitAttendance } from '@/app/actions/attendance';
import { useParams } from 'next/navigation';

// --- Form Schemas ---
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

    // Phone Form
    const { register: registerPhone, handleSubmit: handleSubmitPhone, formState: { errors: phoneErrors } } = useForm<PhoneFormValues>({
        resolver: zodResolver(phoneSchema),
    });

    // Details Form
    const { register: registerDetails, handleSubmit: handleSubmitDetails, formState: { errors: detailsErrors } } = useForm<DetailsFormValues>({
        resolver: zodResolver(detailsSchema),
    });

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
                if ('error' in result) {
                    setErrorMessage(result.error);
                }
            }
        } catch {
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                            Event Check-in
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {step === 1 && "Enter your phone number to get started"}
                            {step === 2 && "We found you're new! Please complete your profile"}
                            {step === 3 && "You're all set! Enjoy the event"}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSubmitPhone(onSubmitPhone)}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-300 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                                        <input
                                            {...registerPhone('phoneNumber')}
                                            type="tel"
                                            placeholder="(555) 123-4567"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    {phoneErrors.phoneNumber && (
                                        <p className="text-red-400 text-xs ml-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {phoneErrors.phoneNumber.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSubmitDetails(onSubmitDetails)}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 ml-1">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                                            <input
                                                {...registerDetails('firstName')}
                                                placeholder="John"
                                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            />
                                        </div>
                                        {detailsErrors.firstName && <p className="text-red-400 text-xs ml-1">{detailsErrors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 ml-1">Last Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                                            <input
                                                {...registerDetails('lastName')}
                                                placeholder="Doe"
                                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            />
                                        </div>
                                        {detailsErrors.lastName && <p className="text-red-400 text-xs ml-1">{detailsErrors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                                        <input
                                            {...registerDetails('email')}
                                            type="email"
                                            placeholder="john@example.com"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        />
                                    </div>
                                    {detailsErrors.email && <p className="text-red-400 text-xs ml-1">{detailsErrors.email.message}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Check-in"}
                                </button>
                            </motion.form>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center text-center py-6"
                            >
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Checked In!</h2>
                                <p className="text-gray-400 mb-6">
                                    Welcome to the event, <span className="text-blue-400 font-semibold">{memberName}</span>.
                                </p>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 w-full">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Event Code</p>
                                    <p className="text-lg font-mono text-white tracking-widest">{eventCode}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-300">{errorMessage}</p>
                        </motion.div>
                    )}

                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600">© 2026 Blitz Mass Communication</p>
                </div>
            </motion.div>
        </div>
    );
}
