'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Mail, MessageSquare, Calendar, ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

interface TextMessage {
    id: number;
    created_at: string;
    content: string;
    receiver: string;
}

interface EmailMessage {
    id: number;
    created_at: string;
    content: string;
    subject: string;
    receiver: string;
}

interface SentMessagesData {
    texts: TextMessage[];
    emails: EmailMessage[];
    pagination: {
        page: number;
        limit: number;
        totalTexts: number;
        totalEmails: number;
        totalPagesTexts: number;
        totalPagesEmails: number;
    };
}

export default function SentMessagesPage() {
    const router = useRouter();
    const [data, setData] = useState<SentMessagesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'texts' | 'emails'>('texts');
    const [currentPage, setCurrentPage] = useState(1);
    const [orgInfo, setOrgInfo] = useState<{ id: number; name: string } | null>(null);
    const [expandedEmails, setExpandedEmails] = useState<Set<number>>(new Set());

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch('/api/verify-auth', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    router.push('/');
                    return;
                }

                const authData = await response.json();
                if (authData.success) {
                    setOrgInfo({
                        id: authData.organizationId,
                        name: authData.chapterName,
                    });
                }
            } catch {
                router.push('/');
            }
        };

        verifyAuth();
    }, [router]);

    const fetchData = async (page = 1, type: 'texts' | 'emails' | 'all' = 'all') => {
        try {
            setLoading(true);
            const response = await fetch(`/api/sent-messages?type=${type}&page=${page}&limit=20`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching sent messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgInfo) {
            fetchData(currentPage, 'all');
        }
    }, [orgInfo, currentPage]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredTexts =
        data?.texts.filter(
            (text) =>
                text.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                text.receiver.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

    const filteredEmails =
        data?.emails.filter(
            (email) =>
                email.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                email.receiver.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

    const handlePageChange = (newPage: number, type: 'texts' | 'emails') => {
        setCurrentPage(newPage);
        fetchData(newPage, type);
    };

    const toggleEmailExpansion = (emailId: number) => {
        setExpandedEmails((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(emailId)) {
                newSet.delete(emailId);
            } else {
                newSet.add(emailId);
            }
            return newSet;
        });
    };

    const PaginationControls = ({
        currentPage,
        totalPages,
        onPageChange,
        type,
    }: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number, type: 'texts' | 'emails') => void;
        type: 'texts' | 'emails';
    }) => {
        if (totalPages <= 1) return null;

        return (
            <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1, type)}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <span className="px-3 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1, type)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    if (loading && !data) {
        return (
            <AnimatedBackground>
                <div className="flex min-h-screen items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm">Loading sent messages…</p>
                    </div>
                </div>
            </AnimatedBackground>
        );
    }

    return (
        <AnimatedBackground>
            <div className="mx-auto w-full max-w-5xl px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/mass-text')}
                            className="-ml-2 mb-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Dashboard
                        </Button>
                        <h1 className="text-3xl font-semibold tracking-tight">Message history</h1>
                        {orgInfo?.name && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                All messages sent by {orgInfo.name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/80 bg-card p-5 shadow-soft">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Text messages</p>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
                                <MessageSquare className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                            {data?.pagination.totalTexts || 0}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">All-time delivered</p>
                    </div>
                    <div className="rounded-xl border border-border/80 bg-card p-5 shadow-soft">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Emails</p>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
                                <Mail className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                            {data?.pagination.totalEmails || 0}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">All-time delivered</p>
                    </div>
                </div>

                {/* Search */}
                <div className="mt-6 relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by content, subject, phone or email…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-11 pl-10"
                    />
                </div>

                {/* Tabs */}
                <div className="mt-6 rounded-2xl border border-border/80 bg-card shadow-soft">
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value as 'texts' | 'emails')}
                        className="p-2"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="texts" className="gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Texts ({filteredTexts.length})
                            </TabsTrigger>
                            <TabsTrigger value="emails" className="gap-2">
                                <Mail className="h-4 w-4" />
                                Emails ({filteredEmails.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="texts" className="p-2 sm:p-4">
                            {filteredTexts.length === 0 ? (
                                <EmptyState
                                    icon={MessageSquare}
                                    title="No text messages yet"
                                    desc="Once you send your first text, it'll show up here."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {filteredTexts.map((text) => (
                                        <div
                                            key={text.id}
                                            className="rounded-xl border border-border/60 bg-background p-4 transition-colors hover:border-border"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-primary">
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="text-sm font-medium">{text.receiver}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(text.created_at)}</span>
                                                </div>
                                            </div>
                                            <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-foreground/90">
                                                {text.content}
                                            </p>
                                        </div>
                                    ))}
                                    <PaginationControls
                                        currentPage={currentPage}
                                        totalPages={data?.pagination.totalPagesTexts || 1}
                                        onPageChange={handlePageChange}
                                        type="texts"
                                    />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="emails" className="p-2 sm:p-4">
                            {filteredEmails.length === 0 ? (
                                <EmptyState
                                    icon={Mail}
                                    title="No emails yet"
                                    desc="Once you send your first email, it'll show up here."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {filteredEmails.map((email) => {
                                        const isExpanded = expandedEmails.has(email.id);
                                        return (
                                            <div
                                                key={email.id}
                                                className="rounded-xl border border-border/60 bg-background p-4 transition-colors hover:border-border"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-primary">
                                                            <Mail className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className="text-sm font-medium">{email.receiver}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatDate(email.created_at)}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-sm font-semibold">{email.subject}</div>
                                                <button
                                                    onClick={() => toggleEmailExpansion(email.id)}
                                                    className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="h-3 w-3" />
                                                            Hide content
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="h-3 w-3" />
                                                            View content
                                                        </>
                                                    )}
                                                </button>
                                                {isExpanded && (
                                                    <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-foreground/90">
                                                        {email.content}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <PaginationControls
                                        currentPage={currentPage}
                                        totalPages={data?.pagination.totalPagesEmails || 1}
                                        onPageChange={handlePageChange}
                                        type="emails"
                                    />
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AnimatedBackground>
    );
}

function EmptyState({
    icon: Icon,
    title,
    desc,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold">{title}</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">{desc}</p>
        </div>
    );
}
