# Hestia Development Roadmap

This file tracks upcoming features and improvements for the Hestia platform.

## ✅ Phase 1 - Completed

### Artisan Badges System
- [x] Database migrations for badge_types and artisan_badges tables
- [x] 6 initial badge types (verified, top_rated, quick_responder, eco_friendly, workshop_host, featured_artisan)
- [x] ArtisanBadge and ArtisanBadges UI components
- [x] Integration into CreatorCard and CreatorProfile pages
- [x] Badge awarding/revoking functions

### Portfolio Analytics System
- [x] Database migrations for analytics events and summaries
- [x] Session-based tracking system (profile views, favorites, contacts, image views)
- [x] Analytics tracking utilities (lib/analytics.ts)
- [x] useAnalytics hook with real-time and historical data
- [x] AnalyticsDashboard component with 6 stat cards
- [x] Integration into Settings page at /settings/analytics
- [x] Engagement metrics and smart tips

### Collections System
- [x] Database migrations for collections and collection_artisans tables
- [x] Seeded 4 initial collections
- [x] useCollections hook with featured collections support
- [x] Collections browse page (/collections)
- [x] CollectionDetail page (/collections/:slug)
- [x] Featured collections section on homepage
- [x] Routes and navigation

---

## 🚧 Phase 2 - Admin & Management Tools

### Admin Dashboard
**Priority**: High
**Estimated Time**: 3-4 days

**Database Requirements**:
```sql
-- Create admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'moderator', 'super_admin')),
  permissions jsonb DEFAULT '[]'::jsonb,
  granted_by uuid REFERENCES auth.users,
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users NOT NULL,
  action text NOT NULL,
  target_type text, -- 'artisan', 'user', 'collection', 'badge'
  target_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
```

**Features to Build**:
- [ ] Admin role management system
- [ ] Admin dashboard page (/admin)
  - [ ] Platform overview stats (total users, artisans, collections)
  - [ ] Recent activity feed
  - [ ] Quick actions (approve artisans, award badges, create collections)
- [ ] Artisan management interface
  - [ ] View all artisan applications
  - [ ] Approve/reject artisan applications
  - [ ] Edit artisan profiles
  - [ ] Award/revoke badges
- [ ] Collection management
  - [ ] Create/edit/delete collections
  - [ ] Add/remove artisans from collections
  - [ ] Reorder artisans in collections
  - [ ] Set featured status
- [ ] User management
  - [ ] View all users
  - [ ] Search/filter users
  - [ ] Ban/unban users
  - [ ] Reset passwords
- [ ] Admin activity logging

**Files to Create**:
- `src/pages/Admin.tsx` - Main admin dashboard
- `src/pages/AdminArtisans.tsx` - Artisan management
- `src/pages/AdminCollections.tsx` - Collection management
- `src/pages/AdminUsers.tsx` - User management
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/StatCard.tsx`
- `src/components/admin/ActivityFeed.tsx`
- `src/hooks/useAdminRole.ts`
- `src/hooks/useAdminActivity.ts`

---

### Content Moderation System
**Priority**: High
**Estimated Time**: 2-3 days

**Database Requirements**:
```sql
-- Moderation flags table
CREATE TABLE IF NOT EXISTS content_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users,
  target_type text NOT NULL, -- 'profile', 'gallery_image', 'bio'
  target_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES auth.users,
  reviewed_at timestamptz,
  resolution_notes text,
  created_at timestamptz DEFAULT now()
);

-- Moderation actions
CREATE TABLE IF NOT EXISTS moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid REFERENCES auth.users NOT NULL,
  action_type text NOT NULL, -- 'hide', 'remove', 'warn', 'ban'
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

**Features to Build**:
- [ ] Content flagging system
  - [ ] Report button on profiles and gallery images
  - [ ] Flag reasons (inappropriate, spam, harassment, etc.)
  - [ ] Anonymous and authenticated reporting
- [ ] Moderation queue
  - [ ] View all pending flags
  - [ ] Filter by type, status, date
  - [ ] Batch actions
- [ ] Moderation actions
  - [ ] Hide content (soft delete)
  - [ ] Remove content (permanent delete)
  - [ ] Warn user (email notification)
  - [ ] Suspend/ban user
- [ ] Auto-moderation rules (optional)
  - [ ] Profanity filter for bios
  - [ ] Image content detection (external API like AWS Rekognition)
  - [ ] Spam detection

**Files to Create**:
- `src/pages/AdminModeration.tsx`
- `src/components/admin/ModerationQueue.tsx`
- `src/components/admin/FlagCard.tsx`
- `src/components/admin/ModerationActionModal.tsx`
- `src/components/ui/report-button.tsx`
- `src/hooks/useContentFlags.ts`
- `src/hooks/useModerationActions.ts`

---

### Client Management System (for Artisans)
**Priority**: Medium
**Estimated Time**: 3-4 days

**Database Requirements**:
```sql
-- Client contacts table (extends existing contact_requests)
CREATE TABLE IF NOT EXISTS artisan_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid REFERENCES artisans NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  tags text[] DEFAULT '{}',
  notes text,
  total_orders int DEFAULT 0,
  total_spent numeric(10,2) DEFAULT 0,
  first_contact_date timestamptz DEFAULT now(),
  last_contact_date timestamptz DEFAULT now(),
  status text DEFAULT 'lead' CHECK (status IN ('lead', 'active', 'past', 'archived')),
  created_at timestamptz DEFAULT now()
);

-- Communication history
CREATE TABLE IF NOT EXISTS client_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES artisan_clients NOT NULL,
  artisan_id uuid REFERENCES artisans NOT NULL,
  message text,
  communication_type text, -- 'email', 'phone', 'meeting', 'note'
  created_at timestamptz DEFAULT now()
);

-- Orders/projects tracking
CREATE TABLE IF NOT EXISTS client_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES artisan_clients NOT NULL,
  artisan_id uuid REFERENCES artisans NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'quoted', 'in_progress', 'completed', 'cancelled')),
  amount numeric(10,2),
  due_date date,
  completed_date date,
  created_at timestamptz DEFAULT now()
);
```

**Features to Build**:
- [ ] Client management dashboard (accessible via /settings/clients)
  - [ ] Client list with search and filters
  - [ ] Client cards showing status, tags, order history
  - [ ] Stats overview (total clients, active projects, revenue)
- [ ] Client detail view
  - [ ] Contact information
  - [ ] Communication history timeline
  - [ ] Order/project history
  - [ ] Notes and tags
- [ ] Add/edit clients
  - [ ] Manual client creation
  - [ ] Import from contact_requests
  - [ ] Bulk import via CSV
- [ ] Communication tracking
  - [ ] Log emails, calls, meetings
  - [ ] Set reminders/follow-ups
  - [ ] Email templates
- [ ] Order/project tracking
  - [ ] Create orders linked to clients
  - [ ] Track status (inquiry → quoted → in progress → completed)
  - [ ] Set deadlines and reminders
  - [ ] Record amounts/payments

**Files to Create**:
- `src/pages/SettingsClients.tsx`
- `src/pages/ClientDetail.tsx`
- `src/components/client/ClientCard.tsx`
- `src/components/client/ClientForm.tsx`
- `src/components/client/CommunicationTimeline.tsx`
- `src/components/client/OrderCard.tsx`
- `src/hooks/useClients.ts`
- `src/hooks/useClientOrders.ts`

---

## 📦 Phase 3 - Growth & Automation Features

### Bulk Upload System
**Priority**: Medium
**Estimated Time**: 2 days

**Features to Build**:
- [ ] Bulk gallery image upload
  - [ ] Drag-and-drop multiple files
  - [ ] Progress indicators
  - [ ] Image preview before upload
  - [ ] Batch metadata editing (titles, descriptions, featured status)
- [ ] CSV import for client data
  - [ ] Template download
  - [ ] Validation and error reporting
  - [ ] Preview before import
- [ ] Batch operations
  - [ ] Bulk delete gallery images
  - [ ] Bulk edit image properties
  - [ ] Bulk tag clients

**Files to Create**:
- `src/components/upload/BulkImageUpload.tsx`
- `src/components/upload/CSVImporter.tsx`
- `src/hooks/useBulkUpload.ts`
- `src/lib/csv-parser.ts`

---

### Newsletter System
**Priority**: Low
**Estimated Time**: 2-3 days

**Database Requirements**:
```sql
-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  preferences jsonb DEFAULT '{}'::jsonb -- e.g., {"frequency": "weekly", "categories": ["pottery", "textiles"]}
);

-- Newsletter campaigns
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  template text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  sent_count int DEFAULT 0,
  open_count int DEFAULT 0,
  click_count int DEFAULT 0,
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now()
);
```

**Features to Build**:
- [ ] Newsletter subscription
  - [ ] Subscribe form on homepage/footer
  - [ ] Double opt-in confirmation email
  - [ ] Manage preferences
  - [ ] Unsubscribe link
- [ ] Campaign management (admin only)
  - [ ] Create newsletters with rich text editor
  - [ ] Email templates
  - [ ] Preview before sending
  - [ ] Schedule send time
  - [ ] Segment subscribers (by preferences, craft type)
- [ ] Analytics
  - [ ] Open rates
  - [ ] Click tracking
  - [ ] Unsubscribe tracking
- [ ] Integration with email service
  - [ ] SendGrid or Resend API
  - [ ] Transactional emails (welcome, updates)

**Files to Create**:
- `src/components/newsletter/SubscribeForm.tsx`
- `src/components/newsletter/NewsletterPreferences.tsx`
- `src/pages/AdminNewsletters.tsx`
- `src/components/admin/NewsletterEditor.tsx`
- `src/hooks/useNewsletterSubscribers.ts`
- `src/lib/email-service.ts`

---

### Referral Program
**Priority**: Low
**Estimated Time**: 2-3 days

**Database Requirements**:
```sql
-- Referral codes
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  artisan_id uuid REFERENCES artisans NOT NULL,
  uses int DEFAULT 0,
  max_uses int,
  expires_at timestamptz,
  reward_type text DEFAULT 'badge', -- 'badge', 'featured', 'credit'
  reward_value text,
  created_at timestamptz DEFAULT now()
);

-- Referrals tracking
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text REFERENCES referral_codes(code),
  referrer_id uuid REFERENCES artisans NOT NULL,
  referred_id uuid REFERENCES artisans NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  completed_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

**Features to Build**:
- [ ] Referral code generation
  - [ ] Unique codes per artisan
  - [ ] Customizable codes
  - [ ] Expiration dates
- [ ] Referral tracking
  - [ ] Track sign-ups via referral codes
  - [ ] Track completion (when referred artisan publishes profile)
  - [ ] Leaderboard of top referrers
- [ ] Rewards system
  - [ ] Award badges for successful referrals
  - [ ] Featured placement rewards
  - [ ] Milestone rewards (5, 10, 25 referrals)
- [ ] Referral dashboard for artisans
  - [ ] View referral code
  - [ ] Share links (social media, email)
  - [ ] Track referral stats
  - [ ] See rewards earned

**Files to Create**:
- `src/pages/SettingsReferrals.tsx`
- `src/components/referral/ReferralCard.tsx`
- `src/components/referral/ShareButtons.tsx`
- `src/hooks/useReferrals.ts`

---

## 🔮 Future Considerations (Phase 4+)

### Booking & Transactions
- Integrated booking system for workshops/consultations
- Payment processing (Stripe integration)
- Commission tracking
- Invoice generation

### Social Features
- Comments on artisan profiles
- Reviews and ratings system
- Follow/unfollow artisans
- Activity feed
- Direct messaging between users and artisans

### Enhanced Search & Discovery
- Advanced filters (price range, availability, custom orders)
- Location-based search with maps
- AI-powered recommendations
- "Artisans similar to..." suggestions

### Mobile App
- React Native mobile application
- Push notifications
- Offline mode
- Camera integration for gallery uploads

### Third-Party Integrations
- Instagram feed sync
- Shopify/WooCommerce product imports
- Google Calendar for availability
- Mailchimp integration

---

## Development Notes

### Priority Legend
- **High**: Core functionality, needed for MVP features
- **Medium**: Important but not blocking
- **Low**: Nice-to-have, can be deferred

### Before Starting Each Phase
1. Review database schema requirements
2. Create migrations in `supabase/migrations/`
3. Update TypeScript types in `src/integrations/supabase/types.ts`
4. Build UI components before integrating with data
5. Test RLS policies thoroughly
6. Update CLAUDE.md with progress

### Code Style Guidelines
- Follow existing patterns in the codebase
- Use React Query for all data fetching
- Keep components small and focused
- Write semantic HTML
- Use Tailwind CSS for styling
- Prefer composition over inheritance
- Add loading and error states
- Use TypeScript strictly (no `any` types)

---

Last Updated: October 16, 2024
