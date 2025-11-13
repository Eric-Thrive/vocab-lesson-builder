# GitHub Auto-Save - Quick Start (5 Minutes)

Get automatic lesson deployment in 5 minutes!

## Step 1: Get Your GitHub Token (2 minutes)

1. Go to: https://github.com/settings/tokens
2. Click: **"Generate new token (classic)"**
3. Name: `Vocab Lesson Builder`
4. Check: ✅ **repo** (Full control)
5. Click: **"Generate token"**
6. **Copy the token** (starts with `ghp_`)

## Step 2: Add to .env File (1 minute)

Open your `.env` file and add:

```bash
VITE_GITHUB_TOKEN=ghp_paste_your_token_here
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=vocab-lesson-builder
VITE_GITHUB_BRANCH=main
```

**Example:**
```bash
VITE_GITHUB_TOKEN=ghp_abc123xyz789...
VITE_GITHUB_OWNER=johndoe
VITE_GITHUB_REPO=vocab-lesson-builder
VITE_GITHUB_BRANCH=main
```

## Step 3: Restart Dev Server (30 seconds)

```bash
# Press Ctrl+C to stop
npm run dev
```

## Step 4: Enable in App (30 seconds)

1. Open the app
2. Look for **"GitHub Auto-Save"** toggle
3. Turn it **ON** ✅

## Step 5: Test It! (1 minute)

1. Enter 3 test words:
   ```
   test
   demo
   example
   ```
2. Click **"Create Lesson"**
3. Wait for it to finish
4. Look for: **"✓ Saved to GitHub!"**

## Verify It Worked

Check your GitHub repo:
```
https://github.com/your-username/your-repo/tree/main/public/lessons
```

You should see a new file like: `test-demo-example.json`

## That's It!

Now every lesson you create automatically:
- ✅ Saves to GitHub
- ✅ Deploys to your site (if using Netlify/Vercel)
- ✅ Gets a short shareable URL

## Share Your Lesson

```
https://yoursite.com?lesson=test-demo-example
```

## Troubleshooting

**Toggle doesn't appear?**
- Check `.env` file has all 4 variables
- Restart dev server

**"GitHub save failed"?**
- Check token is correct
- Verify username/repo names
- Make sure token has `repo` permission

**Need more help?**
See [GITHUB_SETUP.md](GITHUB_SETUP.md) for detailed guide.

---

## What Happens Behind the Scenes?

```
You create lesson
    ↓
Saves locally (instant)
    ↓
Pushes to GitHub (2-3 seconds)
    ↓
Netlify/Vercel auto-deploys (1-2 minutes)
    ↓
Short URL is live!
```

## Next Steps

- Create real lessons
- Share with students
- Collaborate with other teachers
- Track changes in GitHub

Enjoy automatic lesson deployment! 🚀
