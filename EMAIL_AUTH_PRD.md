# Email Authentication PRD — Blitz Mass Communication Platform

> **Author:** AI Assistant  
> **Date:** 2026-02-10  
> **Branch:** `feat/auth-noah`  
> **Status:** Draft  
> **Priority:** 🔴 Critical (Security)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Analysis](#2-current-architecture-analysis)
3. [Security Vulnerabilities in Current System](#3-security-vulnerabilities-in-current-system)
4. [Proposed Solution: Supabase Email Auth](#4-proposed-solution-supabase-email-auth)
5. [Database Schema Changes](#5-database-schema-changes)
6. [Affected Files & Impact Analysis](#6-affected-files--impact-analysis)
7. [Implementation Plan](#7-implementation-plan)
8. [Migration Strategy](#8-migration-strategy)
9. [UI/UX Design](#9-uiux-design)
10. [Testing Plan](#10-testing-plan)
11. [Rollback Plan](#11-rollback-plan)

---

## 1. Executive Summary

### Problem
The Blitz platform currently uses a **plaintext access code** stored in a browser cookie to authenticate organization admins. This is fundamentally insecure — anyone who knows (or guesses) an organization's access code can gain full admin access to send mass texts, mass emails, manage contacts, and manage events on behalf of that organization.

### Solution
Replace the access-code system with **Supabase's built-in email authentication**. Organization admins will sign up and sign in using their email address + password. Supabase Auth handles session management via secure JWT tokens, password hashing, email verification, and password reset — all industry-standard security practices.

### Key Benefits
- ✅ **Secure sessions** — JWT-based tokens with automatic refresh (no plaintext secrets in cookies)
- ✅ **Per-user identity** — Know *who* is performing actions, not just *which org*
- ✅ **Email verification** — Confirm users own their email before granting access
- ✅ **Password reset** — Self-service password recovery flow
- ✅ **Session expiry & revocation** — Automatic token expiry; ability to sign out users
- ✅ **RLS integration** — Row Level Security policies can reference `auth.uid()` directly
- ✅ **Multi-admin support** — Multiple people can manage the same org with individual accounts

---

## 2. Current Architecture Analysis

### 2.1 Authentication Flow (Current)

```
┌──────────────┐     ┌────────────────┐     ┌──────────────────┐
│  Landing Page │────▶│  /access-code  │────▶│  /api/verify-code│
│  (page.tsx)   │     │  (page.tsx)    │     │  (route.ts)      │
└──────────────┘     └────────────────┘     └──────────────────┘
                                                    │
                                    Looks up org by access_code
                                    in `organizations` table
                                                    │
                                           Sets `access-code`
                                         cookie (httpOnly, 24h)
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │  /mass-text  │
                                            │  (page.tsx)  │
                                            └──────────────┘
```

### 2.2 How Auth is Checked Today

| Layer | Mechanism | File |
|---|---|---|
| **Middleware** | Checks for `access-code` cookie existence on `/mass-text` and `/sent-messages` | `src/middleware.ts` |
| **API Routes** | Read `access-code` cookie → `getOrganizationByAccessCode()` → get org ID | Every API route (20 files) |
| **Client Pages** | Call `/api/verify-auth` on mount → redirect if unauthorized | `mass-text/page.tsx`, `events/page.tsx` |

### 2.3 Database Tables (Current `public` Schema)

| Table | Rows | Purpose |
|---|---|---|
| `organizations` | — | Stores org details including `access_code`, `chapter_name`, `message_limit`, etc. |
| `org_members` | — | Members/contacts belonging to an organization |
| `events` | 8 | Events created by an organization |
| `attendance` | 129 | Attendance records for events |
| `email_info` | — | SMTP credentials for org email sending |
| `emails_sent` | — | Log of sent emails |
| `texts_sent` | — | Log of sent texts |
| `conversation_states` | — | Twilio SMS conversation tracking |
| `pending_orgs` | — | Organizations awaiting approval |
| `push_subscriptions` | — | Web push notification subscriptions |
| `region` | — | Twilio number regions |

### 2.4 `organizations` Table Schema

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | Primary key |
| `created_at` | timestamptz | Default: `now()` |
| `access_code` | text | **⚠️ THE CURRENT AUTH KEY — will be deprecated** |
| `chapter_name` | text | Organization display name |
| `message_limit` | bigint | Monthly SMS limit |
| `twilio_number` | text | Org's Twilio phone number |
| `email_remaining` | bigint | Email send quota |
| `region_id` | bigint | FK → `region` |
| `message_sent` | bigint | Current month SMS count |
| `emails_sent` | bigint | Current email count |
| `last_message_sent` | date | Last SMS send date |
| `last_email_sent` | date | Last email send date |

### 2.5 Supabase Client Setup (Current)

**File:** `src/lib/supabase.ts`

```typescript
// Public client (client-side) - uses anon key
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client (server-side) - uses service_role key
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});
```

**Problem:** The public client is a raw `createClient()` without SSR cookie handling. It cannot manage Supabase Auth sessions in a Next.js server-side context.

---

## 3. Security Vulnerabilities in Current System

### 🔴 Critical

| # | Vulnerability | Description |
|---|---|---|
| 1 | **Shared plaintext secret** | The `access_code` is a single string shared among all admins of an org. If leaked, anyone has full access. |
| 2 | **No password hashing** | The access code is stored in plaintext in the `organizations` table and transmitted in plaintext in the cookie. |
| 3 | **No per-user identity** | There's no way to know *who* sent a mass text or made changes — only which org. |
| 4 | **No session revocation** | If an access code is compromised, the only fix is changing it in the DB — there's no sign-out mechanism. |
| 5 | **No brute-force protection** | The `/api/verify-code` endpoint has no rate limiting. An attacker could guess access codes. |
| 6 | **Cookie-only middleware** | The middleware only checks for cookie *existence*, not validity. A stale/forged cookie would still pass. |

### 🟡 Moderate

| # | Vulnerability | Description |
|---|---|---|
| 7 | **`orgSlug.ts` uses a weak secret** | The `ORG_SLUG_SECRET` defaults to `'changeme'` — org IDs can be decoded by anyone who knows this. |
| 8 | **Service role key on client-side risk** | The `supabase.ts` file creates both client and admin clients in the same module. If accidentally imported client-side, the service role key could leak. |

---

## 4. Proposed Solution: Supabase Email Auth

### 4.1 Architecture Overview

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Landing Page │────▶│  /login      │────▶│ Supabase Auth       │
│  (page.tsx)   │     │  (page.tsx)  │     │ signInWithPassword()│
└──────────────┘     └──────────────┘     └─────────────────────┘
       │                                          │
       │              ┌──────────────┐    JWT session stored in
       └─────────────▶│  /signup     │    secure httpOnly cookies
                      │  (page.tsx)  │    via @supabase/ssr
                      └──────────────┘
                              │
                      Supabase Auth
                      signUp() → email
                      verification sent
```

### 4.2 Technology Stack

| Component | Package | Purpose |
|---|---|---|
| **Auth Client (SSR)** | `@supabase/ssr` | Cookie-based session management for Next.js |
| **Auth Client (Browser)** | `@supabase/ssr` | Browser-side client that shares cookies with server |
| **Auth Provider** | Supabase Auth (built-in) | Email + password sign-up/sign-in |
| **Session Middleware** | Next.js Middleware | Refresh tokens on every request, protect routes |

### 4.3 New Supabase Client Architecture

We need **three** Supabase client factories (per Supabase docs):

```
src/lib/supabase/
├── client.ts        # Browser client — createBrowserClient()
├── server.ts        # Server Component / Route Handler client — createServerClient() with cookies
├── middleware.ts     # Middleware client — createServerClient() with request/response cookies
└── admin.ts         # Service role client (existing, refactored)
```

### 4.4 Auth Flow Details

#### Sign Up Flow
1. User navigates to `/signup`
2. Enters email + password + organization name
3. Client calls `supabase.auth.signUp({ email, password })`
4. Supabase sends a verification email with a confirmation link
5. User clicks the link → redirected to `/auth/callback` route
6. Callback route exchanges the code for a session
7. User is redirected to `/mass-text` (authenticated dashboard)

#### Sign In Flow
1. User navigates to `/login`
2. Enters email + password
3. Client calls `supabase.auth.signInWithPassword({ email, password })`
4. On success → session is stored in cookies → redirect to `/mass-text`
5. On failure → show error message

#### Password Reset Flow
1. User clicks "Forgot password?" on login page
2. Enters their email
3. Client calls `supabase.auth.resetPasswordForEmail(email)`
4. Supabase sends a reset email with a link
5. User clicks link → redirected to `/auth/callback` → `/reset-password`
6. User enters new password → `supabase.auth.updateUser({ password })`

#### Sign Out Flow
1. User clicks "Sign Out" button
2. Client calls `supabase.auth.signOut()`
3. Cookies are cleared → redirect to `/`

---

## 5. Database Schema Changes

### 5.1 New Table: `user_profiles`

This table links a Supabase Auth user (`auth.users.id`) to an organization.

```sql
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    organization_id BIGINT REFERENCES public.organizations(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Allow insert during signup (via trigger or service role)
CREATE POLICY "Enable insert for service role"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);
```

### 5.2 Auto-Create Profile on Sign Up (Database Trigger)

```sql
-- Function to create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5.3 Updated RLS Policies on Existing Tables

Once users are linked to organizations via `user_profiles`, we can write proper RLS policies:

```sql
-- Example: org_members - only org admins can read their org's members
CREATE POLICY "Org admins can read their org members"
    ON public.org_members
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.user_profiles
            WHERE id = auth.uid()
        )
    );
```

*(Similar policies would be created for `events`, `attendance`, `texts_sent`, `emails_sent`, `email_info`, etc.)*

### 5.4 Organizations Table — Access Code Deprecation

The `access_code` column in `organizations` will **NOT be removed immediately**. It will be retained during the migration period, then dropped once all orgs have migrated.

```sql
-- Phase 1: Add a flag to track migration status
ALTER TABLE public.organizations
    ADD COLUMN auth_migrated BOOLEAN NOT NULL DEFAULT FALSE;

-- Phase 3 (post-migration): Drop the access_code column
-- ALTER TABLE public.organizations DROP COLUMN access_code;
```

---

## 6. Affected Files & Impact Analysis

### 6.1 Files to REPLACE (Major Rewrite)

| File | Current Function | New Function |
|---|---|---|
| `src/middleware.ts` | Checks `access-code` cookie | Supabase session refresh + route protection |
| `src/lib/supabase.ts` | Single file with both clients | Split into 4 files (see §4.3) |
| `src/app/access-code/page.tsx` | Access code entry form | **DELETE** — replaced by `/login` |
| `src/app/api/verify-code/route.ts` | Verifies access code → sets cookie | **DELETE** — Supabase handles auth |
| `src/app/api/verify-auth/route.ts` | Verifies access-code cookie | **REWRITE** — verify Supabase session |
| `src/components/GetStartedDialog.tsx` | Links to `/access-code` & `/register` | Links to `/login` & `/signup` |

### 6.2 Files to MODIFY (Auth Pattern Change)

Every API route currently reads the `access-code` cookie and calls `getOrganizationByAccessCode()`. All must be updated to use Supabase session → `user_profiles` → `organization_id`.

| API Route | Lines Affected |
|---|---|
| `src/app/api/fetch-contacts/route.ts` | Lines 16-33 (auth block) |
| `src/app/api/messages/route.ts` | Lines 41-58 (auth block) |
| `src/app/api/sent-messages/route.ts` | Auth block |
| `src/app/api/upload-contacts/route.ts` | Auth block |
| `src/app/api/delete-contact/route.ts` | Auth block |
| `src/app/api/update-contact/route.ts` | Auth block |
| `src/app/api/toggle-opt-out/route.ts` | Auth block |
| `src/app/api/preview-contacts/route.ts` | Auth block |
| `src/app/api/email-sender/route.ts` | Auth block |
| `src/app/api/email-sender-background/route.ts` | Auth block |
| `src/app/api/email-health/route.ts` | Auth block |
| `src/app/api/email-beautify/route.ts` | Auth block |
| `src/app/api/email-conversation/route.ts` | Auth block |
| `src/app/api/ai-assist/route.ts` | Auth block |
| `src/app/api/document-parser/route.ts` | Auth block |

### 6.3 Client Pages to MODIFY

| Page | Change |
|---|---|
| `src/app/mass-text/page.tsx` | Replace `verifyAuth()` fetch call (line 138-163) with Supabase session check |
| `src/app/events/page.tsx` | Replace `verifyAuth()` fetch call (line 65-86) with Supabase session check |
| `src/app/sent-messages/page.tsx` | Same auth pattern change |
| `src/components/LandingPage.tsx` | No change needed (calls GetStartedDialog) |

### 6.4 New Files to CREATE

| File | Purpose |
|---|---|
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client (RSC, Route Handlers) |
| `src/lib/supabase/middleware.ts` | Middleware Supabase client |
| `src/lib/supabase/admin.ts` | Service role client (refactored from current) |
| `src/app/login/page.tsx` | Login page (email + password) |
| `src/app/signup/page.tsx` | Sign-up page (email + password + org linking) |
| `src/app/auth/callback/route.ts` | OAuth/email verification callback handler |
| `src/app/reset-password/page.tsx` | Password reset form |
| `src/app/auth/confirm/route.ts` | Email confirmation handler |
| `src/lib/auth-helpers.ts` | Shared helper: get current user + org from session |

### 6.5 Files with NO Changes Needed

| File | Reason |
|---|---|
| `src/app/join/page.tsx` | Public page — no auth required |
| `src/app/check-in/page.tsx` | Public page — no auth required |
| `src/app/about/page.tsx` | Public page — no auth required |
| `src/app/register/page.tsx` | Public page — org registration (pending_orgs) |
| `src/app/api/webhook/route.ts` | Twilio webhook — uses its own auth |
| `src/app/api/join-org/route.ts` | Public endpoint — no admin auth needed |
| `src/app/api/sms-registration/route.ts` | Twilio webhook — uses its own auth |
| `src/app/api/cleanup-conversations/route.ts` | Cron job — uses service role |

---

## 7. Implementation Plan

### Phase 1: Foundation (Infrastructure) 🏗️
**Estimated effort: 1-2 hours**

1. **Install `@supabase/ssr` package**
   ```bash
   npm install @supabase/ssr
   ```

2. **Create new Supabase client files**
   - `src/lib/supabase/client.ts` — `createBrowserClient()`
   - `src/lib/supabase/server.ts` — `createServerClient()` with `cookies()`
   - `src/lib/supabase/middleware.ts` — `createServerClient()` with request/response
   - `src/lib/supabase/admin.ts` — Service role client (extract from current `supabase.ts`)

3. **Create `user_profiles` table + trigger** (via Supabase migration)

4. **Update `src/middleware.ts`** — Implement Supabase session refresh and route protection

5. **Create auth callback route** — `src/app/auth/callback/route.ts`

### Phase 2: Auth Pages (UI) 🎨
**Estimated effort: 2-3 hours**

1. **Create `/login` page** — Email + password form with error handling
2. **Create `/signup` page** — Email + password + full name + org association
3. **Create `/reset-password` page** — New password entry form
4. **Update `GetStartedDialog.tsx`** — Point to `/login` instead of `/access-code`
5. **Add sign-out button** to the mass-text dashboard header
6. **Add user profile display** — Show logged-in user's name/email in nav

### Phase 3: API Route Migration 🔧
**Estimated effort: 2-3 hours**

1. **Create `src/lib/auth-helpers.ts`** — Shared function to:
   - Get Supabase session from cookies
   - Look up `user_profiles` → get `organization_id`
   - Return `{ user, organization }` or throw 401

2. **Update all 15+ API routes** to use the new auth helper instead of `getOrganizationByAccessCode()`

   **Before (current pattern):**
   ```typescript
   const accessCode = request.cookies.get('access-code');
   if (!accessCode) return 401;
   const organization = await getOrganizationByAccessCode(accessCode.value);
   if (!organization) return 401;
   ```

   **After (new pattern):**
   ```typescript
   const { user, organization } = await getAuthenticatedOrg(request);
   // Throws 401 automatically if not authenticated
   ```

3. **Update client page auth checks** — Replace `fetch('/api/verify-auth')` with direct Supabase session check

### Phase 4: Org Association & Onboarding 🔗
**Estimated effort: 1-2 hours**

1. **New user onboarding flow:**
   - After signup + email verification, user is prompted to either:
     - **Enter an access code** to link to an existing org (one-time use of legacy code)
     - **Register a new organization** (replaces current `/register` flow)
   - Once linked, the user's `user_profiles.organization_id` is set

2. **Create API endpoint** — `/api/link-organization` to handle org association

3. **Handle edge case:** Users who sign up but haven't linked to an org yet

### Phase 5: Cleanup & Hardening 🔒
**Estimated effort: 1 hour**

1. **Delete deprecated files:**
   - `src/app/access-code/page.tsx`
   - `src/app/api/verify-code/route.ts`

2. **Remove `getOrganizationByAccessCode()` from supabase.ts** (after all routes migrated)

3. **Update RLS policies** on all public tables to use `auth.uid()`

4. **Add rate limiting** on auth-related endpoints

5. **Remove old `access-code` references** from middleware

6. **Mark `organizations.access_code` as deprecated** (keep for migration period)

---

## 8. Migration Strategy

### For Existing Organizations

Since the app currently has organizations with access codes, we need a graceful migration path:

1. **During Phase 4**, the signup flow includes an option: *"Link to existing organization"*
2. The user enters their org's legacy access code **once** during signup
3. The system validates and links the user's profile to the org
4. The `organizations.auth_migrated` flag is set to `true`
5. Going forward, the user logs in with email + password

### Data Migration Checklist

- [ ] No user data needs to be migrated (new `user_profiles` table is standalone)
- [ ] Existing `organizations` data stays intact
- [ ] `access_code` column is retained temporarily for the linking flow
- [ ] After all orgs are migrated, `access_code` column can be dropped

---

## 9. UI/UX Design

### 9.1 Login Page (`/login`)

```
┌──────────────────────────────────┐
│                                  │
│            ⚡ Blitz              │
│                                  │
│   Welcome back                   │
│   Sign in to your account        │
│                                  │
│   ┌──────────────────────────┐   │
│   │ Email                    │   │
│   └──────────────────────────┘   │
│   ┌──────────────────────────┐   │
│   │ Password                 │   │
│   └──────────────────────────┘   │
│                                  │
│   [      Sign In             ]   │
│                                  │
│   Forgot your password?          │
│                                  │
│   ─────── or ───────             │
│                                  │
│   Don't have an account?         │
│   Sign Up                        │
│                                  │
└──────────────────────────────────┘
```

### 9.2 Sign Up Page (`/signup`)

```
┌──────────────────────────────────┐
│                                  │
│            ⚡ Blitz              │
│                                  │
│   Create your account            │
│                                  │
│   ┌──────────────────────────┐   │
│   │ Full Name                │   │
│   └──────────────────────────┘   │
│   ┌──────────────────────────┐   │
│   │ Email                    │   │
│   └──────────────────────────┘   │
│   ┌──────────────────────────┐   │
│   │ Password                 │   │
│   └──────────────────────────┘   │
│   ┌──────────────────────────┐   │
│   │ Confirm Password         │   │
│   └──────────────────────────┘   │
│                                  │
│   [      Create Account      ]   │
│                                  │
│   Already have an account?       │
│   Sign In                        │
│                                  │
└──────────────────────────────────┘
```

### 9.3 Post-Signup Org Linking (`/onboarding`)

```
┌──────────────────────────────────┐
│                                  │
│   Link to your Organization      │
│                                  │
│   ┌────────────────────────────┐ │
│   │  I have an access code     │ │
│   │  (for existing orgs)       │ │
│   └────────────────────────────┘ │
│                                  │
│   ┌────────────────────────────┐ │
│   │  Register a new            │ │
│   │  organization              │ │
│   └────────────────────────────┘ │
│                                  │
└──────────────────────────────────┘
```

### 9.4 Dashboard Header Update

Add a user menu to the existing dashboard with:
- User's name/email displayed
- Organization name
- "Sign Out" button

---

## 10. Testing Plan

### 10.1 Auth Flow Tests

| Test Case | Expected Result |
|---|---|
| Sign up with new email | Verification email sent, account created |
| Sign up with existing email | Error: "User already exists" |
| Sign in with correct credentials | Redirect to `/mass-text` |
| Sign in with wrong password | Error: "Invalid credentials" |
| Access `/mass-text` without session | Redirect to `/login` |
| Access `/mass-text` with valid session | Page loads normally |
| Sign out | Session cleared, redirect to `/` |
| Password reset request | Reset email sent |
| Use reset link + set new password | Password updated, can sign in |
| Session expires after inactivity | Automatic token refresh or re-login |

### 10.2 API Route Tests

| Test Case | Expected Result |
|---|---|
| Call any API without session | 401 Unauthorized |
| Call API with valid session, no org linked | 403 Forbidden (no org) |
| Call API with valid session + linked org | Success with correct org data |
| Cross-org access attempt | 403 Forbidden |

### 10.3 Migration Tests

| Test Case | Expected Result |
|---|---|
| New user signs up → links with access code | User profile linked to correct org |
| Access code works during linking | Org association successful |
| Old access-code cookie is ignored | System uses Supabase session only |

---

## 11. Rollback Plan

If critical issues arise during deployment:

1. **Phase 1-2 (before API migration):** Simply revert the middleware to check `access-code` cookies again. No data loss.
2. **Phase 3 (during API migration):** The `getOrganizationByAccessCode()` function remains in the codebase during migration. Routes can be individually reverted.
3. **Phase 5 (cleanup):** Only performed after all testing passes. The `access_code` column is retained in the DB as a safety net.

---

## Appendix A: File Inventory (Access-Code References)

Every file that currently reads the `access-code` cookie and must be updated:

```
src/middleware.ts
src/app/access-code/page.tsx
src/app/api/verify-code/route.ts
src/app/api/verify-auth/route.ts
src/app/api/fetch-contacts/route.ts
src/app/api/messages/route.ts
src/app/api/sent-messages/route.ts
src/app/api/upload-contacts/route.ts
src/app/api/delete-contact/route.ts
src/app/api/update-contact/route.ts
src/app/api/toggle-opt-out/route.ts
src/app/api/preview-contacts/route.ts
src/app/api/email-sender/route.ts
src/app/api/email-sender-background/route.ts
src/app/api/email-health/route.ts
src/app/api/email-beautify/route.ts
src/app/api/email-conversation/route.ts
src/app/api/ai-assist/route.ts
src/app/api/document-parser/route.ts
src/app/mass-text/page.tsx
src/app/events/page.tsx
src/components/GetStartedDialog.tsx
```

**Total: 22 files**

## Appendix B: Key Supabase SSR Patterns (Reference)

### Browser Client (`src/lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_PUBLIC!
    )
}
```

### Server Client (`src/lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_PUBLIC!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )
}
```

### Middleware Client (`src/middleware.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_PUBLIC!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protect routes
    if (!user && !request.nextUrl.pathname.startsWith('/login')
        && !request.nextUrl.pathname.startsWith('/signup')
        && request.nextUrl.pathname.startsWith('/mass-text')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
```

### Auth Helper (`src/lib/auth-helpers.ts`)
```typescript
import { createClient } from '@/lib/supabase/server'

export async function getAuthenticatedOrg() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error('Unauthorized')
    }

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) {
        throw new Error('No organization linked')
    }

    return {
        user,
        profile,
        organization: profile.organizations
    }
}
```
