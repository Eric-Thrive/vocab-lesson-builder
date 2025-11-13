# Deployment Guide

This guide shows you how to deploy your Vocabulary Lesson Builder so you can share lessons with students using short URLs.

## Quick Start

### Option A: Automatic (Recommended)
Set up GitHub Auto-Save for zero-effort deployment:
1. Follow [GITHUB_SETUP.md](GITHUB_SETUP.md) to configure auto-save
2. Enable the toggle in the app
3. Create lessons - they automatically deploy!

### Option B: Manual
1. **Build your app**
   ```bash
   npm run build
   ```

2. **Choose a deployment platform** (pick one):
   - GitHub Pages (free, easy)
   - Netlify (free, automatic)
   - Vercel (free, fast)

## Option 1: GitHub Pages (Recommended)

### Setup

1. Update `vite.config.js` with your repo name:
   ```js
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

2. Build and deploy:
   ```bash
   npm run build
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

3. Enable GitHub Pages:
   - Go to your repo Settings → Pages
   - Source: Deploy from branch `gh-pages`
   - Save

4. Your site will be at: `https://yourusername.github.io/your-repo-name/`

### Adding New Lessons

1. Create lesson in the app
2. Click "Share Link" → "Download Lesson File"
3. Save to `public/lessons/your-lesson-id.json`
4. Rebuild and redeploy:
   ```bash
   npm run build
   git add .
   git commit -m "Add new lesson"
   git push
   git subtree push --prefix dist origin gh-pages
   ```

## Option 2: Netlify

### Setup

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy"

### Adding New Lessons

1. Add lesson JSON to `public/lessons/`
2. Commit and push to GitHub
3. Netlify auto-deploys!

## Option 3: Vercel

### Setup

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New" → "Project"
4. Import your GitHub repo
5. Vercel auto-detects Vite settings
6. Click "Deploy"

### Adding New Lessons

1. Add lesson JSON to `public/lessons/`
2. Commit and push to GitHub
3. Vercel auto-deploys!

## Sharing Lessons

Once deployed, share lessons with students using short URLs:

```
https://yoursite.com?lesson=animals-lesson
```

Instead of long URLs like:
```
https://yoursite.com?lesson=eyJ3b3JkcyI6ImVsZXBoYW50XG5saW9uXG5naXJhZmZlIiwibGVzc29uRGF0YSI6eyJ3b3JkcyI6W3sid29yZCI6ImVsZXBoYW50IiwiZGVmaW5pdGlvbiI6IkEgdmVyeSBsYXJnZSBncmF5IGFuaW1hbCB3aXRoIGEgbG9uZyB0cnVuayBhbmQgYmlnIGVhcnMiLCJleGFtcGxlcyI6WyJUaGUgZWxlcGhhbnQgdXNlZCBpdHMgdHJ1bmsgdG8gZHJpbmsgd2F0ZXIuIiwiRWxlcGhhbnRzIGFyZSB0aGUgYmlnZ2VzdCBsYW5kIGFuaW1hbHMuIl0sInBhcnRPZlNwZWVjaCI6Im5vdW4iLCJpbWFnZSI6Imh0dHBzOi8vaW1hZ2UucG9sbGluYXRpb25zLmFpL3Byb21wdC9BJTIwZ3JhcGhpYyUyMG5vdmVsJTIwc3R5bGUlMjBpbGx1c3RyYXRpb24lMjBzaG93aW5nJTNBJTIwVGhlJTIwZWxlcGhhbnQlMjB1c2VkJTIwaXRzJTIwdHJ1bmslMjB0byUyMGRyaW5rJTIwd2F0ZXIuJTIwQm9sZCUyMGxpbmVzJTJDJTIwZHluYW1pYyUyMGNvbXBvc2l0aW9uJTJDJTIwYWdlLWFwcHJvcHJpYXRlJTIwZm9yJTIwNnRoJTIwZ3JhZGUlMjBtaWRkbGUlMjBzY2hvb2wlMjBzdHVkZW50cyUyQyUyMGNvbWljJTIwYm9vayUyMGFydCUyMHN0eWxlJTIwd2l0aCUyMGNsZWFyJTIwZGV0YWlscyUyMGFuZCUyMGdvb2QlMjBjb250cmFzdC4/d2lkdGg9MTAyNCZoZWlnaHQ9MTAyNCZub2xvZ289dHJ1ZSZtb2RlbD1mbHV4JmVuaGFuY2U9dHJ1ZSJ9XSwic3RvcnkiOnsidGl0bGUiOiJBIERheSBhdCB0aGUgWm9vIiwidGV4dCI6IlRvZGF5IHdhcyBhbiBhbWF6aW5nIGRheSBhdCB0aGUgem9vISBGaXJzdCwgSSBzYXcgYSBodWdlIGVsZXBoYW50IHNwcmF5aW5nIHdhdGVyIHdpdGggaXRzIHRydW5rLiBUaGUgZWxlcGhhbnQgd2FzIHNvIGdlbnRsZSBhbmQgc21hcnQuIE5leHQsIEkgaGVhcmQgYSBsb3VkIHJvYXIgZnJvbSB0aGUgbGlvbi4gVGhlIGxpb24gbG9va2VkIHBvd2VyZnVsIGFuZCBicmF2ZSBhcyBpdCB3YWxrZWQgYXJvdW5kLiBUaGVuIEkgc3BvdHRlZCBhIHRhbGwgZ2lyYWZmZSBlYXRpbmcgbGVhdmVzIGZyb20gYSB0cmVlLiBUaGUgZ2lyYWZmZSdzIGxvbmcgbmVjayBoZWxwZWQgaXQgcmVhY2ggdGhlIGhpZ2hlc3QgYnJhbmNoZXMuIEEgemVicmEgcmFuIHBhc3Qgd2l0aCBpdHMgYmxhY2sgYW5kIHdoaXRlIHN0cmlwZXMgc2hpbmluZyBpbiB0aGUgc3VuLiBGaW5hbGx5LCBhIHBsYXlmdWwgbW9ua2V5IHN3dW5nIGZyb20gYnJhbmNoIHRvIGJyYW5jaCwgbWFraW5nIGV2ZXJ5b25lIGxhdWdoLiBXaGF0IGFuIGFkdmVudHVyZSEifSwicHJhY3RpY2UiOnsiZmlsbEluQmxhbmsiOlt7InNlbnRlbmNlIjoiVGhlIF9fXyB1c2VkIGl0cyB0cnVuayB0byBzcHJheSB3YXRlci4iLCJhbnN3ZXIiOiJlbGVwaGFudCIsIm9wdGlvbnMiOlsiZWxlcGhhbnQiLCJsaW9uIiwiZ2lyYWZmZSJdfV0sImNvbXByZWhlbnNpb24iOlt7InF1ZXN0aW9uIjoiV2hpY2ggYW5pbWFsIGRpZCB0aGUgcGVyc29uIHNlZSBmaXJzdCBhdCB0aGUgem9vPyIsImFuc3dlciI6IlRoZSBlbGVwaGFudCJ9XX19fQ==
```

## Troubleshooting

### Lesson not loading?
- Check that the JSON file is in `public/lessons/`
- Verify the filename matches the lesson ID
- Make sure you rebuilt after adding the file

### Images not showing?
- Images are loaded from external URLs
- Check browser console for errors
- Verify image URLs are accessible

### Need help?
Check the main README.md for more information.
