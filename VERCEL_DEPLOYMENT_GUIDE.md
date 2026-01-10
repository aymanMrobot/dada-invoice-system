# Dada Restaurant Invoice System - Vercel Deployment Guide

This guide will help you deploy the Dada Restaurant B2B Invoice System to Vercel.

## Prerequisites

Before deploying, you need to set up:

1. **Database** - MySQL/PostgreSQL database
2. **Vercel Account** - Free or paid account
3. **Git Repository** - GitHub, GitLab, or Bitbucket

---

## Step 1: Set Up Database

You have several options for the database:

### Option A: PlanetScale (Recommended - MySQL)
1. Go to [planetscale.com](https://planetscale.com)
2. Create a free account
3. Create a new database
4. Get the connection string from "Connect" → "Node.js"
5. Copy the `DATABASE_URL` (format: `mysql://username:password@host/database`)

### Option B: Vercel Postgres
1. In your Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the `DATABASE_URL` from the connection details

### Option C: Supabase (PostgreSQL)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (URI format)

---

## Step 2: Prepare Code for Deployment

### 2.1 Update package.json

Make sure your `package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx watch server/_core/index.ts",
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "vercel-build": "pnpm db:push && vite build"
  }
}
```

### 2.2 Push Code to Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Dada Invoice System"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/dada-invoice-system.git

# Push to GitHub
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your Git repository
4. Vercel will auto-detect the framework

### 3.2 Configure Build Settings

- **Framework Preset**: Other
- **Build Command**: `pnpm vercel-build`
- **Output Directory**: `dist/client`
- **Install Command**: `pnpm install`

### 3.3 Add Environment Variables

Go to your project settings → Environment Variables and add these:

#### Required Variables:

```
DATABASE_URL=your-database-connection-string
JWT_SECRET=generate-a-random-32-character-string
ADMIN_PASSWORD=dada2025
OWNER_OPEN_ID=admin
OWNER_NAME=Admin
NODE_ENV=production
```

**Important**: Generate a secure JWT_SECRET using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Optional (for file storage):

```
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### 3.4 Deploy

Click "Deploy" and wait for the build to complete.

---

## Step 4: Initialize Database

After first deployment:

1. Go to your Vercel project dashboard
2. Click on the deployment URL
3. The database tables will be created automatically on first run
4. If you encounter database errors, run migrations manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run database push
vercel env pull .env.local
pnpm db:push
```

---

## Step 5: Test Your Deployment

1. Visit your Vercel deployment URL
2. You should see the login page
3. Enter password: `dada2025`
4. Test all features:
   - Dashboard
   - Add customers
   - Create invoices
   - Download PDF invoices

---

## Step 6: Custom Domain (Optional)

### Add Your Own Domain:

1. Go to your Vercel project → Settings → Domains
2. Add your custom domain (e.g., `invoices.dadarestaurant.ie`)
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (usually 5-30 minutes)

---

## Troubleshooting

### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Check if your database allows connections from Vercel IPs
- For PlanetScale: Make sure SSL is enabled in connection string

### Build Failures

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### PDF Generation Not Working

- Check if logo file exists at `client/public/dada-logo.png`
- Verify file paths are correct for production environment

### Authentication Issues

- Verify `JWT_SECRET` is set and is at least 32 characters
- Check `ADMIN_PASSWORD` matches what you're entering
- Clear browser cookies and try again

---

## Important Notes

1. **Database Migrations**: Run `pnpm db:push` whenever you change the database schema
2. **Environment Variables**: Never commit `.env` files to Git
3. **Password Security**: Change `ADMIN_PASSWORD` to something secure
4. **Backups**: Regularly backup your database
5. **Monitoring**: Check Vercel logs regularly for errors

---

## Support

For Vercel-specific issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

For database issues:
- [PlanetScale Docs](https://planetscale.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

## File Structure

```
dada-invoice-system/
├── client/              # Frontend React app
│   ├── public/         # Static assets (logo, etc.)
│   └── src/            # React components and pages
├── server/             # Backend Express + tRPC
│   ├── _core/          # Core server files
│   ├── db.ts           # Database queries
│   ├── routers.ts      # API routes
│   └── pdfGenerator.ts # PDF generation
├── drizzle/            # Database schema
│   └── schema.ts       # Table definitions
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies
```

---

## Next Steps After Deployment

1. Change the default password in Vercel environment variables
2. Set up regular database backups
3. Configure custom domain
4. Test all features thoroughly
5. Add your B2B customers and start creating invoices!

---

**Deployment Date**: January 2026  
**System Version**: 1.0.0  
**Framework**: React 19 + Express 4 + tRPC 11
