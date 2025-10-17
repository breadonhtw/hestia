# RLS Performance Fix - Deployment Checklist

## Pre-Deployment

- [ ] Read `.claude/RLS_QUICK_REFERENCE.md`
- [ ] Review `.claude/RLS_PERFORMANCE_FIX_GUIDE.md` (optional, detailed)
- [ ] Backup your database
  ```bash
  supabase db pull
  ```
- [ ] Test in development first (if you have a dev environment)

## Deployment Methods (Pick ONE)

### Method 1: Supabase CLI (Recommended)
- [ ] Have Supabase CLI installed
- [ ] Navigate to project root: `cd /Users/brandon/hestia-2`
- [ ] Run: `supabase db push`
- [ ] Confirm: `supabase db lint` returns no errors

### Method 2: Supabase Dashboard
- [ ] Go to [app.supabase.com](https://app.supabase.com)
- [ ] Select your project
- [ ] Go to SQL Editor
- [ ] Create new query
- [ ] Copy contents of: `supabase/migrations/20251017000000_fix_rls_performance_warnings.sql`
- [ ] Run the query
- [ ] Wait for completion (should take < 30 seconds)

### Method 3: Direct Connection
- [ ] Have database credentials
- [ ] Run: `psql "postgresql://user:password@host:5432/db" -f supabase/migrations/20251017000000_fix_rls_performance_warnings.sql`

## Post-Deployment Verification

### Immediate (within 1 minute)

- [ ] No errors in deployment output
- [ ] Database is still responding
- [ ] Supabase dashboard loads normally

### Application Level (within 5 minutes)

- [ ] Website/app still loads
- [ ] Users can log in
- [ ] No "permission denied" errors in console

### Core Features (test within 15 minutes)

- [ ] Can view artisan profiles
- [ ] Can view published artisans
- [ ] Can edit own profile (if logged in)
- [ ] Can upload gallery images (if artisan)
- [ ] Admin can view dashboard
- [ ] Search/browse functionality works

### Performance Check (within 30 minutes)

- [ ] Run: `supabase db lint`
  - Expected: **0 performance warnings** ✅
- [ ] Check query performance
  - Should be noticeably faster
  - If not, run: `ANALYZE;` on affected tables

## Rollback Plan (If Needed)

If something goes wrong:

```bash
# Option 1: Reset entire database (loses all data)
supabase db reset

# Option 2: Revert just the RLS migration (requires git history)
git revert HEAD

# Option 3: Manually restore from backup
# Contact Supabase support
```

## Monitoring After Deployment

### Daily (first week)
- [ ] Check application logs for errors
- [ ] Verify no permission issues
- [ ] Monitor query performance

### Weekly (ongoing)
- [ ] Run `supabase db lint` (should remain 0 warnings)
- [ ] Check for any degraded performance
- [ ] Monitor error logs

## Success Criteria

✅ All of these should be true:

1. Database linter shows 0 performance warnings
2. All user authentication flows work
3. All access control works as before
4. No new error logs
5. Query performance improved or at least not degraded
6. All CRUD operations work (Create, Read, Update, Delete)

## Contact & Support

- Documentation: `.claude/RLS_PERFORMANCE_FIX_GUIDE.md`
- Quick ref: `.claude/RLS_QUICK_REFERENCE.md`
- Summary: `.claude/PERFORMANCE_WARNINGS_SUMMARY.md`
- Supabase docs: https://supabase.com/docs/guides/database/postgres/row-level-security

---

**Estimated Total Time**: 15-30 minutes
**Downtime Required**: 0 minutes
**Difficulty Level**: Easy
**Risk Level**: Very Low
