import React, { useState } from 'react';
import { Book, Image, CheckCircle, RefreshCw, Share2, Copy } from 'lucide-react';

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
  const [savedLessons, setSavedLessons] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState(null);
  const [editedDefinition, setEditedDefinition] = useState('');
  const [deletingLesson, setDeletingLesson] = useState(null);
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
  const [githubAutoSave, setGithubAutoSave] = useState(false);
  const [githubSaveStatus, setGithubSaveStatus] = useState('');

  // Load lesson from URL on mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonParam = urlParams.get('lesson');

    if (lessonParam) {
      // Check if it's a lesson ID (short format) or base64 data (legacy format)
      if (lessonParam.length < 100 && !lessonParam.includes('{')) {
        // It's a lesson ID - fetch from GitHub
        loadLessonFromGitHub(lessonParam);
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

  // Load lesson from GitHub repo
  const loadLessonFromGitHub = async (lessonId) => {
    try {
      const response = await fetch(`/lessons/${lessonId}.json`);
      if (!response.ok) {
        throw new Error('Lesson not found');
      }
      const lesson = await response.json();
      setWords(lesson.words);
      setLessonData(lesson.lessonData);
      setStep('preteach');
    } catch (error) {
      console.error('Error loading lesson from GitHub:', error);
      alert(`Could not load lesson "${lessonId}". Please check the lesson ID.`);
    }
  };

  // Save lesson to GitHub repo
  const saveLessonToGitHub = async (lessonData, lessonId) => {
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
      
      const path = `public/lessons/${lessonId}.json`;
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

  // Load saved lessons on mount
  React.useEffect(() => {
    const loadSavedLessons = async () => {
      try {
        const keys = await window.storage.list('lesson:');
        if (keys && keys.keys) {
          const lessons = await Promise.all(
            keys.keys.map(async (key) => {
              const result = await window.storage.get(key);
              return result ? { key, ...JSON.parse(result.value) } : null;
            })
          );
          setSavedLessons(lessons.filter(Boolean));
        }
      } catch (error) {
        console.log('No saved lessons yet');
      }
    };
    loadSavedLessons();
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

  const loadLesson = async (lessonKey) => {
    try {
      const result = await window.storage.get(lessonKey);
      if (result) {
        const lesson = JSON.parse(result.value);
        setWords(lesson.words);
        setLessonData(lesson.lessonData);
        setStep('preteach');
        setShowSaved(false);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      alert('Error loading lesson');
    }
  };

  const deleteLesson = async (lessonKey, lessonName) => {
    console.log('Delete lesson clicked:', lessonKey);
    setDeletingLesson(lessonKey);
  };

  const confirmDelete = async (lessonKey) => {
    try {
      await window.storage.delete(lessonKey);
      setSavedLessons(savedLessons.filter(l => l.key !== lessonKey));
      setDeletingLesson(null);
      console.log('Lesson deleted successfully');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setDeletingLesson(null);
    }
  };

  const cancelDelete = () => {
    setDeletingLesson(null);
  };

  const exportLessonToFile = async (lesson) => {
    try {
      const lessonToExport = {
        name: lesson.name,
        date: lesson.date,
        words: lesson.words,
        lessonData: lesson.lessonData
      };

      if ('showSaveFilePicker' in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: `${lesson.name.replace(/[^a-z0-9]/gi, '_')}.json`,
          types: [{
            description: 'Vocabulary Lesson',
            accept: { 'application/json': ['.json'] }
          }]
        });
        
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(lessonToExport, null, 2));
        await writable.close();
        
        alert(`✓ Lesson "${lesson.name}" exported successfully!`);
      } else {
        // Fallback: download as file
        const blob = new Blob([JSON.stringify(lessonToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${lesson.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert(`✓ Lesson "${lesson.name}" downloaded!`);
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

  const importLessonFromFile = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'Vocabulary Lesson',
            accept: { 'application/json': ['.json'] }
          }],
          multiple: false
        });
        
        const file = await handle.getFile();
        const text = await file.text();
        const lesson = JSON.parse(text);
        
        // Save to storage
        if (typeof window.storage !== 'undefined') {
          await window.storage.set(`lesson:${Date.now()}`, JSON.stringify(lesson));
          
          // Reload saved lessons list
          const keys = await window.storage.list('lesson:');
          if (keys && keys.keys) {
            const lessons = await Promise.all(
              keys.keys.map(async (key) => {
                const result = await window.storage.get(key);
                return result ? { key, ...JSON.parse(result.value) } : null;
              })
            );
            setSavedLessons(lessons.filter(Boolean));
          }
          
          alert(`✓ Lesson "${lesson.name}" imported successfully!`);
        }
      } else {
        // Fallback: use file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            const text = await file.text();
            const lesson = JSON.parse(text);
            
            // Save to storage
            if (typeof window.storage !== 'undefined') {
              await window.storage.set(`lesson:${Date.now()}`, JSON.stringify(lesson));
              
              // Reload saved lessons list
              const keys = await window.storage.list('lesson:');
              if (keys && keys.keys) {
                const lessons = await Promise.all(
                  keys.keys.map(async (key) => {
                    const result = await window.storage.get(key);
                    return result ? { key, ...JSON.parse(result.value) } : null;
                  })
                );
                setSavedLessons(lessons.filter(Boolean));
              }
              
              alert(`✓ Lesson "${lesson.name}" imported successfully!`);
            }
          }
        };
        input.click();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('User cancelled import');
        return;
      }
      console.error('Error importing lesson:', error);
      alert('Error importing lesson: ' + error.message);
    }
  };

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
    // Generate a short lesson ID from the first few words
    const wordList = words.split('\n').filter(w => w.trim()).slice(0, 3);
    const lessonId = wordList.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    const lessonToShare = {
      id: lessonId,
      name: `Lesson - ${wordList.join(', ')}`,
      description: `Vocabulary lesson with ${lessonData.words.length} words`,
      words: words,
      lessonData: lessonData
    };
    
    // Create both short link (for GitHub-hosted lessons) and full link (legacy)
    const shortLink = `${window.location.origin}${window.location.pathname}?lesson=${lessonId}`;
    const encodedLesson = btoa(JSON.stringify({ words: words, lessonData: lessonData }));
    const fullLink = `${window.location.origin}${window.location.pathname}?lesson=${encodedLesson}`;
    
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
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    console.log('Checking answer for question:', questionIndex);
    console.log('API key available:', !!apiKey);

    if (!apiKey) {
      setComprehensionFeedback(prev => ({
        ...prev,
        [questionIndex]: 'API key not found. Please check your .env file.'
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

      console.log('Sending prompt to API...');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: promptText
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 150
            }
          })
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 500));
      
      const data = JSON.parse(responseText);
      console.log('Parsed data:', data);
      
      if (!data.candidates || !data.candidates[0]) {
        console.error('No candidates in response:', data);
        throw new Error('No response from AI');
      }
      
      const candidate = data.candidates[0];
      console.log('Candidate:', JSON.stringify(candidate, null, 2));
      console.log('Candidate.content:', JSON.stringify(candidate.content, null, 2));
      console.log('Candidate.content.parts:', candidate.content?.parts);
      
      // Handle different response structures
      let feedback = '';
      if (candidate.content?.parts && candidate.content.parts[0]?.text) {
        feedback = candidate.content.parts[0].text.trim();
      } else if (candidate.content?.text) {
        feedback = candidate.content.text.trim();
      } else if (candidate.text) {
        feedback = candidate.text.trim();
      } else {
        console.error('Could not find text in response:', candidate);
        throw new Error('Invalid response from AI');
      }
      
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
    setCheckingAnswer(null);
  };

  const updateDefinition = (wordIndex, newDefinition) => {
    const updatedWords = [...lessonData.words];
    updatedWords[wordIndex].definition = newDefinition;
    setLessonData({ ...lessonData, words: updatedWords });
    setEditingDefinition(null);
    setEditedDefinition('');
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
      {"question": "What happened in the story?", "answer": "sample answer"}
    ]
  }
}

RULES: 
- Include exactly 3 "distractors" - simple words NOT in the vocabulary list
- partOfSpeech must be ONE word: "noun", "verb", "adjective", or "adverb"
- Examples must be SHORT (5-8 words) and age-appropriate
- Create ONE fill-in-the-blank question for EACH vocabulary word (${wordList.length} total questions)
- Each fillInBlank question must have 3 options: the correct answer plus 2 other vocabulary words
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
        const imagePrompt = `A graphic novel style illustration showing: ${exampleSentence}. Bold lines, dynamic composition, age-appropriate for 6th grade middle school students, comic book art style with clear details and good contrast.`;
        
        try {
          const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
          
          // Try OpenAI DALL-E first if key is available
          if (openaiKey && openaiKey !== 'your_openai_key_here') {
            console.log(`Generating image ${index + 1}/${lesson.words.length} for "${wordObj.word}" using DALL-E`);
            
            // Add small delay between requests
            if (index > 0) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            const dalleResponse = await fetch(
              'https://api.openai.com/v1/images/generations',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                  model: 'gpt-image-1',
                  prompt: imagePrompt,
                  n: 1,
                  size: '1024x1024',
                  quality: 'standard',
                  style: 'vivid'
                })
              }
            );
            
            if (dalleResponse.ok) {
              const dalleData = await dalleResponse.json();
              if (dalleData.data && dalleData.data[0] && dalleData.data[0].url) {
                console.log(`DALL-E image generated for "${wordObj.word}"`);
                wordsWithImages.push({
                  ...wordObj,
                  image: dalleData.data[0].url
                });
                continue;
              }
            } else {
              console.warn(`DALL-E failed for "${wordObj.word}", falling back to Nano Banana`);
            }
          }
          
          // Fallback to Nano Banana
          console.log(`Generating image ${index + 1}/${lesson.words.length} for "${wordObj.word}" using Nano Banana`);
          
          // Add delay between requests to avoid rate limiting (except for first request)
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay between requests for Nano Banana
          }
          
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
            
            // If rate limited (429 or 403), use free alternative
            if (imgResponse.status === 429 || imgResponse.status === 403) {
              console.log(`Rate limited (${imgResponse.status}), using Pollinations.ai for "${wordObj.word}"`);
              const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true&model=flux&enhance=true&seed=${Date.now() + index}`;
              wordsWithImages.push({
                ...wordObj,
                image: pollinationsUrl
              });
              continue;
            }
            
            throw new Error(`Image generation failed: ${imgResponse.status}`);
          }
          
          const imgData = await imgResponse.json();
          console.log(`Image response for "${wordObj.word}":`, imgData);
          
          // Extract the base64 image from the response
          if (imgData.candidates && imgData.candidates[0] && imgData.candidates[0].content) {
            const parts = imgData.candidates[0].content.parts;
            const imagePart = parts.find(part => part.inlineData && part.inlineData.mimeType.startsWith('image/'));
            
            if (imagePart && imagePart.inlineData) {
              wordsWithImages.push({
                ...wordObj,
                image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
              });
              continue;
            }
          }
          
          console.warn(`No image in Nano Banana response for "${wordObj.word}", using Pollinations.ai fallback`);
          // Use the full prompt for Pollinations fallback with higher resolution
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true&model=flux&enhance=true&seed=${Date.now() + index}`;
          wordsWithImages.push({
            ...wordObj,
            image: pollinationsUrl
          });
          
        } catch (error) {
          console.error(`Error generating image for ${wordObj.word}:`, error);
          // Fallback to Pollinations.ai (free, no rate limits) with higher resolution
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true&model=flux&enhance=true&seed=${Date.now() + index}`;
          wordsWithImages.push({
            ...wordObj,
            image: pollinationsUrl
          });
        }
      }

      // Skip distractor images - we only use vocab words in the matching game now
      const completedLesson = { ...lesson, words: wordsWithImages };
      setLessonData(completedLesson);

      // Auto-save the created lesson for teacher
      const lessonId = wordList.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
      const lessonToSave = {
        id: lessonId,
        name: `Lesson - ${wordList.slice(0, 3).join(', ')}...`,
        description: `Vocabulary lesson with ${completedLesson.words.length} words`,
        date: new Date().toISOString(),
        words: words,
        lessonData: completedLesson
      };

      // Save to local storage
      if (typeof window.storage !== 'undefined') {
        try {
          await window.storage.set(`lesson:${Date.now()}`, JSON.stringify(lessonToSave));
          console.log('Lesson auto-saved locally');

          // Reload saved lessons list
          const keys = await window.storage.list('lesson:');
          if (keys && keys.keys) {
            const lessons = await Promise.all(
              keys.keys.map(async (key) => {
                const result = await window.storage.get(key);
                return result ? { key, ...JSON.parse(result.value) } : null;
              })
            );
            setSavedLessons(lessons.filter(Boolean));
          }
        } catch (error) {
          console.error('Error auto-saving lesson locally:', error);
        }
      }

      // Save to GitHub if enabled
      if (githubAutoSave) {
        await saveLessonToGitHub(lessonToSave, lessonId);
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

  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Book className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Vocabulary Lesson Builder</h1>
          </div>

          {/* Saved Lessons Section */}
          <div className="mb-6">
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setShowSaved(!showSaved)}
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-purple-700 transition"
              >
                {showSaved ? 'Hide' : 'Show'} Saved Lessons ({savedLessons.length})
              </button>
              <button
                onClick={importLessonFromFile}
                className="bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
              >
                📁 Import
              </button>
            </div>

            {showSaved && (
              <div className="border-2 border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                {savedLessons.length === 0 ? (
                  <p className="text-gray-500 text-center">No saved lessons yet</p>
                ) : (
                  <div className="space-y-3">
                    {savedLessons.map((lesson) => (
                      <div key={lesson.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {deletingLesson === lesson.key ? (
                          <div className="bg-red-50 p-4 rounded border-2 border-red-300">
                            <p className="font-bold text-red-800 mb-3">Delete "{lesson.name}"?</p>
                            <p className="text-sm text-red-700 mb-4">This action cannot be undone.</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => confirmDelete(lesson.key)}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={cancelDelete}
                                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{lesson.name}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(lesson.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Words: {lesson.words.split('\n').filter(w => w.trim()).join(', ')}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => loadLesson(lesson.key)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                              >
                                Load
                              </button>
                              <button
                                onClick={() => exportLessonToFile(lesson)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                              >
                                Export
                              </button>
                              <button
                                onClick={() => deleteLesson(lesson.key, lesson.name)}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
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

          {/* GitHub Auto-Save Settings */}
          {import.meta.env.VITE_GITHUB_TOKEN ? (
            <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">GitHub Auto-Save</h3>
                  <p className="text-sm text-gray-600">
                    Automatically save lessons to GitHub for easy sharing
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={githubAutoSave}
                    onChange={(e) => setGithubAutoSave(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              {githubSaveStatus && (
                <p className="mt-2 text-sm font-semibold text-purple-700">
                  {githubSaveStatus}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">💡 Want Automatic Deployment?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Set up GitHub Auto-Save to automatically deploy lessons when you create them. 
                No more manual exports or deployments!
              </p>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                Set Up GitHub Auto-Save (5 min)
              </a>
              <p className="text-xs text-gray-500 mt-2">
                See GITHUB_AUTO_SAVE_QUICKSTART.md for instructions
              </p>
            </div>
          )}

          <button
            onClick={generateLesson}
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
    );
  }

  if (step === 'preteach' && lessonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pre-Teaching Vocabulary</h1>
            <p className="text-gray-600 mb-4">Learn these words before reading the story!</p>
            
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
                      <p className="font-semibold text-gray-700 text-xl">Examples:</p>
                      {wordObj.examples.map((ex, i) => (
                        <p key={i} className="text-xl text-gray-600">• {ex}</p>
                      ))}
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
            <button
              onClick={exportCurrentLesson}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
            >
              💾 Export
            </button>
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
            <div className="flex justify-between items-center">
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
              <button
                onClick={exportCurrentLesson}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
              >
                💾 Export
              </button>
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