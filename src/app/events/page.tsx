"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import { Plus, Calendar, QrCode, Users, ExternalLink, RefreshCw } from "lucide-react"
import { QRCode } from 'react-qrcode-logo';
import { Event } from "@/lib/supabase"
// import AnimatedBackground from "@/components/AnimatedBackground" 

export default function EventsPage() {
    const router = useRouter()
    const [orgInfo, setOrgInfo] = useState<{ id: number; name: string } | null>(null)
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showDetailDialog, setShowDetailDialog] = useState(false)

    // Create Form State
    const [newEventName, setNewEventName] = useState("")
    const [newEventDate, setNewEventDate] = useState("")
    const [newEventDesc, setNewEventDesc] = useState("")
    const [creating, setCreating] = useState(false)


    // Attendees State
    interface AttendeeRecord {
        id: number;
        created_at: string;
        org_members: {
            first_name: string;
            last_name: string;
            phone_number: string;
        }
    }
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
            // Refresh events
            fetchEvents(orgInfo.id);
        }
    }

    const openEventDetails = async (event: Event) => {
        setSelectedEvent(event);
        setShowDetailDialog(true);
        loadAttendees(event.id);
    }

    // Helper to get Check-in URL
    const getCheckInUrl = (code: string) => {
        if (typeof window === 'undefined') return '';
        // In dev it might be localhost:3000, in prod real domain
        return `${window.location.origin}/check-in/${code}`;
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Events
                        </h1>
                        <p className="text-gray-400 mt-2">Manage your organization&apos;s events and attendance.</p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)} className="bg-white text-black hover:bg-gray-200">
                        <Plus className="mr-2 h-4 w-4" /> Create Event
                    </Button>
                </div>

                {/* Event List */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <p className="text-gray-500">Loading events...</p>
                    ) : events.length === 0 ? (
                        <Card className="col-span-full border-gray-800 bg-gray-900/50">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Calendar className="h-12 w-12 mb-4 opacity-50" />
                                <p>No events found. Create your first event!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        events.map(event => (
                            <Card key={event.id} className="border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 transition-colors cursor-pointer group" onClick={() => openEventDetails(event)}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">{event.name}</CardTitle>
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <CardDescription>
                                        {new Date(event.event_date).toLocaleDateString()} at {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-400 truncate">{event.description || "No description"}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800 bg-transparent text-gray-300">
                                        View Details
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Create Event Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Event</DialogTitle>
                            <DialogDescription>Add a new event for your organization.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Event Name</Label>
                                <Input
                                    id="name"
                                    value={newEventName}
                                    onChange={e => setNewEventName(e.target.value)}
                                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                                    placeholder="e.g. Weekly Meeting"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date & Time</Label>
                                <Input
                                    id="date"
                                    type="datetime-local"
                                    value={newEventDate}
                                    onChange={e => setNewEventDate(e.target.value)}
                                    className="bg-gray-800 border-gray-700 text-white"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Input
                                    id="desc"
                                    value={newEventDesc}
                                    onChange={e => setNewEventDesc(e.target.value)}
                                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                                    placeholder="Optional description"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="hover:bg-gray-800 text-gray-300">Cancel</Button>
                            <Button onClick={handleCreateEvent} disabled={creating} className="bg-white text-black hover:bg-gray-200">
                                {creating ? 'Creating...' : 'Create Event'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Event Detail Dialog */}
                <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                    <DialogContent className="bg-gray-950 border-gray-800 text-white sm:max-w-[800px] max-h-[85vh] overflow-y-auto w-full">
                        {selectedEvent && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">{selectedEvent.name}</DialogTitle>
                                    <DialogDescription className="text-lg text-gray-400">
                                        {new Date(selectedEvent.event_date).toLocaleDateString()} • {new Date(selectedEvent.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid md:grid-cols-2 gap-8 py-4">
                                    {/* Link & QR Section */}
                                    <div className="flex flex-col items-center space-y-4 p-6 bg-white/5 rounded-xl border border-gray-800/50">
                                        <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                                            <QrCode className="w-4 h-4" /> Check-in QR Code
                                        </h3>
                                        <div className="bg-white p-4 rounded-lg shadow-lg">
                                            <QRCode
                                                value={getCheckInUrl(selectedEvent.code)}
                                                size={200}
                                                logoWidth={40}
                                                removeQrCodeBehindLogo
                                            />
                                        </div>
                                        <div className="text-center w-full space-y-2">
                                            <p className="text-xs text-gray-500">Scan to check in or use the link below</p>
                                            <code className="block w-full bg-black/50 p-2 rounded text-xs break-all border border-gray-800 text-gray-400 font-mono">
                                                {getCheckInUrl(selectedEvent.code)}
                                            </code>
                                            <Button size="sm" variant="outline" className="w-full text-xs border-gray-700 hover:bg-gray-800" onClick={() => window.open(getCheckInUrl(selectedEvent.code), '_blank')}>
                                                <ExternalLink className="w-3 h-3 mr-2" /> Open Check-in Page
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Attendees Section */}
                                    <div className="flex flex-col space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                                                <Users className="w-4 h-4" /> Attendees ({attendees.length})
                                            </h3>
                                            <Button size="sm" variant="ghost" onClick={refreshAttendees} disabled={loadingAttendees} className="h-8 w-8 p-0">
                                                <RefreshCw className={`w-3 h-3 ${loadingAttendees ? 'animate-spin' : ''}`} />
                                            </Button>
                                        </div>

                                        <div className="flex-1 bg-white/5 rounded-xl border border-gray-800/50 overflow-hidden flex flex-col h-[350px]">
                                            {loadingAttendees ? (
                                                <div className="flex-1 flex items-center justify-center text-gray-500">Loading attendees...</div>
                                            ) : attendees.length === 0 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm p-8 text-center space-y-2">
                                                    <Users className="h-8 w-8 opacity-20" />
                                                    <p>No attendees yet.</p>
                                                    <p className="text-xs opacity-50">Share the QR code to start tracking attendance.</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-y-auto">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="text-xs text-gray-400 uppercase bg-black/20 sticky top-0 backdrop-blur-sm">
                                                            <tr>
                                                                <th className="px-4 py-3 font-medium">Name</th>
                                                                <th className="px-4 py-3 font-medium">Phone</th>
                                                                <th className="px-4 py-3 font-medium text-right">Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-800/50">
                                                            {attendees.map((att) => (
                                                                <tr key={att.id} className="hover:bg-white/5 transition-colors">
                                                                    <td className="px-4 py-3 font-medium text-gray-200">
                                                                        {att.org_members.first_name} {att.org_members.last_name}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{att.org_members.phone_number}</td>
                                                                    <td className="px-4 py-3 text-gray-500 text-xs text-right">
                                                                        {new Date(att.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
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
        </div>
    )
}
