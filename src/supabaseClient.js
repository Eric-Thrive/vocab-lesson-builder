import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to generate a lesson ID from words
export const generateLessonId = (words) => {
  return words
    .split('\n')
    .filter(w => w.trim())
    .slice(0, 3)
    .map(w => w.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'))
    .join('-')
    .substring(0, 50);
};

// Save lesson to Supabase
export const saveLesson = async (words, lessonData) => {
  const lessonId = generateLessonId(words);
  const title = words.split('\n').filter(w => w.trim()).join(', ');

  const { data, error } = await supabase
    .from('lessons')
    .upsert({
      lesson_id: lessonId,
      title: title,
      words: words,
      lesson_data: lessonData,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'lesson_id'
    })
    .select();

  if (error) throw error;
  return { lessonId, data };
};

// Load lesson from Supabase
export const loadLesson = async (lessonId) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('lesson_id', lessonId)
    .single();

  if (error) throw error;

  // Increment view count (don't fail if this errors)
  try {
    await supabase.rpc('increment_view_count', { lesson_id_param: lessonId });
  } catch (viewCountError) {
    console.log('Could not increment view count:', viewCountError);
  }

  return data;
};

// Get all lessons (for lesson library)
export const getAllLessons = async (limit = 50, includeArchived = false) => {
  let query = supabase
    .from('lessons')
    .select('id, lesson_id, title, created_at, view_count, archived')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Filter out archived lessons by default
  if (!includeArchived) {
    query = query.or('archived.is.null,archived.eq.false');
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

// Archive lesson
export const archiveLesson = async (lessonId) => {
  const { error } = await supabase
    .from('lessons')
    .update({ archived: true, archived_at: new Date().toISOString() })
    .eq('lesson_id', lessonId);

  if (error) throw error;
};

// Unarchive lesson
export const unarchiveLesson = async (lessonId) => {
  const { error } = await supabase
    .from('lessons')
    .update({ archived: false, archived_at: null })
    .eq('lesson_id', lessonId);

  if (error) throw error;
};

// Delete lesson
export const deleteLesson = async (lessonId) => {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('lesson_id', lessonId);

  if (error) throw error;
};
