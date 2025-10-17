# Adding Weekly Magazines to Hestia

This guide explains how to add and manage weekly magazine publications in Hestia.

## Overview

The publications system allows you to feature weekly magazines on the homepage and maintain an archive at `/publications`. Each magazine includes:
- Cover image
- Issue number
- Theme
- Description
- External URL (link to your hosted magazine)
- Active date range (for weekly rotation)

## Adding a New Magazine

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run this query:

```sql
SELECT create_publication(
  p_title := 'Artisan Spotlight: Pottery Masters',
  p_slug := 'pottery-masters-2025-01',
  p_description := 'Meet the talented potters bringing clay to life in their home studios across Singapore.',
  p_cover_image_url := 'https://your-storage-url/magazine-covers/issue-1.jpg',
  p_external_url := 'https://www.canva.com/design/DAFxxxxx/view',
  p_active_from := '2025-10-17 00:00:00+00',
  p_active_until := '2025-10-24 00:00:00+00',
  p_issue_number := 1,
  p_theme := 'Pottery & Ceramics'
);
```

### Option 2: Direct Table Insert

If you prefer to insert directly into the table:

```sql
INSERT INTO publications (
  title,
  slug,
  description,
  cover_image_url,
  external_url,
  active_from,
  active_until,
  issue_number,
  theme,
  status,
  published_at,
  created_by
) VALUES (
  'Artisan Spotlight: Pottery Masters',
  'pottery-masters-2025-01',
  'Meet the talented potters bringing clay to life in their home studios across Singapore.',
  'https://your-storage-url/magazine-covers/issue-1.jpg',
  'https://www.canva.com/design/DAFxxxxx/view',
  '2025-10-17 00:00:00+00'::timestamptz,
  '2025-10-24 00:00:00+00'::timestamptz,
  1,
  'Pottery & Ceramics',
  'published',
  NOW(),
  auth.uid()
);
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | text | Yes | Magazine title (shown prominently) |
| `slug` | text | Yes | URL-friendly identifier (must be unique) |
| `description` | text | No | Brief description of the magazine content |
| `cover_image_url` | text | No | URL to cover image (recommended: 1600x1000px) |
| `external_url` | text | No | Canva presentation URL (opens on click) |
| `active_from` | timestamptz | No | Start date for this issue (UTC timezone) |
| `active_until` | timestamptz | No | End date for this issue (UTC timezone) |
| `issue_number` | integer | No | Issue number (e.g., 1, 2, 3) |
| `theme` | text | No | Theme or category (e.g., "Pottery & Ceramics") |
| `status` | text | Yes | Default: 'published' |

## Weekly Rotation System

The system automatically displays the correct magazine based on the current date:

- **Current Week**: Shows magazine where `NOW()` is between `active_from` and `active_until`
- **Past Issues**: Shows magazines where `NOW()` is after `active_until`

### Example: Setting Up 4 Weeks of Magazines

```sql
-- Week 1: Oct 17-24
SELECT create_publication(
  p_title := 'Pottery Masters',
  p_slug := 'pottery-masters-oct-2025',
  p_external_url := 'https://www.canva.com/design/DAFxxxxx/view',
  p_active_from := '2025-10-17 00:00:00+00',
  p_active_until := '2025-10-24 00:00:00+00',
  p_issue_number := 1,
  p_theme := 'Pottery & Ceramics'
);

-- Week 2: Oct 24-31
SELECT create_publication(
  p_title := 'Textile Artisans',
  p_slug := 'textile-artisans-oct-2025',
  p_external_url := 'https://www.canva.com/design/DAFyyyyy/view',
  p_active_from := '2025-10-24 00:00:00+00',
  p_active_until := '2025-10-31 00:00:00+00',
  p_issue_number := 2,
  p_theme := 'Textiles & Fiber Arts'
);

-- Week 3: Oct 31 - Nov 7
SELECT create_publication(
  p_title := 'Woodworking Stories',
  p_slug := 'woodworking-nov-2025',
  p_external_url := 'https://www.canva.com/design/DAFzzzzz/view',
  p_active_from := '2025-10-31 00:00:00+00',
  p_active_until := '2025-11-07 00:00:00+00',
  p_issue_number := 3,
  p_theme := 'Woodworking'
);

-- Week 4: Nov 7-14
SELECT create_publication(
  p_title := 'Home Bakers & Preservers',
  p_slug := 'bakers-preservers-nov-2025',
  p_external_url := 'https://www.canva.com/design/DAFwwwww/view',
  p_active_from := '2025-11-07 00:00:00+00',
  p_active_until := '2025-11-14 00:00:00+00',
  p_issue_number := 4,
  p_theme := 'Baked Goods & Preserves'
);
```

## Uploading Cover Images

### Using Supabase Storage

1. Go to Supabase Dashboard → Storage
2. Create a bucket called `magazine-covers` (if not exists)
3. Set bucket to **public**
4. Upload your cover image (recommended dimensions: 1600x1000px, aspect ratio 16:10)
5. Copy the public URL
6. Use this URL in the `cover_image_url` field

### Image Guidelines

- **Format**: JPG or PNG
- **Size**: Max 2MB for optimal loading
- **Dimensions**: 1600x1000px (16:10 aspect ratio)
- **Content**: High-quality, visually appealing cover that represents the theme

## Creating Canva Magazines

1. **Design your magazine in Canva**
   - Go to Canva.com and create a new Presentation
   - Use multi-page layouts to design your magazine content
   - Add images, text, graphics, and branding

2. **Publish your Canva Presentation**
   - Click "Share" in the top right
   - Select "Present and record" or use the presentation view
   - Copy the public presentation URL (e.g., `https://www.canva.com/design/[design-id]/view`)
   - Ensure presentation is set to public/anyone with link can view

3. **Use the Canva URL**
   - Use the Canva presentation URL in the `external_url` field
   - Canva presentations work perfectly with iframe embedding

**Alternative: Export as PDF**
- Export magazine as PDF from Canva
- Upload to Supabase Storage → `magazine-pdfs` bucket
- Use a PDF viewer service to generate embeddable URL

The magazine will:
- Open in a modal on desktop (>768px screens) with embedded Canva presentation
- Open in a new tab on mobile (<768px screens)

## Viewing Published Magazines

- **Homepage**: Current week's magazine appears in the featured section
- **Archive**: All past magazines available at `/publications`
- **Admin View**: Can see draft/unpublished magazines in database

## Updating an Existing Magazine

```sql
UPDATE publications
SET
  title = 'Updated Title',
  description = 'Updated description',
  external_url = 'https://www.canva.com/design/DAFnewid/view',
  cover_image_url = 'https://new-image-url.jpg'
WHERE slug = 'pottery-masters-oct-2025';
```

## Deleting a Magazine

```sql
-- Soft delete (set to draft)
UPDATE publications
SET status = 'draft'
WHERE slug = 'pottery-masters-oct-2025';

-- Hard delete (permanent)
DELETE FROM publications
WHERE slug = 'pottery-masters-oct-2025';
```

## Troubleshooting

### Magazine Not Showing on Homepage

1. Check the `active_from` and `active_until` dates - ensure current time is within range
2. Verify `status` is set to `'published'`
3. Check timezone - dates should be in UTC

```sql
-- Check what should be current
SELECT * FROM publications
WHERE status = 'published'
  AND active_from IS NOT NULL
  AND active_until IS NOT NULL
  AND NOW() >= active_from
  AND NOW() < active_until
ORDER BY issue_number DESC;
```

### Magazine Shows Wrong Dates

- Dates are stored in UTC timezone
- `active_from` is inclusive (start of week)
- `active_until` is exclusive (start of next week)

### Modal Not Opening

- Check that `external_url` is populated
- Verify URL is accessible and allows iframe embedding
- Check browser console for errors

## Best Practices

1. **Plan Ahead**: Create magazines 1-2 weeks in advance
2. **Sequential Issues**: Use sequential issue numbers (1, 2, 3...)
3. **Consistent Themes**: Align themes with artisan craft categories
4. **Quality Images**: Use high-resolution, branded cover images
5. **Test Before Publishing**: Set `status = 'draft'` initially, then update to `'published'`
6. **No Gaps**: Ensure `active_until` of one issue = `active_from` of next issue

## Theme Ideas

Match your magazine themes to Hestia's artisan categories:
- Pottery & Ceramics
- Textiles & Fiber Arts
- Woodworking
- Baked Goods & Preserves
- Jewelry & Accessories
- Art & Illustration
- Plants & Florals
- Home Decor
- Seasonal Specials
- Maker Stories

## Example: Complete Magazine Setup

```sql
-- 1. Design magazine in Canva as a Presentation
-- 2. Publish Canva presentation and copy the public URL
-- 3. Upload cover image to Supabase Storage → magazine-covers/
-- 4. Run this SQL:

SELECT create_publication(
  p_title := 'Stories from the Studio: Ceramic Artists of Singapore',
  p_slug := 'ceramic-artists-singapore-nov-2025',
  p_description := 'Step into the studios of Singapore''s most talented ceramic artists. Discover their inspirations, techniques, and the beautiful pieces they create from clay.',
  p_cover_image_url := 'https://[project-id].supabase.co/storage/v1/object/public/magazine-covers/issue-5-ceramics.jpg',
  p_external_url := 'https://www.canva.com/design/DAF12345/view',
  p_active_from := '2025-11-14 00:00:00+00',
  p_active_until := '2025-11-21 00:00:00+00',
  p_issue_number := 5,
  p_theme := 'Pottery & Ceramics'
);

-- 5. Verify it was created:
SELECT * FROM publications WHERE slug = 'ceramic-artists-singapore-nov-2025';
```

## Support

For issues or questions:
- Check Supabase logs for errors
- Verify RLS policies allow public read access to published magazines
- Contact the development team
