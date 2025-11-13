#!/bin/bash

# Helper script to add a new lesson to the repository
# Usage: ./add-lesson.sh path/to/lesson.json

if [ -z "$1" ]; then
  echo "Usage: ./add-lesson.sh path/to/lesson.json"
  echo "Example: ./add-lesson.sh ~/Downloads/animals-lesson.json"
  exit 1
fi

LESSON_FILE="$1"

if [ ! -f "$LESSON_FILE" ]; then
  echo "Error: File not found: $LESSON_FILE"
  exit 1
fi

# Extract lesson ID from the JSON file
LESSON_ID=$(grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' "$LESSON_FILE" | head -1 | sed 's/.*"\([^"]*\)".*/\1/')

if [ -z "$LESSON_ID" ]; then
  echo "Error: Could not find 'id' field in JSON file"
  exit 1
fi

# Copy to public/lessons
cp "$LESSON_FILE" "public/lessons/${LESSON_ID}.json"

echo "✓ Lesson added: public/lessons/${LESSON_ID}.json"
echo ""
echo "Next steps:"
echo "1. Review the file: cat public/lessons/${LESSON_ID}.json"
echo "2. Update public/lessons/index.json to include this lesson"
echo "3. Commit: git add public/lessons/${LESSON_ID}.json"
echo "4. Build: npm run build"
echo "5. Deploy to your hosting service"
echo "6. Share: yoursite.com?lesson=${LESSON_ID}"
