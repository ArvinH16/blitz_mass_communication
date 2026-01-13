'use server'

import { supabaseAdmin, formatPhoneNumber, Event } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export type SubmitAttendanceResult =
    | { success: true; message: string; memberName?: string }
    | { success: false; error: string }
    | { success: false; status: 'DETAILS_REQUIRED'; message: string };

export async function submitAttendance(formData: FormData): Promise<SubmitAttendanceResult> {
    const eventCode = formData.get('eventCode') as string;
    const phoneNumberRaw = formData.get('phoneNumber') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;

    if (!eventCode || !phoneNumberRaw) {
        return { success: false, error: 'Event code and phone number are required' };
    }

    if (!supabaseAdmin) {
        return { success: false, error: 'Server configuration error' };
    }

    // 1. Find Event by Code
    const { data: event, error: eventError } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('code', eventCode)
        .single();

    if (eventError || !event) {
        return { success: false, error: 'Invalid event code' };
    }

    const castedEvent = event as Event;
    const formattedPhone = formatPhoneNumber(phoneNumberRaw);

    // 2. Lookup Member in Organization
    const { data: member } = await supabaseAdmin
        .from('org_members')
        .select('*')
        .eq('organization_id', castedEvent.organization_id)
        .eq('phone_number', formattedPhone)
        .single();

    let memberId: number;
    let memberName: string;

    if (member) {
        // Member exists
        memberId = member.id;
        memberName = `${member.first_name} ${member.last_name}`;
    } else {
        // Member does NOT exist
        // Check if we have the details to create them
        if (!firstName || !lastName || !email) {
            return {
                success: false,
                status: 'DETAILS_REQUIRED',
                message: 'Member not found. Please provide details.'
            };
        }

        // Create new member
        const { data: newMember, error: createError } = await supabaseAdmin
            .from('org_members')
            .insert({
                organization_id: castedEvent.organization_id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone_number: formattedPhone,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (createError || !newMember) {
            console.error('Error creating member:', createError);
            return { success: false, error: 'Failed to register member' };
        }

        memberId = newMember.id;
        memberName = `${newMember.first_name} ${newMember.last_name}`;
    }

    // 3. Record Attendance
    // Check if already attended
    const { data: existingAttendance } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('event_id', castedEvent.id)
        .eq('member_id', memberId)
        .single();

    if (existingAttendance) {
        return { success: true, message: 'You have already checked in!', memberName };
    }

    const { error: attendanceError } = await supabaseAdmin
        .from('attendance')
        .insert({
            event_id: castedEvent.id,
            member_id: memberId,
            status: 'attended',
            created_at: new Date().toISOString()
        });

    if (attendanceError) {
        console.error('Error recording attendance:', attendanceError);
        return { success: false, error: 'Failed to record attendance' };
    }

    revalidatePath(`/events/${eventCode}`); // Optional: revalidate admin page if we had a path for it, or just generic
    revalidatePath('/events');

    return { success: true, message: 'You are checked in!', memberName };
}
