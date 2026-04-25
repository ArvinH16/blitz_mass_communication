'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowRight, Building2, KeyRound } from 'lucide-react';

interface GetStartedDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GetStartedDialog({ isOpen, onClose }: GetStartedDialogProps) {
    const router = useRouter();

    const handleNavigation = (path: string) => {
        onClose();
        setTimeout(() => router.push(path), 100);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Welcome to Blitz</DialogTitle>
                    <DialogDescription>
                        Pick how you&apos;d like to get started.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-2 grid gap-3">
                    <button
                        onClick={() => handleNavigation('/access-code')}
                        className="group flex items-center gap-4 rounded-xl border border-border/80 bg-surface p-4 text-left transition-all hover:border-primary/40 hover:bg-accent/50"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                            <KeyRound className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">Sign in to existing org</div>
                            <div className="text-xs text-muted-foreground">
                                Use your access code
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <button
                        onClick={() => handleNavigation('/register')}
                        className="group flex items-center gap-4 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-4 text-left transition-all hover:border-primary/50"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">Register new organization</div>
                            <div className="text-xs text-muted-foreground">
                                Set things up in under a minute
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
