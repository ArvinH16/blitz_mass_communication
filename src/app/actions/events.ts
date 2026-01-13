'use server'

import { supabaseAdmin, supabase, Event } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function createEvent(formData: FormData) {
    const name = formData.get('name') as string;
    const eventDate = formData.get('eventDate') as string;
    const description = formData.get('description') as string;
    const organizationId = formData.get('organizationId') as string;

    if (!name || !eventDate || !organizationId) {
        return { error: 'Missing required fields' };
    }

    if (!supabaseAdmin) {
        return { error: 'Server configuration error' };
    }

    const { data, error } = await supabaseAdmin
        .from('events')
        .insert({
            name,
            event_date: eventDate,
            description,
            organization_id: parseInt(organizationId),
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating event:', error);
        return { error: 'Failed to create event' };
    }

    revalidatePath('/events');
    return { success: true, event: data as Event };
}

export async function getOrgEvents(orgId: number) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', orgId)
        .order('event_date', { ascending: false });

    if (error) {
        console.error('Error fetching events:', error);
        return [];
    }

    return data as Event[];
}

export async function getEventByCode(code: string) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('code', code)
        .single();

    if (error) return null;
    return data as Event;
}

export async function getEventAttendees(eventId: number) {
    if (!supabaseAdmin) return [];

    const { data, error } = await supabaseAdmin
        .from('attendance')
        .select('*, org_members(first_name, last_name, phone_number)')
        .eq('event_id', eventId);

    if (error) {
        console.error('Error fetching attendees:', error);
        return [];
    }

    return data;
}
