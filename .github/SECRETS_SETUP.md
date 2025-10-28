# GitHub Secrets Setup Guide

This guide shows you how to securely store your Public.com API secret using GitHub Secrets.

## Why Use GitHub Secrets?

✅ **Never commit API keys to your repository**
✅ **Encrypted storage managed by GitHub**
✅ **Automatic injection during builds**
✅ **Easy rotation without code changes**
✅ **Separate secrets for different environments**

## Quick Setup

### 1. Get Your Public.com API Secret

1. Login to [public.com](https://public.com)
2. Go to **Settings** → **Security** → **API Keys**
3. Click **Generate New Secret Key**
4. Copy the secret (you won't be able to see it again!)

### 2. Add Secret to GitHub

1. Open your GitHub repository
2. Click **Settings** (top navigation)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Fill in the form:
   ```
   Name: VITE_PUBLIC_API_SECRET
   Secret: [paste your Public.com API secret here]
   ```
6. Click **Add secret**

### 3. Verify It's Working

The GitHub Actions workflow (`.github/workflows/build.yml`) will automatically:

1. Pull the secret from GitHub Secrets
2. Create a `.env` file during the build
3. Build your app with the secret embedded
4. Upload the built app as an artifact

**To test:**

1. Make any commit and push to your `main` branch:
   ```bash
   git add .
   git commit -m "Test GitHub Secrets integration"
   git push origin main
   ```

2. Go to your repository → **Actions** tab

3. You should see a workflow run named "Build and Deploy"

4. Once complete, click on the run and download the `dist` artifact

## What Secrets Do I Need?

| Secret Name | Description | Where to Get It |
|-------------|-------------|-----------------|
| `VITE_PUBLIC_API_SECRET` | Public.com API secret key | public.com → Settings → Security → API Keys |

## Common Issues

### ❌ Build fails with "API key not configured"

**Solution:** Make sure the secret name is exactly `VITE_PUBLIC_API_SECRET` (case-sensitive)

### ❌ Secret not found in workflow

**Solution:**
1. Verify the secret exists in **Settings** → **Secrets and variables** → **Actions**
2. Re-run the workflow from the Actions tab

### ❌ Want to update the secret

**Solution:**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on `VITE_PUBLIC_API_SECRET`
3. Click **Update secret**
4. Enter new value and save

## Local Development

For local development, GitHub Secrets are **not used**. Instead:

1. Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```

2. Add your API secret to `.env`:
   ```env
   VITE_PUBLIC_API_SECRET=your_secret_here
   ```

3. The `.env` file is in `.gitignore` and will never be committed

## Production Deployment

### Option 1: Download Artifacts (Manual)

1. Go to **Actions** tab → Select a successful workflow run
2. Download the `dist` artifact
3. Deploy the extracted files to your hosting provider

### Option 2: GitHub Pages (Automatic)

1. Edit `.github/workflows/build.yml`
2. Uncomment the `deploy` job (lines starting with `#`)
3. Go to **Settings** → **Pages**
4. Under **Source**, select "GitHub Actions"
5. Push to main - your app deploys automatically!

### Option 3: Vercel/Netlify

Both platforms can use GitHub Secrets:

**Vercel:**
1. Import your GitHub repository
2. In project settings, add environment variable: `VITE_PUBLIC_API_SECRET`
3. Value: Your Public.com API secret
4. Auto-deploys on push!

**Netlify:**
1. Import your GitHub repository
2. In site settings → Environment variables
3. Add: `VITE_PUBLIC_API_SECRET` = your secret
4. Auto-deploys on push!

## Security Best Practices

✅ **DO:**
- Use GitHub Secrets for production builds
- Rotate secrets periodically
- Use different secrets for dev/staging/production
- Keep secrets out of logs and error messages

❌ **DON'T:**
- Commit `.env` files to git
- Share secrets in issues or pull requests
- Log secret values in your code
- Use the same secret across multiple projects

## Need Help?

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Public.com API Documentation](https://public.com/api/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Remember:** Your `.env` file is for local development only. GitHub Secrets protect your production builds!
