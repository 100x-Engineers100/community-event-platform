# Community Event Platform

> Full-stack event management platform for 100x Engineers community

## Features

### Host Flow
- Submit events (max 3/day)
- Track submission status
- View registration counts

### Joinee Flow
- Browse published events
- Register for events
- Access meeting links (registered users only)

### Admin Flow (Coming Soon)
- Review & approve events
- Manage all events
- Host verification system

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Google OAuth
- **Deployment:** Vercel

## Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn
- Supabase account
- Google OAuth credentials

### Local Setup

1. **Clone repository**
```bash
git clone https://github.com/100x-Engineers100/community-event-platform.git
cd community-event-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. **Setup Supabase**
- Create project at [supabase.com](https://supabase.com)
- Run SQL files in `sql/` folder (in order)
- Configure Google OAuth provider

5. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Vercel deployment guide.

**Quick deploy:**
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

## Project Structure

```
app/
├── api/              # API routes
├── auth/             # Auth callbacks
├── create-event/     # Event creation
├── dashboard/        # Host dashboard
├── events/           # Public event pages
└── login/            # Login page

components/
├── ui/               # shadcn/ui components
├── EventCard.tsx     # Event display
├── Navigation.tsx    # Dashboard nav
├── PublicNavbar.tsx  # Public nav
└── RegistrationForm.tsx

lib/
├── supabase/         # Supabase clients
├── validations/      # Zod schemas
└── types.ts          # TypeScript types

sql/
├── 01_schema.sql     # Database schema
├── 02_functions.sql  # DB functions
├── 03_rls_policies.sql # Security policies
└── 04_cron_logs.sql  # Cron logging
```

## Key Features Explained

### Daily Submission Limit
Hosts can submit max 3 events per day. Tracked via `daily_submissions` table.

### Auto-Expiry
Events not reviewed in 7 days auto-expire. Runs daily at 1 AM.

### Auto-Completion
Published events auto-complete after event date. Runs daily at 2 AM.

### Meeting Link Privacy
Meeting links only shown to registered attendees, not public.

### Event Status Flow
```
SUBMITTED → (Admin Review) → PUBLISHED | REJECTED
         → (7 days) → EXPIRED
PUBLISHED → (Event Date) → COMPLETED
```

## Database Schema

### Tables
- `profiles` - User profiles
- `events` - Event submissions
- `daily_submissions` - Daily limit tracking
- `registrations` - Event registrations
- `verified_members` - Cohort verification (Phase 2)

### Functions
- `can_submit_event()` - Check daily limit
- `get_today_active_event_count()` - Current submission count
- `mark_expired_events()` - Auto-expire
- `mark_completed_events()` - Auto-complete

## Development

### Run tests
```bash
npm run test
```

### Lint code
```bash
npm run lint
```

### Build for production
```bash
npm run build
```

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/xyz`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/xyz`)
5. Open Pull Request

## License

MIT License - See [LICENSE](./LICENSE) for details

## Support

**Issues:** [GitHub Issues](https://github.com/100x-Engineers100/community-event-platform/issues)

**Docs:** [Project Requirements](./Project_Requirements_100x_Events.md)

---

Built with by [100x Engineers](https://100xengineers.com)
