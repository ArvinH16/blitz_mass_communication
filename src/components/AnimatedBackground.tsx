'use client';

import { motion } from 'framer-motion';

export default function AnimatedBackground({
    children,
    zIndex = 0,
    variant = 'subtle',
}: {
    children: React.ReactNode;
    zIndex?: number;
    variant?: 'subtle' | 'hero';
}) {
    return (
        <div className="relative min-h-screen bg-background">
            <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{ zIndex }}
                aria-hidden="true"
            >
                {/* Layer 1: subtle dot grid */}
                <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60" />

                {/* Layer 2: ambient glow blobs */}
                {variant === 'hero' ? (
                    <>
                        <motion.div
                            className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full opacity-40 blur-3xl"
                            style={{
                                background:
                                    'radial-gradient(ellipse at center, oklch(0.6 0.22 285 / 0.45), transparent 60%)',
                            }}
                            animate={{
                                scale: [1, 1.05, 1],
                                opacity: [0.35, 0.5, 0.35],
                            }}
                            transition={{
                                duration: 12,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.div
                            className="absolute top-1/3 -left-20 h-[400px] w-[500px] rounded-full opacity-30 blur-3xl"
                            style={{
                                background:
                                    'radial-gradient(ellipse at center, oklch(0.65 0.18 230 / 0.4), transparent 60%)',
                            }}
                            animate={{
                                scale: [1, 1.1, 1],
                                x: [0, 30, 0],
                                y: [0, -20, 0],
                            }}
                            transition={{
                                duration: 18,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.div
                            className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full opacity-30 blur-3xl"
                            style={{
                                background:
                                    'radial-gradient(ellipse at center, oklch(0.68 0.18 320 / 0.4), transparent 60%)',
                            }}
                            animate={{
                                scale: [1, 1.08, 1],
                                x: [0, -20, 0],
                                y: [0, 20, 0],
                            }}
                            transition={{
                                duration: 16,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </>
                ) : (
                    <>
                        <div
                            className="absolute -top-40 right-0 h-[400px] w-[600px] rounded-full opacity-25 blur-3xl"
                            style={{
                                background:
                                    'radial-gradient(ellipse at center, oklch(0.65 0.18 280 / 0.35), transparent 60%)',
                            }}
                        />
                        <div
                            className="absolute top-1/2 -left-20 h-[300px] w-[400px] rounded-full opacity-20 blur-3xl"
                            style={{
                                background:
                                    'radial-gradient(ellipse at center, oklch(0.7 0.15 230 / 0.3), transparent 60%)',
                            }}
                        />
                    </>
                )}
            </div>

            <div className="relative z-10">{children}</div>
        </div>
    );
}
