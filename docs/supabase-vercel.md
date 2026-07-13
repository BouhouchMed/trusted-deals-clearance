# Supabase + Vercel Setup

## 1. Create Supabase project

1. Open https://supabase.com
2. Create a new project.
3. Go to `Project Settings > API`.
4. Copy:
   - Project URL
   - anon public key
   - service_role key

## 2. Create database tables

Open `SQL Editor` in Supabase and run the SQL from:

`src/lib/supabase-schema.sql`

## 3. Add Vercel environment variables

In Vercel:

`Project > Settings > Environment Variables`

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Keep `SUPABASE_SERVICE_ROLE_KEY` secret. Do not expose it in client components.

## 4. Deploy again

After adding variables, redeploy the project from Vercel.

## Behavior

When Supabase variables exist, admin products, articles, and site settings are saved to Supabase.

When variables are missing locally, the app falls back to JSON files so local development still works.
