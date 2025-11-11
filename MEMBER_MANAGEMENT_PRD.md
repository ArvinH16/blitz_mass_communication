# Member Management Feature - PRD

## Overview
Add UI functionality to edit and delete organization members. The backend APIs already exist - we just need to build the frontend interface.

## Current State
- ✅ Users can add members via file upload or SMS registration
- ❌ Users cannot edit member information
- ❌ Users cannot delete members

## Goal
Create a member management page where users can view, edit, and delete organization members.

## Database Schema

```typescript
interface OrgMember {
    id: number;
    created_at: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    organization_id: number;
    other: string;
    opted_out?: boolean;
}
```

**Supabase Table:** `org_members`

## Existing Backend APIs

### Update Member
- **Endpoint:** `PUT /api/update-contact`
- **Body:** `{ id: number, first_name?: string, last_name?: string, email?: string, phone_number?: string }`
- **Auth:** Requires `access-code` cookie

### Delete Member
- **Endpoint:** `DELETE /api/delete-contact?id={memberId}`
- **Auth:** Requires `access-code` cookie

### Fetch Members
- **Function:** `getOrgMembersByOrgId(orgId)` from `@/lib/supabase`

## Implementation Steps

### 1. Create Member Management Page
- Create new page at `src/app/members/page.tsx` or add to existing contacts page
- Fetch and display all members for the current organization
- Use a table or card layout to show member information

### 2. Add Edit Functionality
- Add an "Edit" button for each member
- Create a modal/dialog with a form to edit member details
- Make PUT request to `/api/update-contact` with updated data
- Show success/error toast notifications
- Refresh member list after successful update

### 3. Add Delete Functionality
- Add a "Delete" button for each member
- Show confirmation dialog before deleting
- Make DELETE request to `/api/delete-contact?id={memberId}`
- Show success/error toast notifications
- Remove deleted member from UI or refresh list

### 4. UI Components to Use
- Use existing shadcn/ui components (Table, Dialog, Button, Form, Input)
- Follow the existing design patterns from `mass-text/page.tsx` and `about/page.tsx`
- Ensure responsive design for mobile devices

## Git Workflow

### Creating Your Branch
```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Create a new feature branch
git checkout -b feature/member-management-ui

# Or for individual work
git checkout -b your-name/member-management
```

### Making Changes
```bash
# Check what files you've changed
git status

# Add your changes
git add .

# Commit with a descriptive message
git commit -m "Add member management UI with edit and delete"

# Push to remote
git push origin feature/member-management-ui
```

### Creating a Pull Request
1. Go to GitHub repository
2. Click "Compare & pull request"
3. Add a description of your changes
4. Request review from team lead
5. Address any feedback and push additional commits

### Best Practices
- Commit frequently with clear messages
- Test your changes locally before pushing
- Don't commit sensitive data or environment variables
- Keep your branch up to date with main: `git pull origin main`

## Testing Checklist
- [ ] Can view all members for the organization
- [ ] Can edit member first name, last name, email, and phone number
- [ ] Can delete a member with confirmation
- [ ] Changes persist after page refresh
- [ ] Error messages display for failed operations
- [ ] Responsive design works on mobile
- [ ] Opted-out members are visually indicated

## Reference Files
- Backend API: [src/app/api/update-contact/route.ts](src/app/api/update-contact/route.ts)
- Backend API: [src/app/api/delete-contact/route.ts](src/app/api/delete-contact/route.ts)
- Database functions: [src/lib/supabase.ts:699-743](src/lib/supabase.ts)
- Example page structure: [src/app/mass-text/page.tsx](src/app/mass-text/page.tsx)

## Questions?
If you get stuck, check existing pages for examples or ask the team lead!
