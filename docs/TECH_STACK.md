# Hestia Tech Stack Documentation

Complete documentation of all libraries, frameworks, and tools used in the Hestia web application.

---

## Table of Contents

1. [Core Framework](#core-framework)
2. [Backend & Database](#backend--database)
3. [UI Component Library](#ui-component-library)
4. [Forms & Validation](#forms--validation)
5. [Routing](#routing)
6. [State Management](#state-management)
7. [Styling](#styling)
8. [Animation](#animation)
9. [3D Graphics](#3d-graphics)
10. [Icons](#icons)
11. [Image Handling](#image-handling)
12. [Date & Time](#date--time)
13. [Charts & Data Visualization](#charts--data-visualization)
14. [SEO & Meta](#seo--meta)
15. [Analytics](#analytics)
16. [Utilities](#utilities)
17. [Development Tools](#development-tools)
18. [Testing](#testing)

---

## Core Framework

### React (v18.3.1)
**Purpose**: Core UI library
**Documentation**: https://react.dev/
**Usage**: Main framework for building the user interface with component-based architecture.

```typescript
import { useState, useEffect } from 'react';
```

### Vite (v6.3.6)
**Purpose**: Build tool and development server
**Documentation**: https://vitejs.dev/
**Usage**: Fast development server with hot module replacement (HMR), production builds, and code splitting.

```bash
npm run dev      # Start dev server on http://localhost:8080
npm run build    # Production build
npm run preview  # Preview production build
```

### TypeScript (v5.8.3)
**Purpose**: Type safety and better developer experience
**Documentation**: https://www.typescriptlang.org/
**Usage**: Provides static typing throughout the application.

```typescript
interface Publication {
  id: string;
  title: string;
  slug: string;
}
```

---

## Backend & Database

### Supabase (@supabase/supabase-js v2.74.0)
**Purpose**: Backend-as-a-Service (PostgreSQL, Auth, Storage, Realtime)
**Documentation**: https://supabase.com/docs
**Usage**: Complete backend solution providing database, authentication, storage, and real-time subscriptions.

```typescript
import { supabase } from '@/integrations/supabase/client';

// Query data
const { data, error } = await supabase
  .from('artisans_public')
  .select('*')
  .eq('status', 'published');

// Authentication
await supabase.auth.signInWithPassword({ email, password });

// Storage
await supabase.storage
  .from('artisan-images')
  .upload(path, file);
```

**Key Features Used:**
- PostgreSQL database with Row Level Security (RLS)
- Email/password authentication
- File storage for images
- Database functions and views
- Real-time subscriptions (future use)

---

## UI Component Library

### shadcn/ui (Radix UI)
**Purpose**: Accessible, customizable UI components
**Documentation**: https://ui.shadcn.com/
**Components Used**: All components are built on top of Radix UI primitives.

#### Radix UI Components

All Radix UI components provide:
- Full keyboard navigation
- Screen reader support
- Focus management
- Unstyled primitives (styled with Tailwind)

**Components in use:**

| Component | Version | Usage |
|-----------|---------|-------|
| `@radix-ui/react-accordion` | 1.2.11 | Expandable sections in FAQ/settings |
| `@radix-ui/react-alert-dialog` | 1.1.14 | Confirmation dialogs for destructive actions |
| `@radix-ui/react-aspect-ratio` | 1.1.7 | Maintain aspect ratios for images/videos |
| `@radix-ui/react-avatar` | 1.1.10 | User profile pictures with fallback |
| `@radix-ui/react-checkbox` | 1.3.2 | Form checkboxes (filters, settings) |
| `@radix-ui/react-collapsible` | 1.1.11 | Collapsible content sections |
| `@radix-ui/react-context-menu` | 2.2.15 | Right-click context menus |
| `@radix-ui/react-dialog` | 1.1.14 | Modal dialogs (magazine modal, forms) |
| `@radix-ui/react-dropdown-menu` | 2.1.15 | Dropdown menus in header/navigation |
| `@radix-ui/react-hover-card` | 1.1.14 | Hover preview cards |
| `@radix-ui/react-label` | 2.1.7 | Form field labels |
| `@radix-ui/react-menubar` | 1.1.15 | Menu bar navigation |
| `@radix-ui/react-navigation-menu` | 1.2.13 | Main navigation menus |
| `@radix-ui/react-popover` | 1.1.14 | Popovers for additional info |
| `@radix-ui/react-progress` | 1.1.7 | Progress indicators (image uploads) |
| `@radix-ui/react-radio-group` | 1.3.7 | Radio button groups in forms |
| `@radix-ui/react-scroll-area` | 1.2.9 | Custom scrollable areas |
| `@radix-ui/react-select` | 2.2.5 | Dropdown select inputs |
| `@radix-ui/react-separator` | 1.1.7 | Visual separators |
| `@radix-ui/react-slider` | 1.3.5 | Range sliders |
| `@radix-ui/react-slot` | 1.2.3 | Component composition utility |
| `@radix-ui/react-switch` | 1.2.5 | Toggle switches (dark mode, settings) |
| `@radix-ui/react-tabs` | 1.1.12 | Tab navigation (profile sections) |
| `@radix-ui/react-toast` | 1.2.14 | Toast notifications |
| `@radix-ui/react-toggle` | 1.1.9 | Toggle buttons |
| `@radix-ui/react-toggle-group` | 1.1.10 | Toggle button groups (filters) |
| `@radix-ui/react-tooltip` | 1.2.7 | Tooltips for additional context |

**Example Usage:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
```

### Additional UI Libraries

#### Sonner (v1.7.4)
**Purpose**: Toast notifications
**Documentation**: https://sonner.emilkowal.ski/
**Usage**: Modern toast notification system.

```typescript
import { toast } from 'sonner';

toast.success('Profile updated successfully!');
toast.error('Failed to upload image');
```

#### Vaul (v0.9.9)
**Purpose**: Drawer component for mobile
**Documentation**: https://github.com/emilkowalski/vaul
**Usage**: Mobile-optimized drawer/bottom sheet.

#### cmdk (v1.1.1)
**Purpose**: Command palette/menu
**Documentation**: https://cmdk.paco.me/
**Usage**: Fast, accessible command menu (Cmd+K style search).

---

## Forms & Validation

### React Hook Form (v7.61.1)
**Purpose**: Performant form state management
**Documentation**: https://react-hook-form.com/
**Usage**: Handles all form state, validation, and submission with minimal re-renders.

```typescript
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = (data) => {
  console.log(data);
};
```

### Zod (v3.25.76)
**Purpose**: TypeScript-first schema validation
**Documentation**: https://zod.dev/
**Usage**: Runtime type checking and validation for forms and API responses.

```typescript
import { z } from 'zod';

const profileSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
});
```

### @hookform/resolvers (v3.10.0)
**Purpose**: Validation resolvers for React Hook Form
**Usage**: Integrates Zod with React Hook Form.

```typescript
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(profileSchema),
});
```

---

## Routing

### React Router DOM (v6.30.1)
**Purpose**: Client-side routing
**Documentation**: https://reactrouter.com/
**Usage**: Handles all routing, navigation, and route parameters.

```typescript
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';

// Route definition
<Route path="/artisan/:username" element={<CreatorProfile />} />

// Navigation
const navigate = useNavigate();
navigate('/browse');

// Get params
const { username } = useParams();
```

**Routes in Hestia:**
- `/` - Landing page
- `/browse` - Browse artisans
- `/search` - Search artisans
- `/artisan/:username` - Artisan profile
- `/publications` - Magazine archive
- `/profile` - User profile settings
- `/become-artisan` - Artisan application

---

## State Management

### TanStack Query (React Query v5.83.0)
**Purpose**: Server state management and data fetching
**Documentation**: https://tanstack.com/query/latest
**Usage**: Manages all server state with caching, background refetching, and optimistic updates.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['artisans'],
  queryFn: fetchArtisans,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutations
const mutation = useMutation({
  mutationFn: updateProfile,
  onSuccess: () => {
    queryClient.invalidateQueries(['profile']);
  },
});
```

**Key Features Used:**
- Query caching with staleTime
- Automatic background refetching
- Optimistic updates
- Query invalidation
- Mutation handling

#### TanStack Query Persist Client (v5.90.5)
**Purpose**: Persist React Query cache
**Usage**: Persists query cache to localStorage for offline access.

#### TanStack React Virtual (v3.13.12)
**Purpose**: Virtualizing large lists
**Documentation**: https://tanstack.com/virtual/latest
**Usage**: Efficiently render large lists of artisans (future optimization).

### React Context API
**Purpose**: Global state for authentication
**Usage**: `AuthContext` for user authentication state.

```typescript
// src/contexts/AuthContext.tsx
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

## Styling

### Tailwind CSS (v3.4.17)
**Purpose**: Utility-first CSS framework
**Documentation**: https://tailwindcss.com/
**Usage**: All styling is done with Tailwind utility classes.

```typescript
<div className="flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all">
```

**Custom Configuration:**
- Custom color palette (primary, secondary, accent)
- Custom animations
- Custom shadows and effects
- Extended spacing and sizing

### PostCSS (v8.5.6)
**Purpose**: CSS processing
**Usage**: Processes Tailwind directives and optimizes CSS.

### Autoprefixer (v10.4.21)
**Purpose**: Add vendor prefixes
**Usage**: Automatically adds browser prefixes for CSS properties.

### Tailwind Merge (v2.6.0)
**Purpose**: Merge Tailwind classes intelligently
**Usage**: Resolves conflicting Tailwind classes in component props.

```typescript
import { cn } from '@/lib/utils';

// cn is a utility using tailwind-merge
<Button className={cn("bg-primary", className)} />
```

### Tailwindcss Animate (v1.0.7)
**Purpose**: Animation utilities for Tailwind
**Usage**: Adds animation classes like `animate-spin`, `animate-bounce`.

### @tailwindcss/typography (v0.5.16)
**Purpose**: Beautiful typography defaults
**Usage**: Styles rich text content with `.prose` class.

```typescript
<div className="prose dark:prose-invert">
  {/* Markdown or rich text content */}
</div>
```

### Class Variance Authority (v0.7.1)
**Purpose**: Create variant-based components
**Documentation**: https://cva.style/docs
**Usage**: Type-safe variant props for components.

```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
  }
);
```

### clsx (v2.1.1)
**Purpose**: Conditional class names
**Usage**: Construct className strings conditionally.

```typescript
import clsx from 'clsx';

<div className={clsx('base-class', { 'active': isActive, 'disabled': isDisabled })} />
```

---

## Animation

### Framer Motion (v12.23.22)
**Purpose**: Production-ready animation library
**Documentation**: https://www.framer.com/motion/
**Usage**: Page transitions, element animations, gestures, and layout animations.

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

**Key Features Used:**
- Page transitions
- Scroll-triggered animations
- Stagger animations for lists
- Layout animations
- Gesture support (drag, tap, hover)

### Motion (v12.23.22)
**Purpose**: Lightweight animation library (alternative to Framer Motion)
**Usage**: Simpler animations where Framer Motion is overkill.

---

## 3D Graphics

### Three.js (v0.160.1)
**Purpose**: 3D graphics library
**Documentation**: https://threejs.org/
**Usage**: WebGL-based 3D rendering for decorative effects.

### React Three Fiber (@react-three/fiber v8.18.0)
**Purpose**: React renderer for Three.js
**Documentation**: https://docs.pmnd.rs/react-three-fiber
**Usage**: Declarative 3D scenes in React.

```typescript
import { Canvas } from '@react-three/fiber';

<Canvas>
  <mesh>
    <boxGeometry />
    <meshStandardMaterial color="orange" />
  </mesh>
</Canvas>
```

### React Three Drei (@react-three/drei v9.122.0)
**Purpose**: Useful helpers for React Three Fiber
**Documentation**: https://github.com/pmnd/drei
**Usage**: Pre-built 3D components and utilities.

**Components Used:**
- `OrbitControls` - Camera controls
- `Environment` - HDRI lighting
- `Float` - Floating animation
- `MeshDistortMaterial` - Distorted materials for effects

---

## Icons

### Lucide React (v0.462.0)
**Purpose**: Beautiful, consistent icon set
**Documentation**: https://lucide.dev/
**Usage**: Primary icon library throughout the app.

```typescript
import { Heart, Share2, ExternalLink, User, Settings } from 'lucide-react';

<Heart className="h-5 w-5 text-red-500" />
```

**Icons Used:**
- Navigation: `Menu`, `X`, `ChevronDown`, `ChevronRight`
- Actions: `Heart`, `Share2`, `Edit`, `Trash`, `Plus`
- Social: `Instagram`, `Globe`, `Mail`, `Phone`
- Categories: `Palette`, `Scissors`, `Hammer`, `CakeSlice`, `Gem`, `Flower`, `Home`

### Tabler Icons React (@tabler/icons-react v3.35.0)
**Purpose**: Additional icon set
**Documentation**: https://tabler-icons.io/
**Usage**: Supplementary icons not in Lucide.

---

## Image Handling

### React Easy Crop (v5.5.3)
**Purpose**: Image cropping interface
**Documentation**: https://ricardo-ch.github.io/react-easy-crop/
**Usage**: Crop and resize images before upload (avatars, gallery images).

```typescript
import Cropper from 'react-easy-crop';

<Cropper
  image={imageSrc}
  crop={crop}
  zoom={zoom}
  aspect={1}
  onCropChange={setCrop}
  onZoomChange={setZoom}
  onCropComplete={onCropComplete}
/>
```

---

## Date & Time

### date-fns (v3.6.0)
**Purpose**: Modern date utility library
**Documentation**: https://date-fns.org/
**Usage**: Format dates, calculate date differences, parse dates.

```typescript
import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Format date
format(new Date(), 'PPP'); // "January 1st, 2025"

// Relative time
formatDistanceToNow(new Date(publication.created_at)); // "2 days ago"
```

### React Day Picker (v8.10.1)
**Purpose**: Date picker component
**Documentation**: https://daypicker.dev/
**Usage**: Calendar date picker for forms.

```typescript
import { DayPicker } from 'react-day-picker';

<DayPicker
  mode="single"
  selected={date}
  onSelect={setDate}
/>
```

---

## Charts & Data Visualization

### Recharts (v2.15.4)
**Purpose**: Composable charting library
**Documentation**: https://recharts.org/
**Usage**: Analytics dashboards and data visualization.

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

<LineChart data={analyticsData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="views" stroke="#8884d8" />
</LineChart>
```

**Used in:**
- Analytics dashboard (`/settings/analytics`)
- Portfolio insights
- Engagement metrics

---

## SEO & Meta

### React Helmet (v6.1.0)
**Purpose**: Manage document head
**Documentation**: https://github.com/nfl/react-helmet
**Usage**: Set page titles, meta tags, Open Graph tags, and structured data.

```typescript
import { Helmet } from 'react-helmet';

<Helmet>
  <title>Hestia – Discover Local Artisans</title>
  <meta name="description" content="Connect with talented artisans..." />
  <link rel="canonical" href="https://www.hestia.sg/" />
  <meta property="og:title" content="Hestia" />
  <meta property="og:image" content="https://www.hestia.sg/og-image.jpg" />
  <script type="application/ld+json">
    {JSON.stringify(structuredData)}
  </script>
</Helmet>
```

**SEO Features:**
- Dynamic page titles
- Meta descriptions
- Open Graph tags (Facebook/LinkedIn)
- Twitter Cards
- Canonical URLs
- JSON-LD structured data (Schema.org)

---

## Analytics

### Vercel Analytics (@vercel/analytics v1.5.0)
**Purpose**: Web analytics
**Documentation**: https://vercel.com/docs/analytics
**Usage**: Track page views, user behavior, and performance metrics.

```typescript
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

**Only loaded on production domain (hestia.sg).**

### Vercel Speed Insights (@vercel/speed-insights v1.2.0)
**Purpose**: Real User Monitoring (RUM)
**Documentation**: https://vercel.com/docs/speed-insights
**Usage**: Track Core Web Vitals and performance metrics.

```typescript
import { SpeedInsights } from '@vercel/speed-insights/react';

<SpeedInsights />
```

---

## Utilities

### React Aria Components (v1.13.0)
**Purpose**: Accessible component primitives
**Documentation**: https://react-spectrum.adobe.com/react-aria/
**Usage**: Accessibility utilities and ARIA-compliant behaviors.

### React Resizable Panels (v2.1.9)
**Purpose**: Resizable panel layouts
**Documentation**: https://github.com/bvaughn/react-resizable-panels
**Usage**: Split panes and resizable layouts.

### Embla Carousel React (v8.6.0)
**Purpose**: Lightweight carousel
**Documentation**: https://www.embla-carousel.com/
**Usage**: Image galleries and slideshows.

```typescript
import useEmblaCarousel from 'embla-carousel-react';

const [emblaRef] = useEmblaCarousel();

<div className="embla" ref={emblaRef}>
  <div className="embla__container">
    {images.map((img) => (
      <div className="embla__slide" key={img.id}>
        <img src={img.url} alt={img.title} />
      </div>
    ))}
  </div>
</div>
```

### Input OTP (v1.4.2)
**Purpose**: One-time password input
**Documentation**: https://input-otp.rodz.dev/
**Usage**: OTP/PIN input fields (future authentication features).

### next-themes (v0.3.0)
**Purpose**: Theme management (light/dark mode)
**Documentation**: https://github.com/pacocoursey/next-themes
**Usage**: Dark mode toggle with system preference support.

```typescript
import { ThemeProvider, useTheme } from 'next-themes';

// Wrap app
<ThemeProvider attribute="class" defaultTheme="system">
  <App />
</ThemeProvider>

// Use in components
const { theme, setTheme } = useTheme();
setTheme('dark');
```

---

## Development Tools

### ESLint (v9.32.0)
**Purpose**: JavaScript/TypeScript linting
**Documentation**: https://eslint.org/
**Usage**: Enforce code quality and consistency.

```bash
npm run lint
```

**Plugins:**
- `eslint-plugin-react-hooks` (v5.2.0) - React Hooks rules
- `eslint-plugin-react-refresh` (v0.4.20) - React Fast Refresh rules

### @vitejs/plugin-react-swc (v3.11.0)
**Purpose**: Fast Refresh with SWC compiler
**Documentation**: https://github.com/vitejs/vite-plugin-react-swc
**Usage**: Ultra-fast compilation with Rust-based SWC instead of Babel.

**Performance:**
- ~20x faster than Babel
- Faster builds and HMR

### Rollup Plugin Visualizer (v6.0.4)
**Purpose**: Bundle size analysis
**Documentation**: https://github.com/btd/rollup-plugin-visualizer
**Usage**: Visualize bundle composition and identify large dependencies.

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  visualizer({ open: true })
]
```

### Lovable Tagger (v1.1.10)
**Purpose**: Development utility for Lovable.ai platform
**Usage**: Internal tagging/tracking for Lovable platform integration.

---

## Testing

### Vitest (v3.2.4)
**Purpose**: Unit testing framework
**Documentation**: https://vitest.dev/
**Usage**: Fast unit tests powered by Vite.

```bash
npm run test          # Watch mode
npm run test:run      # Run once
npm run test:coverage # Coverage report
npm run test:ui       # UI dashboard
```

### @vitest/ui (v3.2.4)
**Purpose**: Testing UI dashboard
**Usage**: Visual test runner with browser interface.

### Testing Library
**Purpose**: Test React components
**Documentation**: https://testing-library.com/react

**Packages:**
- `@testing-library/react` (v16.3.0) - React testing utilities
- `@testing-library/jest-dom` (v6.9.1) - Custom Jest matchers
- `@testing-library/user-event` (v14.6.1) - User interaction simulation

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('clicking button increments counter', async () => {
  render(<Counter />);
  const button = screen.getByRole('button');
  await userEvent.click(button);
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### jsdom (v27.0.0)
**Purpose**: DOM implementation for testing
**Usage**: Simulates browser environment in Node.js for tests.

---

## Package Manager & Node

### npm
**Package Manager**: npm (bundled with Node.js)
**Node Version**: v18+ recommended

### TypeScript Types

Type definitions for dependencies:

```json
{
  "@types/node": "^22.16.5",
  "@types/react": "^18.3.23",
  "@types/react-dom": "^18.3.7"
}
```

---

## Architecture Patterns

### Custom Hooks Pattern
All business logic is extracted into custom hooks in `src/hooks/`:

```typescript
// src/hooks/useArtisans.ts
export function useArtisans() {
  return useQuery({
    queryKey: ['artisans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artisans_public')
        .select('*')
        .eq('status', 'published');
      if (error) throw error;
      return data;
    },
  });
}
```

### Component Composition Pattern
Components are composed from smaller, reusable pieces:

```typescript
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Code Splitting / Lazy Loading
Routes are lazy-loaded to reduce initial bundle size:

```typescript
const CreatorProfile = React.lazy(() => import('./pages/CreatorProfile'));

<Route path="/artisan/:username" element={
  <Suspense fallback={<LoadingSpinner />}>
    <CreatorProfile />
  </Suspense>
} />
```

---

## Development Scripts

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:8080)

# Building
npm run build        # Production build
npm run build:dev    # Development build with sourcemaps
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint

# Testing
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Open test UI
npm run test:coverage # Generate coverage report
```

---

## Environment Variables

Required environment variables (`.env.local`):

```bash
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-public-key]
VITE_SUPABASE_PROJECT_ID=[project-id]
```

---

## Browser Support

### Modern Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Features Used
- ES2020+ syntax
- CSS Grid & Flexbox
- CSS Custom Properties
- Web APIs: `localStorage`, `IntersectionObserver`, `ResizeObserver`

---

## Performance Optimizations

1. **Code Splitting**: Route-based lazy loading
2. **Image Optimization**: Lazy loading, optimized formats
3. **Bundle Analysis**: Visualizer plugin for size monitoring
4. **Tree Shaking**: Vite automatically removes unused code
5. **Query Caching**: TanStack Query caches server responses
6. **Minification**: Production builds are minified with Terser

---

## Security Features

1. **Row Level Security (RLS)**: Database-level permissions
2. **XSS Protection**: React escapes content by default
3. **HTTPS Only**: Enforced in production
4. **Secure Authentication**: Supabase Auth with JWT tokens
5. **Input Validation**: Zod schema validation
6. **File Upload Validation**: Type and size checks

---

## Deployment

### Vercel (Recommended)
**Platform**: Vercel
**Config**: `vercel.json` (if present)
**Build Command**: `npm run build`
**Output Directory**: `dist`

### Environment Setup
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

---

## Contributing

### Setting Up Development Environment

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/hestia.git
cd hestia
```

2. **Install Dependencies**
```bash
npm install
```

3. **Set Up Environment Variables**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Run Tests**
```bash
npm run test
```

### Code Style Guidelines

- Use TypeScript for all new code
- Follow existing component patterns
- Use Tailwind CSS for styling (no inline styles)
- Extract business logic into custom hooks
- Write tests for new features
- Use semantic HTML
- Ensure accessibility (ARIA labels, keyboard navigation)

### Pull Request Process

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Run tests: `npm run test:run`
4. Run linter: `npm run lint`
5. Build: `npm run build`
6. Push and create PR: `git push origin feature/your-feature`

---

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **React Documentation**: https://react.dev/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **TanStack Query Docs**: https://tanstack.com/query/latest
- **React Router Docs**: https://reactrouter.com/
- **Vite Documentation**: https://vitejs.dev/

---

## License

See `LICENSE` file in repository.

---

## Support

For questions or issues:
- Create an issue on GitHub
- Check existing documentation in `/docs`
- Review the CLAUDE.md file for development guidelines

---

**Last Updated**: October 17, 2025
**Version**: 1.0.0
**Maintainer**: Hestia Development Team
