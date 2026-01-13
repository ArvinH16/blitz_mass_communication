# Attendance Tracking Implementation Plan

This implementation plan divides the Attendance Tracking feature into two distinct phases. Each phase is designed to be completed in a single coding session.

## Phase 1: Core Infrastructure & Admin Interface

**Goal:** Establish the database schema, implement backend logic, and create the Admin Dashboard for event management.

### Tasks
1.  **Database Migration**:
    *   Create `events` table (id, org_id, name, date, code).
    *   Create `attendance` table (id, event_id, member_id, status).
    *   Set up RLS policies for security (Admin read/write).
2.  **Server Actions / API**:
    *   Create `createEvent` action: Validates input and inserts into `events` table.
    *   Create `getOrgEvents` action: Fetches events for the current organization.
3.  **Admin Frontend (`/events`)**:
    *   Create `EventsPage` component at `src/app/events/page.tsx`.
    *   Implement **List View**: Display table/grid of events.
    *   Implement **Create Event Dialog**: Form to add new events.
    *   Implement **Event Detail View**: Display the specific event's QR Code (using `qrcode.react`) and the public check-in URL.
    *   Display a simple list of current attendees for each event.

### Deliverable
*   Admins can log in, create events, and see the QR code/link to share with students.

### Phase 1 Prompt
> "I want to implement Phase 1 of the Attendance Tracking feature. Refer to the 'Database Schema Changes' and 'Frontend Pages > Admin' sections in `ATTENDANCE_TRACKING_PRD.md`.
>
> 1. Setup the Database: Create the `events` and `attendance` tables in Supabase with appropriate RLS policies.
> 2. Create Backend Actions: Implement server actions/APIs to create events and fetch them.
> 3. Build the Admin Page: Create `src/app/events/page.tsx` with a list view of events, a dialog to create a new event, and a detail view that generates and displays the QR code using `qrcode.react`.
>
> Ensure the code is clean, types are defined, and the UI matches the existing project aesthetics."

---

## Phase 2: Public Student Experience & Integration

**Goal:** Build the public-facing check-in flow and ensure seamless member registration.

### Tasks
1.  **Public Backend Logic**:
    *   Create `submitAttendance` action:
        *   Accept phone number + event code.
        *   Look up existing member.
        *   If new, accept extra fields (Name, Email) and create member.
        *   Record attendance record.
2.  **Public Frontend (`/check-in/[code]`)**:
    *   Create route `src/app/check-in/[code]/page.tsx`.
    *   **Step 1**: "Enter Phone Number" form.
    *   **Step 2 (Conditional)**: If phone not found, show "Complete Profile" form (Name, Email).
    *   **Success State**: "You are checked in!" confirmation screen.
    *   Ensure mobile-responsive design.
3.  **Integration & Polish**:
    *   Verify the full flow: Admin creates event -> gets QR -> Student scans -> Checks in (New & Existing).
    *   Add error handling (invalid code, already checked in).
    *   Update the Admin Event Detail view to show real-time attendee counts if not fully wired in Phase 1.

### Deliverable
*   Students can successfully check in via QR code or link.
*   System handles both existing members and new sign-ups automatically.

### Phase 2 Prompt
> "I want to implement Phase 2 of the Attendance Tracking feature. We have already built the Admin side and Database in Phase 1. Now focus on the 'Public: Student Check-in' section of `ATTENDANCE_TRACKING_PRD.md`.
>
> 1. Build the Public Route: Create `src/app/check-in/[code]/page.tsx`.
> 2. Implement the Check-in Logic: The user enters their phone number. Check the DB.
>    - IF they exist: Mark attendance immediately.
>    - IF they don't exist: Show a second step to collect Name/Email, create the user, THEN mark attendance.
> 3. Polish: Ensure the mobile experience is excellent and provides clear success/error feedback.
>
> Use the existing `events` and `attendance` tables created in Phase 1."

