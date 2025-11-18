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

---

## Row Level Security (RLS) Policies

### ⚠️ IMPORTANT: Required for Delete/Update/Insert to Work

If your delete, archive, or update buttons are not working, you need to enable the proper RLS policies. Run this SQL in Supabase:

```sql
-- Enable Row Level Security on lessons table
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON lessons;
DROP POLICY IF EXISTS "Public insert access" ON lessons;
DROP POLICY IF EXISTS "Public update access" ON lessons;
DROP POLICY IF EXISTS "Public delete access" ON lessons;

-- Create SELECT policy
CREATE POLICY "Public read access" ON lessons FOR SELECT USING (true);

-- Create INSERT policy
CREATE POLICY "Public insert access" ON lessons FOR INSERT WITH CHECK (true);

-- Create UPDATE policy
CREATE POLICY "Public update access" ON lessons FOR UPDATE USING (true) WITH CHECK (true);

-- Create DELETE policy (THIS IS THE KEY ONE FOR THE DELETE BUTTON!)
CREATE POLICY "Public delete access" ON lessons FOR DELETE USING (true);
```

### What These Policies Do

- **SELECT policy**: Allows anyone to read lessons
- **INSERT policy**: Allows anyone to create new lessons
- **UPDATE policy**: Allows anyone to update lessons (for archive/unarchive)
- **DELETE policy**: Allows anyone to permanently delete lessons

### Security Note

These policies allow public access for simplicity. In a production environment with user authentication, you should replace `true` with proper user authentication checks like `auth.uid() = user_id`.

### Verify Policies Are Active

After running the SQL, go to:
1. Supabase Dashboard → Authentication → Policies
2. Select the `lessons` table
3. You should see all 4 policies listed above

If the delete button still doesn't work after adding these policies:
1. Check the browser console for errors
2. Make sure you're using the correct `lesson_id` format
3. Try refreshing the page

---

## Supabase Storage Setup (REQUIRED for 10-word lessons)

### ⚠️ IMPORTANT: Required to Save Large Lessons

To save lessons with many words (especially 10 words), you MUST set up Supabase Storage. This stores images separately instead of in the database, reducing the payload size from ~10MB to just a few KB.

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Click **Storage** in the left sidebar
3. Click **New bucket**
4. Set the following:
   - **Name**: `lesson-images`
   - **Public bucket**: ✅ **YES** (check this box!)
   - **Allowed MIME types**: Leave empty or add `image/png, image/jpeg, image/jpg, image/webp`
5. Click **Create bucket**

### Step 2: Set Storage Policies

After creating the bucket, you need to allow public access:

1. Go to **Storage** → **Policies** → Select `lesson-images` bucket
2. Click **New policy**
3. Create these policies:

**Policy 1: Public Upload Access**
```sql
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'lesson-images');
```

**Policy 2: Public Read Access**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-images');
```

**Policy 3: Public Update Access** (for re-uploading images)
```sql
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'lesson-images')
WITH CHECK (bucket_id = 'lesson-images');
```

**Policy 4: Public Delete Access** (for cleanup)
```sql
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'lesson-images');
```

### Step 3: Verify Storage is Working

1. Try creating a lesson with 10 vocabulary words
2. Check the browser console (F12) - you should see messages like:
   - `Uploading image: lesson-id/word-0-timestamp.png (XXX KB)`
   - `✓ Image uploaded successfully: https://...`
3. In Supabase Dashboard → Storage → lesson-images, you should see folders with your lesson IDs containing image files

### What This Does

- **Before**: Images stored as base64 in database (10 words = ~10MB payload) ❌
- **After**: Images stored in Supabase Storage, only URLs in database (10 words = ~5KB payload) ✅

### Benefits

- ✅ Can save lessons with 10 or more words
- ✅ Much faster saving and loading
- ✅ Reduced database costs
- ✅ Better performance
- ✅ Automatic cleanup when deleting lessons
