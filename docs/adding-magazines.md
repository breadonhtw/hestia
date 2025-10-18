# Adding Weekly Magazines to Hestia

This guide explains how to add and manage weekly magazine publications in Hestia.

## Overview

The publications system features the latest magazine on the homepage and maintains an archive at `/publications`. Each magazine includes:
- Cover image
- Issue number
- Theme
- Description
- External URL (link to your hosted magazine)

**Homepage Display**: The latest published magazine appears as a featured card in the center of the page.

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
| `cover_image_url` | text | No | URL to cover image (320x427px for homepage, 800x500px for /publications) |
| `external_url` | text | No | Canva presentation URL (opens on click) |
| `active_from` | timestamptz | No | Start date for this issue (UTC timezone) |
| `active_until` | timestamptz | No | End date for this issue (UTC timezone) |
| `issue_number` | integer | No | Issue number (e.g., 1, 2, 3) |
| `theme` | text | No | Theme or category (e.g., "Pottery & Ceramics") |
| `status` | text | Yes | Default: 'published' |

## Homepage Display

The homepage displays the **latest published magazine** as a compact portrait card:

- The magazine with the highest `issue_number` (or most recent `created_at`) is displayed
- The card is centered on the page with a compact, portrait design (320x427px, 3:4 aspect ratio)
- Styled like a traditional magazine cover for visual appeal
- Clicking the magazine card opens it in a modal (desktop) or new tab (mobile)
- The modal includes aligned "Open in New Tab" and close (X) buttons in the header
- The `active_from` and `active_until` dates are optional and can be used for your own scheduling needs

## Publications Page Display

The `/publications` page displays the **latest magazine** as a large landscape card (800x500px, 16:10 aspect ratio), with past issues shown below in a grid.

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
4. Upload your cover image (recommended dimensions: 320x427px or 800x500px)
5. Copy the public URL
6. Use this URL in the `cover_image_url` field

### Image Guidelines

- **Format**: JPG or PNG
- **Size**: Max 1MB for optimal loading
- **Dimensions**:
  - **Homepage**: 320x427px (3:4 portrait aspect ratio, like a magazine cover)
  - **Publications Page**: 800x500px (16:10 landscape aspect ratio)
- **Content**: High-quality, visually appealing cover that represents the theme
- **Note**: The homepage displays a compact portrait card, while the /publications page shows a larger landscape featured card

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
- Display as a compact portrait card (320x427px) centered on the homepage
- Display as a large landscape card (800x500px) on the /publications page
- Open in a modal on desktop (>768px screens) with:
  - Embedded Canva presentation
  - Aligned "Open in New Tab" button and close (X) button in the header
- Open directly in a new tab on mobile (<768px screens)

## Viewing Published Magazines

- **Homepage**: The latest published magazine appears as a compact featured card
- **Publications Page** (`/publications`): The latest magazine shown as a large featured card, with past issues in a grid below
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

1. Verify `status` is set to `'published'`
2. Check if you have at least 1 published magazine
3. The homepage shows the latest magazine by `issue_number` (descending) or creation date

```sql
-- Check the latest published magazine (shown on homepage)
SELECT * FROM publications
WHERE status = 'published'
ORDER BY issue_number DESC NULLS LAST, created_at DESC
LIMIT 1;
```

### Magazine Ordering

- The latest magazine is determined by `issue_number` (descending), then `created_at` (newest first)
- Use sequential issue numbers (1, 2, 3...) to control which magazine appears on the homepage
- Higher issue numbers will appear first

### Modal Not Opening

- Check that `external_url` is populated
- Verify URL is accessible and allows iframe embedding
- Check browser console for errors

## Best Practices

1. **Sequential Issues**: Use sequential issue numbers (1, 2, 3...) to control homepage display
2. **Consistent Themes**: Align themes with artisan craft categories
3. **Quality Cover Images**: Use high-quality covers optimized for each display
   - Homepage: 320x427px (3:4 portrait, magazine cover style)
   - /publications page: 800x500px (16:10 landscape)
   - You can use one image for both, but it will be cropped differently
4. **Test Before Publishing**: Set `status = 'draft'` initially, then update to `'published'`
5. **Engaging Titles**: Create compelling titles that draw readers in
6. **Keep It Fresh**: Regularly publish new issues - the homepage and /publications page always show the latest

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
