"use client"

import React, { useState, useEffect } from "react"
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
import { Plus, Calendar, Users, ExternalLink, RefreshCw, X } from "lucide-react"
import { QRCode } from 'react-qrcode-logo';
import { Event } from "@/lib/supabase"

interface EventsTabProps {
    orgInfo: { id: number; name: string } | null
}

export function EventsTab({ orgInfo }: EventsTabProps) {
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
        if (orgInfo?.id) {
            fetchEvents(orgInfo.id);
        }
    }, [orgInfo]);

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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
        return `${baseUrl}/check-in/${code}`;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Events
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your organization events and track attendance.
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Event
                </Button>
            </div>

            {/* Event List */}
            <div className="grid gap-4 md:grid-cols-2">
                {loading ? (
                    <p className="text-gray-500">Loading events...</p>
                ) : events.length === 0 ? (
                    <Card className="col-span-full border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Calendar className="h-12 w-12 mb-4 opacity-50" />
                            <p>No events found. Create your first event!</p>
                        </CardContent>
                    </Card>
                ) : (
                    events.map(event => (
                        <Card
                            key={event.id}
                            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                            onClick={() => openEventDetails(event)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-semibold truncate pr-2">{event.name}</CardTitle>
                                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                </div>
                                <CardDescription className="text-sm">
                                    {new Date(event.event_date).toLocaleDateString()} at {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                    {event.description || "No description provided."}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary/80">
                                    View Details
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Event Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[425px]">
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
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="desc">Description</Label>
                            <Input
                                id="desc"
                                value={newEventDesc}
                                onChange={e => setNewEventDesc(e.target.value)}
                                placeholder="Optional description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateEvent} disabled={creating}>
                            {creating ? 'Creating...' : 'Create Event'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Event Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto w-full p-0 gap-0 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                    {selectedEvent && (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-800 relative">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-4 top-4 h-8 w-8"
                                    onClick={() => setShowDetailDialog(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <DialogTitle className="text-2xl font-bold">{selectedEvent.name}</DialogTitle>
                                <DialogDescription className="mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(selectedEvent.event_date).toLocaleDateString()} • {new Date(selectedEvent.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </DialogDescription>
                            </div>

                            <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x border-gray-200 dark:border-gray-800">
                                {/* Link & QR Section */}
                                <div className="p-6 flex flex-col items-center space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
                                    <div className="text-center">
                                        <h3 className="font-semibold text-lg mb-1">Check-in QR Code</h3>
                                        <p className="text-sm text-gray-500">Scan to check in instantly</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                        <QRCode
                                            value={getCheckInUrl(selectedEvent.code)}
                                            size={200}
                                            logoWidth={40}
                                            removeQrCodeBehindLogo
                                        />
                                    </div>

                                    <div className="w-full space-y-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500">Or use link</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <code className="flex-1 bg-white dark:bg-gray-800 p-2 rounded text-xs border border-gray-200 dark:border-gray-700 font-mono truncate select-all">
                                                {getCheckInUrl(selectedEvent.code)}
                                            </code>
                                            <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={() => window.open(getCheckInUrl(selectedEvent.code), '_blank')}>
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Attendees Section */}
                                <div className="p-0 flex flex-col h-[500px]">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-950 sticky top-0">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Attendees <span className="text-gray-500 font-normal">({attendees.length})</span>
                                        </h3>
                                        <Button size="sm" variant="ghost" onClick={refreshAttendees} disabled={loadingAttendees} className="h-8 w-8 p-0">
                                            <RefreshCw className={`w-3 h-3 ${loadingAttendees ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
                                        {loadingAttendees ? (
                                            <div className="flex h-full items-center justify-center text-gray-500 text-sm">Loading attendees...</div>
                                        ) : attendees.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm p-8 text-center space-y-2">
                                                <Users className="h-8 w-8 opacity-20" />
                                                <p>No attendees yet.</p>
                                                <p className="text-xs opacity-50">Share the QR code to start tracking.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {attendees.map((att) => (
                                                    <div key={att.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                        <div>
                                                            <p className="font-medium text-sm">{att.org_members.first_name} {att.org_members.last_name}</p>
                                                            <p className="text-xs text-gray-500 font-mono">{att.org_members.phone_number}</p>
                                                        </div>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(att.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
