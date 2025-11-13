# Sharing Lessons - Complete Guide

## The Problem

Previously, sharing lessons created very long URLs like:
```
https://yoursite.com?lesson=eyJ3b3JkcyI6ImVsZXBoYW50XG5saW9uXG5naXJhZmZlXG56ZWJyYVxubW9ua2V5Iiwi...
(continues for 2000+ characters)
```

These long URLs:
- Break in some email clients
- Are hard to copy/paste
- Look unprofessional
- Can't be easily remembered or typed

## The Solution

Now you can share lessons with short, clean URLs:
```
https://yoursite.com?lesson=animals-lesson
```

## How It Works

### 1. Create a Lesson
Use the app to create your vocabulary lesson as usual.

### 2. Download the Lesson File
Click "Share Link for Students" → "Download Lesson File for GitHub"

This downloads a JSON file like `animals-lesson.json`:
```json
{
  "id": "animals-lesson",
  "name": "Animals Vocabulary",
  "description": "Learn about different animals",
  "words": "elephant\nlion\ngiraffe\nzebra\nmonkey",
  "lessonData": {
    "words": [...],
    "story": {...},
    "practice": {...}
  }
}
```

### 3. Add to Your Repository
```bash
# Copy the file to your lessons folder
cp ~/Downloads/animals-lesson.json public/lessons/

# Or use the helper script
./add-lesson.sh ~/Downloads/animals-lesson.json
```

### 4. Deploy
```bash
# Build your app
npm run build

# Deploy to your hosting service
# (GitHub Pages, Netlify, Vercel, etc.)
```

### 5. Share the Short URL
```
https://yoursite.com?lesson=animals-lesson
```

## Deployment Options

### GitHub Pages (Free)
```bash
npm run build
git add dist -f
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

### Netlify (Free, Automatic)
1. Connect your GitHub repo
2. Netlify auto-deploys on every push
3. No manual build needed!

### Vercel (Free, Fast)
1. Connect your GitHub repo
2. Vercel auto-deploys on every push
3. No manual build needed!

## Workflow Example

### Teacher Workflow
1. Create lesson in app
2. Download JSON file
3. Add to `public/lessons/`
4. Commit and push to GitHub
5. Hosting service auto-deploys
6. Share short URL with students

### Student Workflow
1. Click teacher's link
2. Lesson loads instantly
3. Complete activities
4. Progress saved automatically

## File Structure

```
your-project/
├── public/
│   └── lessons/
│       ├── README.md              # Documentation
│       ├── index.json             # List of all lessons
│       ├── example-animals.json   # Example lesson
│       ├── your-lesson-1.json     # Your lessons
│       └── your-lesson-2.json
├── src/
│   └── App.jsx                    # Updated with GitHub loading
├── DEPLOYMENT.md                  # Deployment guide
├── QUICK_START.md                 # Quick start guide
└── add-lesson.sh                  # Helper script
```

## Managing Multiple Lessons

### Update index.json
After adding lessons, update `public/lessons/index.json`:

```json
{
  "lessons": [
    {
      "id": "animals-lesson",
      "name": "Animals Vocabulary",
      "description": "Learn about different animals",
      "file": "animals-lesson.json"
    },
    {
      "id": "weather-lesson",
      "name": "Weather Vocabulary",
      "description": "Learn about weather and climate",
      "file": "weather-lesson.json"
    }
  ]
}
```

This allows you to:
- Create a lesson browser/catalog
- Track all available lessons
- Add metadata for searching

## Best Practices

### Lesson IDs
- Use descriptive, URL-friendly IDs
- Use lowercase and hyphens
- Examples: `animals-lesson`, `chapter-3-science`, `week-1-vocab`

### File Organization
```
public/lessons/
├── grade-6/
│   ├── unit-1-animals.json
│   ├── unit-2-weather.json
│   └── unit-3-space.json
├── grade-7/
│   └── ...
└── index.json
```

### Version Control
- Commit lesson files to git
- Track changes over time
- Collaborate with other teachers
- Backup automatically

## Troubleshooting

### Lesson not loading?
```bash
# Check file exists
ls public/lessons/your-lesson.json

# Check file is valid JSON
cat public/lessons/your-lesson.json | python -m json.tool

# Rebuild
npm run build

# Check dist folder
ls dist/lessons/
```

### Wrong lesson loading?
- Clear browser cache
- Check URL spelling
- Verify lesson ID matches filename

### Images not showing?
- Images are loaded from external URLs
- Check internet connection
- Verify image URLs are accessible

## Advanced: Custom Domain

### With GitHub Pages
1. Add `CNAME` file to `public/` folder
2. Configure DNS settings
3. Share: `https://vocab.yourschool.com?lesson=animals`

### With Netlify/Vercel
1. Add custom domain in dashboard
2. Configure DNS automatically
3. Share: `https://vocab.yourschool.com?lesson=animals`

## Migration from Old Format

The app still supports the old base64 URL format for backward compatibility:
- Old links continue to work
- No need to update existing shared links
- New lessons use the short format

## Summary

✅ Short, clean URLs  
✅ Easy to share and remember  
✅ Professional appearance  
✅ Version controlled  
✅ Easy to manage  
✅ Backward compatible  

Share lessons with confidence using short URLs like:
```
yoursite.com?lesson=animals-lesson
```

Instead of:
```
yoursite.com?lesson=eyJ3b3JkcyI6ImVsZXBoYW50XG5saW9uXG5naXJhZmZlXG56ZWJyYVxubW9ua2V5IiwibGVzc29uRGF0YSI6eyJ3b3JkcyI6W3sid29yZCI6ImVsZXBoYW50IiwiZGVmaW5pdGlvbiI6IkEgdmVyeSBsYXJnZSBncmF5IGFuaW1hbCB3aXRoIGEgbG9uZyB0cnVuayBhbmQgYmlnIGVhcnMiLCJleGFtcGxlcyI6WyJUaGUgZWxlcGhhbnQgdXNlZCBpdHMgdHJ1bmsgdG8gZHJpbmsgd2F0ZXIuIiwiRWxlcGhhbnRzIGFyZSB0aGUgYmlnZ2VzdCBsYW5kIGFuaW1hbHMuIl0sInBhcnRPZlNwZWVjaCI6Im5vdW4iLCJpbWFnZSI6Imh0dHBzOi8vaW1hZ2UucG9sbGluYXRpb25zLmFpL3Byb21wdC9BJTIwZ3JhcGhpYyUyMG5vdmVsJTIwc3R5bGUlMjBpbGx1c3RyYXRpb24lMjBzaG93aW5nJTNBJTIwVGhlJTIwZWxlcGhhbnQlMjB1c2VkJTIwaXRzJTIwdHJ1bmslMjB0byUyMGRyaW5rJTIwd2F0ZXIuJTIwQm9sZCUyMGxpbmVzJTJDJTIwZHluYW1pYyUyMGNvbXBvc2l0aW9uJTJDJTIwYWdlLWFwcHJvcHJpYXRlJTIwZm9yJTIwNnRoJTIwZ3JhZGUlMjBtaWRkbGUlMjBzY2hvb2wlMjBzdHVkZW50cyUyQyUyMGNvbWljJTIwYm9vayUyMGFydCUyMHN0eWxlJTIwd2l0aCUyMGNsZWFyJTIwZGV0YWlscyUyMGFuZCUyMGdvb2QlMjBjb250cmFzdC4/d2lkdGg9MTAyNCZoZWlnaHQ9MTAyNCZub2xvZ289dHJ1ZSZtb2RlbD1mbHV4JmVuaGFuY2U9dHJ1ZSJ9XSwic3RvcnkiOnsidGl0bGUiOiJBIERheSBhdCB0aGUgWm9vIiwidGV4dCI6IlRvZGF5IHdhcyBhbiBhbWF6aW5nIGRheSBhdCB0aGUgem9vISBGaXJzdCwgSSBzYXcgYSBodWdlIGVsZXBoYW50IHNwcmF5aW5nIHdhdGVyIHdpdGggaXRzIHRydW5rLiBUaGUgZWxlcGhhbnQgd2FzIHNvIGdlbnRsZSBhbmQgc21hcnQuIE5leHQsIEkgaGVhcmQgYSBsb3VkIHJvYXIgZnJvbSB0aGUgbGlvbi4gVGhlIGxpb24gbG9va2VkIHBvd2VyZnVsIGFuZCBicmF2ZSBhcyBpdCB3YWxrZWQgYXJvdW5kLiBUaGVuIEkgc3BvdHRlZCBhIHRhbGwgZ2lyYWZmZSBlYXRpbmcgbGVhdmVzIGZyb20gYSB0cmVlLiBUaGUgZ2lyYWZmZSdzIGxvbmcgbmVjayBoZWxwZWQgaXQgcmVhY2ggdGhlIGhpZ2hlc3QgYnJhbmNoZXMuIEEgemVicmEgcmFuIHBhc3Qgd2l0aCBpdHMgYmxhY2sgYW5kIHdoaXRlIHN0cmlwZXMgc2hpbmluZyBpbiB0aGUgc3VuLiBGaW5hbGx5LCBhIHBsYXlmdWwgbW9ua2V5IHN3dW5nIGZyb20gYnJhbmNoIHRvIGJyYW5jaCwgbWFraW5nIGV2ZXJ5b25lIGxhdWdoLiBXaGF0IGFuIGFkdmVudHVyZSEifSwicHJhY3RpY2UiOnsiZmlsbEluQmxhbmsiOlt7InNlbnRlbmNlIjoiVGhlIF9fXyB1c2VkIGl0cyB0cnVuayB0byBzcHJheSB3YXRlci4iLCJhbnN3ZXIiOiJlbGVwaGFudCIsIm9wdGlvbnMiOlsiZWxlcGhhbnQiLCJsaW9uIiwiZ2lyYWZmZSJdfV0sImNvbXByZWhlbnNpb24iOlt7InF1ZXN0aW9uIjoiV2hpY2ggYW5pbWFsIGRpZCB0aGUgcGVyc29uIHNlZSBmaXJzdCBhdCB0aGUgem9vPyIsImFuc3dlciI6IlRoZSBlbGVwaGFudCJ9XX19fQ==
```
