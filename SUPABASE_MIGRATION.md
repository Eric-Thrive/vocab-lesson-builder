# Supabase Database Migration

## Archive Feature - Required Columns

To support the archive functionality, you need to add these columns to your `lessons` table in Supabase:

### SQL Migration - Simple Version (Run This First)

Run **ONLY** this SQL in your Supabase SQL Editor:

```sql
-- Add archived column (boolean, default false)
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add archived_at column (timestamp, nullable)
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
```

### Optional Performance Index (Run After Columns Are Added)

If the above succeeds, you can optionally add this index for better performance:

```sql
-- Add index for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_lessons_archived ON lessons(archived);
```

### ⚠️ Note About the Error You Saw

If you got an error about `policy "Public read access" for table "lessons" already exists`, that's fine! It means:
- The policy already exists (which is good)
- **Just ignore that error** and make sure the columns were added
- You can verify the columns exist by checking the table schema in Supabase

### Verify the Migration Worked

After running the SQL, check your `lessons` table structure in Supabase. You should see:
- `archived` column (boolean)
- `archived_at` column (timestamp with time zone)

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
