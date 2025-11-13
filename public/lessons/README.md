# Vocabulary Lessons

This folder contains vocabulary lesson files that can be shared with students using short URLs.

## How to Add a New Lesson

1. Create a lesson in the app
2. Click "Share Link for Students"
3. Download the lesson JSON file
4. Add it to this folder
5. Commit and push to GitHub
6. Deploy your site (GitHub Pages, Netlify, Vercel, etc.)
7. Share the short URL: `yoursite.com?lesson=lesson-id`

## Lesson File Format

Each lesson file should be named with a unique ID (e.g., `animals-lesson.json`) and contain:

```json
{
  "id": "animals-lesson",
  "name": "Animals Vocabulary",
  "description": "Learn about different animals",
  "words": "elephant\nlion\ngiraffe",
  "lessonData": {
    "words": [...],
    "story": {...},
    "practice": {...}
  }
}
```

## Example Lessons

- `example-animals.json` - Sample animals vocabulary lesson

## Updating the Index

After adding new lessons, update `index.json` to list all available lessons:

```json
{
  "lessons": [
    {
      "id": "example-animals",
      "name": "Animals Vocabulary",
      "description": "Learn about different animals",
      "file": "example-animals.json"
    }
  ]
}
```
