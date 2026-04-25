"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { createEvent, getOrgEvents, getEventAttendees } from "@/app/actions/events"
import { Plus, Calendar, QrCode, Users, ExternalLink, RefreshCw, ArrowLeft, Loader2, Copy, Check } from "lucide-react"
import { QRCode } from 'react-qrcode-logo';
import { Event } from "@/lib/supabase"
import AnimatedBackground from "@/components/AnimatedBackground"

interface AttendeeRecord {
    id: number;
    created_at: string;
    org_members: {
        first_name: string;
        last_name: string;
        phone_number: string;
    }
}

export default function EventsPage() {
    const router = useRouter()
    const [orgInfo, setOrgInfo] = useState<{ id: number; name: string } | null>(null)
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showDetailDialog, setShowDetailDialog] = useState(false)
    const [copied, setCopied] = useState(false)

    const [newEventName, setNewEventName] = useState("")
    const [newEventDate, setNewEventDate] = useState("")
    const [newEventDesc, setNewEventDesc] = useState("")
    const [creating, setCreating] = useState(false)

    const [attendees, setAttendees] = useState<AttendeeRecord[]>([])
    const [loadingAttendees, setLoadingAttendees] = useState(false)

    const loadAttendees = async (eventId: number) => {
        setLoadingAttendees(true);
        const att = await getEventAttendees(eventId);
        setAttendees(att as unknown as AttendeeRecord[]);
        setLoadingAttendees(false);
    }

    const refreshAttendees = () => {
        if (selectedEvent) {
            loadAttendees(selectedEvent.id);
        }
    }

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
                const data = await response.json();
                if (data.success) {
                    setOrgInfo({ id: data.organizationId, name: data.chapterName });
                    fetchEvents(data.organizationId);
                }
            } catch {
                router.push('/');
            }
        };
        verifyAuth();
    }, [router]);

    const fetchEvents = async (orgId: number) => {
        setLoading(true)
        const data = await getOrgEvents(orgId)
        setEvents(data)
        setLoading(false)
    }

    const handleCreateEvent = async () => {
        if (!orgInfo) return;
        if (!newEventName || !newEventDate) {
            alert("Name and Date are required");
            return;
        }

        setCreating(true);
        const formData = new FormData();
        formData.append('name', newEventName);
        formData.append('eventDate', new Date(newEventDate).toISOString());
        formData.append('description', newEventDesc);
        formData.append('organizationId', orgInfo.id.toString());

        const result = await createEvent(formData);
        setCreating(false);

        if (result.error) {
            alert(result.error);
        } else {
            setShowCreateDialog(false);
            setNewEventName("");
            setNewEventDate("");
            setNewEventDesc("");
            fetchEvents(orgInfo.id);
        }
    }

    const openEventDetails = async (event: Event) => {
        setSelectedEvent(event);
        setShowDetailDialog(true);
        loadAttendees(event.id);
    }

    const getCheckInUrl = (code: string) => {
        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            (typeof window !== 'undefined' ? window.location.origin : '');
        return `${baseUrl}/check-in/${code}`;
    }

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    const formatEventDate = (date: string) => {
        const d = new Date(date);
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            relative: getRelative(d),
        };
    }

    const getRelative = (d: Date) => {
        const diff = d.getTime() - Date.now();
        const days = Math.round(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days === -1) return 'Yesterday';
        if (days > 0 && days < 7) return `In ${days} days`;
        if (days < 0 && days > -7) return `${-days} days ago`;
        return null;
    }

    return (
        <AnimatedBackground>
            <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-12">
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
                        <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Run events with QR check-in and live attendance.
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)} size="lg">
                        <Plus className="h-4 w-4" />
                        Create event
                    </Button>
                </div>

                {/* Events grid */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="col-span-full">
                            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 text-base font-semibold">No events yet</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create your first event to start tracking attendance.
                                </p>
                                <Button className="mt-6" onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="h-4 w-4" />
                                    Create event
                                </Button>
                            </div>
                        </div>
                    ) : (
                        events.map((event) => {
                            const f = formatEventDate(event.event_date);
                            return (
                                <button
                                    key={event.id}
                                    onClick={() => openEventDetails(event)}
                                    className="group flex flex-col rounded-2xl border border-border/80 bg-card p-5 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-elevated"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        {f.relative && (
                                            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-primary">
                                                {f.relative}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                                        {event.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {f.date} · {f.time}
                                    </p>
                                    <p className="mt-3 line-clamp-2 text-sm text-foreground/70">
                                        {event.description || 'No description'}
                                    </p>
                                    <div className="mt-4 flex items-center text-xs font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                                        View details
                                        <span className="ml-1">→</span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Create Event Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create new event</DialogTitle>
                            <DialogDescription>
                                Set up an event and we&apos;ll generate a QR check-in link.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Event name</Label>
                                <Input
                                    id="name"
                                    value={newEventName}
                                    onChange={(e) => setNewEventName(e.target.value)}
                                    placeholder="e.g. Spring Kickoff"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="date">Date & time</Label>
                                <Input
                                    id="date"
                                    type="datetime-local"
                                    value={newEventDate}
                                    onChange={(e) => setNewEventDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="desc">Description (optional)</Label>
                                <Input
                                    id="desc"
                                    value={newEventDesc}
                                    onChange={(e) => setNewEventDesc(e.target.value)}
                                    placeholder="What's it about?"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateEvent} disabled={creating}>
                                {creating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating…
                                    </>
                                ) : (
                                    'Create event'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Event Detail Dialog */}
                <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[860px]">
                        {selectedEvent && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">{selectedEvent.name}</DialogTitle>
                                    <DialogDescription>
                                        {formatEventDate(selectedEvent.event_date).date} ·{' '}
                                        {formatEventDate(selectedEvent.event_date).time}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-6 py-2 md:grid-cols-2">
                                    {/* QR */}
                                    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/80 bg-accent/30 p-6">
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                            <QrCode className="h-4 w-4" /> Check-in QR
                                        </div>
                                        <div className="rounded-xl bg-white p-4 shadow-soft">
                                            <QRCode
                                                value={getCheckInUrl(selectedEvent.code)}
                                                size={200}
                                                logoWidth={40}
                                                removeQrCodeBehindLogo
                                            />
                                        </div>
                                        <div className="w-full space-y-2">
                                            <p className="text-center text-xs text-muted-foreground">
                                                Scan to check in or share the link below
                                            </p>
                                            <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
                                                <code className="flex-1 truncate font-mono text-xs text-muted-foreground">
                                                    {getCheckInUrl(selectedEvent.code)}
                                                </code>
                                                <Button
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    onClick={() => handleCopy(getCheckInUrl(selectedEvent.code))}
                                                >
                                                    {copied ? (
                                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() =>
                                                    window.open(getCheckInUrl(selectedEvent.code), '_blank')
                                                }
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Open check-in page
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Attendees */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-sm font-medium">
                                                <Users className="h-4 w-4" />
                                                Attendees ({attendees.length})
                                            </div>
                                            <Button
                                                size="icon-sm"
                                                variant="ghost"
                                                onClick={refreshAttendees}
                                                disabled={loadingAttendees}
                                            >
                                                <RefreshCw
                                                    className={`h-3.5 w-3.5 ${loadingAttendees ? 'animate-spin' : ''}`}
                                                />
                                            </Button>
                                        </div>

                                        <div className="flex h-[360px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card">
                                            {loadingAttendees ? (
                                                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                </div>
                                            ) : attendees.length === 0 ? (
                                                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                                                        <Users className="h-5 w-5" />
                                                    </div>
                                                    <p className="mt-3 text-sm font-medium">No attendees yet</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Share the QR code to start tracking.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="overflow-y-auto">
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="sticky top-0 bg-card text-xs uppercase tracking-wider text-muted-foreground">
                                                            <tr className="border-b border-border/80">
                                                                <th className="px-4 py-3 font-medium">Name</th>
                                                                <th className="px-4 py-3 font-medium">Phone</th>
                                                                <th className="px-4 py-3 text-right font-medium">Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/60">
                                                            {attendees.map((att) => (
                                                                <tr
                                                                    key={att.id}
                                                                    className="transition-colors hover:bg-accent/40"
                                                                >
                                                                    <td className="px-4 py-3 font-medium text-foreground">
                                                                        {att.org_members.first_name}{' '}
                                                                        {att.org_members.last_name}
                                                                    </td>
                                                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                                        {att.org_members.phone_number}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                                                                        {new Date(att.created_at).toLocaleTimeString([], {
                                                                            hour: 'numeric',
                                                                            minute: '2-digit',
                                                                        })}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedBackground>
    )
}
