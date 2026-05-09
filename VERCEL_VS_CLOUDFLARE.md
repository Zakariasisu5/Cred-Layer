# Deployment: Vercel vs Cloudflare Pages

## Current Issue

Your CredLayer application is currently configured for **Cloudflare Pages** deployment, but you're trying to deploy to **Vercel**. This causes the "worker-entry" error because:

- The build outputs Cloudflare Workers format (using `fetch` handler)
- Vercel expects Node.js HTTP format (using `req`/`res` handlers)

## Solution Options

### Option 1: Deploy to Cloudflare Pages (Recommended - Easiest)

Your app is already configured for Cloudflare. Just deploy there instead:

#### Steps:

1. **Create Cloudflare Pages Project**
   - Go to https://dash.cloudflare.com/
   - Click "Workers & Pages" → "Create application" → "Pages"
   - Connect your GitHub repository: `Zakariasisu5/Cred-Layer`

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Build output directory: dist/client
   Root directory: /
   ```

3. **Set Environment Variables**
   - Add your `.env` variables in Cloudflare Pages settings
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SOLANA_NETWORK`
   - `VITE_PROGRAM_ID` (after deploying smart contract)

4. **Deploy**
   - Click "Save and Deploy"
   - Your app will be live at: `https://cred-layer.pages.dev`

#### Advantages:
- ✅ No code changes needed
- ✅ Already configured
- ✅ Free tier includes unlimited bandwidth
- ✅ Global CDN
- ✅ Automatic HTTPS

---

### Option 2: Reconfigure for Vercel (More Work)

If you must use Vercel, you need to reconfigure the entire build:

#### Required Changes:

1. **Update `vite.config.ts`** - Remove Cloudflare config, add Node.js adapter
2. **Update `src/server.ts`** - Convert from Workers `fetch` to Node.js HTTP
3. **Remove** `wrangler.jsonc`
4. **Add** Vercel-specific configuration
5. **Test** locally with Node.js runtime

#### Steps:

```bash
# Install Vercel adapter (if available)
npm install @tanstack/start-node

# Update vite.config.ts to use Node adapter
# Update server.ts to use Node HTTP handlers
# Remove Cloudflare-specific code
```

This requires significant refactoring and testing.

---

## Recommendation

**Use Cloudflare Pages** - it's the path of least resistance since your app is already configured for it.

### Quick Comparison:

| Feature | Cloudflare Pages | Vercel |
|---------|------------------|--------|
| Current Config | ✅ Ready | ❌ Needs changes |
| Free Tier | Unlimited bandwidth | 100GB/month |
| Build Time | ~2-3 min | ~2-3 min |
| Global CDN | ✅ Yes | ✅ Yes |
| Custom Domain | ✅ Free | ✅ Free |
| Serverless Functions | ✅ Workers | ✅ Functions |

---

## Current Deployment URLs

- **Vercel (broken)**: https://cred-layer-pi.vercel.app/
- **Cloudflare (not set up yet)**: Will be `https://cred-layer.pages.dev`

---

## Next Steps

1. **Delete Vercel deployment** (optional)
2. **Deploy to Cloudflare Pages** following Option 1 above
3. **Update README** with new deployment URL
4. **Test** the live application

---

## Need Help?

If you want to proceed with Cloudflare Pages deployment, I can:
1. Guide you through the Cloudflare setup
2. Update the README with Cloudflare deployment instructions
3. Help configure environment variables

If you absolutely need Vercel, I can:
1. Reconfigure the entire build system
2. Convert from Workers to Node.js format
3. Test and deploy to Vercel

**Which option do you prefer?**
