# Blitz - Product Overview & Requirements Document

## Table of Contents
1. [Current Application Overview](#current-application-overview)
2. [Product Requirements Document (PRD)](#product-requirements-document-prd)
3. [Technical Architecture](#technical-architecture)
4. [Implementation Roadmap](#implementation-roadmap)

---

## Current Application Overview

### What is Blitz?

**Blitz** is a comprehensive club management and mass communication platform designed to streamline how student organizations communicate with their members. Built with Next.js, Supabase, and Twilio, Blitz enables club administrators to efficiently manage member databases and send targeted communications at scale.

### Current Features

#### 🔐 **Authentication & Access Control**
- **Access Code-Based Authentication**: Organizations are assigned unique access codes for secure login
- **Cookie-based Session Management**: Sessions persist across page refreshes
- **Organization Registration**: New organizations can register and receive their own workspace
- **Member Join Flow**: Members can join organizations via QR codes or direct links

#### 📱 **Mass SMS Communication**
- **Twilio Integration**: Send text messages to multiple recipients simultaneously
- **Contact Import Methods**:
  - CSV/Excel file upload with field mapping
  - Google Sheets API integration for automatic roster syncing
  - Manual contact entry
- **Message Personalization**: Dynamic `{name}` variable replacement in messages
- **SMS Compliance**: 
  - Automatic opt-out messaging ("Reply QUIT to stop")
  - Honors opt-out requests (STOP, QUIT, CANCEL, etc.)
  - Opt-in support (START, YES, OPTIN)
- **Monthly Message Limits**: Tracks and enforces organization-specific message quotas
- **Real-time Feedback**: Shows success/failure status for each message sent

#### 📧 **Mass Email Communication**
- **SMTP Integration**: Gmail/Nodemailer-based email sending
- **HTML Email Support**: AI-powered email beautification feature
- **Subject Line Personalization**: Dynamic variables in subject lines
- **Daily Email Limits**: Prevents exceeding email provider restrictions
- **Throttling**: Built-in delays between emails to respect server limits

#### 👥 **Contact Management**
- **Centralized Database**: All members stored in Supabase
- **CRUD Operations**:
  - Add contacts manually
  - Edit existing contact information
  - Delete contacts
  - Bulk upload via CSV/Excel
- **Contact Fields**:
  - First Name / Last Name
  - Phone Number
  - Email Address
  - Opt-out Status
  - Custom "Other" field for additional data
- **Duplicate Detection**: Flags potential duplicate contacts during upload
- **Data Validation**: Email and phone number format validation

#### 📊 **Basic Analytics & History**
- **Sent Messages Dashboard**: View all previously sent texts and emails
- **Search Functionality**: Filter messages by content or recipient
- **Message Counts**: Track total texts and emails sent
- **Pagination**: Browse through message history efficiently
- **Timestamp Tracking**: See when each message was sent

#### 🤖 **AI-Powered Features**
- **Message Assistant**: AI suggestions for message content
- **Email Beautification**: Convert plain text emails to formatted HTML
- **Document Parser**: Extract contact information from documents

#### 🎨 **User Experience**
- **Modern UI**: Built with Radix UI and Tailwind CSS
- **Responsive Design**: Works on desktop and mobile
- **Animated Backgrounds**: Engaging visual design
- **Loading States**: Progress indicators for long operations
- **Error Handling**: Clear feedback for failed operations

### Current Technical Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **UI Components** | Radix UI, Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes (Serverless Functions) |
| **Database** | Supabase (PostgreSQL) |
| **SMS** | Twilio API |
| **Email** | Nodemailer (SMTP) |
| **File Processing** | xlsx, csv-parse, mammoth |
| **AI** | Google Generative AI (Gemini), OpenAI |
| **Authentication** | Cookie-based sessions |
| **Deployment** | Vercel |

### Current Database Schema

```
organizations
├── id (PK)
├── chapter_name
├── access_code
├── twilio_number
├── message_limit (monthly)
├── message_sent (current month count)
├── email_remaining (daily limit)
├── emails_sent (current day count)
├── last_message_sent (date)
└── last_email_sent (date)

org_members
├── id (PK)
├── organization_id (FK)
├── first_name
├── last_name
├── email
├── phone_number
├── opted_out (boolean)
└── other (custom field)

texts_sent
├── id (PK)
├── org_id (FK)
├── content
├── receiver (phone number)
└── created_at

emails_sent
├── id (PK)
├── org_id (FK)
├── subject
├── content
├── receiver (email)
└── created_at

email_info
├── id (PK)
├── organization_id (FK)
├── email_user_name (SMTP username)
└── email_passcode (SMTP password)

conversation_states
├── phone_number (unique)
├── state (for SMS registration flow)
├── organization_id (FK)
├── name
├── email
└── expires_at (24hr TTL)
```

### Current Limitations

1. **Authentication**: Simple access code system lacks modern security standards (no OAuth)
2. **Email Reliability**: Synchronous email sending can timeout or fail if connection is lost
3. **Member Management**: No role-based organization or departmental grouping
4. **Targeted Messaging**: Cannot filter recipients by roles/departments
5. **Interactive Communication**: No way to send prompts and collect member responses
6. **Analytics**: Limited insights into member engagement and communication effectiveness
7. **Admin Controls**: Basic member management without granular permissions or advanced filtering

---

## Product Requirements Document (PRD)

### Vision Statement

Transform Blitz from a simple mass communication tool into a comprehensive club management platform that enables intelligent, targeted communication and provides deep insights into member engagement. Administrators should be able to organize members by roles/departments, send interactive prompts, track all communications in a unified dashboard, and leverage secure OAuth authentication.

---

## Feature 1: Interactive Member Prompts & Response Collection

### Overview
Enable administrators to send questions or prompts to members and collect, view, and analyze their responses in real-time. This feature transforms Blitz from one-way broadcasting to two-way communication.

### User Stories

**As an admin**, I want to:
- Send a question to all members or specific groups
- See who has responded and who hasn't
- View individual responses in an organized dashboard
- Export responses for analysis
- Set response deadlines
- Send reminder notifications to non-responders

**As a member**, I want to:
- Receive prompts via SMS or email
- Respond easily through a web interface or by replying directly
- See confirmation that my response was recorded
- Update my response before a deadline

### Functional Requirements

#### FR1.1: Prompt Creation Interface
- **Input Fields**:
  - Prompt title (internal reference)
  - Question text (supports markdown/rich text)
  - Response type: Multiple choice, text, number, yes/no, rating scale
  - Delivery method: SMS, Email, or Both
  - Target audience: All members, specific roles, specific departments, custom selection
  - Optional response deadline
  - Optional follow-up reminder schedule

#### FR1.2: Prompt Delivery
- Prompts delivered via SMS include a unique link to a response form
- Email prompts include embedded forms or links
- SMS responses can be collected via reply (for simple yes/no questions)
- Each prompt generates a unique tracking ID

#### FR1.3: Response Collection Dashboard
- **Overview Panel**:
  - Total prompts sent
  - Response rate (percentage)
  - Average response time
  - Status filters: All, Responded, Not Responded, Pending
  
- **Individual Response View**:
  - Member name and contact info
  - Response timestamp
  - Response content
  - Response edit history (if allowed)
  
- **Bulk Actions**:
  - Send reminders to non-responders
  - Export responses as CSV/Excel
  - Close prompt (stop accepting responses)

#### FR1.4: Response Analytics
- Visualize multiple-choice responses with charts
- Word clouds for text responses
- Time-series graphs showing response patterns
- Compare response rates across different member groups

#### FR1.5: Automated Reminders
- Schedule automatic reminders X hours/days before deadline
- Smart reminders only sent to non-responders
- Customizable reminder message templates

### Database Schema Changes

```sql
-- New table: prompts
CREATE TABLE prompts (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  response_type TEXT NOT NULL, -- 'text', 'multiple_choice', 'yes_no', 'rating', 'number'
  response_options JSONB, -- For multiple choice options
  
  delivery_method TEXT NOT NULL, -- 'sms', 'email', 'both'
  target_audience JSONB NOT NULL, -- {type: 'all'|'roles'|'departments'|'custom', values: [...]}
  
  deadline TIMESTAMP WITH TIME ZONE,
  reminder_schedule JSONB, -- {enabled: boolean, intervals: [24, 2]} hours before deadline
  
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'closed'
  sent_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  
  total_recipients INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0
);

-- New table: prompt_responses
CREATE TABLE prompt_responses (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  prompt_id BIGINT REFERENCES prompts(id) ON DELETE CASCADE,
  member_id BIGINT REFERENCES org_members(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  response_text TEXT,
  response_data JSONB, -- For structured responses (rating, multiple choice, etc.)
  
  submitted_via TEXT, -- 'sms', 'email', 'web_form'
  ip_address TEXT,
  
  is_edited BOOLEAN DEFAULT FALSE,
  edit_count INTEGER DEFAULT 0,
  
  UNIQUE(prompt_id, member_id)
);

-- New table: prompt_deliveries
CREATE TABLE prompt_deliveries (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  prompt_id BIGINT REFERENCES prompts(id) ON DELETE CASCADE,
  member_id BIGINT REFERENCES org_members(id) ON DELETE CASCADE,
  
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_method TEXT NOT NULL, -- 'sms', 'email'
  delivery_status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'bounced'
  
  reminder_sent_at TIMESTAMP WITH TIME ZONE[],
  
  UNIQUE(prompt_id, member_id, delivery_method)
);

-- Indexes
CREATE INDEX idx_prompts_org_id ON prompts(organization_id);
CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_prompt_responses_prompt_id ON prompt_responses(prompt_id);
CREATE INDEX idx_prompt_responses_member_id ON prompt_responses(member_id);
CREATE INDEX idx_prompt_deliveries_prompt_id ON prompt_deliveries(prompt_id);
```

### API Endpoints

```
POST   /api/prompts                    - Create new prompt
GET    /api/prompts                    - List all prompts for org
GET    /api/prompts/:id                - Get prompt details
PUT    /api/prompts/:id                - Update prompt
DELETE /api/prompts/:id                - Delete prompt
POST   /api/prompts/:id/send           - Send prompt to members
POST   /api/prompts/:id/close          - Close prompt (stop accepting responses)

GET    /api/prompts/:id/responses      - Get all responses for a prompt
POST   /api/prompts/:id/responses      - Submit a response (public endpoint)
PUT    /api/prompts/:id/responses/:responseId - Update a response
DELETE /api/prompts/:id/responses/:responseId - Delete a response

GET    /api/prompts/:id/analytics      - Get analytics for a prompt
POST   /api/prompts/:id/remind         - Send reminders to non-responders
GET    /api/prompts/:id/export         - Export responses as CSV

GET    /api/prompts/respond/:token     - Public form to respond (token-based)
POST   /api/prompts/respond/:token     - Submit response via public form
```

### UI Mockups/Wireframes Needed

1. **Prompts Dashboard** - List view of all prompts with status, response rates
2. **Create Prompt Modal** - Form to create new prompt with all options
3. **Prompt Details Page** - Overview with analytics and response list
4. **Response Collection View** - Table/cards showing individual responses
5. **Public Response Form** - Mobile-friendly form members see when clicking link
6. **Analytics Dashboard** - Charts and visualizations for prompt insights

### Success Metrics

- **Adoption Rate**: % of admins who create at least one prompt in first month
- **Response Rate**: Average % of members who respond to prompts
- **Time to Response**: Median time between prompt delivery and response
- **Reminder Effectiveness**: Response rate increase after reminders sent
- **Feature Usage**: Number of prompts created per organization per month

---

## Feature 2: Role-Based Member Management

### Overview
Organize members into roles (President, VP, Treasurer, etc.) and departments (Tech, Business, Marketing, etc.) for better management and targeted communication. Enable filtering, searching, and bulk operations based on these attributes.

### User Stories

**As an admin**, I want to:
- Assign roles to members (single role per member)
- Assign departments to members (multiple departments possible)
- Filter member lists by role and/or department
- See role/department tags on member profiles
- Update roles/departments in bulk
- Generate reports by role/department

**As a member**, I want to:
- See my assigned role and department(s) in my profile
- Receive communications relevant to my role/department

### Functional Requirements

#### FR2.1: Role & Department Management
- **Predefined Roles** (customizable per org):
  - Executive Board (President, VP, Treasurer, Secretary)
  - Committee Chairs
  - General Member
  - Alumni
  - Prospective Member
  
- **Predefined Departments** (customizable per org):
  - Technology/Engineering
  - Business/Finance
  - Marketing/PR
  - Events
  - Operations
  - Education/Academic

- **Admin Interface**:
  - Create/edit/delete custom roles
  - Create/edit/delete custom departments
  - Set role hierarchy (for future permission features)
  - Color-code roles and departments

#### FR2.2: Member Assignment Interface
- **Individual Assignment**:
  - Edit member profile to select role (single select)
  - Edit member profile to select departments (multi-select)
  
- **Bulk Assignment**:
  - Select multiple members via checkboxes
  - Apply role or department to all selected
  - Import from CSV with role/department columns

#### FR2.3: Enhanced Member List View
- **Filtering**:
  - Filter by role (dropdown)
  - Filter by department (multi-select)
  - Combine filters (e.g., "Tech Department + General Member")
  - Save filter presets
  
- **Visual Indicators**:
  - Role badge on each member card
  - Department tags (color-coded)
  - Quick stats at top: "45 Tech Members, 12 Business Members..."

#### FR2.4: Role-Based Analytics Dashboard
- **Member Distribution**:
  - Pie chart: Members by role
  - Pie chart: Members by department
  - Bar chart: Department size comparison
  
- **Engagement Metrics**:
  - Response rates by role
  - Response rates by department
  - Opt-out rates by group
  
- **Communication History**:
  - Messages sent to each role/department
  - Filter sent messages by target group

### Database Schema Changes

```sql
-- New table: roles
CREATE TABLE roles (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color for UI badges
  hierarchy_level INTEGER DEFAULT 0, -- Higher = more permissions (future use)
  is_system_role BOOLEAN DEFAULT FALSE, -- Cannot be deleted
  
  UNIQUE(organization_id, name)
);

-- New table: departments
CREATE TABLE departments (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color for UI tags
  lead_member_id BIGINT REFERENCES org_members(id) ON DELETE SET NULL, -- Department lead
  
  UNIQUE(organization_id, name)
);

-- Add to org_members table:
ALTER TABLE org_members ADD COLUMN role_id BIGINT REFERENCES roles(id) ON DELETE SET NULL;

-- New table: member_departments (many-to-many)
CREATE TABLE member_departments (
  member_id BIGINT REFERENCES org_members(id) ON DELETE CASCADE,
  department_id BIGINT REFERENCES departments(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (member_id, department_id)
);

-- Indexes
CREATE INDEX idx_org_members_role_id ON org_members(role_id);
CREATE INDEX idx_roles_org_id ON roles(organization_id);
CREATE INDEX idx_departments_org_id ON departments(organization_id);
CREATE INDEX idx_member_departments_member_id ON member_departments(member_id);
CREATE INDEX idx_member_departments_dept_id ON member_departments(department_id);

-- Add to texts_sent and emails_sent tables:
ALTER TABLE texts_sent ADD COLUMN target_roles BIGINT[];
ALTER TABLE texts_sent ADD COLUMN target_departments BIGINT[];
ALTER TABLE emails_sent ADD COLUMN target_roles BIGINT[];
ALTER TABLE emails_sent ADD COLUMN target_departments BIGINT[];
```

### API Endpoints

```
-- Roles
POST   /api/roles                      - Create new role
GET    /api/roles                      - List all roles for org
PUT    /api/roles/:id                  - Update role
DELETE /api/roles/:id                  - Delete role

-- Departments
POST   /api/departments                - Create new department
GET    /api/departments                - List all departments for org
PUT    /api/departments/:id            - Update department
DELETE /api/departments/:id            - Delete department

-- Member Assignment
PUT    /api/members/:id/role           - Assign role to member
PUT    /api/members/:id/departments    - Assign departments to member
POST   /api/members/bulk-assign-role   - Bulk assign role to multiple members
POST   /api/members/bulk-assign-dept   - Bulk assign department to multiple members

-- Analytics
GET    /api/analytics/by-role          - Get stats grouped by role
GET    /api/analytics/by-department    - Get stats grouped by department
GET    /api/analytics/engagement       - Engagement metrics by groups
```

### UI Mockups/Wireframes Needed

1. **Roles Management Page** - CRUD interface for roles
2. **Departments Management Page** - CRUD interface for departments
3. **Enhanced Member List** - With role badges, department tags, and filters
4. **Bulk Assignment Modal** - Select members and assign role/dept
5. **Member Edit Form** - With role dropdown and department multi-select
6. **Analytics Dashboard** - Charts showing distribution and engagement by groups

---

## Feature 3: Targeted Mass Communication by Role/Department

### Overview
Enable admins to send mass texts and emails to specific roles or departments instead of all members. Integrates seamlessly with the role/department system from Feature 2.

### User Stories

**As an admin**, I want to:
- Select target roles when composing a message
- Select target departments when composing a message
- Combine multiple roles and departments (OR logic)
- Preview recipient list before sending
- See message history filtered by target groups
- Automatically exclude opted-out members from targeted groups

### Functional Requirements

#### FR3.1: Enhanced Recipient Selection Interface
- **Current Behavior**: Upload CSV or select all contacts from database
- **New Behavior**: Add filtering step before sending

- **Recipient Source Options**:
  1. All Members (current default)
  2. Specific Roles (multi-select dropdown)
  3. Specific Departments (multi-select dropdown)
  4. Custom Selection (checkboxes)
  5. Upload CSV (current functionality preserved)

- **Filter Logic**:
  - Multiple roles = OR logic (e.g., "Presidents OR VPs")
  - Multiple departments = OR logic (e.g., "Tech OR Marketing")
  - Roles + Departments = AND logic (e.g., "Tech members who are General Members")
  - Option to switch between AND/OR logic

#### FR3.2: Recipient Preview
- **Before Sending**:
  - Show count: "This message will be sent to 47 members"
  - Display list of recipients (name, role, department)
  - Option to manually exclude specific individuals
  - Show estimated cost (for SMS)

- **Warning Messages**:
  - "You are about to message all Executive Board members (12 people)"
  - "Some recipients have opted out and will be skipped (3 people)"

#### FR3.3: Updated Sending Flow
- **For SMS**:
  - Select "By Role/Department" option
  - Choose filters
  - Preview recipients
  - Compose message
  - Send (existing rate limiting applies)

- **For Email**:
  - Same flow as SMS
  - HTML beautification still available
  - Background sending for large groups

#### FR3.4: Enhanced Message History
- **Existing `/sent-messages` page updated**:
  - Add "Target Audience" column showing roles/depts
  - Filter sent messages by target audience
  - Tags showing "All Members", "Tech Dept", "Presidents", etc.

### Database Schema Changes

```sql
-- Already added to Feature 2 schema:
ALTER TABLE texts_sent ADD COLUMN target_roles BIGINT[];
ALTER TABLE texts_sent ADD COLUMN target_departments BIGINT[];
ALTER TABLE texts_sent ADD COLUMN target_filter_logic TEXT; -- 'and' or 'or'
ALTER TABLE texts_sent ADD COLUMN target_count INTEGER; -- Number of recipients

ALTER TABLE emails_sent ADD COLUMN target_roles BIGINT[];
ALTER TABLE emails_sent ADD COLUMN target_departments BIGINT[];
ALTER TABLE emails_sent ADD COLUMN target_filter_logic TEXT;
ALTER TABLE emails_sent ADD COLUMN target_count INTEGER;

-- Indexes for filtering
CREATE INDEX idx_texts_sent_target_roles ON texts_sent USING GIN(target_roles);
CREATE INDEX idx_texts_sent_target_depts ON texts_sent USING GIN(target_departments);
CREATE INDEX idx_emails_sent_target_roles ON emails_sent USING GIN(target_roles);
CREATE INDEX idx_emails_sent_target_depts ON emails_sent USING GIN(target_departments);
```

### API Endpoints

```
POST   /api/messages/preview           - Preview recipients based on filters
GET    /api/messages/count              - Get recipient count for filters

-- Updated existing endpoints:
POST   /api/messages                    - Now accepts role/dept filters
POST   /api/email-sender                - Now accepts role/dept filters
POST   /api/email-sender-background     - Now accepts role/dept filters
```

### Request Body Example

```json
{
  "message": "Hi {name}, don't forget our Tech team meeting!",
  "filters": {
    "roles": [3, 5],           // Role IDs
    "departments": [1, 2],     // Department IDs
    "logic": "or",             // 'and' or 'or'
    "excludeOptedOut": true
  },
  "deliveryMethod": "sms"
}
```

### UI Mockups/Wireframes Needed

1. **Updated Mass Text Page** - Recipient selection step with role/dept filters
2. **Filter Builder** - Visual interface to build AND/OR filter logic
3. **Recipient Preview Modal** - List of selected recipients before sending
4. **Updated Sent Messages Page** - Target audience tags and filters

---

## Feature 4: OAuth Authentication

### Overview
Replace the current access code system with modern OAuth 2.0 authentication supporting Google and GitHub. Provides better security, user experience, and enables future permission-based features.

### User Stories

**As an admin**, I want to:
- Sign in with my Google or GitHub account
- Not have to remember access codes
- Invite team members by email with automatic access
- Manage who has access to the organization dashboard
- Revoke access when someone leaves

**As a new user**, I want to:
- Quickly sign up using my existing Google/GitHub account
- Not have to create yet another password

### Functional Requirements

#### FR4.1: OAuth Provider Integration
- **Supported Providers**:
  - Google OAuth 2.0
  - GitHub OAuth
  - (Future: Microsoft, Apple)

- **OAuth Flow**:
  1. User clicks "Sign in with Google/GitHub"
  2. Redirected to provider's consent screen
  3. User authorizes Blitz
  4. Provider redirects back with authorization code
  5. Backend exchanges code for access token
  6. User profile created/updated in database
  7. Session cookie created

#### FR4.2: User & Organization Association
- **On First Sign-In**:
  - Check if user exists in `users` table (by email)
  - If new user, determine if they should be associated with existing org:
    - Check for pending invitation
    - Allow user to enter org join code
    - Or create new organization
  
- **Multi-Organization Support**:
  - Users can belong to multiple organizations (future feature)
  - Currently: One user = one primary organization
  - Profile stores: `user_id`, `organization_id`, `role_in_org`

#### FR4.3: Admin Management
- **Organization Admins**:
  - First user to create org = Super Admin
  - Super Admin can invite additional admins
  - Admins have full access to org dashboard
  
- **Admin Invitation Flow**:
  1. Current admin enters email address
  2. System sends invitation email with magic link
  3. Recipient clicks link and signs in with OAuth
  4. Automatically associated with organization

#### FR4.4: Migration Path from Access Codes
- **Graceful Migration**:
  - Existing organizations keep access codes initially
  - First admin to sign in with OAuth "claims" the organization
  - Enter current access code during OAuth onboarding
  - Access code still works during transition period
  - Eventually deprecated after all orgs migrate

- **Migration UI**:
  - Landing page offers both options: "Sign In with OAuth" or "Enter Access Code"
  - Banner on access code login: "Upgrade to OAuth for better security"

#### FR4.5: Session Management
- **Technology**: 
  - Use NextAuth.js for OAuth handling
  - JWT tokens stored in secure, httpOnly cookies
  - Refresh token rotation for enhanced security
  
- **Session Duration**:
  - Access token: 1 hour
  - Refresh token: 30 days
  - Auto-logout after 30 days of inactivity

### Database Schema Changes

```sql
-- New table: users
CREATE TABLE users (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  
  -- OAuth provider info
  oauth_provider TEXT NOT NULL, -- 'google', 'github'
  oauth_provider_id TEXT NOT NULL, -- Provider's user ID
  oauth_access_token TEXT, -- Encrypted
  oauth_refresh_token TEXT, -- Encrypted
  oauth_token_expires_at TIMESTAMP WITH TIME ZONE,
  
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(oauth_provider, oauth_provider_id)
);

-- New table: org_admins (junction table)
CREATE TABLE org_admins (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  
  role TEXT DEFAULT 'admin', -- 'super_admin', 'admin', 'viewer' (future)
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE(user_id, organization_id)
);

-- New table: org_invitations
CREATE TABLE org_invitations (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by BIGINT REFERENCES users(id) ON DELETE CASCADE,
  
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  invitation_token TEXT UNIQUE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  status TEXT DEFAULT 'pending' -- 'pending', 'accepted', 'expired', 'revoked'
);

-- Add to organizations table:
ALTER TABLE organizations ADD COLUMN created_by BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_org_admins_user_id ON org_admins(user_id);
CREATE INDEX idx_org_admins_org_id ON org_admins(organization_id);
CREATE INDEX idx_org_invitations_token ON org_invitations(invitation_token);
CREATE INDEX idx_org_invitations_email ON org_invitations(email);
```

### API Endpoints

```
-- OAuth
GET    /api/auth/signin/:provider      - Initiate OAuth flow (Google/GitHub)
GET    /api/auth/callback/:provider    - OAuth callback handler
POST   /api/auth/signout                - Sign out user
GET    /api/auth/session                - Get current session

-- User Management
GET    /api/user/me                     - Get current user profile
PUT    /api/user/me                     - Update user profile
GET    /api/user/organizations          - List organizations user belongs to
POST   /api/user/switch-org/:orgId      - Switch active organization

-- Admin Management
GET    /api/org/admins                  - List all admins for current org
POST   /api/org/admins/invite           - Send invitation to new admin
DELETE /api/org/admins/:userId          - Remove admin access
GET    /api/org/invitations             - List pending invitations
DELETE /api/org/invitations/:id         - Revoke invitation

-- Organization Claiming (for migration)
POST   /api/org/claim                   - Claim existing org with access code
```

### Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# GitHub OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=xxx (random secret for JWT signing)

# Session
SESSION_COOKIE_NAME=blitz-session
SESSION_MAX_AGE=2592000 (30 days)
```

### Third-Party Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for dev)
6. Copy Client ID and Client Secret

#### GitHub OAuth Setup
1. Go to GitHub Settings > Developer Settings > OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`
4. Copy Client ID and Client Secret

### Security Considerations

- **Token Storage**: OAuth tokens encrypted at rest in database
- **CSRF Protection**: NextAuth handles CSRF tokens automatically
- **XSS Protection**: httpOnly cookies prevent JavaScript access
- **Session Fixation**: New session ID generated after login
- **Rate Limiting**: Limit failed login attempts per IP
- **HTTPS Only**: Enforce HTTPS in production for cookie security

### UI Mockups/Wireframes Needed

1. **New Login Page** - OAuth buttons + legacy access code option
2. **OAuth Consent Screen** - What Blitz requests from Google/GitHub
3. **Post-Login Org Selection** - If user belongs to multiple orgs
4. **Admin Management Page** - List of admins, invite button
5. **Invitation Email Template** - Email sent to new admin invites
6. **Account Settings Page** - User profile, connected accounts
7. **Organization Claiming Flow** - UI to migrate from access code

---

## Feature 5: Background Email Jobs & Queue System

### Overview
Replace synchronous email sending with a robust background job system that prevents data loss from page reloads, connection drops, or timeouts. Provides real-time progress tracking and reliable email delivery.

### User Stories

**As an admin**, I want to:
- Start a mass email send and close my browser without losing progress
- See real-time progress of email sending jobs
- Pause and resume email sending jobs
- Retry failed emails
- Receive notifications when email jobs complete
- View a history of all email jobs and their statuses

### Functional Requirements

#### FR5.1: Job Queue System
- **Technology**: Redis-based queue (e.g., BullMQ) or database-backed queue
- **Job Types**:
  - Email sending jobs
  - SMS sending jobs (future)
  - CSV export jobs (future)
  
- **Job Lifecycle**:
  1. Admin creates mass email
  2. Job created in "pending" state
  3. Backend worker picks up job
  4. Emails sent in batches with throttling
  5. Progress updated in real-time
  6. Job marked "completed" or "failed"

#### FR5.2: Email Job Creation
- **On Form Submit**:
  - Validate inputs (subject, message, recipients)
  - Create job record in database
  - Add job to queue
  - Redirect to job status page
  - Show success: "Email job created! Sending to 120 members..."

- **Job Configuration**:
  - Batch size (e.g., send 50 emails, then pause 30 seconds)
  - Max retry attempts for failed emails
  - Priority (high/normal/low)
  - Scheduled send time (future feature)

#### FR5.3: Real-Time Progress Tracking
- **Job Status Page**:
  - Live progress bar (0-100%)
  - Stats: "42 of 120 sent | 2 failed | 76 remaining"
  - Estimated time remaining
  - Current action: "Sending batch 3 of 12..."
  - Recent activity log
  
- **WebSocket Updates**:
  - Server pushes progress updates every 5 seconds
  - Or client polls API endpoint every 3 seconds
  - Updates appear without page refresh

#### FR5.4: Job Management Interface
- **Jobs Dashboard**:
  - List of all email/SMS jobs
  - Filters: All, Running, Completed, Failed, Paused
  - Sortable by date, status, recipient count
  - Search by content or subject

- **Job Actions**:
  - Pause job (if running)
  - Resume job (if paused)
  - Cancel job (if pending/running)
  - Retry failed emails (if completed with failures)
  - View detailed logs
  - Download error report

#### FR5.5: Error Handling & Retries
- **Automatic Retries**:
  - Failed emails automatically retried up to 3 times
  - Exponential backoff between retries (1m, 5m, 15m)
  - Permanent failures logged for review

- **Failure Notifications**:
  - If >10% of emails fail, alert admin
  - Email summary of failures sent to admin
  - Dashboard badge showing jobs needing attention

#### FR5.6: Job Persistence
- **Database Storage**:
  - All job data persisted in database
  - Progress survives server restarts
  - Worker resumes in-progress jobs on startup
  
- **Job History Retention**:
  - Keep completed jobs for 90 days
  - Option to archive important jobs permanently
  - Automatic cleanup of old job records

### Database Schema Changes

```sql
-- New table: email_jobs
CREATE TABLE email_jobs (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Job configuration
  subject TEXT NOT NULL,
  message_text TEXT NOT NULL,
  message_html TEXT,
  is_html_email BOOLEAN DEFAULT FALSE,
  
  -- Target recipients
  recipient_type TEXT NOT NULL, -- 'all', 'roles', 'departments', 'custom'
  target_roles BIGINT[],
  target_departments BIGINT[],
  recipient_count INTEGER,
  
  -- Job settings
  batch_size INTEGER DEFAULT 50,
  batch_delay_seconds INTEGER DEFAULT 30,
  max_retries INTEGER DEFAULT 3,
  priority INTEGER DEFAULT 0, -- Higher = more urgent
  
  -- Job status
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'paused', 'completed', 'failed', 'cancelled'
  progress_sent INTEGER DEFAULT 0,
  progress_failed INTEGER DEFAULT 0,
  progress_pending INTEGER,
  progress_percent NUMERIC(5,2) DEFAULT 0.00,
  
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  paused_at TIMESTAMP WITH TIME ZONE,
  
  -- Error tracking
  error_message TEXT,
  error_count INTEGER DEFAULT 0,
  last_error_at TIMESTAMP WITH TIME ZONE,
  
  -- Estimates
  estimated_completion_time TIMESTAMP WITH TIME ZONE,
  estimated_duration_seconds INTEGER
);

-- New table: email_job_items (individual emails in a job)
CREATE TABLE email_job_items (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  job_id BIGINT REFERENCES email_jobs(id) ON DELETE CASCADE,
  member_id BIGINT REFERENCES org_members(id) ON DELETE SET NULL,
  
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'skipped'
  sent_at TIMESTAMP WITH TIME ZONE,
  
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  
  personalized_subject TEXT,
  personalized_message TEXT
);

-- New table: email_job_logs
CREATE TABLE email_job_logs (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  job_id BIGINT REFERENCES email_jobs(id) ON DELETE CASCADE,
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  log_level TEXT NOT NULL, -- 'info', 'warning', 'error'
  message TEXT NOT NULL,
  
  metadata JSONB -- Additional context (e.g., batch number, recipient)
);

-- Indexes
CREATE INDEX idx_email_jobs_org_id ON email_jobs(organization_id);
CREATE INDEX idx_email_jobs_status ON email_jobs(status);
CREATE INDEX idx_email_jobs_created_at ON email_jobs(created_at);
CREATE INDEX idx_email_job_items_job_id ON email_job_items(job_id);
CREATE INDEX idx_email_job_items_status ON email_job_items(status);
CREATE INDEX idx_email_job_logs_job_id ON email_job_logs(job_id);
```

### API Endpoints

```
-- Job Management
POST   /api/email-jobs                  - Create new email job
GET    /api/email-jobs                  - List all jobs for org
GET    /api/email-jobs/:id              - Get job details
DELETE /api/email-jobs/:id              - Cancel/delete job

-- Job Actions
POST   /api/email-jobs/:id/pause        - Pause running job
POST   /api/email-jobs/:id/resume       - Resume paused job
POST   /api/email-jobs/:id/cancel       - Cancel job
POST   /api/email-jobs/:id/retry-failed - Retry failed items

-- Job Status
GET    /api/email-jobs/:id/status       - Get current status (polling)
GET    /api/email-jobs/:id/logs         - Get job logs
GET    /api/email-jobs/:id/failed-items - Get list of failed emails
GET    /api/email-jobs/:id/export-errors - Download error report CSV

-- Real-time (WebSocket)
WS     /api/email-jobs/:id/subscribe    - WebSocket for live updates
```

### Background Worker Implementation

**Option 1: BullMQ + Redis**
```typescript
// Worker setup
import { Worker } from 'bullmq';

const emailWorker = new Worker('email-jobs', async (job) => {
  const { jobId, recipients, subject, message } = job.data;
  
  // Process in batches
  for (const batch of chunkArray(recipients, 50)) {
    await sendEmailBatch(batch, subject, message);
    await updateJobProgress(jobId, batch.length);
    await sleep(30000); // 30 second delay between batches
  }
}, {
  connection: redisConnection,
  concurrency: 5 // Process 5 jobs simultaneously
});

emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
  notifyAdmin(job.data.organizationId, 'Email job completed!');
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
  logJobError(job.id, err.message);
});
```

**Option 2: Database-Backed Queue** (simpler, no Redis needed)
```typescript
// Simple polling worker
async function processEmailJobs() {
  while (true) {
    // Find oldest pending job
    const job = await db.query(`
      SELECT * FROM email_jobs 
      WHERE status = 'pending' 
      ORDER BY priority DESC, created_at ASC 
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `);
    
    if (job) {
      await processEmailJob(job.id);
    }
    
    await sleep(5000); // Check every 5 seconds
  }
}

// Start worker on server startup
processEmailJobs();
```

### Frontend Implementation

**Job Status Page with Real-Time Updates**
```tsx
'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

export default function EmailJobStatusPage({ jobId }) {
  const [job, setJob] = useState(null);
  
  useEffect(() => {
    // Poll for updates every 3 seconds
    const interval = setInterval(async () => {
      const response = await fetch(`/api/email-jobs/${jobId}/status`);
      const data = await response.json();
      setJob(data);
      
      // Stop polling if job complete
      if (['completed', 'failed', 'cancelled'].includes(data.status)) {
        clearInterval(interval);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [jobId]);
  
  if (!job) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Email Job: {job.subject}</h1>
      
      <Progress value={job.progress_percent} />
      
      <div className="stats">
        <div>Sent: {job.progress_sent}</div>
        <div>Failed: {job.progress_failed}</div>
        <div>Remaining: {job.progress_pending}</div>
      </div>
      
      {job.status === 'running' && (
        <div>
          <p>Estimated time remaining: {job.estimatedTimeRemaining}</p>
          <button onClick={() => pauseJob(jobId)}>Pause</button>
        </div>
      )}
      
      {job.status === 'paused' && (
        <button onClick={() => resumeJob(jobId)}>Resume</button>
      )}
      
      {job.progress_failed > 0 && (
        <button onClick={() => retryFailed(jobId)}>Retry Failed</button>
      )}
    </div>
  );
}
```

### Infrastructure Requirements

**If using Redis (BullMQ)**:
- Add Redis instance (Vercel KV, Upstash, or self-hosted)
- Update `package.json`: `"bullmq": "^5.0.0"`, `"ioredis": "^5.0.0"`
- Environment variables: `REDIS_URL`, `REDIS_PASSWORD`

**If using database queue**:
- No additional infrastructure needed
- Ensure database can handle concurrent updates (use `FOR UPDATE SKIP LOCKED`)
- Consider adding read replica for job status queries if high traffic

**Worker Deployment**:
- Vercel: Deploy separate "background function" (max 60s execution, then reschedule)
- Separate Node.js server: Deploy worker as standalone process
- Docker: Run worker container alongside web container

### Success Metrics

- **Reliability**: % of email jobs that complete successfully
- **Recovery Rate**: % of failed emails successfully retried
- **Admin Satisfaction**: Survey admins on new vs old system
- **Job Completion Time**: Average time to send 100 emails
- **Error Rate**: % of emails that permanently fail

### Migration Plan

1. **Phase 1**: Implement job system alongside existing synchronous endpoint
2. **Phase 2**: Add toggle in UI: "Use background sending" (default: on)
3. **Phase 3**: Monitor both systems in production
4. **Phase 4**: Deprecate synchronous endpoint, redirect to job system
5. **Phase 5**: Remove old code

---

## Feature 6: Enhanced Admin Analytics Dashboard

### Overview
Provide administrators with comprehensive insights into member engagement, communication effectiveness, and organizational health through data visualizations and actionable metrics.

### User Stories

**As an admin**, I want to:
- See how many members engage with our communications
- Identify inactive members who haven't responded in months
- Track communication trends over time
- Compare effectiveness of SMS vs Email
- Generate reports for executive board meetings
- Understand which departments have highest engagement

### Functional Requirements

#### FR6.1: Dashboard Overview
- **Key Metrics** (large cards at top):
  - Total Members
  - Active Members (responded in last 30 days)
  - Total Messages Sent (this month)
  - Average Response Rate
  
- **Quick Stats**:
  - Emails sent today / daily limit remaining
  - SMS sent this month / monthly limit remaining
  - Pending prompts awaiting responses
  - Failed jobs needing attention

#### FR6.2: Communication Analytics
- **Message Volume Over Time**:
  - Line chart showing texts + emails sent per day/week/month
  - Selectable time range: 7 days, 30 days, 90 days, 1 year
  
- **Channel Effectiveness**:
  - Bar chart comparing SMS vs Email response rates
  - Average time to response by channel
  
- **Message Type Breakdown**:
  - Pie chart: Broadcast messages, Prompts, Automated reminders
  
#### FR6.3: Member Engagement Analytics
- **Engagement Score**:
  - Algorithm: (prompt responses + message interactions) / total prompts sent
  - Member list sortable by engagement score
  - Visual indicators: High (green), Medium (yellow), Low (red)
  
- **Inactive Members**:
  - List of members who haven't responded in 60+ days
  - Bulk action: "Send re-engagement message"
  
- **Engagement Trends**:
  - Line chart showing overall engagement over time
  - Annotations for major events (e.g., "Start of semester")

#### FR6.4: Role & Department Analytics
- **Member Distribution**:
  - Pie chart: Members by role
  - Pie chart: Members by department
  
- **Engagement by Group**:
  - Bar chart: Average response rate by role
  - Bar chart: Average response rate by department
  - Identify which groups are most/least engaged
  
- **Communication Volume by Group**:
  - Heatmap: Messages sent to each role/department over time

#### FR6.5: Prompt Performance Analytics
- **Prompt Summary**:
  - Table of all prompts with response rates
  - Sortable by date, response rate, recipient count
  
- **Best/Worst Performing Prompts**:
  - Top 5 prompts with highest response rates
  - Bottom 5 prompts with lowest response rates
  - Insights: "Prompts sent on weekends have 20% lower response rates"

- **Response Time Analysis**:
  - Histogram: Distribution of response times
  - Average response time by day of week
  - Average response time by time of day sent

#### FR6.6: Export & Reporting
- **Export Options**:
  - Download current dashboard as PDF
  - Export raw data as CSV (members, messages, responses)
  - Schedule weekly/monthly email reports
  
- **Custom Reports**:
  - Select date range
  - Choose metrics to include
  - Add notes/commentary
  - Generate shareable report URL

### API Endpoints

```
GET    /api/analytics/overview           - Dashboard overview metrics
GET    /api/analytics/communication      - Communication volume & effectiveness
GET    /api/analytics/engagement         - Member engagement metrics
GET    /api/analytics/role-department    - Breakdown by roles & departments
GET    /api/analytics/prompts            - Prompt performance metrics
GET    /api/analytics/trends             - Time-series trend data

POST   /api/analytics/export/pdf         - Generate PDF report
POST   /api/analytics/export/csv         - Export data as CSV
POST   /api/analytics/schedule-report    - Schedule recurring reports
```

### UI Mockups/Wireframes Needed

1. **Analytics Dashboard** - Main overview with key metrics
2. **Communication Analytics Page** - Charts for message volume, effectiveness
3. **Member Engagement Page** - Engagement scores, inactive members
4. **Prompt Analytics Page** - Prompt performance, response times
5. **Custom Report Builder** - UI to create custom reports
6. **PDF Report Template** - Professional report layout for exports

### Success Metrics

- **Dashboard Usage**: % of admins who view analytics weekly
- **Report Generation**: Number of reports exported per month
- **Action Rate**: % of admins who take action based on insights (e.g., message inactive members)
- **Data-Driven Decisions**: Survey admins on whether analytics influence strategy

---

## Technical Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  Next.js 15 App Router + React 19 + TypeScript              │
│  ├── Pages: Landing, Mass Text, Analytics, Prompts, etc.    │
│  ├── Components: UI components (Radix + Tailwind)           │
│  └── State Management: React Context + Local State          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTPS / WebSocket
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   API Layer (Next.js Routes)                 │
│  ├── /api/auth/*           - OAuth & session management     │
│  ├── /api/messages/*       - SMS sending & history          │
│  ├── /api/email-jobs/*     - Email job management           │
│  ├── /api/prompts/*        - Prompt creation & responses    │
│  ├── /api/members/*        - Member CRUD & management       │
│  ├── /api/roles/*          - Role & department management   │
│  └── /api/analytics/*      - Analytics & reporting          │
└─────────────────┬───────────────────────────────────────────┘
                  │
      ┌───────────┴──────────┬───────────────┬────────────┐
      │                      │               │            │
┌─────▼─────┐    ┌──────────▼──────┐   ┌───▼────┐  ┌────▼─────┐
│ Supabase  │    │  Background     │   │ Twilio │  │  SMTP    │
│ Postgres  │    │  Job Worker     │   │  API   │  │ (Gmail)  │
│           │    │  (BullMQ/Poll)  │   │        │  │          │
│ ├── org   │    │                 │   └────────┘  └──────────┘
│ ├── users │    │ Processes:      │
│ ├── roles │    │ - Email jobs    │   ┌─────────────────────┐
│ ├── prompts│   │ - SMS jobs      │   │  External Services  │
│ ├── texts │    │ - Exports       │   ├─────────────────────┤
│ └── emails│    │                 │   │ Google OAuth        │
└───────────┘    └─────────┬───────┘   │ GitHub OAuth        │
                           │           │ Google Sheets API   │
                      ┌────▼────┐      │ OpenAI API          │
                      │  Redis  │      │ Gemini AI           │
                      │  Queue  │      └─────────────────────┘
                      │ (BullMQ)│
                      └─────────┘
```

### Technology Stack Summary

| Component | Current | New/Updated |
|-----------|---------|-------------|
| **Frontend Framework** | Next.js 15 | ✅ Keep |
| **UI Library** | Radix UI + Tailwind | ✅ Keep |
| **Database** | Supabase (Postgres) | ✅ Keep |
| **Authentication** | Access Codes | 🔄 Add NextAuth.js + OAuth |
| **SMS** | Twilio | ✅ Keep |
| **Email** | Nodemailer (sync) | 🔄 Add BullMQ + Worker |
| **Job Queue** | None | ➕ Add BullMQ or DB Queue |
| **Caching** | None | ➕ Optional: Redis |
| **Analytics** | Basic | 🔄 Enhanced with charts |
| **Charts** | None | ➕ Add Recharts or Chart.js |
| **Real-time** | None | ➕ Add WebSocket or Polling |

### New Dependencies

```json
{
  "dependencies": {
    "next-auth": "^5.0.0",
    "bullmq": "^5.0.0",
    "ioredis": "^5.0.0",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "zod": "^3.24.0",
    "@tanstack/react-query": "^5.0.0"
  }
}
```

### Database Migration Strategy

1. **Create migration scripts** for each new table
2. **Run migrations** in staging environment first
3. **Test thoroughly** with sample data
4. **Create rollback scripts** for each migration
5. **Run in production** during low-traffic period
6. **Monitor logs** for errors
7. **Verify data integrity** after migration

### Security Considerations

- **OAuth Tokens**: Encrypt at rest using AES-256
- **API Rate Limiting**: Implement per-org and per-IP rate limits
- **RBAC**: Implement role-based access control for future admin levels
- **Input Validation**: Use Zod schemas for all API inputs
- **SQL Injection**: Use parameterized queries (Supabase client handles this)
- **XSS Prevention**: Sanitize all user-generated content before rendering
- **CSRF Protection**: NextAuth handles this automatically
- **Audit Logging**: Log all admin actions (message sends, member changes, etc.)

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)

**Week 1: OAuth Authentication**
- [ ] Set up NextAuth.js
- [ ] Implement Google OAuth
- [ ] Implement GitHub OAuth
- [ ] Create user and org_admins tables
- [ ] Build login/signup UI
- [ ] Implement session management
- [ ] Test OAuth flow end-to-end

**Week 2: Role & Department System**
- [ ] Create roles and departments tables
- [ ] Update org_members schema
- [ ] Build role management UI
- [ ] Build department management UI
- [ ] Implement member assignment UI
- [ ] Add role/department filters to member list
- [ ] Test bulk assignment features

**Week 3: Database & API Groundwork**
- [ ] Create all remaining new tables
- [ ] Write database migration scripts
- [ ] Set up staging database
- [ ] Run migrations in staging
- [ ] Create API route scaffolds
- [ ] Set up error handling middleware
- [ ] Configure rate limiting

### Phase 2: Core Features (Weeks 4-7)

**Week 4: Targeted Mass Communication**
- [ ] Update message API to accept role/dept filters
- [ ] Build recipient selection UI with filters
- [ ] Implement recipient preview modal
- [ ] Update sent messages to show target audience
- [ ] Test SMS sending to filtered groups
- [ ] Test email sending to filtered groups

**Week 5: Interactive Prompts - Backend**
- [ ] Create prompt creation API
- [ ] Create response submission API
- [ ] Implement SMS prompt delivery
- [ ] Implement email prompt delivery
- [ ] Build public response form endpoint
- [ ] Set up response collection logic

**Week 6: Interactive Prompts - Frontend**
- [ ] Build prompt creation UI
- [ ] Build prompts dashboard
- [ ] Build response collection view
- [ ] Build public response form page
- [ ] Implement response analytics UI
- [ ] Add reminder scheduling UI

**Week 7: Testing & Polish for Phase 2**
- [ ] End-to-end testing for prompts
- [ ] Test role/dept filtering thoroughly
- [ ] Fix bugs and edge cases
- [ ] UI/UX polish
- [ ] Performance optimization
- [ ] Documentation updates

### Phase 3: Background Jobs & Analytics (Weeks 8-11)

**Week 8: Job Queue Setup**
- [ ] Choose queue system (BullMQ vs DB)
- [ ] Set up Redis (if using BullMQ)
- [ ] Create email_jobs tables
- [ ] Build job creation API
- [ ] Implement worker process
- [ ] Test job execution locally

**Week 9: Job Management UI**
- [ ] Build job creation flow in UI
- [ ] Build job status page with progress
- [ ] Implement real-time updates (polling or WS)
- [ ] Add pause/resume/cancel functionality
- [ ] Build jobs dashboard
- [ ] Implement retry failed emails

**Week 10: Analytics Backend**
- [ ] Create analytics API endpoints
- [ ] Implement engagement score algorithm
- [ ] Build data aggregation queries
- [ ] Optimize query performance
- [ ] Add caching for expensive queries
- [ ] Create export functionality (CSV/PDF)

**Week 11: Analytics Frontend**
- [ ] Build analytics dashboard layout
- [ ] Integrate Recharts for visualizations
- [ ] Build communication analytics page
- [ ] Build engagement analytics page
- [ ] Build role/dept analytics views
- [ ] Add export UI

### Phase 4: Polish & Launch (Weeks 12-14)

**Week 12: Integration & Testing**
- [ ] End-to-end testing of all features
- [ ] Load testing (simulate 1000 members, 100 concurrent jobs)
- [ ] Security audit
- [ ] Accessibility audit (WCAG compliance)
- [ ] Mobile responsiveness testing
- [ ] Cross-browser testing

**Week 13: Documentation & Training**
- [ ] Write admin user guide
- [ ] Create video tutorials
- [ ] Write API documentation
- [ ] Update README with new features
- [ ] Create troubleshooting guide
- [ ] Prepare migration guide for existing orgs

**Week 14: Deployment & Monitoring**
- [ ] Deploy to staging environment
- [ ] Invite beta testers (2-3 organizations)
- [ ] Collect feedback and fix critical issues
- [ ] Deploy to production
- [ ] Set up error monitoring (Sentry)
- [ ] Set up uptime monitoring
- [ ] Monitor performance metrics
- [ ] Announce launch to all organizations

---

## Success Criteria

### Feature Adoption Metrics

- **OAuth**: 80% of organizations migrate from access codes within 3 months
- **Roles/Departments**: 60% of organizations assign roles to members within 1 month
- **Targeted Messaging**: 50% of mass messages use role/dept filters instead of "all members"
- **Interactive Prompts**: Average 3 prompts created per organization per month
- **Background Jobs**: 95% of email jobs complete successfully without admin intervention
- **Analytics**: 70% of admins view analytics dashboard at least weekly

### Technical Performance Metrics

- **Page Load Time**: < 2 seconds for all pages (p95)
- **API Response Time**: < 500ms for most endpoints (p95)
- **Email Job Success Rate**: > 95% of emails delivered successfully
- **Background Job Completion**: > 99% of jobs complete without errors
- **Uptime**: 99.9% uptime (< 43 minutes downtime per month)
- **Error Rate**: < 0.1% of API requests result in 500 errors

### User Satisfaction Metrics

- **Net Promoter Score (NPS)**: Target score of 50+
- **Feature Satisfaction**: 80% of admins rate new features as "useful" or "very useful"
- **Support Tickets**: < 5 tickets per week per 100 active organizations
- **User Retention**: 90% of organizations remain active after 3 months

---

## Risks & Mitigation

### Risk 1: OAuth Migration Complexity
**Risk**: Existing organizations resist migrating from access codes to OAuth
**Mitigation**: 
- Keep access codes working during transition
- Create easy migration wizard
- Offer 1-on-1 migration support for large orgs
- Communicate benefits clearly (security, convenience)

### Risk 2: Background Job Failures
**Risk**: Email jobs fail silently or get stuck, causing data loss
**Mitigation**:
- Implement comprehensive error logging
- Set up alerting for stuck jobs
- Build robust retry logic
- Create admin tools to manually intervene
- Test failure scenarios thoroughly

### Risk 3: Database Performance
**Risk**: Analytics queries slow down as data grows
**Mitigation**:
- Add database indexes strategically
- Implement query result caching
- Use read replicas for heavy queries
- Archive old data periodically
- Monitor slow query logs

### Risk 4: Scope Creep
**Risk**: Adding too many features delays launch
**Mitigation**:
- Stick to defined MVP for each feature
- Use phased rollout (launch core features first)
- Create backlog for "nice-to-have" features
- Regular check-ins to assess progress vs timeline

### Risk 5: User Adoption
**Risk**: Organizations don't use new features, rendering work wasted
**Mitigation**:
- Conduct user research before building
- Get feedback from beta testers early
- Create compelling onboarding flows
- Send feature announcement emails
- Offer training webinars

---

## Appendix

### Glossary

- **OAuth**: Open standard for secure delegated access (login with Google/GitHub)
- **Role**: A member's position in the organization (e.g., President, Member)
- **Department**: A functional group within the organization (e.g., Tech, Marketing)
- **Prompt**: An interactive question sent to members to collect responses
- **Job**: A background task (e.g., sending 100 emails) that runs asynchronously
- **Queue**: A system for managing background jobs (FIFO: first-in, first-out)
- **Throttling**: Intentionally slowing down operations to avoid rate limits
- **Webhook**: An HTTP callback triggered by external events (e.g., Twilio SMS received)

### Related Documentation

- [SMS Opt-Out Setup Guide](docs/SMS_OPT_OUT_SETUP.md)
- [Database Structure](database-structure.md)
- [AI Integration README](README-AI-INTEGRATION.md)
- [Main README](README.md)

### Contact & Support

For questions about this PRD or implementation:
- **Technical Lead**: [Your Name]
- **Project Manager**: [PM Name]
- **Design Lead**: [Designer Name]

---

*Last Updated: October 28, 2025*  
*Version: 1.0*  
*Status: Approved for Development*

