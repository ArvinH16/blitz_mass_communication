import { OrganizationRegisterForm } from '@/components/OrganizationRegisterForm';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Register Organization · Blitz',
    description: 'Register your organization with Blitz',
};

export default function RegisterPage() {
    return (
        <AnimatedBackground variant="hero">
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
                <Link
                    href="/"
                    className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Home
                </Link>
                <div className="w-full">
                    <OrganizationRegisterForm />
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an organization?{' '}
                        <Link href="/access-code" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </AnimatedBackground>
    );
}
