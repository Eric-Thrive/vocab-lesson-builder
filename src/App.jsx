import React, { useState } from 'react';
import { Book, Image, CheckCircle, RefreshCw } from 'lucide-react';

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
  const [lessonName, setLessonName] = useState('');
  const [editingDefinition, setEditingDefinition] = useState(null);
  const [editedDefinition, setEditedDefinition] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [deletingLesson, setDeletingLesson] = useState(null);
  const [imageProgress, setImageProgress] = useState({ current: 0, total: 0, word: '' });
  const [expandedWordIndex, setExpandedWordIndex] = useState(0); // Accordion state - start with first word expanded
  const [matchingItems, setMatchingItems] = useState([]); // For practice matching game

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

  const saveLesson = async () => {
    console.log('Save lesson clicked');
    console.log('Lesson name:', lessonName);
    console.log('Storage available?', typeof window.storage !== 'undefined');
    
    if (!lessonName.trim()) {
      setSaveMessage('❌ Please enter a name for this lesson');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    
    if (typeof window.storage === 'undefined') {
      setSaveMessage('❌ Storage is not available in this environment');
      setTimeout(() => setSaveMessage(''), 5000);
      console.error('window.storage is not defined');
      return;
    }
    
    const lessonToSave = {
      name: lessonName,
      date: new Date().toISOString(),
      words: words,
      lessonData: lessonData
    };
    
    console.log('Lesson to save:', lessonToSave);
    
    try {
      console.log('Attempting to save to storage...');
      const saveResult = await window.storage.set(`lesson:${Date.now()}`, JSON.stringify(lessonToSave));
      console.log('Save result:', saveResult);
      
      if (!saveResult) {
        throw new Error('Storage returned null or undefined');
      }
      
      // Reload saved lessons
      console.log('Reloading saved lessons list...');
      const keys = await window.storage.list('lesson:');
      console.log('Storage keys:', keys);
      
      if (keys && keys.keys) {
        const lessons = await Promise.all(
          keys.keys.map(async (key) => {
            const result = await window.storage.get(key);
            return result ? { key, ...JSON.parse(result.value) } : null;
          })
        );
        setSavedLessons(lessons.filter(Boolean));
        console.log('Loaded lessons:', lessons);
        
        setSaveMessage(`✓ Lesson "${lessonName}" saved successfully! You now have ${lessons.length} saved lesson(s).`);
      } else {
        setSaveMessage(`✓ Lesson "${lessonName}" saved successfully!`);
      }
      
      setLessonName('');
      setTimeout(() => setSaveMessage(''), 5000);
    } catch (error) {
      console.error('Error saving lesson:', error);
      setSaveMessage('❌ Error saving lesson: ' + error.message);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

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
    
    try {
      // Use Google Gemini API for text generation (using Gemini 2.5 Flash - latest stable)
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

IMPORTANT: Keep example sentences SHORT and SIMPLE (5-8 words max). Use clear, concrete language appropriate for a middle schooler.

Return ONLY valid JSON (no markdown, no backticks, no explanation) with this exact structure:
{
  "words": [
    {
      "word": "word",
      "definition": "clear, simple definition appropriate for 6th grader (one short sentence)",
      "examples": ["Short 5-8 word sentence.", "Another short 5-8 word sentence."],
      "partOfSpeech": "noun/verb/adjective"
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

IMPORTANT: Include 3 "distractors" - simple words that are NOT in the vocabulary list but are age-appropriate for 6th grade. These will be used for the matching game.

Remember: Examples must be SHORT (5-8 words), CONCRETE, and age-appropriate for a 6th grader (not babyish).`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
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
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const lesson = JSON.parse(cleanContent);
      
      // Generate custom AI images using Nano Banana (Gemini 2.5 Flash Image)
      // Process images sequentially with delays to avoid rate limits
      const wordsWithImages = [];
      const distractorImages = [];
      const totalImages = lesson.words.length + (lesson.distractors?.length || 0);
      let imageCount = 0;
      
      // Generate images for vocabulary words
      for (let index = 0; index < lesson.words.length; index++) {
        const wordObj = lesson.words[index];
        
        // Update progress for word image
        imageCount++;
        setImageProgress({ current: imageCount, total: totalImages, word: wordObj.word });
        
        try {
          // Use the first example sentence directly as the image prompt
          const exampleSentence = wordObj.examples[0] || wordObj.word;
          const imagePrompt = `A graphic novel style illustration showing: ${exampleSentence}. Bold lines, dynamic composition, age-appropriate for 6th grade middle school students, comic book art style with clear details and good contrast.`;
          
          console.log(`Generating image ${index + 1}/${lesson.words.length} for "${wordObj.word}" using Nano Banana`);
          
          // Add delay between requests to avoid rate limiting (except for first request)
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 12000)); // 12 second delay between requests
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
            const errorData = await imgResponse.json();
            console.error(`Nano Banana error for "${wordObj.word}":`, imgResponse.status, errorData);
            
            // If rate limited (429), use free alternative
            if (imgResponse.status === 429) {
              console.log(`Rate limited, using Pollinations.ai for "${wordObj.word}"`);
              const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=400&height=500&nologo=true&model=flux&seed=${Date.now() + index}`;
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
          // Use simpler prompt for Pollinations fallback
          const simplifiedPrompt = `graphic novel illustration of ${wordObj.word}, comic book style`;
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(simplifiedPrompt)}?width=512&height=512&nologo=true&enhance=true&seed=${Date.now() + index}`;
          wordsWithImages.push({
            ...wordObj,
            image: pollinationsUrl
          });
          
        } catch (error) {
          console.error(`Error generating image for ${wordObj.word}:`, error);
          // Fallback to Pollinations.ai (free, no rate limits)
          const simplifiedPrompt = `graphic novel illustration of ${wordObj.word}, comic book style`;
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(simplifiedPrompt)}?width=512&height=512&nologo=true&enhance=true&seed=${Date.now() + index}`;
          wordsWithImages.push({
            ...wordObj,
            image: pollinationsUrl
          });
        }
      }

      // Generate images for distractor words
      if (lesson.distractors && lesson.distractors.length > 0) {
        for (let i = 0; i < lesson.distractors.length; i++) {
          const distractor = lesson.distractors[i];
          imageCount++;
          setImageProgress({ current: imageCount, total: totalImages, word: `${distractor} (distractor)` });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 12000)); // 12 second delay
            
            const distractorPrompt = `A graphic novel style illustration showing: ${distractor}. Bold lines, dynamic composition, age-appropriate for 6th grade middle school students, comic book art style with clear details and good contrast.`;
            
            const imgResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: distractorPrompt }] }],
                  generationConfig: { temperature: 0.8, maxOutputTokens: 8192 }
                })
              }
            );
            
            if (imgResponse.ok) {
              const imgData = await imgResponse.json();
              const parts = imgData.candidates?.[0]?.content?.parts;
              const imagePart = parts?.find(part => part.inlineData?.mimeType.startsWith('image/'));
              if (imagePart?.inlineData) {
                distractorImages.push({
                  word: distractor,
                  image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
                });
                continue;
              }
            }
            
            // Fallback to Pollinations
            const simplifiedPrompt = `graphic novel illustration of ${distractor}, comic book style`;
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(simplifiedPrompt)}?width=512&height=512&nologo=true&enhance=true&seed=${Date.now() + i + 5000}`;
            distractorImages.push({
              word: distractor,
              image: pollinationsUrl
            });
          } catch (error) {
            console.error(`Error generating distractor image for ${distractor}:`, error);
            const simplifiedPrompt = `graphic novel illustration of ${distractor}, comic book style`;
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(simplifiedPrompt)}?width=512&height=512&nologo=true&enhance=true&seed=${Date.now() + i + 5000}`;
            distractorImages.push({
              word: distractor,
              image: pollinationsUrl
            });
          }
        }
      }

      setLessonData({ ...lesson, words: wordsWithImages, distractors: distractorImages });
      setStep('preteach');
    } catch (error) {
      console.error('Error:', error);
      alert(`Error generating lesson: ${error.message}\n\nPlease check:\n1. Your API key is correct\n2. You have internet connection\n3. The Gemini API is enabled for your key`);
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
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-purple-700 transition mb-3"
            >
              {showSaved ? 'Hide' : 'Show'} Saved Lessons ({savedLessons.length})
            </button>

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
                  `Each image takes 12-15 seconds to generate. Please be patient! (${Math.round((imageProgress.current / imageProgress.total) * 100)}% complete)`
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
            
            {/* Save Lesson */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                placeholder="Enter lesson name to save..."
                className="flex-1 p-3 border-2 border-gray-300 rounded-lg"
              />
              <button
                onClick={saveLesson}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Save Lesson
              </button>
            </div>
            
            {/* Save Message */}
            {saveMessage && (
              <div className={`p-4 rounded-lg mb-4 font-semibold ${
                saveMessage.startsWith('✓') 
                  ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                  : 'bg-red-100 text-red-800 border-2 border-red-300'
              }`}>
                {saveMessage}
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
        // Create a regex that matches the word with word boundaries (case insensitive)
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        result = result.replace(regex, '<strong>$1</strong>');
      });
      return result;
    };

    const storyWithBoldWords = boldVocabWords(lessonData.story.text);

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">{lessonData.story.title}</h1>
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

  // Initialize matching items when entering practice mode
  React.useEffect(() => {
    if (step === 'practice' && lessonData && matchingItems.length === 0) {
      const items = [
        ...lessonData.words.slice(0, 3), // First 3 vocabulary words
        ...(lessonData.distractors || []) // 3 distractor words with images
      ];
      // Shuffle the array
      setMatchingItems(items.sort(() => Math.random() - 0.5));
    }
  }, [step, lessonData]);

  if (step === 'practice' && lessonData) {
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Practice Activities</h1>
          </div>

          {/* Fill in the Blank */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fill in the Blank</h2>
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
          </div>

          {/* Match to Picture */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Match Words to Pictures</h2>
            <p className="text-gray-600 mb-4">Click a word, then click the picture it matches!</p>
            
            {/* Word Bank - Only show vocabulary words (not distractors) */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
              <p className="font-semibold mb-3">Word Bank:</p>
              <div className="flex flex-wrap gap-3">
                {lessonData.words.slice(0, 3).map((wordObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedWord(wordObj.word)}
                    disabled={Object.values(matchingAnswers).some(a => a.selectedWord === wordObj.word && a.isCorrect)}
                    className={`px-6 py-3 rounded-lg text-xl font-bold transition ${
                      selectedWord === wordObj.word
                        ? 'bg-blue-600 text-white'
                        : Object.values(matchingAnswers).some(a => a.selectedWord === wordObj.word && a.isCorrect)
                        ? 'bg-green-200 text-green-800 opacity-50 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {wordObj.word}
                  </button>
                ))}
              </div>
            </div>

            {/* Images Grid - Randomized mix of vocabulary and distractors */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {matchingItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => selectedWord && handleMatchClick(idx, selectedWord, matchingItems)}
                  disabled={matchingAnswers[idx]?.isCorrect}
                  className={`border-4 rounded-lg p-4 text-center transition ${
                    matchingAnswers[idx]?.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : matchingAnswers[idx]?.selectedWord
                      ? 'border-red-500 bg-red-50'
                      : selectedWord
                      ? 'border-blue-300 hover:border-blue-500 cursor-pointer'
                      : 'border-gray-300 cursor-not-allowed'
                  }`}
                >
                  <img 
                    src={item.image} 
                    alt="Match me!" 
                    className="w-full h-40 object-cover rounded mb-3" 
                  />
                  {matchingAnswers[idx]?.isCorrect && (
                    <p className="text-2xl font-bold text-green-800">✓ {item.word}</p>
                  )}
                  {matchingAnswers[idx]?.selectedWord && !matchingAnswers[idx]?.isCorrect && (
                    <p className="text-xl font-bold text-red-800">✗ Try again!</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Comprehension */}
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
              <div key={idx} className="mb-6">
                <p className="text-xl font-semibold mb-3">{q.question}</p>
                <textarea
                  className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg"
                  rows="3"
                  placeholder="Write your answer here..."
                />
                <details className="mt-2">
                  <summary className="text-blue-600 cursor-pointer hover:text-blue-700">Show sample answer</summary>
                  <p className="text-gray-600 mt-2 p-3 bg-gray-50 rounded">{q.answer}</p>
                </details>
              </div>
            ))}
          </div>

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