import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStory } from '../contexts/StoryContext';
import { 
  ChevronRight, ChevronLeft, Sparkles, 
  Save, Loader2, Plus, X
} from 'lucide-react';
import type { StoryConfig, Character } from '../types';

const genres = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Romance',
  'Horror', 'Literary Fiction', 'Historical Fiction', 'Adventure',
  'Dystopian', 'Contemporary', 'Young Adult', 'Crime', 'Action',
  'Comedy', 'Drama', 'Biography', 'Memoir', 'Self-Help', 'Business'
];

const storyTypes = [
  { key: 'novella', label: 'Novella', words: '~20,000 words', price: 13 },
  { key: 'novel', label: 'Novel', words: '~50,000 words', price: 21 },
  { key: 'memoir', label: 'Memoir', words: '~30,000 words', price: 17 },
  { key: 'autobiography', label: 'Autobiography', words: '~60,000 words', price: 26 },
];

const steps = [
  { id: 'type', label: 'Story Type' },
  { id: 'basics', label: 'Basics' },
  { id: 'characters', label: 'Characters' },
  { id: 'details', label: 'Details' },
  { id: 'review', label: 'Review' },
];

export default function CreateStory() {
  const navigate = useNavigate();
  const { createStory, autoSave, loadAutoSave } = useStory();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  
  const [config, setConfig] = useState<StoryConfig>({
    storyType: 'novel',
    packageType: 'normal',
    brief: '',
    targetWordCount: 50000,
    characters: [],
    themes: [],
    events: [],
    locations: [],
  });

  const [newCharacter, setNewCharacter] = useState<Partial<Character>>({});
  const [newTheme, setNewTheme] = useState('');
  const [newEvent, setNewEvent] = useState('');

  // Load auto-save on mount
  useEffect(() => {
    const savedId = localStorage.getItem('fantmink-draft-id');
    if (savedId) {
      loadAutoSave(savedId).then((data) => {
        if (data?.exists && data.data) {
          setConfig(data.data);
          setStoryId(savedId);
        }
      });
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!storyId) return;
    
    const interval = setInterval(() => {
      autoSave(storyId, config);
    }, 30000);

    return () => clearInterval(interval);
  }, [storyId, config]);

  const updateConfig = useCallback((updates: Partial<StoryConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const addCharacter = () => {
    if (newCharacter.name && newCharacter.description) {
      updateConfig({
        characters: [...(config.characters || []), newCharacter as Character]
      });
      setNewCharacter({});
    }
  };

  const removeCharacter = (index: number) => {
    updateConfig({
      characters: config.characters?.filter((_, i) => i !== index)
    });
  };

  const addTheme = () => {
    if (newTheme) {
      updateConfig({ themes: [...(config.themes || []), newTheme] });
      setNewTheme('');
    }
  };

  const addEvent = () => {
    if (newEvent) {
      updateConfig({ events: [...(config.events || []), newEvent] });
      setNewEvent('');
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const story = await createStory(config);
      setStoryId(story.id);
      localStorage.setItem('fantmink-draft-id', story.id);
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    if (currentStep === steps.length - 1) {
      // Final step - create story and go to payment
      setLoading(true);
      try {
        let story;
        if (storyId) {
          story = { id: storyId, config };
        } else {
          story = await createStory(config);
        }
        navigate(`/story/${story.id}/payment`);
      } catch (error) {
        console.error('Failed to create story:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return config.storyType && config.packageType;
      case 1:
        return config.brief && config.brief.length > 20;
      case 2:
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-fantm-cream mb-4">
            Create Your <span className="text-fantm-gold">Story</span>
          </h1>
          <p className="text-fantm-cream/60">
            Tell us about your vision and we'll bring it to life
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    index <= currentStep
                      ? 'bg-fantm-gold text-fantm-dark'
                      : 'bg-fantm-dark-light text-fantm-cream/40 border border-fantm-gold/20'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-2 text-sm hidden sm:block ${
                    index <= currentStep ? 'text-fantm-cream' : 'text-fantm-cream/40'
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-px mx-4 ${
                      index < currentStep ? 'bg-fantm-gold' : 'bg-fantm-gold/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-fantm-dark-light/50 border border-fantm-gold/20 rounded-2xl p-8"
          >
            {/* Step 1: Story Type */}
            {currentStep === 0 && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-fantm-cream mb-6">
                    What type of story?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {storyTypes.map((type) => (
                      <button
                        key={type.key}
                        onClick={() => updateConfig({ storyType: type.key as any })}
                        className={`p-6 border rounded-xl text-left transition-all ${
                          config.storyType === type.key
                            ? 'border-fantm-gold bg-fantm-gold/10'
                            : 'border-fantm-gold/20 hover:border-fantm-gold/50'
                        }`}
                      >
                        <div className="font-serif text-xl font-bold text-fantm-cream mb-1">
                          {type.label}
                        </div>
                        <div className="text-fantm-cream/60 text-sm">{type.words}</div>
                        <div className="text-fantm-gold mt-2">From ${type.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-bold text-fantm-cream mb-6">
                    Choose your package
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => updateConfig({ packageType: 'normal' })}
                      className={`p-6 border rounded-xl text-left transition-all ${
                        config.packageType === 'normal'
                          ? 'border-fantm-gold bg-fantm-gold/10'
                          : 'border-fantm-gold/20 hover:border-fantm-gold/50'
                      }`}
                    >
                      <div className="font-serif text-xl font-bold text-fantm-cream mb-2">
                        Normal
                      </div>
                      <ul className="text-fantm-cream/60 text-sm space-y-1">
                        <li>• Complete story generation</li>
                        <li>• Professional PDF</li>
                        <li>• Title page & TOC</li>
                        <li>• Back cover blurb</li>
                      </ul>
                    </button>

                    <button
                      onClick={() => updateConfig({ packageType: 'premium' })}
                      className={`p-6 border rounded-xl text-left transition-all ${
                        config.packageType === 'premium'
                          ? 'border-fantm-gold bg-fantm-gold/10'
                          : 'border-fantm-gold/20 hover:border-fantm-gold/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-serif text-xl font-bold text-fantm-gold mb-2">
                        <Sparkles className="w-5 h-5" />
                        Premium
                      </div>
                      <ul className="text-fantm-cream/60 text-sm space-y-1">
                        <li>• Everything in Normal</li>
                        <li>• AI illustrations</li>
                        <li>• About the author section</li>
                        <li>• Edit & regenerate</li>
                      </ul>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Basics */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold text-fantm-cream">
                  Tell us about your story
                </h3>

                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={config.title || ''}
                    onChange={(e) => updateConfig({ title: e.target.value })}
                    className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream placeholder:text-fantm-cream/30 focus:border-fantm-gold focus:outline-none"
                    placeholder="Enter your story title or leave blank for AI suggestion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    Brief Subject <span className="text-fantm-gold">*</span>
                  </label>
                  <textarea
                    value={config.brief}
                    onChange={(e) => updateConfig({ brief: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream placeholder:text-fantm-cream/30 focus:border-fantm-gold focus:outline-none"
                    placeholder="Describe what your story is about. What's the main plot? What happens?"
                  />
                  <p className="mt-2 text-sm text-fantm-cream/40">
                    Minimum 20 characters. The more detail, the better the result.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    Genre
                  </label>
                  <select
                    value={config.genre || ''}
                    onChange={(e) => updateConfig({ genre: e.target.value })}
                    className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                  >
                    <option value="">Select a genre (or type your own)</option>
                    {genres.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {!genres.includes(config.genre || '') && (
                  <div>
                    <label className="block text-sm font-medium text-fantm-cream mb-2">
                      Custom Genre
                    </label>
                    <input
                      type="text"
                      value={config.genre || ''}
                      onChange={(e) => updateConfig({ genre: e.target.value })}
                      className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream placeholder:text-fantm-cream/30 focus:border-fantm-gold focus:outline-none"
                      placeholder="Enter your custom genre"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    Target Word Count
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="100000"
                    step="5000"
                    value={config.targetWordCount}
                    onChange={(e) => updateConfig({ targetWordCount: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-fantm-cream/60 mt-1">
                    <span>10,000</span>
                    <span className="text-fantm-gold font-medium">{config.targetWordCount.toLocaleString()} words</span>
                    <span>100,000</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Characters */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold text-fantm-cream">
                  Characters (optional)
                </h3>

                {/* Character List */}
                {config.characters && config.characters.length > 0 && (
                  <div className="space-y-3">
                    {config.characters.map((char, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-4 bg-fantm-dark border border-fantm-gold/20 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-fantm-cream">{char.name}</div>
                          <div className="text-sm text-fantm-cream/60">{char.description}</div>
                          {char.arc && (
                            <div className="text-xs text-fantm-gold mt-1">{char.arc}</div>
                          )}
                        </div>
                        <button
                          onClick={() => removeCharacter(index)}
                          className="p-1 text-fantm-cream/40 hover:text-red-400 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Character Form */}
                <div className="p-4 bg-fantm-dark/50 border border-fantm-gold/10 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-fantm-cream mb-2">
                      Character Name
                    </label>
                    <input
                      type="text"
                      value={newCharacter.name || ''}
                      onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                      className="w-full px-4 py-2 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                      placeholder="e.g., Eleanor Blackwood"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-fantm-cream mb-2">
                      Description
                    </label>
                    <textarea
                      value={newCharacter.description || ''}
                      onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                      placeholder="Appearance, personality, background..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-fantm-cream mb-2">
                      Character Arc
                    </label>
                    <select
                      value={newCharacter.arc || ''}
                      onChange={(e) => setNewCharacter({ ...newCharacter, arc: e.target.value as any })}
                      className="w-full px-4 py-2 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                    >
                      <option value="">Select arc type</option>
                      <option value="Protagonist">Protagonist</option>
                      <option value="Antagonist">Antagonist</option>
                      <option value="Supporting">Supporting</option>
                      <option value="Minor">Minor</option>
                    </select>
                  </div>
                  <button
                    onClick={addCharacter}
                    disabled={!newCharacter.name || !newCharacter.description}
                    className="flex items-center gap-2 px-4 py-2 bg-fantm-gold/20 text-fantm-gold rounded-lg hover:bg-fantm-gold/30 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Character
                  </button>
                </div>

                <p className="text-sm text-fantm-cream/40">
                  You can skip this step and let the AI create characters for you.
                </p>
              </div>
            )}

            {/* Step 4: Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold text-fantm-cream">
                  Story Details (optional)
                </h3>

                {/* Themes */}
                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    Themes
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {config.themes?.map((theme, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-fantm-gold/20 text-fantm-gold rounded-full text-sm flex items-center gap-1"
                      >
                        {theme}
                        <button
                          onClick={() => updateConfig({
                            themes: config.themes?.filter((_, i) => i !== index)
                          })}
                          className="hover:text-fantm-cream"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTheme}
                      onChange={(e) => setNewTheme(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTheme())}
                      className="flex-1 px-4 py-2 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                      placeholder="e.g., redemption, love, betrayal"
                    />
                    <button
                      onClick={addTheme}
                      disabled={!newTheme}
                      className="px-4 py-2 bg-fantm-gold/20 text-fantm-gold rounded-lg hover:bg-fantm-gold/30 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    Tone
                  </label>
                  <input
                    type="text"
                    value={config.tone || ''}
                    onChange={(e) => updateConfig({ tone: e.target.value })}
                    className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                    placeholder="e.g., dark and brooding, lighthearted, suspenseful"
                  />
                </div>

                {/* Writing Style */}
                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    Writing Style
                  </label>
                  <input
                    type="text"
                    value={config.writingStyle || ''}
                    onChange={(e) => updateConfig({ writingStyle: e.target.value })}
                    className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                    placeholder="e.g., Hemingway, Austen, King, or describe the style"
                  />
                </div>

                {/* Setting */}
                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    Setting
                  </label>
                  <input
                    type="text"
                    value={config.setting || ''}
                    onChange={(e) => updateConfig({ setting: e.target.value })}
                    className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                    placeholder="e.g., Victorian London, distant future, small town"
                  />
                </div>

                {/* Events */}
                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    Key Events
                  </label>
                  <div className="space-y-2 mb-2">
                    {config.events?.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg"
                      >
                        <span className="text-fantm-cream/80">{event}</span>
                        <button
                          onClick={() => updateConfig({
                            events: config.events?.filter((_, i) => i !== index)
                          })}
                          className="text-fantm-cream/40 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newEvent}
                      onChange={(e) => setNewEvent(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEvent())}
                      className="flex-1 px-4 py-2 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                      placeholder="Add a key event that should happen..."
                    />
                    <button
                      onClick={addEvent}
                      disabled={!newEvent}
                      className="px-4 py-2 bg-fantm-gold/20 text-fantm-gold rounded-lg hover:bg-fantm-gold/30 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold text-fantm-cream">
                  Review Your Story
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-fantm-dark border border-fantm-gold/20 rounded-lg">
                    <div className="text-sm text-fantm-cream/60 mb-1">Story Type</div>
                    <div className="text-fantm-cream capitalize">{config.storyType}</div>
                  </div>

                  <div className="p-4 bg-fantm-dark border border-fantm-gold/20 rounded-lg">
                    <div className="text-sm text-fantm-cream/60 mb-1">Package</div>
                    <div className="text-fantm-cream capitalize flex items-center gap-2">
                      {config.packageType}
                      {config.packageType === 'premium' && <Sparkles className="w-4 h-4 text-fantm-gold" />}
                    </div>
                  </div>

                  <div className="p-4 bg-fantm-dark border border-fantm-gold/20 rounded-lg">
                    <div className="text-sm text-fantm-cream/60 mb-1">Title</div>
                    <div className="text-fantm-cream">{config.title || '(AI will suggest)'}</div>
                  </div>

                  <div className="p-4 bg-fantm-dark border border-fantm-gold/20 rounded-lg">
                    <div className="text-sm text-fantm-cream/60 mb-1">Brief</div>
                    <div className="text-fantm-cream/80">{config.brief}</div>
                  </div>

                  <div className="p-4 bg-fantm-dark border border-fantm-gold/20 rounded-lg">
                    <div className="text-sm text-fantm-cream/60 mb-1">Genre</div>
                    <div className="text-fantm-cream">{config.genre || '(Not specified)'}</div>
                  </div>

                  <div className="p-4 bg-fantm-dark border border-fantm-gold/20 rounded-lg">
                    <div className="text-sm text-fantm-cream/60 mb-1">Target Word Count</div>
                    <div className="text-fantm-cream">{config.targetWordCount.toLocaleString()} words</div>
                  </div>

                  {config.characters && config.characters.length > 0 && (
                    <div className="p-4 bg-fantm-dark border border-fantm-gold/20 rounded-lg">
                      <div className="text-sm text-fantm-cream/60 mb-2">Characters</div>
                      <div className="space-y-1">
                        {config.characters.map((char, i) => (
                          <div key={i} className="text-fantm-cream/80">
                            • {char.name} ({char.arc})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {config.themes && config.themes.length > 0 && (
                    <div className="p-4 bg-fantm-dark border border-fantm-gold/20 rounded-lg">
                      <div className="text-sm text-fantm-cream/60 mb-1">Themes</div>
                      <div className="text-fantm-cream/80">{config.themes.join(', ')}</div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-fantm-gold/10 border border-fantm-gold/30 rounded-lg">
                  <p className="text-sm text-fantm-cream/80">
                    By continuing, you'll proceed to payment. Your story will be generated after payment is confirmed.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 text-fantm-cream/60 hover:text-fantm-cream transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-3 text-fantm-cream/60 hover:text-fantm-cream transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </button>

            <button
              onClick={handleContinue}
              disabled={!canProceed() || loading}
              className="flex items-center gap-2 px-8 py-3 bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : currentStep === steps.length - 1 ? (
                <>
                  Proceed to Payment
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
