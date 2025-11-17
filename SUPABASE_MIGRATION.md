# Supabase Database Migration

## Archive Feature - Required Columns

To support the archive functionality, you need to add these columns to your `lessons` table in Supabase:

### SQL Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add archived column (boolean, default false)
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add archived_at column (timestamp, nullable)
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_archived ON lessons(archived);
```

### What These Columns Do

- **`archived`** (boolean): Indicates if a lesson is archived
  - `false` or `null` = Active lesson (shown by default)
  - `true` = Archived lesson (hidden unless "Show archived" is checked)

- **`archived_at`** (timestamptz): When the lesson was archived
  - `null` = Not archived or restored from archive
  - timestamp = When it was last archived

### Features Enabled

After running this migration, you'll have:
- ✅ **Archive** button - Moves lessons to archive (soft delete)
- ✅ **Restore** button - Brings archived lessons back to active
- ✅ **Delete** button - Permanently removes lessons (hard delete)
- ✅ **Show archived lessons** checkbox - Toggle visibility of archived lessons
- ✅ Visual indicators for archived lessons (orange background)
