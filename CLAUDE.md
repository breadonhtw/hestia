# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hestia is a React + TypeScript web application for discovering and connecting with artisans in Singapore. The platform allows artisans to showcase their work and enables community members to browse, search, and favorite artisan profiles.

**Tech Stack:**
- Vite + React 18 + TypeScript
- Supabase (PostgreSQL database, authentication, storage)
- TanStack Query (React Query) for data fetching
- React Router for routing
- Tailwind CSS + shadcn/ui components
- Vercel Analytics & Speed Insights (production only)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development (includes sourcemaps)
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Database Schema

The application uses Supabase with the following core tables:

- **profiles**: User profiles (community members and artisans)
  - Linked to Supabase auth.users via trigger
  - Contains username, full_name, avatar_url, role (artisan/community_member/admin)
  - One-to-one relationship with artisans table via artisan_profile_id

- **artisans**: Artisan-specific data
  - Linked to profiles via user_id (one-to-one)
  - Contains craft details, contact info, pricing, availability
  - Uses status field for draft/published workflow
  - Categories and tags stored as arrays

- **artisans_public**: Database VIEW for public artisan data
  - Joins artisans + profiles + gallery images
  - ALWAYS query this view for public-facing artisan data, never the artisans table directly
  - Filters out unpublished/deleted profiles

- **gallery_images**: Artisan portfolio images
  - Linked to artisans table
  - Has display_order for sorting

- **user_favorites**: User's favorited artisans
- **artisan_applications**: Application submissions for becoming an artisan
- **contact_requests**: Messages sent to artisans

### Key Database Functions

- `get_email_by_username`: Convert username to email for login
- `has_role`: Check if user has specific role
- `create_artisan_profile`: Initialize artisan record for user
- `publish_artisan_profile`: Publish artisan profile (sets status + published_at)
- `unpublish_artisan_profile`: Unpublish artisan profile

### Authentication Flow

Authentication is managed through `AuthContext` (src/contexts/AuthContext.tsx):

1. **Sign Up**:
   - Validates password strength and username format
   - Checks username availability via profiles table
   - Creates auth.users record with metadata (full_name, username, role)
   - Trigger automatically creates profile record
   - For artisans, artisan record is created separately via `create_artisan_profile` RPC

2. **Sign In**:
   - Accepts email OR username
   - If username provided, uses `get_email_by_username` RPC to lookup email
   - Then signs in via Supabase auth

3. **Session Management**:
   - Stored in localStorage
   - Auto-refresh enabled
   - Auth state listener in AuthContext keeps user/session in sync

### Routing Structure

All routes defined in src/App.tsx with lazy loading:

- `/` - Landing page (Index)
- `/browse` - Browse all artisans
- `/search` - Search artisans
- `/artisan/:username` - Artisan profile by username
- `/creator/:id` - Artisan profile by ID (legacy route)
- `/profile` - User's own profile (edit mode)
- `/become-artisan` - Artisan upgrade/application flow
- `/auth` - Sign in/sign up
- `/about` - About page
- `/contact` - Contact page
- `*` - 404 Not Found

**Route prefetching**: main.tsx preloads Browse and CreatorProfile routes during idle time for better performance.

### Custom Hooks

Located in src/hooks/:

- **useArtisans**: Fetches all published artisans from artisans_public view
- **useArtisanById**: Fetch single artisan by ID from artisans_public view
- **useArtisanByUsername**: Fetch single artisan by username from artisans_public view
- **useArtisanUpgrade**: Manages artisan profile creation/upgrade flow
- **useFavorites**: Manage user's favorited artisans
- **useUserRole**: Get current user's role from profiles table
- **useImageUpload**: Handle image uploads to Supabase storage
- **use-toast-modern**: Custom toast notifications
- **useParallax**, **useScrollReveal**: Animation utilities
- **use-mobile**: Responsive breakpoint detection

### State Management

- **TanStack Query (React Query)**: All server state (artisans, profiles, favorites)
  - Query keys follow pattern: `["resource-type", identifier]`
  - Single QueryClient instance in App.tsx
- **Context API**: Authentication state (AuthContext)
- **Local component state**: UI state, forms

### Component Organization

- **src/components/ui/**: shadcn/ui components (buttons, cards, dialogs, etc.)
- **src/components/**: Application components (Header, Footer, CreatorCard, etc.)
- **src/components/artisan/**: Artisan-specific components (profile editing, gallery)
- **src/components/profile/**: Profile-specific components
- **src/pages/**: Route components (one per route)

### Data Fetching Patterns

**CRITICAL**: Always use the `artisans_public` VIEW for fetching artisan data:

```typescript
// CORRECT - Query the public view
const { data } = await supabase
  .from("artisans_public")
  .select("*")
  .eq("username", username)
  .maybeSingle();

// INCORRECT - Never query artisans table directly for public data
const { data } = await supabase
  .from("artisans")
  .select("*")  // ❌ This won't include profile data
```

Use `.maybeSingle()` instead of `.single()` when a record might not exist (avoids throwing errors).

### Image Handling

Images are stored in Supabase Storage:

- **Bucket**: `artisan-images`
- **Upload**: Use `useImageUpload` hook
- **Path pattern**: `{user_id}/{timestamp}-{filename}`
- **Validation**: See src/lib/image.ts for size/type checks
- **Sanitization**: Filenames sanitized via src/lib/sanitize.ts

### Performance Optimizations

1. **Route-based code splitting**: All page components lazy-loaded via React.lazy()
2. **Preconnect to Supabase**: main.tsx adds preconnect/dns-prefetch links
3. **Route prefetching**: Browse and CreatorProfile preloaded during idle
4. **Conditional analytics**: Vercel Analytics/SpeedInsights only on production (hestia.sg domain)
5. **Image optimization**: Custom loading states, lazy loading

### Environment Variables

Required in `.env.local`:

```
VITE_SUPABASE_URL=https://{project-id}.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY={anon-public-key}
VITE_SUPABASE_PROJECT_ID={project-id}
```

### TypeScript Configuration

- Path alias: `@/` → `src/`
- Strict checks disabled for rapid development (noImplicitAny, strictNullChecks, etc.)
- Uses project references (tsconfig.app.json, tsconfig.node.json)

## Supabase Migrations

Migrations located in `supabase/migrations/` are applied in chronological order. Key migrations:

1. **initial_schema.sql**: Base tables, views, RLS policies, auth triggers
2. **artisan_mvp_fields.sql**: Added categories, pricing, contact fields
3. **auto_create_artisan_on_signup.sql**: Artisan profile creation logic
4. **gallery_images_policies.sql**: RLS policies for image uploads

When modifying schema:
1. Create new migration file with timestamp prefix
2. Update src/integrations/supabase/types.ts to match (auto-generated by Supabase CLI)
3. Test locally before deploying

## Common Patterns

### Adding a new artisan field

1. Add migration to `supabase/migrations/`
2. Regenerate types: Update `src/integrations/supabase/types.ts`
3. Update `artisans_public` view if needed
4. Update UI components that display/edit the field
5. Update validation in `src/lib/validations.ts` if applicable

### Creating a new page

1. Create component in `src/pages/`
2. Add lazy import in `src/App.tsx`
3. Add route in `<Routes>` section (before the `*` catch-all)
4. Consider adding to route prefetching in `src/main.tsx` if frequently accessed

### Role-based access

Use `useUserRole` hook to check user's role:

```typescript
const { role, isArtisan, isCommunityMember } = useUserRole();
```

RLS policies enforce database-level permissions. Frontend checks are for UX only.

## Important Notes

- The app is deployed on Vercel and uses Vercel Analytics
- Custom 404 page handling via NotFound component
- Scroll restoration handled by ScrollToTop component
- Custom toast system (toast-modern) instead of default sonner
- Uses SWC for faster builds (Vite + @vitejs/plugin-react-swc)
- TypeScript strict mode is disabled for rapid iteration

## Testing Considerations

- No test suite currently configured
- When adding tests, consider Vitest (matches Vite ecosystem)
- Focus testing on: auth flows, data fetching hooks, form validation
