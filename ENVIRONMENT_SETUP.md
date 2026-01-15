# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How to Get These Values

### 1. Supabase Project URL
- Go to your Supabase project dashboard
- Copy the URL from the project settings
- Format: https://nqldexmenxmlznetqnlx.supabase.co

### 2. Supabase Service Role Key
- In your Supabase dashboard, go to Settings > API
- Copy the "service_role" key (not the anon key)
- This key has admin privileges for database operations

## Example .env.local File

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCIZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM5MjQ5NB9.example
```

## Important Notes

- **Never commit your `.env.local` file** to version control
- The `NEXT_PUBLIC_` prefix makes the variable available in the browser
- The service role key has admin privileges, keep it secure
- Restart your development server after adding environment variables

## Supabase Setup

Make sure you've also set up your Supabase database according to the `SUPABASE_SETUP.md` file:

1. Create the `partners` table
2. Create the `partner-assets` storage bucket
3. Set up the required policies

## Testing

After setting up the environment variables:
1. Restart your development server
2. Visit `/admin` page
3. Connect with the admin wallet
4. Try adding a partner to test the setup 