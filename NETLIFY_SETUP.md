# Netlify Automatic Deployment Setup

This guide will set up automatic deployment so every lesson you create is instantly available online.

## What You'll Get

✅ Automatic deployment when lessons are saved  
✅ Free hosting with SSL certificate  
✅ Custom domain support (optional)  
✅ Deploy previews for testing  
✅ Instant rollbacks if needed  

## Step-by-Step Setup (5 Minutes)

### 1. Sign Up for Netlify

1. Go to: **https://app.netlify.com/signup**
2. Click **"Sign up with GitHub"** (recommended)
3. Authorize Netlify to access your GitHub account

### 2. Import Your Repository

1. Click **"Add new site"** button (top right)
2. Select **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. You may need to configure GitHub permissions:
   - Click **"Configure the Netlify app on GitHub"**
   - Select **"Only select repositories"**
   - Choose **`vocab-lesson-builder`**
   - Click **"Save"**
5. Back in Netlify, search for and click **`vocab-lesson-builder`**

### 3. Configure Build Settings

Netlify should auto-detect the settings, but verify:

- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

Click **"Deploy site"**

### 4. Wait for First Deployment

- First build takes 2-3 minutes
- Watch the deploy log for progress
- You'll see: "Site is live" when ready

### 5. Get Your Site URL

Your site will be at: `https://random-name-123456.netlify.app`

**Optional**: Customize the URL:
1. Go to **Site settings** → **Domain management**
2. Click **"Options"** → **"Edit site name"**
3. Change to something like: `vocab-lessons-yourname`
4. Your URL becomes: `https://vocab-lessons-yourname.netlify.app`

## Test the Automatic Deployment

### Create a Test Lesson

1. Open your local app: `http://localhost:5175`
2. Make sure **GitHub Auto-Save is ON**
3. Create a simple lesson:
   ```
   test
   auto
   deploy
   ```
4. Wait for lesson to generate
5. Look for: **"✓ Saved to GitHub!"**

### Watch Netlify Deploy

1. Go to your Netlify dashboard
2. You'll see a new deployment start automatically
3. Wait 1-2 minutes for it to complete
4. Status changes to: **"Published"**

### Test Your Short URL

Open in a new browser:
```
https://your-site-name.netlify.app?lesson=test-auto-deploy
```

The lesson should load! 🎉

## How It Works

```
┌─────────────────────────────────────────────────┐
│  You create lesson in app                       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  GitHub Auto-Save (2-3 seconds)                 │
│  Commits to: public/lessons/your-lesson.json    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  GitHub webhook triggers Netlify (instant)      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Netlify builds site (1-2 minutes)              │
│  - Runs: npm install                            │
│  - Runs: npm run build                          │
│  - Publishes: dist folder                       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Short URL is live!                             │
│  https://your-site.netlify.app?lesson=name      │
└─────────────────────────────────────────────────┘
```

**Total time**: 3-5 minutes from creating lesson to live URL

## Netlify Dashboard Features

### Deploys Tab
- See all deployments
- View build logs
- Rollback to previous versions

### Site Settings
- Change site name
- Add custom domain
- Configure environment variables
- Set up deploy notifications

### Domain Management
- Add custom domain (e.g., `vocab.yourschool.com`)
- Free SSL certificate
- DNS configuration help

## Environment Variables (Important!)

Your `.env` file is NOT deployed (it's in `.gitignore`). You need to add environment variables in Netlify:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add your Google API key:
   - **Key**: `VITE_GOOGLE_API_KEY`
   - **Value**: Your API key
   - **Scopes**: All scopes
4. Click **"Create variable"**

**Note**: GitHub credentials are NOT needed in Netlify (they're only for local development).

## Troubleshooting

### Build Failed?

**Check the build log**:
1. Go to **Deploys** tab
2. Click the failed deploy
3. Read the error message

**Common issues**:
- Missing environment variables → Add in Netlify settings
- Build command wrong → Should be `npm run build`
- Publish directory wrong → Should be `dist`

### Lesson Not Loading?

**Check these**:
1. Deployment completed successfully (green checkmark)
2. Lesson file exists in GitHub: `public/lessons/your-lesson.json`
3. URL is correct: `https://your-site.netlify.app?lesson=lesson-id`
4. Clear browser cache and try again

### Deployment Taking Too Long?

**Normal times**:
- First deploy: 2-3 minutes
- Subsequent deploys: 1-2 minutes

**If longer**:
- Check Netlify status: https://www.netlifystatus.com/
- Check build log for errors
- Try triggering a new deploy manually

## Advanced: Deploy Notifications

Get notified when deployments complete:

1. **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add notification:
   - Email notification
   - Slack webhook
   - Discord webhook
   - Custom webhook

## Custom Domain Setup (Optional)

### Using Your Own Domain

1. **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain: `vocab.yourschool.com`
4. Follow DNS configuration instructions
5. Netlify provides free SSL certificate

### Using a Subdomain

If you have `yourschool.com`, you can use:
- `vocab.yourschool.com`
- `lessons.yourschool.com`
- `learning.yourschool.com`

Just add a CNAME record pointing to your Netlify site.

## Monitoring & Analytics

### Built-in Analytics (Free)
- Page views
- Unique visitors
- Top pages
- Bandwidth usage

### Enable Analytics:
1. **Site settings** → **Analytics**
2. Click **"Enable analytics"**

## Cost

**Free tier includes**:
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- SSL certificate
- Deploy previews

**For this app**: Free tier is more than enough!

## Workflow Summary

### Creating Lessons (After Setup)

1. Open app locally
2. Create lesson
3. Wait for "✓ Saved to GitHub!"
4. Wait 1-2 minutes for Netlify deploy
5. Share URL with students

**That's it!** No manual deployment needed.

### Sharing Lessons

Short URL format:
```
https://your-site-name.netlify.app?lesson=lesson-id
```

Example:
```
https://vocab-lessons.netlify.app?lesson=animals-lesson
```

## Next Steps

After setup:
1. ✅ Create a real lesson
2. ✅ Test the automatic deployment
3. ✅ Share the URL with a test student
4. ✅ Customize your site name (optional)
5. ✅ Add custom domain (optional)

## Support

- **Netlify Docs**: https://docs.netlify.com/
- **Netlify Support**: https://www.netlify.com/support/
- **Community Forum**: https://answers.netlify.com/

---

**Ready to deploy?** Follow the steps above and you'll have automatic deployment in 5 minutes!
