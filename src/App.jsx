import React, { useState, useRef, useEffect } from 'react';
import { Book, Image, CheckCircle, RefreshCw, Share2, Copy, Library, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { saveLesson, loadLesson as loadLessonFromDB, getAllLessons, deleteLesson, archiveLesson, unarchiveLesson, uploadImageToStorage } from './supabaseClient';

const VocabLessonBuilder = () => {
  const [step, setStep] = useState('input'); // input, preteach, story, practice
  const [words, setWords] = useState('');
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [editingImage, setEditingImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [selectedWord, setSelectedWord] = useState(null);
  const [showStory, setShowStory] = useState(false);

  const [editingDefinition, setEditingDefinition] = useState(null);
  const [editedDefinition, setEditedDefinition] = useState('');
  const [editingExamples, setEditingExamples] = useState(null);
  const [editedExamples, setEditedExamples] = useState([]);
  const [deletingLesson, setDeletingLesson] = useState(null);
  const [showArchivedLessons, setShowArchivedLessons] = useState(false);
  const [imageProgress, setImageProgress] = useState({ current: 0, total: 0, word: '' });
  const [expandedWordIndex, setExpandedWordIndex] = useState(0); // Accordion state - start with first word expanded
  const [matchingItems, setMatchingItems] = useState([]); // For practice matching game
  const [matchingCarouselIndex, setMatchingCarouselIndex] = useState(0); // Carousel for matching game
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentActivity, setCurrentActivity] = useState('fillInBlank'); // fillInBlank, matching, comprehension
  const [comprehensionAnswers, setComprehensionAnswers] = useState({});
  const [comprehensionFeedback, setComprehensionFeedback] = useState({});
  const [checkingAnswer, setCheckingAnswer] = useState(null);
  const [githubSaveStatus, setGithubSaveStatus] = useState('');
  const [customDirectory, setCustomDirectory] = useState('public/lessons');
  const [customFilename, setCustomFilename] = useState('');
  const [customLessonName, setCustomLessonName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLessonLibrary, setShowLessonLibrary] = useState(false);
  const [lessonLibrary, setLessonLibrary] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [supabaseSaveStatus, setSupabaseSaveStatus] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // idle, saving, saved, error
  const autoSaveTimerRef = useRef(null);

  // Load lesson from URL on mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonParam = urlParams.get('lesson');

    if (lessonParam) {
      // Check if it's a lesson ID (short format) or base64 data (legacy format)
      if (lessonParam.length < 100 && !lessonParam.includes('{')) {
        // It's a lesson ID - fetch from Supabase
        loadLessonFromSupabase(lessonParam);
      } else {
        // Legacy base64 format
        try {
          const decodedData = JSON.parse(atob(lessonParam));
          setWords(decodedData.words);
          setLessonData(decodedData.lessonData);
          setStep('preteach');
        } catch (error) {
          console.error('Error loading lesson from URL:', error);
        }
      }
    }
  }, []);

  // Load lesson from Supabase
  const loadLessonFromSupabase = async (lessonId) => {
    try {
      setLoading(true);
      console.log('Loading lesson from Supabase:', lessonId);
      const lesson = await loadLessonFromDB(lessonId);

      if (!lesson) {
        throw new Error('Lesson not found');
      }

      console.log('Lesson loaded successfully:', lesson);
      setWords(lesson.words);
      setLessonData(lesson.lesson_data);
      setStep('preteach');
      setShowLessonLibrary(false); // Close the lesson library after loading
    } catch (error) {
      console.error('Error loading lesson from Supabase:', error);
      console.error('Lesson ID that failed:', lessonId);
      console.error('Full error:', JSON.stringify(error, null, 2));

      let errorMessage = 'Could not load lesson.';

      if (error.message === 'Lesson not found') {
        errorMessage = `Lesson "${lessonId}" not found. It may have been deleted or the link is invalid.`;
      } else if (error.code === 'PGRST116') {
        errorMessage = `Lesson "${lessonId}" does not exist in the database.`;
      } else {
        errorMessage = `Failed to load lesson: ${error.message}\n\nCheck the browser console for details.`;
      }

      alert(errorMessage);

      // Show the lesson library so user can pick a different lesson
      setShowLessonLibrary(true);
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  // Load all lessons for library
  const loadLessonLibrary = async (includeArchived = showArchivedLessons) => {
    try {
      setLoadingLibrary(true);
      const lessons = await getAllLessons(50, includeArchived);
      setLessonLibrary(lessons);
    } catch (error) {
      console.error('Error loading lesson library:', error);
      alert('Could not load lesson library. Please try again.');
    } finally {
      setLoadingLibrary(false);
    }
  };

  // Delete lesson handler
  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    if (!window.confirm(`Are you sure you want to permanently DELETE "${lessonTitle}"?\n\nThis cannot be undone!`)) {
      return;
    }

    try {
      console.log('Attempting to delete lesson:', lessonId);
      const result = await deleteLesson(lessonId);
      console.log('Delete result:', result);
      alert(`✓ Lesson "${lessonTitle}" has been deleted.`);
      await loadLessonLibrary(showArchivedLessons); // Reload the library with current filter state
    } catch (error) {
      console.error('Error deleting lesson:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert(`Failed to delete lesson: ${error.message}\n\nCheck the console for more details.\n\nThis is likely a Supabase permissions issue.`);
    }
  };

  // Archive lesson handler
  const handleArchiveLesson = async (lessonId, lessonTitle) => {
    try {
      await archiveLesson(lessonId);
      alert(`✓ Lesson "${lessonTitle}" has been archived.`);
      await loadLessonLibrary(showArchivedLessons); // Reload the library with current filter state
    } catch (error) {
      console.error('Error archiving lesson:', error);
      alert(`Failed to archive lesson: ${error.message}`);
    }
  };

  // Unarchive lesson handler
  const handleUnarchiveLesson = async (lessonId, lessonTitle) => {
    try {
      await unarchiveLesson(lessonId);
      alert(`✓ Lesson "${lessonTitle}" has been restored from archive.`);
      await loadLessonLibrary(showArchivedLessons); // Reload the library with current filter state
    } catch (error) {
      console.error('Error unarchiving lesson:', error);
      alert(`Failed to unarchive lesson: ${error.message}`);
    }
  };

  // Save lesson to GitHub repo
  const saveLessonToGitHub = async (lessonData, lessonId, customDir = null, customFile = null) => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const owner = import.meta.env.VITE_GITHUB_OWNER;
    const repo = import.meta.env.VITE_GITHUB_REPO;
    const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';

    if (!token || !owner || !repo) {
      console.log('GitHub credentials not configured. Skipping GitHub save.');
      return false;
    }

    try {
      setGithubSaveStatus('Saving to GitHub...');

      // Use custom directory and filename if provided, otherwise use defaults
      const directory = customDir || 'public/lessons';
      const filename = customFile || `${lessonId}.json`;
      const path = `${directory}/${filename}`;
      const content = btoa(JSON.stringify(lessonData, null, 2));

      // Check if file exists to get SHA
      let sha = null;
      try {
        const checkResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
          {
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        if (checkResponse.ok) {
          const data = await checkResponse.json();
          sha = data.sha;
        }
      } catch (e) {
        // File doesn't exist, that's ok
      }

      // Create or update file
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Auto-save lesson: ${lessonData.name}`,
            content: content,
            branch: branch,
            ...(sha && { sha })
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save to GitHub');
      }

      // Update the index.json file
      await updateLessonIndex(lessonId, lessonData, token, owner, repo, branch, directory, filename);

      setGithubSaveStatus('✓ Saved to GitHub!');
      setTimeout(() => setGithubSaveStatus(''), 3000);
      console.log('Lesson saved to GitHub:', lessonId);
      return true;
    } catch (error) {
      console.error('Error saving to GitHub:', error);
      setGithubSaveStatus('✗ GitHub save failed');
      setTimeout(() => setGithubSaveStatus(''), 5000);
      return false;
    }
  };

  // Update the lessons index file in GitHub
  const updateLessonIndex = async (lessonId, lessonData, token, owner, repo, branch, directory = 'public/lessons', filename = null) => {
    try {
      const indexPath = 'public/lessons/index.json';

      // Fetch current index
      let currentIndex = { lessons: [] };
      let indexSha = null;

      try {
        const indexResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${indexPath}?ref=${branch}`,
          {
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        if (indexResponse.ok) {
          const indexData = await indexResponse.json();
          indexSha = indexData.sha;
          const decodedContent = atob(indexData.content);
          currentIndex = JSON.parse(decodedContent);
        }
      } catch (e) {
        console.log('Index file does not exist yet, will create it');
      }

      // Remove existing entry for this lesson if it exists
      currentIndex.lessons = currentIndex.lessons.filter(lesson => lesson.id !== lessonId);

      // Add new/updated lesson entry with full path
      const finalFilename = filename || `${lessonId}.json`;
      const fullPath = directory === 'public/lessons' ? finalFilename : `${directory}/${finalFilename}`;

      currentIndex.lessons.push({
        id: lessonId,
        name: lessonData.name,
        description: lessonData.description || `Vocabulary lesson with ${lessonData.lessonData?.words?.length || 0} words`,
        date: lessonData.date || new Date().toISOString(),
        file: fullPath,
        directory: directory
      });

      // Sort by date (newest first)
      currentIndex.lessons.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Update index file
      const indexContent = btoa(JSON.stringify(currentIndex, null, 2));

      const updateResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${indexPath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Update index: add/update ${lessonData.name}`,
            content: indexContent,
            branch: branch,
            ...(indexSha && { sha: indexSha })
          })
        }
      );

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.message || 'Failed to update index');
      }

      console.log('Index file updated successfully');
    } catch (error) {
      console.error('Error updating index file:', error);
      // Don't throw - we don't want to fail the entire save if index update fails
    }
  };

  // Load lesson library from Supabase on mount and show it by default
  React.useEffect(() => {
    loadLessonLibrary();
    setShowLessonLibrary(true); // Show lesson library by default
  }, []);

  // Auto-save student progress when answers change
  React.useEffect(() => {
    if (lessonData && (Object.keys(practiceAnswers).length > 0 || Object.keys(matchingAnswers).length > 0)) {
      if (typeof window.storage !== 'undefined') {
        try {
          const progressKey = `progress:${JSON.stringify(lessonData.words.map(w => w.word))}`;
          const progressData = {
            practiceAnswers,
            matchingAnswers,
            lastUpdated: new Date().toISOString()
          };
          window.storage.set(progressKey, JSON.stringify(progressData));
          console.log('Student progress auto-saved');
        } catch (error) {
          console.error('Error auto-saving progress:', error);
        }
      }
    }
  }, [practiceAnswers, matchingAnswers, lessonData]);

  // Auto-save lesson data changes (images, definitions, etc.) to Supabase
  React.useEffect(() => {
    // Only auto-save if we have lesson data and words (meaning lesson is loaded)
    if (!lessonData || !words || loading) {
      return;
    }

    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Debounce the save - wait 2 seconds after last change
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        console.log('Auto-saving lesson changes to Supabase...');

        await saveLesson(words, lessonData);

        setAutoSaveStatus('saved');
        console.log('Lesson auto-saved successfully');

        // Clear the "saved" status after 3 seconds
        setTimeout(() => setAutoSaveStatus(''), 3000);
      } catch (error) {
        console.error('Error auto-saving lesson:', error);
        setAutoSaveStatus('error');

        // Clear the error status after 5 seconds
        setTimeout(() => setAutoSaveStatus(''), 5000);
      }
    }, 2000);

    // Cleanup function
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [lessonData, words, loading]);

  // Initialize matching items when entering practice mode - only use vocab words (high-quality Nano Banana images)
  React.useEffect(() => {
    if (step === 'practice' && lessonData && matchingItems.length === 0) {
      const groups = [];
      const vocabWords = lessonData.words;

      console.log('Initializing matching game with vocab words only:', vocabWords.length);

      // Create groups with exactly 4 vocab words per group
      for (let i = 0; i < vocabWords.length; i += 4) {
        const group = [
          vocabWords[i],
          vocabWords[i + 1],
          vocabWords[i + 2],
          vocabWords[i + 3]
        ].filter(Boolean); // Remove undefined if not enough words

        // Only add groups that have at least 2 words (for last group if odd number)
        if (group.length >= 2) {
          // Shuffle this group
          groups.push(group.sort(() => Math.random() - 0.5));
        }
      }

      console.log('Created matching groups:', groups);
      if (groups.length > 0) {
        setMatchingItems(groups);
        setMatchingCarouselIndex(0);
      } else {
        console.error('No matching groups created!');
      }
    }
  }, [step, lessonData]);





  const exportCurrentLesson = async () => {
    if (!lessonData) return;
    
    const lessonToExport = {
      name: `Lesson - ${lessonData.words.slice(0, 3).map(w => w.word).join(', ')}...`,
      date: new Date().toISOString(),
      words: words,
      lessonData: lessonData
    };

    try {
      if ('showSaveFilePicker' in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: `${lessonToExport.name.replace(/[^a-z0-9]/gi, '_')}.json`,
          types: [{
            description: 'Vocabulary Lesson',
            accept: { 'application/json': ['.json'] }
          }]
        });
        
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(lessonToExport, null, 2));
        await writable.close();
        
        alert('✓ Lesson exported successfully!');
      } else {
        // Fallback: download as file
        const blob = new Blob([JSON.stringify(lessonToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${lessonToExport.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('✓ Lesson downloaded!');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('User cancelled export');
        return;
      }
      console.error('Error exporting lesson:', error);
      alert('Error exporting lesson: ' + error.message);
    }
  };

  const createShareLink = () => {
    // Get the lesson ID from the URL (it's already there after saving to Supabase)
    const urlParams = new URLSearchParams(window.location.search);
    let lessonId = urlParams.get('lesson');

    // Fallback: if no lesson ID in URL, generate it using the same logic as Supabase
    if (!lessonId || lessonId.length > 100) {
      // Import the generateLessonId function logic here
      lessonId = words
        .split('\n')
        .filter(w => w.trim())
        .slice(0, 3)
        .map(w => w.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'))
        .join('-')
        .substring(0, 50);
    }

    const wordList = words.split('\n').filter(w => w.trim()).slice(0, 3);
    const lessonToShare = {
      id: lessonId,
      name: `Lesson - ${wordList.join(', ')}`,
      description: `Vocabulary lesson with ${lessonData.words.length} words`,
      words: words,
      lessonData: lessonData
    };

    // Create short link using lesson ID (primary sharing method)
    const shortLink = `${window.location.origin}${window.location.pathname}?lesson=${lessonId}`;

    // Store the lesson data for download
    window.currentLessonForDownload = lessonToShare;

    setShareLink(shortLink);
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      alert('Link copied to clipboard! Share this with your students.');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const checkComprehensionAnswer = async (questionIndex, question, sampleAnswer, studentAnswer) => {
    if (!studentAnswer || !studentAnswer.trim()) {
      setComprehensionFeedback(prev => ({
        ...prev,
        [questionIndex]: 'Please write an answer first!'
      }));
      return;
    }

    setCheckingAnswer(questionIndex);
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

    console.log('Checking answer for question:', questionIndex);
    console.log('OpenAI API key available:', !!openaiKey);

    if (!openaiKey || openaiKey === 'your_openai_key_here') {
      setComprehensionFeedback(prev => ({
        ...prev,
        [questionIndex]: 'OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file.'
      }));
      setCheckingAnswer(null);
      return;
    }

    try {
      const promptText = `You are a supportive teacher helping a 6th grade student who reads at a 3rd grade level.

Question: ${question}
Sample Answer: ${sampleAnswer}
Student's Answer: ${studentAnswer}

Give brief, encouraging feedback (2-3 short sentences). Use simple 3rd grade level words. If the answer is good, praise it. If it needs help, give one easy hint.

Be warm and use very simple language.`;

      console.log('Sending prompt to OpenAI GPT-4o...');

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{
              role: 'user',
              content: promptText
            }],
            temperature: 0.7,
            max_tokens: 150
          })
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', response.status, errorData);
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('OpenAI response:', data);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('No choices in response:', data);
        throw new Error('No response from OpenAI');
      }

      const feedback = data.choices[0].message.content.trim();
      console.log('Feedback received:', feedback);

      setComprehensionFeedback(prev => ({
        ...prev,
        [questionIndex]: feedback
      }));
    } catch (error) {
      console.error('Error checking answer:', error);
      console.error('Error details:', error.message);
      setComprehensionFeedback(prev => ({
        ...prev,
        [questionIndex]: 'Sorry, I had trouble checking your answer. Please try again!'
      }));
    }
    setCheckingAnswer(null);
  };

  const updateDefinition = (wordIndex, newDefinition) => {
    const updatedWords = [...lessonData.words];
    updatedWords[wordIndex].definition = newDefinition;
    setLessonData({ ...lessonData, words: updatedWords });
    setEditingDefinition(null);
    setEditedDefinition('');
  };

  const updateExamples = (wordIndex, newExamples) => {
    const updatedWords = [...lessonData.words];
    updatedWords[wordIndex].examples = newExamples.filter(ex => ex.trim());
    setLessonData({ ...lessonData, words: updatedWords });
    setEditingExamples(null);
    setEditedExamples([]);
  };

  const handleImagePaste = async (e, wordIndex) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          const updatedWords = [...lessonData.words];
          updatedWords[wordIndex].image = event.target.result;
          setLessonData({ ...lessonData, words: updatedWords });
          setEditingImage(null);
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
  };

  const handleImageUpload = (e, wordIndex) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const updatedWords = [...lessonData.words];
      updatedWords[wordIndex].image = event.target.result;
      setLessonData({ ...lessonData, words: updatedWords });
      setEditingImage(null);
    };
    reader.readAsDataURL(file);
  };

  const updateImage = (wordIndex, newUrl) => {
    console.log('Update image called:', wordIndex, newUrl);
    
    if (!newUrl || !newUrl.trim()) {
      alert('Please enter a valid image URL');
      return;
    }
    
    // Update immediately without validation
    const updatedWords = [...lessonData.words];
    updatedWords[wordIndex].image = newUrl;
    setLessonData({ ...lessonData, words: updatedWords });
    setEditingImage(null);
    setImageUrl('');
  };

  // Show save dialog before generating lesson
  const handleCreateLesson = () => {
    console.log('handleCreateLesson called');
    console.log('GitHub token exists:', !!import.meta.env.VITE_GITHUB_TOKEN);

    if (import.meta.env.VITE_GITHUB_TOKEN) {
      // Set default values for the dialog
      const wordList = words.split('\n').filter(w => w.trim()).slice(0, 10);
      const defaultId = wordList.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
      const defaultName = `Lesson - ${wordList.slice(0, 3).join(', ')}${wordList.length > 3 ? '...' : ''}`;

      console.log('Setting dialog values:', { defaultName, defaultId });
      setCustomLessonName(defaultName);
      setCustomFilename(`${defaultId}.json`);
      setCustomDirectory('public/lessons');
      setShowSaveDialog(true);
      console.log('Dialog should be visible now');
    } else {
      // No GitHub configured, just generate directly
      console.log('No GitHub token, generating directly');
      generateLesson();
    }
  };

  const generateLesson = async () => {
    setLoading(true);
    const wordList = words.split('\n').filter(w => w.trim()).slice(0, 10);
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    
    if (!apiKey) {
      alert('Please add your Google API key to the .env file. Get one free at: https://aistudio.google.com/app/apikey');
      setLoading(false);
      return;
    }
    
    // Retry logic for JSON generation
    let retries = 3;
    let lesson = null;
    let validationRetries = 3; // Additional retries for validation
    
    while (retries > 0 && !lesson) {
      try {
        // Use Google Gemini API for text generation (using Gemini 2.5 Flash)
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Create a vocabulary lesson for a 6th grade autistic student (11-12 years old) reading at 2nd-3rd grade level. 

Words: ${wordList.join(', ')}

Return a valid JSON object with this EXACT structure (no extra text, no markdown):

{
  "words": [
    {
      "word": "word",
      "definition": "clear simple definition for 6th grader",
      "examples": ["Short 5-8 word sentence.", "Another short 5-8 word sentence."],
      "partOfSpeech": "noun"
    }
  ],
  "distractors": ["distractor1", "distractor2", "distractor3"],
  "story": {
    "title": "Engaging story title for middle school",
    "text": "150-200 word story naturally using all vocabulary words multiple times. Use varied themes like adventure, mystery, sports, science, friendship, or school life - appropriate for 6th grade. Make it engaging and relatable for 11-12 year olds."
  },
  "practice": {
    "fillInBlank": [
      {"sentence": "The student was very ___.", "answer": "word", "options": ["word1", "word2", "word3"]}
    ],
    "comprehension": [
      {"question": "Identification question about the story", "answer": "sample answer"},
      {"question": "Another identification question", "answer": "sample answer"},
      {"question": "Question about a character in the story", "answer": "sample answer"},
      {"question": "Question about another character", "answer": "sample answer"},
      {"question": "Question about the theme or lesson", "answer": "sample answer"}
    ]
  }
}

RULES:
- Include exactly 3 "distractors" - simple words NOT in the vocabulary list
- partOfSpeech must be ONE word: "noun", "verb", "adjective", or "adverb"
- Examples must be SHORT (5-8 words) and age-appropriate
- Create ONE fill-in-the-blank question for EACH vocabulary word (${wordList.length} total questions)
- Each fillInBlank question must have 3 options: the correct answer plus 2 other vocabulary words
- Create EXACTLY 5 comprehension questions: 2 identification questions (about events/settings/objects), 2 character questions (about motivations/actions/feelings), and 1 theme question (about the main lesson/message)
- NO trailing commas in arrays or objects
- Return ONLY valid JSON`
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4000,
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Gemini API error:', response.status, errorData);
          throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]) {
          console.error('No candidates in response:', data);
          throw new Error('No response from Gemini API');
        }
        
        const content = data.candidates[0].content.parts[0].text;
        console.log('Raw AI response (attempt ' + (4 - retries) + '):', content);
        
        // More aggressive cleaning of the response
        let cleanContent = content.trim();
        
        // Remove markdown code blocks (multiple patterns)
        cleanContent = cleanContent.replace(/```json\s*/g, '');
        cleanContent = cleanContent.replace(/```\s*/g, '');
        
        // Remove any text before the first {
        const firstBrace = cleanContent.indexOf('{');
        if (firstBrace > 0) {
          cleanContent = cleanContent.substring(firstBrace);
        } else if (firstBrace === -1) {
          retries--;
          if (retries > 0) {
            console.log('No JSON found, retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw new Error('No JSON object found in response after multiple attempts.');
        }
        
        // Remove any text after the last }
        const lastBrace = cleanContent.lastIndexOf('}');
        if (lastBrace > 0 && lastBrace < cleanContent.length - 1) {
          cleanContent = cleanContent.substring(0, lastBrace + 1);
        }
        
        // Fix common JSON issues
        // Remove trailing commas before closing brackets/braces
        cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1');
        
        console.log('Cleaned content:', cleanContent);
        
        try {
          lesson = JSON.parse(cleanContent);
          console.log('Successfully parsed JSON!');
          
          // Validate that we have exactly 5 comprehension questions
          if (!lesson.practice?.comprehension || lesson.practice.comprehension.length !== 5) {
            console.warn(`Expected 5 comprehension questions, got ${lesson.practice?.comprehension?.length || 0}`);
            
            // If we have validation retries left, try again
            if (validationRetries > 0) {
              validationRetries--;
              retries--; // Also decrement main retries
              console.log(`Retrying due to incorrect number of comprehension questions... (${validationRetries} validation retries left)`);
              lesson = null; // Reset lesson to trigger retry
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            } else {
              console.error('Failed to get exactly 5 comprehension questions after multiple attempts');
              // Continue anyway with what we have, but log the issue
            }
          }
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.error('Failed to parse:', cleanContent);
          
          // Try to provide more helpful error message
          const errorMatch = parseError.message.match(/position (\d+)/);
          if (errorMatch) {
            const pos = parseInt(errorMatch[1]);
            const snippet = cleanContent.substring(Math.max(0, pos - 50), Math.min(cleanContent.length, pos + 50));
            console.error('Error near:', snippet);
          }
          
          retries--;
          if (retries > 0) {
            console.log('JSON parse failed, retrying... (' + retries + ' attempts left)');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw new Error(`Invalid JSON from AI after multiple attempts: ${parseError.message}\n\nPlease try again.`);
        }
      } catch (error) {
        if (retries === 1) {
          // Last retry failed, throw the error
          setLoading(false);
          alert(`Error generating lesson: ${error.message}\n\nPlease check:\n1. Your API key is correct\n2. You have internet connection\n3. The Gemini API is enabled for your key`);
          return;
        }
        retries--;
        console.log('Error occurred, retrying... (' + retries + ' attempts left)');
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    }
    
    if (!lesson) {
      setLoading(false);
      alert('Failed to generate lesson after multiple attempts. Please try again.');
      return;
    }
    
    try {
      // Generate custom AI images using Nano Banana (Gemini 2.5 Flash Image)
      // Only generate images for vocabulary words (used in preteach and matching game)
      const wordsWithImages = [];
      const totalImages = lesson.words.length;
      let imageCount = 0;
      
      // Generate images for vocabulary words
      for (let index = 0; index < lesson.words.length; index++) {
        const wordObj = lesson.words[index];
        
        // Update progress for word image
        imageCount++;
        setImageProgress({ current: imageCount, total: totalImages, word: wordObj.word });
        
        // Define imagePrompt outside try block so it's available in catch
        const exampleSentence = wordObj.examples[0] || wordObj.word;
        const imagePrompt = `Create a graphic novel style illustration for the vocabulary word "${wordObj.word}" which means "${wordObj.definition}".

Scene to show: ${exampleSentence}

Style: GRAPHIC NOVEL / COMIC BOOK ART with bold ink lines, dynamic angles, and high contrast. Use clean linework, solid colors with cel-shading, and dramatic composition like you'd see in a modern graphic novel or comic book. Age-appropriate for 6th grade middle schoolers.

Make the main concept VERY OBVIOUS and CENTERED in the image - avoid ambiguous or background details. If illustrating "${wordObj.word}", emphasize the action or object that represents this word clearly and prominently. Show whatever best illustrates the meaning - this could be one person, multiple people, or no people at all. Avoid stereotypes.

IMPORTANT: Do NOT include any text, words, letters, sound effects (like "POW!" or "BANG!"), speech bubbles, or labels in the image. The image must be purely visual with no written text of any kind.`;

        // Helper function to try OpenAI as fallback
        const tryOpenAI = async (reason) => {
          const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

          if (!openaiKey || openaiKey === 'your_openai_key_here') {
            throw new Error(`Nano Banana failed (${reason}) and no OpenAI API key configured`);
          }

          console.log(`Nano Banana failed (${reason}), trying OpenAI gpt-image-1-mini for "${wordObj.word}"`);

          const dalleResponse = await fetch(
            'https://api.openai.com/v1/images/generations',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`
              },
              body: JSON.stringify({
                model: 'gpt-image-1-mini',
                prompt: imagePrompt,
                size: '1024x1024',
                quality: 'standard'
              })
            }
          );

          if (!dalleResponse.ok) {
            const errorData = await dalleResponse.json().catch(() => ({}));
            throw new Error(`OpenAI also failed: ${dalleResponse.status} - ${JSON.stringify(errorData)}`);
          }

          const dalleData = await dalleResponse.json();
          console.log('OpenAI response:', dalleData);

          if (!dalleData.data || !dalleData.data[0] || !dalleData.data[0].url) {
            throw new Error('OpenAI returned invalid response - no image URL');
          }

          console.log(`✓ OpenAI image generated successfully for "${wordObj.word}"`);
          return dalleData.data[0].url;
        };

        try {
          // Try Nano Banana first (Google Gemini image generation)
          console.log(`Generating image ${index + 1}/${lesson.words.length} for "${wordObj.word}" using Nano Banana`);

          // Add delay between requests to avoid rate limiting (except for first request)
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 12000)); // 12 second delay between requests for Nano Banana
          }

          let imageUrl = null;

          try {
            // Use Nano Banana (gemini-2.5-flash-image) for image generation
            const imgResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  contents: [{
                    parts: [{
                      text: imagePrompt
                    }]
                  }],
                  generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 8192,
                  }
                })
              }
            );

            if (!imgResponse.ok) {
              const errorData = await imgResponse.json().catch(() => ({}));
              console.error(`Nano Banana error for "${wordObj.word}":`, imgResponse.status, errorData);
              // Try OpenAI for ANY error from Nano Banana
              imageUrl = await tryOpenAI(`HTTP ${imgResponse.status}`);
            } else {
              const imgData = await imgResponse.json();
              console.log(`Image response for "${wordObj.word}":`, imgData);

              // Extract the base64 image from the response
              if (imgData.candidates && imgData.candidates[0] && imgData.candidates[0].content) {
                const parts = imgData.candidates[0].content.parts;
                const imagePart = parts.find(part => part.inlineData && part.inlineData.mimeType.startsWith('image/'));

                if (imagePart && imagePart.inlineData) {
                  imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                  console.log(`✓ Nano Banana image generated successfully for "${wordObj.word}"`);
                } else {
                  console.warn(`No image data in Nano Banana response for "${wordObj.word}"`);
                  // Try OpenAI if Nano Banana returned success but no image
                  imageUrl = await tryOpenAI('no image data in response');
                }
              } else {
                console.warn(`Invalid response structure from Nano Banana for "${wordObj.word}"`);
                // Try OpenAI if response structure is invalid
                imageUrl = await tryOpenAI('invalid response structure');
              }
            }
          } catch (nanaBananaError) {
            console.error(`Nano Banana exception for "${wordObj.word}":`, nanaBananaError);
            // Try OpenAI for ANY exception from Nano Banana
            imageUrl = await tryOpenAI('exception: ' + nanaBananaError.message);
          }

          // Add the word with image to the list
          if (imageUrl) {
            wordsWithImages.push({
              ...wordObj,
              image: imageUrl
            });
          } else {
            throw new Error(`Failed to generate image for "${wordObj.word}" - both Nano Banana and OpenAI failed`);
          }

        } catch (error) {
          console.error(`FATAL: Could not generate image for "${wordObj.word}":`, error);
          throw new Error(`Image generation failed for "${wordObj.word}": ${error.message}`);
        }
      }

      // Generate a temporary lesson ID for organizing images in storage
      const tempLessonId = words
        .split('\n')
        .filter(w => w.trim())
        .slice(0, 3)
        .map(w => w.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'))
        .join('-')
        .substring(0, 50);

      // Upload images to Supabase Storage and replace base64 URLs with storage URLs
      console.log('Uploading images to Supabase Storage...');
      setSupabaseSaveStatus('Uploading images to storage...');

      const wordsWithStorageUrls = [];
      for (let i = 0; i < wordsWithImages.length; i++) {
        const wordObj = wordsWithImages[i];
        try {
          // Upload the base64 image to storage and get back the public URL
          const storageUrl = await uploadImageToStorage(wordObj.image, tempLessonId, i);
          wordsWithStorageUrls.push({
            ...wordObj,
            image: storageUrl // Replace base64 with storage URL
          });
          console.log(`✓ Uploaded image ${i + 1}/${wordsWithImages.length} to storage`);
        } catch (uploadError) {
          console.error(`Error uploading image for "${wordObj.word}":`, uploadError);
          // Fallback: keep the base64 image if upload fails
          wordsWithStorageUrls.push(wordObj);
        }
      }

      // Skip distractor images - we only use vocab words in the matching game now
      const completedLesson = { ...lesson, words: wordsWithStorageUrls };

      // Save to Supabase (now with storage URLs instead of base64)
      try {
        setSupabaseSaveStatus('Saving lesson to database...');
        const { lessonId } = await saveLesson(words, completedLesson);
        setSupabaseSaveStatus(`✓ Lesson saved! Share URL: ${window.location.origin}?lesson=${lessonId}`);

        // Update URL without reloading page
        window.history.pushState({}, '', `?lesson=${lessonId}`);

        // Set lesson data AFTER saving to avoid auto-save conflicts
        setLessonData(completedLesson);
      } catch (error) {
        console.error('Error saving to Supabase:', error);
        setSupabaseSaveStatus(`✗ Save failed: ${error.message}`);

        // Still set the lesson data even if save failed, so user can see their lesson
        setLessonData(completedLesson);
      }

      setStep('preteach');
    } catch (imageError) {
      console.error('Error generating images:', imageError);
      alert(`Error generating images: ${imageError.message}\n\nThe lesson text was created, but image generation failed.`);
    }
    setLoading(false);
  };

  const getWordColor = (pos) => {
    const colors = {
      noun: 'bg-blue-100 text-blue-800 border-blue-300',
      verb: 'bg-red-100 text-red-800 border-red-300',
      adjective: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[pos] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const checkAnswer = (questionId, answer) => {
    setPracticeAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleMatchClick = (imageIndex, word, shuffledImages) => {
    // Check if the selected word matches the image at this index
    const correctWord = shuffledImages[imageIndex]?.word;
    setMatchingAnswers(prev => ({
      ...prev,
      [imageIndex]: {
        selectedWord: word,
        isCorrect: word === correctWord
      }
    }));
    setSelectedWord(null);
  };

  // Render save dialog as overlay (outside step-specific rendering)
  const renderSaveDialog = () => {
    if (!showSaveDialog) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Name Your Lesson</h2>
          <p className="text-gray-600 mb-6">Customize your lesson details before creation:</p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lesson Name: *
            </label>
            <input
              type="text"
              value={customLessonName}
              onChange={(e) => setCustomLessonName(e.target.value)}
              placeholder="My Awesome Vocabulary Lesson"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              This name will appear in your lesson list
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Directory Path:
            </label>
            <input
              type="text"
              value={customDirectory}
              onChange={(e) => setCustomDirectory(e.target.value)}
              placeholder="public/lessons"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              e.g., public/lessons/animals or public/lessons/grade-1
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filename:
            </label>
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder="my-lesson.json"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must end with .json (auto-added if missing)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSaveDialog(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Validate lesson name is provided
                if (!customLessonName.trim()) {
                  alert('Please enter a lesson name');
                  return;
                }

                setShowSaveDialog(false);
                // Trigger lesson generation which will use the custom values
                generateLesson();
              }}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Create Lesson
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (step === 'input') {
    return (
      <>
        {renderSaveDialog()}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Book className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Vocabulary Lesson Builder</h1>
            </div>

          {/* Lesson Library from Supabase */}
          <div className="mb-6">
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => {
                  setShowLessonLibrary(!showLessonLibrary);
                  if (!showLessonLibrary) loadLessonLibrary();
                }}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Library className="w-5 h-5" />
                {showLessonLibrary ? 'Hide Lessons' : 'Browse All Lessons'}
              </button>
            </div>

            {showLessonLibrary && (
              <>
                <div className="mb-3 flex items-center gap-2 bg-white p-3 rounded-lg border-2 border-gray-300">
                  <input
                    type="checkbox"
                    id="showArchived"
                    checked={showArchivedLessons}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setShowArchivedLessons(newValue);
                      loadLessonLibrary(newValue);
                    }}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <label htmlFor="showArchived" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Show archived lessons
                  </label>
                </div>
              </>
            )}

            {showLessonLibrary && (
              <div className="border-2 border-blue-300 rounded-lg p-4 max-h-96 overflow-y-auto mt-4 bg-blue-50">
                {loadingLibrary ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Loading lessons from database...</p>
                  </div>
                ) : lessonLibrary.length === 0 ? (
                  <p className="text-gray-500 text-center">No lessons in the library yet. Create your first lesson!</p>
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg text-blue-800 mb-3 flex items-center gap-2">
                      <Library className="w-5 h-5" />
                      All Lessons ({lessonLibrary.length})
                    </h3>
                    {lessonLibrary.map((lesson) => (
                      <div key={lesson.id} className={`bg-white p-4 rounded-lg border ${lesson.archived ? 'border-orange-300 bg-orange-50' : 'border-blue-200'} hover:border-blue-400 transition`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-gray-800">{lesson.title}</h3>
                              {lesson.archived && (
                                <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded font-semibold">
                                  ARCHIVED
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(lesson.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Views: {lesson.view_count || 0}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 ml-4">
                            <button
                              onClick={() => loadLessonFromSupabase(lesson.lesson_id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-semibold"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => {
                                const url = `${window.location.origin}?lesson=${lesson.lesson_id}`;
                                navigator.clipboard.writeText(url);
                                alert(`Link copied!\n${url}`);
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-semibold flex items-center gap-1"
                            >
                              <Copy className="w-4 h-4" />
                              Share
                            </button>
                            {lesson.archived ? (
                              <button
                                onClick={() => handleUnarchiveLesson(lesson.lesson_id, lesson.title)}
                                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm font-semibold flex items-center gap-1"
                                title="Restore from archive"
                              >
                                <ArchiveRestore className="w-4 h-4" />
                                Restore
                              </button>
                            ) : (
                              <button
                                onClick={() => handleArchiveLesson(lesson.lesson_id, lesson.title)}
                                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm font-semibold flex items-center gap-1"
                                title="Archive this lesson"
                              >
                                <Archive className="w-4 h-4" />
                                Archive
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteLesson(lesson.lesson_id, lesson.title)}
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-semibold flex items-center gap-1"
                              title="Permanently delete this lesson"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Enter Vocabulary Words (one per line, up to 10):
            </label>
            <textarea
              className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              value={words}
              onChange={(e) => setWords(e.target.value)}
              placeholder="brave&#10;rescue&#10;danger&#10;hero&#10;adventure"
            />
          </div>

          {/* Save Status */}
          {supabaseSaveStatus && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <p className="text-sm font-semibold text-green-700">
                {supabaseSaveStatus}
              </p>
            </div>
          )}

          <button
            onClick={handleCreateLesson}
            disabled={!words.trim() || loading}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin" />
                Creating Lesson... Please wait
              </span>
            ) : (
              'Create Lesson'
            )}
          </button>
          
          {loading && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <p className="text-center text-blue-800 font-semibold">
                {imageProgress.total === 0 ? (
                  '📝 Generating vocabulary lesson with Google Gemini...'
                ) : (
                  `🍌 Creating custom AI image ${imageProgress.current} of ${imageProgress.total} for "${imageProgress.word}"...`
                )}
              </p>
              <p className="text-center text-blue-600 text-sm mt-2">
                {imageProgress.total === 0 ? (
                  'This should take about 5-10 seconds...'
                ) : (
                  `Generating high-quality Nano Banana images... (${Math.round((imageProgress.current / imageProgress.total) * 100)}% complete)`
                )}
              </p>
              {imageProgress.total > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(imageProgress.current / imageProgress.total) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </>
    );
  }

  if (step === 'preteach' && lessonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Pre-Teaching Vocabulary</h1>
                <p className="text-gray-600">Learn these words before reading the story!</p>
              </div>

              {/* Auto-save Status Indicator */}
              {autoSaveStatus && (
                <div className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 ${
                  autoSaveStatus === 'saving' ? 'bg-blue-100 text-blue-800' :
                  autoSaveStatus === 'saved' ? 'bg-green-100 text-green-800' :
                  autoSaveStatus === 'error' ? 'bg-red-100 text-red-800' : ''
                }`}>
                  {autoSaveStatus === 'saving' && (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      ✗ Save failed
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Share and Export Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={createShareLink}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Link for Students
              </button>
              <button
                onClick={exportCurrentLesson}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
              >
                💾 Export to File
              </button>
            </div>

            {/* Share Modal */}
            {showShareModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Share This Lesson</h2>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">📎 Short Share Link (Recommended)</h3>
                    <p className="text-gray-600 text-sm mb-3">To use this short link, you need to deploy your lesson to GitHub:</p>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300 mb-3">
                      <code className="text-sm text-gray-700 break-all">{shareLink}</code>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300 text-sm mb-3">
                      <p className="font-semibold mb-2">📋 To deploy this lesson:</p>
                      <ol className="list-decimal ml-5 space-y-1">
                        <li>Click "Download Lesson File" below</li>
                        <li>Add the file to your <code className="bg-white px-1 rounded">public/lessons/</code> folder</li>
                        <li>Commit and push to GitHub</li>
                        <li>Deploy via GitHub Pages, Netlify, or Vercel</li>
                        <li>Share the short link with students!</li>
                      </ol>
                    </div>

                    <button
                      onClick={() => {
                        const lesson = window.currentLessonForDownload;
                        const blob = new Blob([JSON.stringify(lesson, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${lesson.id}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 mb-4"
                    >
                      💾 Download Lesson File for GitHub
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={copyShareLink}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Copy className="w-5 h-5" />
                      Copy Short Link
                    </button>
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion Navigation */}
          <div className="flex justify-center gap-2 mb-6">
            {lessonData.words.map((wordObj, idx) => (
              <button
                key={idx}
                onClick={() => setExpandedWordIndex(idx)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  expandedWordIndex === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {idx + 1}. {wordObj.word}
              </button>
            ))}
          </div>

          {/* Single Expanded Word Card */}
          {lessonData.words.map((wordObj, idx) => (
            expandedWordIndex === idx && (
              <div key={idx} className={`bg-white rounded-lg shadow-2xl p-8 border-4 ${getWordColor(wordObj.partOfSpeech)} mb-6`}>
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="relative flex-1">
                    <img
                      src={wordObj.image}
                      alt={wordObj.word}
                      className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setEditingImage(idx);
                        setImageUrl(wordObj.image);
                      }}
                      className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      <Image className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    
                    {editingImage === idx && (
                      <div className="absolute top-0 left-0 w-full bg-white p-4 rounded-lg shadow-xl border-2 border-blue-500 z-10">
                        <p className="font-semibold mb-2">Add Image:</p>
                        
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm font-semibold mb-1">📋 Paste Image:</p>
                          <input
                            type="text"
                            onPaste={(e) => handleImagePaste(e, idx)}
                            placeholder="Right-click here and paste (Ctrl+V)"
                            className="w-full p-2 border-2 border-blue-300 rounded"
                          />
                        </div>

                        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm font-semibold mb-1">📁 Upload Image:</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, idx)}
                            className="w-full text-sm"
                          />
                        </div>

                        <div className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded">
                          <p className="text-sm font-semibold mb-1">🔗 Or paste URL:</p>
                          <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full p-2 border-2 border-gray-300 rounded mb-2"
                            placeholder="https://example.com/image.jpg"
                          />
                          <button
                            onClick={() => updateImage(idx, imageUrl)}
                            className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                          >
                            Save URL
                          </button>
                        </div>
                        
                        <button
                          onClick={() => {
                            setEditingImage(null);
                            setImageUrl('');
                          }}
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 mt-2"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h2 className="text-5xl font-bold mb-3">{wordObj.word}</h2>
                    <p className="text-lg uppercase font-semibold mb-4 opacity-70">{wordObj.partOfSpeech}</p>
                    
                    {/* Definition with Edit Button */}
                    <div className="mb-4">
                      {editingDefinition === idx ? (
                        <div>
                          <textarea
                            value={editedDefinition}
                            onChange={(e) => setEditedDefinition(e.target.value)}
                            className="w-full p-3 border-2 border-blue-300 rounded-lg text-lg mb-2"
                            rows="2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateDefinition(idx, editedDefinition)}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingDefinition(null);
                                setEditedDefinition('');
                              }}
                              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <p className="text-2xl flex-1">{wordObj.definition}</p>
                          <button
                            onClick={() => {
                              setEditingDefinition(idx);
                              setEditedDefinition(wordObj.definition);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-700 text-xl">Examples:</p>
                        {editingExamples !== idx && (
                          <button
                            onClick={() => {
                              setEditingExamples(idx);
                              setEditedExamples([...wordObj.examples]);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      {editingExamples === idx ? (
                        <div className="space-y-2">
                          {editedExamples.map((ex, i) => (
                            <div key={i} className="flex gap-2">
                              <input
                                type="text"
                                value={ex}
                                onChange={(e) => {
                                  const newExamples = [...editedExamples];
                                  newExamples[i] = e.target.value;
                                  setEditedExamples(newExamples);
                                }}
                                className="flex-1 p-2 border-2 border-blue-300 rounded-lg text-lg"
                              />
                              <button
                                onClick={() => {
                                  const newExamples = editedExamples.filter((_, idx) => idx !== i);
                                  setEditedExamples(newExamples);
                                }}
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => setEditedExamples([...editedExamples, ''])}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            + Add example
                          </button>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => updateExamples(idx, editedExamples)}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingExamples(null);
                                setEditedExamples([]);
                              }}
                              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        wordObj.examples.map((ex, i) => (
                          <p key={i} className="text-xl text-gray-600">• {ex}</p>
                        ))
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-auto pt-6">
                      <button
                        onClick={() => setExpandedWordIndex(Math.max(0, expandedWordIndex - 1))}
                        disabled={expandedWordIndex === 0}
                        className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setExpandedWordIndex(Math.min(lessonData.words.length - 1, expandedWordIndex + 1))}
                        disabled={expandedWordIndex === lessonData.words.length - 1}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}

          <button
            onClick={() => setStep('story')}
            className="w-full mt-8 bg-green-600 text-white py-4 px-6 rounded-lg text-xl font-semibold hover:bg-green-700 transition"
          >
            Read the Story →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'story' && lessonData) {
    // Function to bold vocabulary words in the story
    const boldVocabWords = (text) => {
      let result = text;
      lessonData.words.forEach(wordObj => {
        const word = wordObj.word;
        // First, remove any asterisks around the word (from markdown-style bolding)
        const asteriskRegex = new RegExp(`\\*\\*(${word})\\*\\*`, 'gi');
        result = result.replace(asteriskRegex, '$1');
        // Then create HTML bold tags with word boundaries (case insensitive)
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        result = result.replace(regex, '<strong>$1</strong>');
      });
      return result;
    };

    const storyWithBoldWords = boldVocabWords(lessonData.story.text);

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">{lessonData.story.title}</h1>
            <div className="flex items-center gap-3">
              {/* Auto-save Status Indicator */}
              {autoSaveStatus && (
                <div className={`px-3 py-1 rounded-lg font-semibold text-sm flex items-center gap-2 ${
                  autoSaveStatus === 'saving' ? 'bg-blue-100 text-blue-800' :
                  autoSaveStatus === 'saved' ? 'bg-green-100 text-green-800' :
                  autoSaveStatus === 'error' ? 'bg-red-100 text-red-800' : ''
                }`}>
                  {autoSaveStatus === 'saving' && (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Saving...
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Saved
                    </>
                  )}
                  {autoSaveStatus === 'error' && '✗ Save failed'}
                </div>
              )}
              <button
                onClick={exportCurrentLesson}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
              >
                💾 Export
              </button>
            </div>
          </div>
          <div className="prose prose-lg max-w-none">
            <p 
              className="text-xl leading-relaxed text-gray-700 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: storyWithBoldWords }}
            />
          </div>

          <button
            onClick={() => setStep('practice')}
            className="w-full mt-8 bg-purple-600 text-white py-4 px-6 rounded-lg text-xl font-semibold hover:bg-purple-700 transition"
          >
            Practice Activities →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'practice' && lessonData) {
    // Check if all fill-in-blank questions are answered correctly
    const allFillInBlankCorrect = lessonData.practice.fillInBlank.every((q, idx) => 
      practiceAnswers[`fib-${idx}`] === q.answer
    );

    // Check if all matching in current set is correct
    const currentSetAllCorrect = matchingItems[matchingCarouselIndex]?.every((_, idx) => {
      const globalKey = `${matchingCarouselIndex}-${idx}`;
      return matchingAnswers[globalKey]?.isCorrect;
    });

    // Check if all matching sets are complete
    const allMatchingSetsComplete = matchingItems.every((group, setIdx) => 
      group.every((_, idx) => {
        const globalKey = `${setIdx}-${idx}`;
        return matchingAnswers[globalKey]?.isCorrect;
      })
    );
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Practice Activities</h1>
                {/* Progress indicator */}
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    currentActivity === 'fillInBlank' ? 'bg-blue-600 text-white' : 
                    allFillInBlankCorrect ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1. Fill in the Blank
                  </span>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    currentActivity === 'matching' ? 'bg-blue-600 text-white' : 
                    allMatchingSetsComplete ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2. Matching
                  </span>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    currentActivity === 'comprehension' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    3. Comprehension
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {/* Auto-save Status Indicator */}
                {autoSaveStatus && (
                  <div className={`px-3 py-1 rounded-lg font-semibold text-sm flex items-center gap-2 ${
                    autoSaveStatus === 'saving' ? 'bg-blue-100 text-blue-800' :
                    autoSaveStatus === 'saved' ? 'bg-green-100 text-green-800' :
                    autoSaveStatus === 'error' ? 'bg-red-100 text-red-800' : ''
                  }`}>
                    {autoSaveStatus === 'saving' && (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Saving...
                      </>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Saved
                      </>
                    )}
                    {autoSaveStatus === 'error' && '✗ Save failed'}
                  </div>
                )}
                <button
                  onClick={exportCurrentLesson}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
                >
                  💾 Export
                </button>
              </div>
            </div>
          </div>

          {/* Fill in the Blank */}
          {currentActivity === 'fillInBlank' && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Fill in the Blank</h2>
              <p className="text-gray-600 mb-6">Choose the correct word to complete each sentence.</p>
              {lessonData.practice.fillInBlank.map((q, idx) => (
                <div key={idx} className="mb-6">
                  <p className="text-xl mb-3">{q.sentence}</p>
                  <div className="flex gap-3 flex-wrap">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => checkAnswer(`fib-${idx}`, opt)}
                        className={`px-6 py-3 rounded-lg text-lg font-semibold transition ${
                          practiceAnswers[`fib-${idx}`] === opt
                            ? opt === q.answer
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {allFillInBlankCorrect && (
                <div className="mt-6 p-4 bg-green-100 border-2 border-green-500 rounded-lg">
                  <p className="text-green-800 font-bold text-center mb-3">🎉 Great job! All correct!</p>
                  <button
                    onClick={() => setCurrentActivity('matching')}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Continue to Matching Activity →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Match to Picture - Carousel Version */}
          {currentActivity === 'matching' && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Match Words to Pictures</h2>
              <p className="text-gray-600 mb-4">Click a word, then click the picture it matches!</p>
              
              {matchingItems.length > 0 && matchingItems[matchingCarouselIndex] && (
                <>
                  {/* Progress Indicator */}
                  <div className="mb-4 text-center">
                    <p className="text-lg font-semibold text-gray-700">
                      Set {matchingCarouselIndex + 1} of {matchingItems.length}
                    </p>
                    <div className="flex justify-center gap-2 mt-2">
                      {matchingItems.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-3 h-3 rounded-full ${
                            idx === matchingCarouselIndex ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Word Bank - Show all 4 words from current group */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                    <p className="font-semibold mb-3">Word Bank:</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {matchingItems[matchingCarouselIndex].map((wordObj, idx) => {
                        const globalKey = `${matchingCarouselIndex}-${idx}`;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedWord(wordObj.word)}
                            disabled={matchingAnswers[globalKey]?.isCorrect}
                            className={`px-6 py-3 rounded-lg text-xl font-bold transition ${
                              selectedWord === wordObj.word
                                ? 'bg-blue-600 text-white'
                                : matchingAnswers[globalKey]?.isCorrect
                                ? 'bg-green-200 text-green-800 opacity-50 cursor-not-allowed'
                                : 'bg-white border-2 border-gray-300 hover:border-blue-500'
                            }`}
                          >
                            {wordObj.word}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Images Grid - Current group only (2x2 grid for 4 images) */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                  {matchingItems[matchingCarouselIndex].map((item, idx) => {
                    const globalKey = `${matchingCarouselIndex}-${idx}`;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (selectedWord) {
                            const isCorrect = selectedWord === item.word;
                            setMatchingAnswers(prev => ({
                              ...prev,
                              [globalKey]: {
                                selectedWord: selectedWord,
                                isCorrect: isCorrect
                              }
                            }));
                            if (isCorrect) {
                              setSelectedWord(null);
                            }
                          }
                        }}
                        disabled={matchingAnswers[globalKey]?.isCorrect}
                        className={`border-4 rounded-lg p-4 text-center transition ${
                          matchingAnswers[globalKey]?.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : matchingAnswers[globalKey]?.selectedWord
                            ? 'border-red-500 bg-red-50'
                            : selectedWord
                            ? 'border-blue-300 hover:border-blue-500 cursor-pointer'
                            : 'border-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <img 
                          src={item.image} 
                          alt="Match me!" 
                          className="w-full h-64 object-contain rounded mb-3 bg-gray-50" 
                        />
                        {matchingAnswers[globalKey]?.isCorrect && (
                          <p className="text-2xl font-bold text-green-800">✓ {item.word}</p>
                        )}
                        {matchingAnswers[globalKey]?.selectedWord && !matchingAnswers[globalKey]?.isCorrect && (
                          <p className="text-xl font-bold text-red-800">✗ Try again!</p>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setMatchingCarouselIndex(Math.max(0, matchingCarouselIndex - 1))}
                    disabled={matchingCarouselIndex === 0}
                    className="bg-gray-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    ← Previous Set
                  </button>
                  <button
                    onClick={() => setMatchingCarouselIndex(Math.min(matchingItems.length - 1, matchingCarouselIndex + 1))}
                    disabled={matchingCarouselIndex === matchingItems.length - 1}
                    className="bg-blue-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    Next Set →
                  </button>
                </div>

                {/* Continue button when all matching is complete */}
                {currentSetAllCorrect && matchingCarouselIndex === matchingItems.length - 1 && allMatchingSetsComplete && (
                  <div className="mt-6 p-4 bg-green-100 border-2 border-green-500 rounded-lg">
                    <p className="text-green-800 font-bold text-center mb-3">🎉 Excellent! All matches complete!</p>
                    <button
                      onClick={() => setCurrentActivity('comprehension')}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Continue to Comprehension Questions →
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          )}

          {/* Comprehension */}
          {currentActivity === 'comprehension' && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Story Comprehension</h2>
              
              {/* Show Story Button */}
              <button
                onClick={() => setShowStory(!showStory)}
                className="w-full mb-6 bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Book className="w-5 h-5" />
                {showStory ? 'Hide Story' : 'Show Story'}
              </button>

              {/* Story Display */}
              {showStory && (
                <div className="mb-6 p-6 bg-yellow-50 border-4 border-yellow-300 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{lessonData.story.title}</h3>
                  <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {lessonData.story.text}
                  </p>
                </div>
              )}

              {/* Check if all comprehension questions have been answered */}
              {(() => {
                const totalQuestions = lessonData.practice.comprehension.length;
                const answeredQuestions = Object.keys(comprehensionAnswers).filter(
                  key => comprehensionAnswers[key] && comprehensionAnswers[key].trim()
                ).length;
                const allAnswered = answeredQuestions === totalQuestions && totalQuestions > 0;

                return allAnswered && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-100 to-blue-100 border-4 border-green-500 rounded-lg text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-3xl font-bold text-green-800 mb-3">Congratulations!</h3>
                    <p className="text-xl text-gray-700 mb-4">
                      You've completed all {totalQuestions} comprehension questions! Great work!
                    </p>
                    <p className="text-lg text-gray-600">
                      You've finished the entire lesson. Keep up the excellent work! 🌟
                    </p>
                  </div>
                );
              })()}

              {/* Comprehension Questions */}
              {lessonData.practice.comprehension.map((q, idx) => (
                <div key={idx} className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <p className="text-xl font-semibold mb-3">{q.question}</p>
                  <textarea
                    className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg mb-3"
                    rows="3"
                    placeholder="Write your answer here..."
                    value={comprehensionAnswers[idx] || ''}
                    onChange={(e) => setComprehensionAnswers(prev => ({
                      ...prev,
                      [idx]: e.target.value
                    }))}
                  />
                  
                  <button
                    onClick={() => checkComprehensionAnswer(idx, q.question, q.answer, comprehensionAnswers[idx])}
                    disabled={checkingAnswer === idx}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition mb-3"
                  >
                    {checkingAnswer === idx ? 'Checking...' : 'Check My Answer'}
                  </button>

                  {comprehensionFeedback[idx] && (
                    <div className="mt-3 p-4 bg-white border-2 border-blue-300 rounded-lg">
                      <p className="text-gray-800">{comprehensionFeedback[idx]}</p>
                    </div>
                  )}

                  <details className="mt-3">
                    <summary className="text-blue-600 cursor-pointer hover:text-blue-700 text-sm">Show sample answer</summary>
                    <p className="text-gray-600 mt-2 p-3 bg-white rounded border border-gray-200">{q.answer}</p>
                  </details>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep('input')}
              className="flex-1 bg-gray-600 text-white py-4 px-6 rounded-lg text-xl font-semibold hover:bg-gray-700 transition"
            >
              <RefreshCw className="inline mr-2" /> New Lesson
            </button>
            <button
              onClick={() => setStep('preteach')}
              className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg text-xl font-semibold hover:bg-blue-700 transition"
            >
              Review Vocabulary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VocabLessonBuilder;