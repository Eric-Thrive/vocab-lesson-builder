# Railway Automatic Deployment Setup

Since you already have a Railway account, let's use that for automatic deployment!

## What You'll Get

✅ Automatic deployment when lessons are saved  
✅ Free $5/month credit (enough for this app)  
✅ Custom domain support  
✅ Automatic SSL certificate  
✅ GitHub integration  

## Step-by-Step Setup (3 Minutes)

### 1. Log Into Railway

1. Go to: **https://railway.app/**
2. Click **"Login"** (you already have an account)
3. Use your existing credentials

### 2. Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. If prompted, authorize Railway to access GitHub
4. Search for and select: **`vocab-lesson-builder`**

### 3. Configure Deployment

Railway will auto-detect it's a Node.js app. It should automatically:
- Install dependencies: `npm install`
- Build: `npm run build`
- Serve: `npx serve dist`

**No configuration needed!** Railway reads the `railway.json` file.

### 4. Add Environment Variable

**Important!** Add your Google API key:

1. In your Railway project, click **"Variables"** tab
2. Click **"New Variable"**
3. Add:
   - **Variable**: `VITE_GOOGLE_API_KEY`
   - **Value**: `YOUR_GOOGLE_API_KEY_HERE`
4. Click **"Add"**

### 5. Deploy

1. Railway will automatically start deploying
2. Watch the build logs (takes 2-3 minutes)
3. When complete, you'll see: **"Success"**

### 6. Get Your URL

1. Click **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. You'll get: `https://your-app.up.railway.app`

**Optional**: Add a custom domain if you have one.

## How It Works

```
You create lesson
    ↓
GitHub Auto-Save (2-3 seconds)
    ↓
GitHub webhook triggers Railway (instant)
    ↓
Railway builds & deploys (1-2 minutes)
    ↓
Short URL is live!
```

**Total time**: 3-5 minutes from creating lesson to live URL

## Test the Automatic Deployment

### Create a Test Lesson

1. Open your local app: `http://localhost:5175`
2. Make sure **GitHub Auto-Save is ON**
3. Create a simple lesson:
   ```
   railway
   test
   deploy
   ```
4. Wait for lesson to generate
5. Look for: **"✓ Saved to GitHub!"**

### Watch Railway Deploy

1. Go to your Railway dashboard
2. You'll see a new deployment start automatically
3. Click on it to see build logs
4. Wait 1-2 minutes for completion
5. Status changes to: **"Success"**

### Test Your Short URL

Open in a new browser:
```
https://your-app.up.railway.app?lesson=railway-test-deploy
```

The lesson should load! 🎉

## Railway Dashboard Features

### Deployments Tab
- See all deployments
- View build logs
- Rollback to previous versions
- Redeploy manually if needed

### Variables Tab
- Manage environment variables
- Add/edit/delete variables
- Variables are encrypted

### Settings Tab
- Generate custom domain
- Configure build settings
- Set up webhooks
- View usage metrics

### Metrics Tab
- CPU usage
- Memory usage
- Network traffic
- Request count

## Cost

**Free tier includes**:
- $5 credit per month
- 500 hours of usage
- 512 MB RAM
- 1 GB disk

**For this app**: Free tier is more than enough! This static site uses minimal resources.

## Custom Domain (Optional)

### Add Your Own Domain

1. Go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter your domain: `vocab.yourschool.com`
4. Add the CNAME record to your DNS:
   - **Name**: `vocab`
   - **Value**: `your-app.up.railway.app`
5. Railway automatically provisions SSL

## Troubleshooting

### Build Failed?

**Check the build logs**:
1. Click on the failed deployment
2. Read the error message in logs

**Common issues**:
- Missing environment variables → Add in Variables tab
- Build command wrong → Check railway.json
- Dependencies failed → Check package.json

### Lesson Not Loading?

**Check these**:
1. Deployment completed successfully (green checkmark)
2. Lesson file exists in GitHub: `public/lessons/your-lesson.json`
3. URL is correct: `https://your-app.up.railway.app?lesson=lesson-id`
4. Environment variable is set correctly

### Deployment Taking Too Long?

**Normal times**:
- First deploy: 2-3 minutes
- Subsequent deploys: 1-2 minutes

**If longer**:
- Check Railway status
- Check build logs for errors
- Try redeploying manually

## Workflow Summary

### After Setup (Automatic)

1. Create lesson in app
2. Wait for "✓ Saved to GitHub!"
3. Railway auto-deploys (1-2 minutes)
4. Share URL with students

**No manual steps needed!**

### Sharing Lessons

Short URL format:
```
https://your-app.up.railway.app?lesson=lesson-id
```

Example:
```
https://vocab-lessons.up.railway.app?lesson=animals-lesson
```

## Comparison: Railway vs Netlify

| Feature | Railway | Netlify |
|---------|---------|---------|
| Free tier | $5/month credit | 100 GB bandwidth |
| Setup | 3 minutes | 5 minutes |
| Build time | 1-2 minutes | 1-2 minutes |
| Custom domain | ✅ Free SSL | ✅ Free SSL |
| Auto-deploy | ✅ Yes | ✅ Yes |
| Best for | You already have account! | Static sites |

**Since you have Railway, use it!** No need to create another account.

## Next Steps

1. ✅ Log into Railway
2. ✅ Import `vocab-lesson-builder` repo
3. ✅ Add environment variable
4. ✅ Generate domain
5. ✅ Create a test lesson
6. ✅ Share with students!

## Support

- **Railway Docs**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app/

---

**Ready to deploy?** Log into Railway and follow the steps above!
