import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to convert base64 to blob
const base64ToBlob = (base64String) => {
  // Extract the base64 data (remove data:image/png;base64, prefix)
  const parts = base64String.split(',');
  const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const base64Data = parts[1];

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

// Upload image to Supabase Storage
export const uploadImageToStorage = async (base64Image, lessonId, wordIndex) => {
  try {
    // Convert base64 to blob
    const blob = base64ToBlob(base64Image);

    // Generate a unique filename
    const timestamp = Date.now();
    const fileName = `${lessonId}/word-${wordIndex}-${timestamp}.png`;

    console.log(`Uploading image: ${fileName} (${(blob.size / 1024).toFixed(2)} KB)`);

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('Images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true // Overwrite if exists
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('Images')
      .getPublicUrl(fileName);

    console.log(`✓ Image uploaded successfully: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    throw error;
  }
};

// Delete images from storage when deleting a lesson
export const deleteImagesFromStorage = async (lessonId) => {
  try {
    // List all files in the lesson folder
    const { data: files, error: listError } = await supabase.storage
      .from('Images')
      .list(lessonId);

    if (listError) {
      console.warn('Could not list images for deletion:', listError);
      return;
    }

    if (!files || files.length === 0) {
      console.log('No images to delete for lesson:', lessonId);
      return;
    }

    // Delete all images in the folder
    const filePaths = files.map(file => `${lessonId}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from('Images')
      .remove(filePaths);

    if (deleteError) {
      console.warn('Could not delete some images:', deleteError);
    } else {
      console.log(`✓ Deleted ${filePaths.length} images for lesson ${lessonId}`);
    }
  } catch (error) {
    console.error('Error deleting images from storage:', error);
    // Don't throw - we still want to delete the lesson record even if images fail
  }
};

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

  // Calculate payload size for debugging
  const payload = {
    lesson_id: lessonId,
    title: title,
    words: words,
    lesson_data: lessonData,
    updated_at: new Date().toISOString()
  };

  const payloadSize = JSON.stringify(payload).length;
  const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
  console.log(`Saving lesson with ${lessonData?.words?.length || 0} words, payload size: ${payloadSizeMB} MB`);

  const { data, error } = await supabase
    .from('lessons')
    .upsert(payload, {
      onConflict: 'lesson_id'
    })
    .select();

  if (error) {
    console.error('Save lesson error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    throw error;
  }

  console.log('Lesson saved successfully!');
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
  console.log('deleteLesson called with:', lessonId);

  // First, delete images from storage
  await deleteImagesFromStorage(lessonId);

  // Then delete the lesson record
  const { data, error } = await supabase
    .from('lessons')
    .delete()
    .eq('lesson_id', lessonId)
    .select();

  console.log('Supabase delete response:', { data, error });

  if (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }

  return data;
};
