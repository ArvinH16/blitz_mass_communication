# Attendance Tracking Enhancements PRD

This document outlines enhancements to the Attendance Tracking feature, focusing on dashboard integration, UI consistency, and member profile insights.

## 1. Dashboard Integration

**Goal:** Provide easy access to the Event Management page from the main dashboard.

### Requirements:
*   **Navigation Button:** Add a specific "Events" button/tab to the main dashboard navigation in `src/app/mass-text/page.tsx`.
*   **Placement:** Insert this button alongside the existing "Mass Text & Email" and "All Members" tabs (lines ~1069-1086).
*   **Behavior:** Clicking "Events" should navigate the user to `/events`.

## 2. Event Page Design (`/events`)

**Goal:** Ensure the Event Management page feels native to the application.

### Requirements:
*   **Aesthetics:** logic and structure should follow the `ATTENDANCE_TRACKING_PRD.md`, but the *design* must match the existing "Mass Text" dashboard.
*   **Components:**
    *   Use the `Card`, `CardHeader`, `CardContent` components from `@/components/ui/card`.
    *   Use `Button` from `@/components/ui/button`.
    *   Use the existing `Outfit` font and standard spacing/colors (`primary` colors, `gray-100` backgrounds, etc.).
    *   Include the helper components like `AnimatedBackground` if applicable to maintain the "vibe".

## 3. Member Profile & History

**Goal:** Allow admins to view detailed attendance history for individual members.

### Requirements:
*   **Entry Point:** In the "All Members" tab (Contacts Management view), make member rows clickable or add a "View Profile" action.
*   **Profile View:** Create a way to view a specific member's details (e.g., a Modal or a dedicated page `/members/[id]`).
*   **Data Display:**
    *   **Personal Info:** Stats (Name, Phone, Email).
    *   **Attendance History:** A list of events this member has attended.
    *   **Projects:** (If applicable) List any projects associated with the member. *Note: If "Projects" are not yet defined in the schema, focus on displaying "Events Attended".*

## Implementation Priority

1.  **Phase 1 Update (Admin Page):** Apply the design requirements to the `/events` page being built in Phase 1.
2.  **Navigation Update:** Add the button to `src/app/mass-text/page.tsx`.
3.  **Phase 3 (New): Member Insights:** Implement the Member Profile view and connect it to the "All Members" list.
