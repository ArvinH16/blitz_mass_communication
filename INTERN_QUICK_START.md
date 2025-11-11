# Blitz Intern Quick Start Guide

Welcome to the Blitz development team! This guide will help you get started quickly.

---

## 📚 Essential Reading (In This Order)

1. **Start Here**: [BLITZ_EXECUTIVE_SUMMARY.md](./BLITZ_EXECUTIVE_SUMMARY.md) - 10 minute overview
2. **Deep Dive**: [BLITZ_PRD.md](./BLITZ_PRD.md) - Full specifications (read sections relevant to your assignment)
3. **Current App**: [README.md](./README.md) - How to run the existing application
4. **Database**: [database-structure.md](./database-structure.md) - Current database schema

---

## 🎯 What You're Building

You're working on **Blitz** - a club management platform for student organizations. Think of it as:
- **Mailchimp** (for mass emails)
- **+** **Twilio** (for SMS)
- **+** **Google Forms** (for interactive prompts)
- **+** **Analytics Dashboard**

...all in one platform, designed specifically for student clubs.

---

## 🏗️ Project Structure

```
tamid/
├── src/
│   ├── app/                    # Next.js 15 App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── mass-text/         # Main dashboard
│   │   ├── sent-messages/     # Message history
│   │   ├── api/               # Backend API routes
│   │   │   ├── messages/      # SMS endpoints
│   │   │   ├── email-sender/  # Email endpoints
│   │   │   ├── prompts/       # 🆕 You'll add this
│   │   │   ├── roles/         # 🆕 You'll add this
│   │   │   └── email-jobs/    # 🆕 You'll add this
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   └── ...
│   └── lib/                  # Utility functions
│       ├── supabase.ts       # Database functions
│       └── ...
├── database-structure.md     # Current DB schema
├── BLITZ_PRD.md             # Full requirements (your bible)
└── package.json             # Dependencies
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd tamid
bun install  # or npm install
```

### 2. Environment Setup

Create `.env.local` file with these variables (ask your mentor for actual values):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Twilio
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=xxx

# Google Sheets
GOOGLE_SHEET_ID=xxx
GOOGLE_CLIENT_EMAIL=xxx
GOOGLE_PRIVATE_KEY=xxx

# 🆕 OAuth (you might add these)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# 🆕 Redis (for background jobs)
REDIS_URL=xxx
REDIS_PASSWORD=xxx
```

### 3. Run Development Server

```bash
bun run dev  # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Access the Dashboard

1. Go to `/access-code` page
2. Enter access code (ask mentor, or register a test org at `/register`)
3. You'll be redirected to `/mass-text` - the main dashboard

---

## 🎓 Tech Stack Crash Course

### Frontend
- **Next.js 15**: React framework with file-based routing
- **TypeScript**: JavaScript with type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless component library (buttons, dialogs, etc.)
- **Framer Motion**: Animation library

### Backend
- **Next.js API Routes**: Serverless functions in `/src/app/api/`
- **Supabase**: PostgreSQL database + auth (we only use database part currently)
- **Twilio**: SMS API
- **Nodemailer**: Email sending (SMTP)

### Key Concepts
- **Server Components**: Components that run on server (no `'use client'`)
- **Client Components**: Components with `'use client'` directive (use state, effects, etc.)
- **API Routes**: Files named `route.ts` in `/api/` folders
- **TypeScript Interfaces**: Define data shapes (Contact, Message, etc.)

---

## 📝 Feature Assignments

You'll likely be assigned one of these features. Here's what each involves:

### Feature 1: Interactive Prompts 🔴 Advanced
**Skills**: Full-stack, database design, forms, real-time updates

**Tasks**:
- Create `prompts` table in Supabase
- Build API endpoints (`POST /api/prompts`, `GET /api/prompts/:id/responses`)
- Create prompt creation form UI
- Build public response form page
- Implement response dashboard with charts

**Files You'll Touch**:
- `src/app/api/prompts/route.ts` (new)
- `src/app/prompts/page.tsx` (new)
- `src/app/prompts/[id]/page.tsx` (new)
- `src/app/respond/[token]/page.tsx` (new - public form)
- `src/lib/supabase.ts` (add functions)

---

### Feature 2: Roles & Departments 🟡 Intermediate
**Skills**: Database, CRUD operations, forms, filtering

**Tasks**:
- Create `roles` and `departments` tables
- Build role/dept management UI (create, edit, delete)
- Add role/dept selection to member edit form
- Implement filtering in member list
- Add visual badges/tags

**Files You'll Touch**:
- `src/app/api/roles/route.ts` (new)
- `src/app/api/departments/route.ts` (new)
- `src/app/mass-text/page.tsx` (update member list UI)
- `src/lib/supabase.ts` (add functions)

---

### Feature 3: Targeted Messaging 🟢 Beginner-Friendly
**Skills**: Frontend forms, API integration, filtering logic

**Tasks**:
- Add role/dept filters to message sending UI
- Build recipient preview modal
- Update API to accept filter parameters
- Add target audience tags to sent messages page

**Files You'll Touch**:
- `src/app/mass-text/page.tsx` (add filter UI)
- `src/app/api/messages/route.ts` (update to filter recipients)
- `src/app/sent-messages/page.tsx` (show target audience)

---

### Feature 4: OAuth Authentication 🔴 Advanced
**Skills**: Authentication, security, NextAuth.js, OAuth flows

**Tasks**:
- Install and configure NextAuth.js
- Set up Google and GitHub OAuth providers
- Create user and session management
- Build new login page
- Implement admin invitation system
- Migrate from access codes

**Files You'll Touch**:
- `src/app/api/auth/[...nextauth]/route.ts` (new - NextAuth handler)
- `src/app/login/page.tsx` (new)
- `src/middleware.ts` (update auth check)
- `src/lib/supabase.ts` (add user functions)

---

### Feature 5: Background Email Jobs 🔴 Advanced
**Skills**: Job queues, Redis, background workers, real-time updates

**Tasks**:
- Set up BullMQ and Redis
- Create email job tables
- Build job creation and execution logic
- Create job status page with progress tracking
- Implement pause/resume/cancel functionality

**Files You'll Touch**:
- `src/app/api/email-jobs/route.ts` (new)
- `src/workers/email-worker.ts` (new - background worker)
- `src/app/email-jobs/[id]/page.tsx` (new - status page)
- `src/lib/queue.ts` (new - queue setup)

---

### Feature 6: Analytics Dashboard 🟡 Intermediate
**Skills**: Data visualization, charts, SQL queries, aggregations

**Tasks**:
- Create analytics API endpoints (aggregating data)
- Build dashboard with Recharts
- Implement engagement score calculation
- Create export functionality (CSV/PDF)

**Files You'll Touch**:
- `src/app/api/analytics/route.ts` (new)
- `src/app/analytics/page.tsx` (new)
- `src/components/AnalyticsChart.tsx` (new)
- `src/lib/supabase.ts` (add analytics queries)

---

## 🛠️ Common Tasks

### Adding a New API Endpoint

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationByAccessCode } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get access code from cookie
    const accessCode = request.cookies.get('access-code');
    
    if (!accessCode) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get organization
    const organization = await getOrganizationByAccessCode(accessCode.value);
    
    if (!organization) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Your logic here
    const data = { /* ... */ };
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Creating a New Page

```typescript
// src/app/my-page/page.tsx
'use client'; // Only if you need state/effects

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function MyPage() {
  const [data, setData] = useState(null);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Page</h1>
      
      <Card className="p-6">
        {/* Your content */}
      </Card>
    </div>
  );
}
```

### Adding a Database Function

```typescript
// src/lib/supabase.ts

export async function getMyData(orgId: number) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized');
  }
  
  const { data, error } = await supabaseAdmin
    .from('my_table')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }
  
  return data;
}
```

---

## 🎨 UI Component Examples

### Using Existing Components

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function MyComponent() {
  return (
    <>
      <Button>Click Me</Button>
      <Button variant="outline">Secondary</Button>
      <Button variant="destructive">Delete</Button>
      
      <Input placeholder="Enter text..." />
      
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          Card content goes here
        </CardContent>
      </Card>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <div>Dialog content</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## 🐛 Debugging Tips

### Check the Console
- **Browser Console**: `Cmd+Option+I` (Mac) or `F12` (Windows)
- **Server Logs**: Check your terminal where `bun run dev` is running

### Common Issues

**"Unauthorized" error**:
- Make sure you're logged in (have access code cookie)
- Check if access code is valid in database

**Database query failing**:
- Check table exists: Go to Supabase dashboard > Table Editor
- Verify column names match your query
- Check for typos in table/column names

**Component not updating**:
- Make sure you're using state: `const [value, setValue] = useState(...)`
- Check if component has `'use client'` directive at top
- Verify you're calling state setter: `setValue(newValue)`

**TypeScript errors**:
- Read the error message carefully
- Check if types match (string vs number, etc.)
- Add proper type annotations: `const name: string = "John"`

---

## 📖 Learning Resources

### Essential Documentation
- [Next.js Docs](https://nextjs.org/docs) - App Router, API Routes, etc.
- [Tailwind CSS](https://tailwindcss.com/docs) - All CSS utility classes
- [Radix UI](https://www.radix-ui.com/) - Component APIs
- [Supabase Docs](https://supabase.com/docs) - Database queries
- [Twilio Docs](https://www.twilio.com/docs) - SMS API

### Tutorials (If You're New to the Stack)
- **Next.js**: [Next.js Tutorial](https://nextjs.org/learn)
- **TypeScript**: [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- **React**: [React Docs](https://react.dev/learn)
- **Supabase**: [Supabase Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

## 🤝 Collaboration Tips

### Git Workflow
1. **Create feature branch**: `git checkout -b feature/prompts-system`
2. **Make small commits**: `git commit -m "Add prompt creation API"`
3. **Push regularly**: `git push origin feature/prompts-system`
4. **Open PR when ready**: Get code review before merging to main

### Code Review Checklist
Before submitting PR:
- [ ] Code runs without errors
- [ ] TypeScript types are correct (no `any` types)
- [ ] Tested on both desktop and mobile
- [ ] Console has no errors or warnings
- [ ] Code is commented where complex
- [ ] Followed existing code style

### Communication
- **Stuck?**: Ask in Slack/Discord after trying for 30 minutes
- **Blocker?**: Tag your mentor immediately
- **Achievement?**: Share screenshots/demos in group chat!
- **Daily Update**: Post what you did + what's next (async standup)

---

## 🎯 Success Tips

1. **Read the PRD**: Seriously. Read the relevant sections of BLITZ_PRD.md for your feature
2. **Start Small**: Get the simplest version working first, then add features
3. **Test Often**: Refresh the page after every few lines of code
4. **Ask Questions**: No question is stupid. Asking saves time.
5. **Use TypeScript**: Let the type errors guide you
6. **Copy Existing Patterns**: Look at how existing features are built
7. **Take Breaks**: Stuck for 30+ mins? Take a 10 min walk
8. **Celebrate Wins**: Got something working? Show your team!

---

## 📞 Getting Help

### Your Mentor
- Name: [Mentor Name]
- Best Contact Method: [Slack/Discord/Email]
- Office Hours: [Schedule]

### Team Channels
- **Slack/Discord**: `#blitz-dev` channel
- **GitHub Issues**: Tag issues with `question` label
- **Daily Standups**: [Time/Frequency]

### Emergency Contacts
- **Production Down**: [Contact Info]
- **Database Issues**: [Contact Info]

---

## 🎉 Your First Task

Here's a good starter task to get familiar with the codebase:

**Task**: Add a "Total Members" count to the mass-text dashboard

1. Open `src/app/mass-text/page.tsx`
2. Find where contacts are loaded (search for `contacts.length`)
3. Add a new `Card` component showing total count
4. Style it to match existing cards
5. Test it works by adding/removing members

This touches the main page, uses existing components, and helps you understand the structure.

---

## 🚀 Ready to Build!

You got this! Remember:
- The PRD is your guide
- The existing code is your example
- Your team is your support system

Now go build something amazing! 💪

---

**Questions about this guide?** Ask in `#blitz-dev` or tag your mentor.

**Found a bug in this guide?** Submit a PR to fix it!

**Good luck and happy coding! 🎊**

