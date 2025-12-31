# Supabase Setup Guide

## For Local Testing (Current Setup)
**You don't need to do anything in Supabase!** 
- We're using SQLite locally (`file:./dev.db`)
- Just run `npm run dev` and you're good to go
- No SQL editor needed, no Supabase setup needed

## For Production (Using Supabase Postgres)

### Step 1: Get Your Database Password
1. Go to your Supabase project: https://supabase.com/dashboard/project/bcrstmdwngmkaxedfjue
2. Go to **Settings** → **Database**
3. Find your **Database password** (or reset it if needed)

### Step 2: Update Prisma Schema
Change the datasource provider from `sqlite` to `postgresql`:

```prisma
datasource db {
  provider = "postgresql"
}
```

### Step 3: Update .env File
Replace `DATABASE_URL` with your Supabase connection string:

```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.bcrstmdwngmkaxedfjue.supabase.co:5432/postgres"
```

Replace `[YOUR-PASSWORD]` with your actual database password.

### Step 4: Run Migrations
```bash
npx prisma generate
npx prisma db push
```

**That's it!** Prisma will automatically create all the tables in Supabase. You don't need to:
- ❌ Use the SQL Editor
- ❌ Manually create tables
- ❌ Write any SQL

Prisma handles everything automatically.

