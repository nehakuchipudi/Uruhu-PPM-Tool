# PostgreSQL Installation Guide for Windows

## Step 1: Download PostgreSQL

1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download PostgreSQL 16.x for Windows x86-64

## Step 2: Install PostgreSQL

1. Run the downloaded installer
2. Follow the installation wizard:
   - **Installation Directory**: Use default (C:\Program Files\PostgreSQL\16)
   - **Components**: Select all (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
   - **Data Directory**: Use default
   - **Password**: Set password as `postgres` (or remember your custom password)
   - **Port**: Use default `5432`
   - **Locale**: Use default

3. Complete the installation (Stack Builder is optional, you can skip it)

## Step 3: Verify Installation

Open a new PowerShell terminal and run:
```powershell
psql --version
```

If this doesn't work, add PostgreSQL to your PATH:
```
C:\Program Files\PostgreSQL\16\bin
```

## Step 4: Create the Database

Open PowerShell and connect to PostgreSQL:
```powershell
# Connect as postgres user
psql -U postgres

# When prompted, enter your password (default: postgres)
```

Inside psql, create the database:
```sql
CREATE DATABASE uruhu_ppm;
\q
```

## Step 5: Update Environment Variables

Your `.env` file is already configured with:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uruhu_ppm?schema=public"
```

**If you used a different password**, update it in `.env`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/uruhu_ppm?schema=public"
```

## Step 6: Push Schema to Database

Back in your project directory, run:
```powershell
npm run db:push
```

This will create all the tables in your PostgreSQL database.

## Step 7: Seed the Database

Populate with sample data:
```powershell
npm run db:seed
```

## Step 8: Start the Backend Server

```powershell
npm run server
```

The API will be available at `http://localhost:3001`

## Troubleshooting

### "psql: command not found"
Add PostgreSQL to your system PATH:
1. Search for "Environment Variables" in Windows
2. Edit "System variables" → "Path"
3. Add: `C:\Program Files\PostgreSQL\16\bin`
4. Restart PowerShell

### Connection refused
Make sure PostgreSQL service is running:
```powershell
Get-Service -Name postgresql*
```

If stopped, start it:
```powershell
Start-Service -Name postgresql-x64-16
```

### Wrong password
Update the password in your `.env` file to match what you set during installation.

## Next Steps

Once PostgreSQL is set up:
1. ✅ Database is running on port 5432
2. ✅ Schema is pushed with `npm run db:push`
3. ✅ Database is seeded with `npm run db:seed`
4. ✅ Backend server starts with `npm run server`
5. ✅ Browse data with `npm run db:studio`
