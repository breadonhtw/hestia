# Environment Setup Guide

This project supports two environments for Supabase:

## 🏠 Local Development Environment
- **File**: `.env.development`
- **Mode**: `development`
- **Supabase URL**: `http://127.0.0.1:54321`
- **Use when**: Working locally with Supabase CLI

## ☁️ Cloud/Production Environment  
- **File**: `.env.production`
- **Mode**: `production`
- **Supabase URL**: `https://jkbdphlwosqamkwonshm.supabase.co`
- **Use when**: Working with cloud Supabase instance

## 🚀 Quick Start Commands

### For Cloud Development (Default):
```bash
# Start React app with cloud environment (default)
npm run dev
```

### For Local Development:
```bash
# Start local Supabase (if not already running)
npx supabase start

# Start React app with local environment
npm run dev:local
```

### Alternative Cloud Command:
```bash
# Explicitly start with cloud environment
npm run dev:cloud
```

## 📁 Environment Files

- `.env.production` - Cloud Supabase production (default)
- `.env.development` - Local Supabase development

## 🔄 Switching Environments

1. **Default (Cloud)**: Use `npm run dev` - loads `.env.production`
2. **Local Development**: Use `npm run dev:local` - loads `.env.development`
3. **Explicit Cloud**: Use `npm run dev:cloud` - loads `.env.production`

## 🛠️ Building for Different Environments

```bash
# Build for cloud environment (default)
npm run build

# Build for local environment
npm run build:local

# Build for cloud environment (explicit)
npm run build:cloud
```

## 🔍 Verifying Environment

Check the browser console for Supabase configuration logs to verify which environment is being used:

- **Cloud Environment**: Shows `https://jkbdphlwosqamkwonshm.supabase.co`
- **Local Environment**: Shows `http://127.0.0.1:54321`

## 📋 Command Summary

| Command | Environment | Mode | File Used | Supabase URL |
|---------|-------------|------|-----------|--------------|
| `npm run dev` | ☁️ Cloud (default) | `production` | `.env.production` | `https://jkbdphlwosqamkwonshm.supabase.co` |
| `npm run dev:local` | 🏠 Local | `development` | `.env.development` | `http://127.0.0.1:54321` |
| `npm run dev:cloud` | ☁️ Cloud | `production` | `.env.production` | `https://jkbdphlwosqamkwonshm.supabase.co` |
