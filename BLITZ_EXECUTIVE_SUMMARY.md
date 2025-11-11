# Blitz - Executive Summary

## What is Blitz?

**Blitz** is a club management and mass communication platform that enables student organizations to efficiently manage member databases and send targeted communications via SMS and email. Built with Next.js, Supabase, and Twilio.

---

## Current State

### ✅ What Blitz Can Do Today

- **Mass SMS & Email**: Send personalized messages to multiple members simultaneously
- **Contact Management**: Import members from CSV/Excel, Google Sheets, or manual entry
- **Message Tracking**: View history of all sent texts and emails
- **SMS Compliance**: Automatic opt-out handling (STOP, QUIT, etc.)
- **Limits & Quotas**: Monthly SMS and daily email limits per organization
- **Basic Analytics**: Message counts and sent message history
- **AI Features**: Message suggestions and email beautification
- **Access Control**: Organization-based access codes

### ⚠️ Current Limitations

- Simple access code authentication (not OAuth)
- No role-based member organization (President, VP, Tech team, etc.)
- Cannot filter messages by member groups
- No way to send questions and collect responses
- Email sending can fail if page is reloaded
- Limited analytics and insights

---

## Proposed Enhancements

### 🎯 Feature 1: Interactive Member Prompts

**What**: Send questions to members and collect their responses

**Why**: Enable two-way communication for surveys, polls, RSVPs, feedback collection

**Key Capabilities**:
- Create prompts with multiple response types (text, multiple choice, yes/no, rating)
- Send via SMS or email with unique response links
- View responses in real-time dashboard
- See who responded vs. who hasn't
- Send automatic reminders to non-responders
- Export responses for analysis
- Visualize results with charts

**Impact**: Transforms Blitz from broadcast-only to interactive engagement platform

---

### 👥 Feature 2: Role-Based Member Management

**What**: Organize members by roles (President, VP, Member) and departments (Tech, Business, Marketing)

**Why**: Better organization, targeted communication, clearer structure

**Key Capabilities**:
- Assign roles to members (single role per person)
- Assign departments to members (multiple departments possible)
- Filter member lists by role/department
- Create custom roles and departments per organization
- Visual badges and tags for quick identification
- Analytics broken down by role/department

**Impact**: Enables sophisticated member organization and management

---

### 📱 Feature 3: Targeted Mass Communication

**What**: Send messages to specific roles or departments, not just "everyone"

**Why**: Reduce noise, increase relevance, improve engagement

**Key Capabilities**:
- Select target audience by role (e.g., only Presidents)
- Select target audience by department (e.g., only Tech team)
- Combine filters (e.g., "Tech General Members")
- Preview recipient list before sending
- Track which groups were messaged in history
- Filter sent messages by target audience

**Impact**: More relevant communications = higher engagement + less spam

---

### 🔐 Feature 4: OAuth Authentication

**What**: Replace access codes with modern "Sign in with Google/GitHub"

**Why**: Better security, improved UX, enables multi-admin support

**Key Capabilities**:
- Sign in with Google or GitHub
- Multi-admin support (invite additional admins by email)
- Secure session management with JWT tokens
- Remove need to remember/share access codes
- Admin invitation system
- Graceful migration from existing access codes

**Impact**: Professional authentication system, easier onboarding, better security

---

### ⚙️ Feature 5: Background Email Jobs

**What**: Make email sending resilient to page reloads and connection drops

**Why**: Current system loses all progress if user closes browser or loses connection

**Key Capabilities**:
- Create email job and close browser safely
- Real-time progress tracking
- Pause, resume, or cancel jobs
- Automatic retry of failed emails
- Jobs dashboard showing all current and past jobs
- Notifications when jobs complete
- Detailed error logs and reports

**Impact**: Reliable email delivery, no more lost progress, better admin experience

---

### 📊 Feature 6: Enhanced Analytics

**What**: Comprehensive insights into member engagement and communication effectiveness

**Why**: Data-driven decisions, identify disengaged members, optimize strategy

**Key Capabilities**:
- Dashboard with key metrics (total members, engagement rate, message volume)
- Charts showing communication trends over time
- Member engagement scores
- Identify inactive members
- Compare SMS vs. Email effectiveness
- Analyze prompt response rates
- Export reports as PDF/CSV
- Scheduled weekly/monthly reports

**Impact**: Transform data into actionable insights for better club management

---

## Technical Overview

### Architecture
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with OAuth
- **Job Queue**: BullMQ + Redis (or database-backed queue)
- **SMS**: Twilio API
- **Email**: Nodemailer with background processing
- **Charts**: Recharts
- **Deployment**: Vercel

### New Database Tables
- `users` - OAuth user accounts
- `roles` - Organization roles
- `departments` - Organization departments
- `prompts` - Interactive questions
- `prompt_responses` - Member responses
- `email_jobs` - Background email jobs
- `email_job_items` - Individual emails in a job

---

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-3)
- OAuth authentication
- Role & department system
- Database migrations

### Phase 2: Core Features (Weeks 4-7)
- Targeted mass communication
- Interactive prompts (backend & frontend)
- Testing & polish

### Phase 3: Jobs & Analytics (Weeks 8-11)
- Background job queue
- Job management UI
- Analytics backend & frontend

### Phase 4: Launch (Weeks 12-14)
- Integration testing
- Documentation
- Beta testing
- Production deployment

**Total Timeline**: ~14 weeks (3.5 months)

---

## Success Metrics

### Adoption Targets
- 80% of orgs migrate to OAuth within 3 months
- 60% of orgs use roles/departments within 1 month
- 50% of messages use targeted filters
- Average 3 prompts per org per month
- 95% email job success rate
- 70% of admins view analytics weekly

### Technical Targets
- < 2s page load time (p95)
- < 500ms API response time (p95)
- 99.9% uptime
- < 0.1% error rate

### User Satisfaction
- NPS score of 50+
- 80% rate features as "useful"
- 90% org retention after 3 months

---

## Risk Management

| Risk | Mitigation |
|------|------------|
| **OAuth migration resistance** | Keep access codes working during transition, offer migration support |
| **Background job failures** | Comprehensive error logging, alerting, retry logic, manual intervention tools |
| **Database performance** | Strategic indexes, caching, read replicas, archive old data |
| **Scope creep** | Stick to MVP, phased rollout, regular progress check-ins |
| **Low adoption** | User research, beta testing, compelling onboarding, training webinars |

---

## Resources Required

### Development Team
- **1 Full-Stack Engineer** (primary developer)
- **1 Backend Engineer** (background jobs & OAuth)
- **1 Frontend Engineer** (UI/UX implementation)
- **1 Designer** (UI mockups & user flows)
- **1 Project Manager** (coordination & timeline management)

### Infrastructure
- **Redis instance** for job queue (Upstash or Vercel KV) - ~$10-20/month
- **Increased Supabase tier** for more database storage/connections - ~$25/month
- **OAuth app registrations** (Google Cloud, GitHub) - Free
- **Error monitoring** (Sentry) - ~$26/month for team plan

**Total Additional Monthly Cost**: ~$60-70/month

---

## Business Value

### For Admins
- **Save time**: Background jobs mean less babysitting
- **Better insights**: Data-driven decisions with analytics
- **Targeted comms**: Stop spamming everyone with irrelevant messages
- **Professional auth**: No more sharing access codes

### For Members
- **Less spam**: Only receive relevant messages for their role/dept
- **Better engagement**: Can respond to prompts and provide feedback
- **Modern UX**: Sign in with Google/GitHub

### For Organizations
- **Higher engagement**: More relevant communications = better response rates
- **Better organization**: Clear roles and departments
- **Professionalism**: Modern platform that looks good to prospective members
- **Scalability**: System can handle 1000+ member organizations

---

## Next Steps

1. **Review & Approve PRD**: Get stakeholder sign-off on full PRD document
2. **Form Team**: Assign developers and designer
3. **Set Up Infrastructure**: Create Redis instance, upgrade Supabase
4. **Kick Off Sprint 1**: Begin OAuth implementation (Week 1)
5. **Weekly Check-ins**: Every Monday to review progress and blockers

---

## Questions?

See the full [Product Requirements Document (BLITZ_PRD.md)](./BLITZ_PRD.md) for detailed specifications, database schemas, API endpoints, and implementation details.

---

**Prepared by**: AI Assistant  
**Date**: October 28, 2025  
**Status**: Ready for Review  
**Contact**: [Your Name] for questions or clarifications

