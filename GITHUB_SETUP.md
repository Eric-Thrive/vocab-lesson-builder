# GitHub Auto-Save Setup Guide

This guide shows you how to set up automatic saving of lessons to your GitHub repository.

## Why Use GitHub Auto-Save?

- **Automatic deployment** - Lessons are instantly available for sharing
- **Version control** - Track changes to your lessons over time
- **Backup** - Lessons are safely stored in the cloud
- **Collaboration** - Work with other teachers on lessons
- **No manual steps** - Just create and it's automatically deployed

## Prerequisites

1. A GitHub account
2. A repository for your vocab app (this repo)
3. GitHub Pages, Netlify, or Vercel deployment set up

## Step 1: Create a GitHub Personal Access Token

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: `Vocab Lesson Builder`
4. Set expiration: Choose your preference (90 days, 1 year, or no expiration)
5. Select scopes:
   - ✅ **repo** (Full control of private repositories)
     - This includes: repo:status, repo_deployment, public_repo, repo:invite, security_events
6. Click "Generate token"
7. **IMPORTANT:** Copy the token immediately (you won't see it again!)

## Step 2: Add Token to Your .env File

1. Open your `.env` file (or create it from `.env.example`)
2. Add these lines:

```bash
# GitHub Auto-Save Configuration
VITE_GITHUB_TOKEN=ghp_your_token_here
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=vocab-lesson-builder
VITE_GITHUB_BRANCH=main
```

### Example:
```bash
VITE_GITHUB_TOKEN=ghp_abc123xyz789...
VITE_GITHUB_OWNER=johndoe
VITE_GITHUB_REPO=vocab-lesson-builder
VITE_GITHUB_BRANCH=main
```

## Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

## Step 4: Enable Auto-Save in the App

1. Open the app
2. You'll see a new "GitHub Auto-Save" toggle
3. Turn it ON
4. Create a lesson
5. Watch it automatically save to GitHub!

## How It Works

When you create a lesson with GitHub Auto-Save enabled:

1. **Local save** - Lesson saved to browser storage (instant)
2. **GitHub save** - Lesson pushed to `public/lessons/your-lesson.json`
3. **Auto-deploy** - Netlify/Vercel automatically deploys the change
4. **Share** - Short URL is immediately available!

## Workflow Comparison

### Without GitHub Auto-Save:
```
Create → Save locally → Export → Add to repo → Commit → Push → Deploy
(6 manual steps)
```

### With GitHub Auto-Save:
```
Create → Done! ✓
(1 step - everything else is automatic)
```

## Security Notes

### Keep Your Token Safe
- ✅ Add `.env` to `.gitignore` (already done)
- ✅ Never commit your token to git
- ✅ Don't share your token with anyone
- ✅ Regenerate if compromised

### Token Permissions
The token needs `repo` access to:
- Create/update files in your repository
- Commit changes automatically
- Work with both public and private repos

### Revoking Access
If you need to revoke the token:
1. Go to https://github.com/settings/tokens
2. Find your token
3. Click "Delete"
4. The app will fall back to local-only saving

## Troubleshooting

### Toggle doesn't appear?
- Check that `.env` has all required variables
- Restart the dev server
- Check browser console for errors

### "GitHub save failed" message?
- Verify token is valid (not expired)
- Check token has `repo` permissions
- Verify owner/repo names are correct
- Check internet connection

### Files not appearing in repo?
- Check the `public/lessons/` folder in GitHub
- Verify branch name is correct (usually `main` or `master`)
- Look at recent commits for auto-save messages

### Deployment not updating?
- **Netlify/Vercel**: Should auto-deploy within 1-2 minutes
- **GitHub Pages**: May need manual deployment
- Check your hosting service's deployment logs

## Advanced Configuration

### Custom Branch
Save to a different branch:
```bash
VITE_GITHUB_BRANCH=lessons
```

### Multiple Environments
Use different tokens for dev/production:
```bash
# .env.development
VITE_GITHUB_BRANCH=dev

# .env.production
VITE_GITHUB_BRANCH=main
```

## Testing

### Test the Setup
1. Enable GitHub Auto-Save
2. Create a simple test lesson (2-3 words)
3. Check GitHub repo for new file
4. Verify deployment updated
5. Test the short URL

### Verify Commits
Check your repo's commit history:
```
https://github.com/your-username/your-repo/commits/main
```

You should see commits like:
```
Auto-save lesson: Lesson - brave, rescue, danger...
```

## FAQ

**Q: Does this work with private repos?**  
A: Yes! The `repo` scope works with both public and private repositories.

**Q: Can multiple teachers use the same repo?**  
A: Yes, but each needs their own token. Consider using a shared organization repo.

**Q: What if I want to review before publishing?**  
A: Use a different branch (e.g., `draft`) and merge to `main` when ready.

**Q: Does this cost money?**  
A: No! GitHub, Netlify, and Vercel all have free tiers that work great for this.

**Q: Can I disable auto-save temporarily?**  
A: Yes, just toggle it off in the app. Lessons still save locally.

**Q: What happens if GitHub is down?**  
A: Lessons still save locally. GitHub save will fail gracefully with a message.

## Next Steps

Once set up:
1. Create lessons normally
2. They auto-save to GitHub
3. Share short URLs immediately
4. No manual deployment needed!

See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting setup and [QUICK_START.md](QUICK_START.md) for usage guide.
