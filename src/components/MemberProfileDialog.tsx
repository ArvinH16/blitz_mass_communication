"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, User, Mail, Phone } from "lucide-react"
import { getMemberAttendance } from "@/app/actions/events"

interface Member {
    id?: number
    name: string
    phone: string
    email?: string
}

interface AttendanceRecord {
    id: number
    created_at: string
    events: {
        name: string
        event_date: string
        description: string
        code: string
    }
}

interface MemberProfileDialogProps {
    member: Member | null
    isOpen: boolean
    onClose: () => void
}

export function MemberProfileDialog({ member, isOpen, onClose }: MemberProfileDialogProps) {
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (member?.id && isOpen) {
            const fetchHistory = async () => {
                setLoading(true)
                try {
                    const history = await getMemberAttendance(member.id!)
                    // Cast to unknown first if types don't match perfectly, or define proper types in actions/events.ts
                    setAttendanceHistory(history as unknown as AttendanceRecord[])
                } catch (error) {
                    console.error("Failed to fetch attendance history", error)
                } finally {
                    setLoading(false)
                }
            }
            fetchHistory()
        }
    }, [member, isOpen])

    if (!member) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-6 w-6" />
                        </div>
                        {member.name}
                    </DialogTitle>
                    <DialogDescription className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {member.phone}
                        </div>
                        {member.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {member.email}
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden mt-4">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        Attendance History
                    </h3>

                    <div className="h-[300px] w-full rounded-md border p-4 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Loading history...
                            </div>
                        ) : attendanceHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                                <CalendarDays className="h-8 w-8 opacity-20" />
                                <p>No attendance records found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {attendanceHistory.map((record) => (
                                    <div key={record.id} className="flex flex-col space-y-1 pb-4 border-b last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-base">{record.events?.name || "Unknown Event"}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {new Date(record.created_at).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground gap-4">
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="h-3 w-3" />
                                                Event Date: {new Date(record.events?.event_date).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Checked in: {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {record.events?.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                {record.events.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Future Projects Section Placeholder */}
                <div className="mt-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-muted-foreground opacity-50">
                        <MapPin className="h-5 w-5" />
                        Projects (Coming Soon)
                    </h3>
                </div>

            </DialogContent>
        </Dialog>
    )
}
