# Hestia - Discover Local Artisans

A modern web platform connecting artisans and makers with their local community in Singapore. Hestia helps home-based artisans showcase their work, build their brand, and connect with customers who appreciate handcrafted goods.

![Hestia Platform](https://www.hestia.sg/og-image.jpg)

---

## 🌟 Features

- **Artisan Profiles**: Beautiful, customizable profiles with portfolio galleries
- **Browse & Search**: Find artisans by craft type, location, or keywords
- **Publications System**: Weekly magazine featuring community stories
- **Favorites**: Save and organize favorite artisans
- **Analytics Dashboard**: Track profile views, favorites, and engagement
- **Badge System**: Recognition badges for verified, top-rated, and featured artisans
- **Dark Mode**: Beautiful light and dark themes
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **SEO Optimized**: Structured data, Open Graph tags, and semantic HTML

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm))
- npm (comes with Node.js)
- Supabase account ([sign up free](https://supabase.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hestia.git
cd hestia
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

4. **Set up Supabase database**
```bash
# Apply migrations
npx supabase db push
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:8080` 🎉

---

## 📚 Documentation

- **[Tech Stack Documentation](docs/TECH_STACK.md)** - Complete guide to all libraries and frameworks used
- **[Project Instructions (CLAUDE.md)](CLAUDE.md)** - Architecture, patterns, and development guidelines
- **[Adding Magazines Guide](docs/adding-magazines.md)** - How to add weekly publications
- **[Publications Summary](docs/PUBLICATIONS_SUMMARY.md)** - Publications system overview
- **[Development Roadmap](.claude/CLAUDE.md)** - Upcoming features and improvements

---

## 🛠️ Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling

### Backend
- **Supabase** - PostgreSQL database, authentication, storage
- **TanStack Query** - Server state management
- **React Router** - Client-side routing

### UI Components
- **shadcn/ui** - Radix UI primitives with Tailwind styling
- **Framer Motion** - Animations
- **Lucide Icons** - Icon library

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Additional Features
- **React Helmet** - SEO/meta tags
- **Vercel Analytics** - Web analytics
- **Recharts** - Data visualization
- **date-fns** - Date utilities

**[📖 View Full Tech Stack Documentation →](docs/TECH_STACK.md)**

---

## 📁 Project Structure

```
hestia-2/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── artisan/      # Artisan-specific components
│   │   └── ...           # Other components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Route components
│   ├── contexts/         # React Context providers
│   ├── lib/              # Utility functions
│   ├── integrations/     # Third-party integrations
│   │   └── supabase/     # Supabase client & types
│   ├── assets/           # Images, fonts, etc.
│   └── styles/           # Global styles
├── docs/                 # Documentation
├── supabase/
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── ...config files
```

---

## 🔧 Development

### Available Scripts

```bash
# Development
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

### Database Management

```bash
# Apply migrations to remote database
npx supabase db push

# Reset local database
npx supabase db reset

# Generate TypeScript types from database
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

---

## 🎨 Key Features

### Artisan Profiles
- Customizable profile with bio, contact info, and social links
- Portfolio gallery with drag-and-drop image upload
- Craft categories and tags
- Pricing and availability information
- Analytics dashboard

### Publications System
Weekly magazine featuring artisan stories:
- Designed in Canva as presentations
- Embedded viewer on desktop, direct link on mobile
- Weekly rotation based on active dates
- Archive of past issues

### Badge System
Recognition badges for artisans:
- Verified Artisan
- Top Rated
- Quick Responder
- Eco-Friendly
- Workshop Host
- Featured Artisan

### Analytics Dashboard
Track performance metrics:
- Profile views (daily, weekly, monthly)
- Favorites count
- Contact requests
- Image views
- Engagement rate
- Smart tips for improvement

---

## 🌍 Environment Configuration

### Required Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-public-key]
VITE_SUPABASE_PROJECT_ID=[project-id]
```

### Optional Environment Variables

```bash
# Analytics (production only)
# Automatically enabled on hestia.sg domain
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository to Vercel**
2. **Configure Environment Variables** in Vercel dashboard
3. **Deploy**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy the dist/ folder to your hosting provider
```

---

## 🧪 Testing

Tests are written using Vitest and Testing Library:

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm run test:run`
5. Run linter: `npm run lint`
6. Build: `npm run build`
7. Commit: `git commit -m "Add your feature"`
8. Push: `git push origin feature/your-feature`
9. Create a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing patterns (see [CLAUDE.md](CLAUDE.md))
- Use Tailwind CSS for styling
- Extract business logic into custom hooks
- Write semantic, accessible HTML
- Add tests for new features

### Pull Request Guidelines

- Describe what your PR does
- Link related issues
- Ensure all tests pass
- Update documentation if needed

---

## 📖 Database Schema

### Main Tables
- `profiles` - User profiles (community members & artisans)
- `artisans` - Artisan-specific data
- `artisans_public` - Public view of artisan data (always query this!)
- `gallery_images` - Portfolio images
- `publications` - Weekly magazines
- `badge_types` - Available badge types
- `artisan_badges` - Awarded badges
- `user_favorites` - Favorited artisans
- `artisan_applications` - Artisan applications
- `analytics_events` - Analytics tracking
- `analytics_summaries` - Aggregated analytics

### Key Functions
- `get_current_weekly_publication()` - Get current week's magazine
- `get_past_weekly_publications()` - Get past magazines
- `create_publication()` - Add new magazine
- `create_artisan_profile()` - Initialize artisan profile
- `publish_artisan_profile()` - Publish artisan profile

**[📖 See CLAUDE.md for detailed schema documentation](CLAUDE.md)**

---

## 🔒 Security

- **Row Level Security (RLS)** - Database-level access control
- **Secure Authentication** - Supabase Auth with JWT tokens
- **Input Validation** - Zod schema validation
- **XSS Protection** - React escapes content by default
- **HTTPS Only** - Enforced in production
- **File Upload Validation** - Type and size checks

---

## 🎯 Roadmap

### Phase 2 (In Progress)
- [ ] Admin dashboard
- [ ] Content moderation system
- [ ] Client management for artisans

### Phase 3 (Planned)
- [ ] Bulk upload system
- [ ] Newsletter system
- [ ] Referral program

**[📋 View Full Roadmap →](.claude/CLAUDE.md)**

---

## 📄 License

[MIT License](LICENSE) - feel free to use this project for your own purposes.

---

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Backend by [Supabase](https://supabase.com/)

---

## 📧 Support & Contact

- **Documentation**: See `/docs` folder
- **Issues**: [Create an issue](https://github.com/yourusername/hestia/issues)
- **Website**: [hestia.sg](https://hestia.sg)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Made with ❤️ for the artisan community in Singapore**
