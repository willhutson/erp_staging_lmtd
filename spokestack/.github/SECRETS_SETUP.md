# GitHub Secrets Setup for Database Migrations

## Required Secret

Add this secret to your GitHub repository to enable automatic database schema migrations:

### `DIRECT_DATABASE_URL`

This is the **direct** PostgreSQL connection string (NOT the pooler URL).

**Format:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Example (replace with your actual values):**
```
postgresql://postgres.cyhwbgohqrsqvwkjcybb:YOUR_PASSWORD@db.cyhwbgohqrsqvwkjcybb.supabase.co:5432/postgres
```

## How to Add the Secret

### Via GitHub Web UI (Recommended)

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `DIRECT_DATABASE_URL`
5. Value: Your direct database URL (get from Supabase Dashboard)
6. Click **Add secret**

### Finding Your Supabase Connection String

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Project Settings** → **Database**
4. Scroll to **Connection string** → **URI**
5. Select **Direct connection** (port 5432, NOT the pooler)
6. Copy the connection string and replace `[YOUR-PASSWORD]` with your database password

## Using the Migration Workflow

### Automatic (on schema changes)
When you push changes to `prisma/schema.prisma` on the `main` branch, the workflow runs automatically.

### Manual Trigger
1. Go to **Actions** → **Database Schema Migration**
2. Click **Run workflow**
3. Select environment: `production`
4. Type `MIGRATE` to confirm
5. Click **Run workflow**

## Important Notes

- Uses `prisma db push` which is suitable for development/staging
- For production with existing data, consider using `prisma migrate deploy` instead
- The `--accept-data-loss` flag is included; review schema changes carefully before pushing
- Always test schema changes in a staging environment first

## Troubleshooting

**"Unable to connect to database"**
- Verify the secret value is correct
- Ensure you're using the DIRECT URL (port 5432), not the pooler URL (port 6543)

**"Authentication failed"**
- Check that your password is correct
- No URL encoding issues (special characters in password may need encoding)

**"Relation does not exist" after deploy**
- Schema was pushed successfully but the app hasn't been redeployed
- Trigger a new Vercel deployment after schema push
