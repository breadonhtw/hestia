# Hestia Security Guidelines

## Database Access Rules

### ✅ DO: Query Public Views
Always use `artisans_public` view for displaying artisan data:

```typescript
const { data } = await supabase.from('artisans_public').select('*');
```

### ❌ DON'T: Query Tables Directly (unless you own the data)
Never query `artisans` table directly for public display:

```typescript
// WRONG - exposes emails and GPS coordinates
const { data } = await supabase.from('artisans').select('*');
```

### Exception: Artisan Dashboard
Artisans can query their own full record:

```typescript
const { data } = await supabase
  .from('artisans')
  .select('*')
  .eq('user_id', user.id)
  .single();
```

## Row-Level Security Policies

The following RLS policies protect sensitive data:

1. **Anonymous users**: Can only query `artisans_public` view (no emails/GPS)
2. **Authenticated users**: Can only query `artisans_public` view (no emails/GPS)
3. **Artisan owners**: Can query their own full record from `artisans` table

## Input Validation

All user inputs must be validated using Zod schemas before:
- Submitting to database
- Displaying in UI
- Using in external links

See `src/lib/validations.ts` for schemas.

### Example: Form Validation

```typescript
import { joinFormSchema } from '@/lib/validations';

const result = joinFormSchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
}
```

## Link Sanitization

All external links must be sanitized to prevent XSS attacks:

```typescript
import { sanitizeUrl, sanitizeEmail, sanitizeInstagramHandle } from '@/lib/sanitize';

// Sanitize URLs
<a href={sanitizeUrl(website)} />

// Sanitize emails
<a href={`mailto:${sanitizeEmail(email)}`} />

// Sanitize Instagram handles
<a href={`https://instagram.com/${sanitizeInstagramHandle(handle)}`} />
```

## Sensitive Data Protection

### Email Addresses
- Stored in `artisans.email` column
- Only accessible by the artisan owner
- Use `contact_requests` table for public contact

### GPS Coordinates
- Stored in `artisans.latitude` and `artisans.longitude`
- Only accessible by the artisan owner
- Public location shows `artisans.location` (city/neighborhood)

## Security Checklist

Before launching:

- [ ] All RLS policies tested with authenticated and anonymous users
- [ ] Input validation implemented on all forms
- [ ] External links sanitized
- [ ] Email addresses only accessible to artisan owners
- [ ] GPS coordinates excluded from public queries
- [ ] Rate limiting configured on Auth
- [ ] Email confirmation enabled
- [ ] Security headers configured in Vercel
- [ ] Review `artisans_public` view is used in all public-facing queries
