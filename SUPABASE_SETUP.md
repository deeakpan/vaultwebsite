# Supabase Setup for Partners Feature

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Supabase Database Setup

1. Create a new table called `partners` with the following structure:

```sql
CREATE TABLE partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. Create a storage bucket called `partner-assets` with the following settings:
   - Public bucket
   - File size limit: 5MB
   - Allowed file types: image/*

3. Set up storage policies for the `partner-assets` bucket:

```sql
-- Allow public read access to partner assets
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'partner-assets');

-- Allow authenticated users to upload to partner-assets
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'partner-assets' AND auth.role() = 'authenticated');
```

## Admin Access

Only the wallet address `0x62942BbBb86482bFA0C064d0262E23Ca04ea99C5` can access the admin panel and add partners.

## Features

- **Admin Panel**: `/admin` - Add new partners with logo upload
- **Partner Display**: Latest partners are shown in the Hero section
- **File Upload**: Logos are uploaded to Supabase Storage
- **Database**: Partner data is stored in Supabase database
- **Authentication**: Only the specified admin wallet can add partners 