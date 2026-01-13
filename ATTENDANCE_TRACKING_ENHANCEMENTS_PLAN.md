# Attendance Tracking Enhancements Implementation Plan

This plan breaks down the enhancements into two focused phases. While possible to execute together, splitting them ensures attention to detail for the "premium" design requirements.

## Phase 1: Design & Navigation Integration
**Goal:** Make the Events page look spectacular and ensure seamless navigation from the main dashboard.

### Steps:
1.  **Integrate Navigation (`src/app/mass-text/page.tsx`)**:
    *   Add an "Events" tab button alongside "Mass Text" and "All Members".
    *   Ensure it correctly routes to `/events`.
2.  **Enhance Events Page (`src/app/events/page.tsx`)**:
    *   **Background:** Import and enable the `AnimatedBackground` component.
    *   **Typography & Colors:** Update the header, lists, and dialogs to match the `MassTextPage` aesthetic (Inter/Outfit fonts, glassmorphism cards).
    *   **Layout:** Refine the grid layout and empty states to be more visually engaging.

## Phase 2: Member Profile & Insights
**Goal:** Enable deep-dive views into member activity and attendance history.

### Steps:
1.  **Backend Logic (`src/app/actions/events.ts`)**:
    *   Create a server action `getMemberAttendance(memberId)` that returns a list of events attended by that member.
2.  **Frontend Modal (`src/app/mass-text/page.tsx`)**:
    *   Create a `MemberProfileDialog` component.
    *   **Trigger:** Make table rows in the "All Members" view clickable (or add a "View" icon).
    *   **Content:**
        *   Header with Member Name/Phone/Email.
        *   "Attendance History" section listing past events with dates.
        *   Placeholder for "Projects" (if data becomes available later).

---

## Ease of Execution
*   **Recommendation:** Execute **Phase 1** first. This fixes the immediate visual disjoint and navigation friction. Then, execute **Phase 2** to add the new data depth.
