import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStory } from '../contexts/StoryContext';
import { 
  ArrowLeft, BookOpen, Download, Edit3, Sparkles, 
  Loader2
} from 'lucide-react';

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentStory, fetchStory, regenerateSection } = useStory();
  const [activeChapter, setActiveChapter] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenInstructions, setRegenInstructions] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<{chapter: number, block: number} | null>(null);

  useEffect(() => {
    if (id) fetchStory(id);
  }, [id]);

  async function handleRegenerate() {
    if (!selectedBlock || !id) return;
    
    setRegenerating(true);
    try {
      await regenerateSection(id, selectedBlock.chapter, selectedBlock.block, regenInstructions);
      setShowRegenModal(false);
      setRegenInstructions('');
      fetchStory(id);
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setRegenerating(false);
    }
  }

  if (!currentStory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-fantm-gold animate-spin" />
      </div>
    );
  }

  const isPremium = currentStory.config.packageType === 'premium';
  const isComplete = currentStory.status === 'completed';

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-fantm-cream/60 hover:text-fantm-cream mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-4xl font-bold text-fantm-cream mb-2">
                {currentStory.config.title || 'Untitled'}
              </h1>
              <p className="text-fantm-cream/60 capitalize">
                {currentStory.config.storyType} • {currentStory.config.targetWordCount.toLocaleString()} words
                {isPremium && (
                  <span className="ml-2 text-fantm-gold flex items-center gap-1 inline-flex">
                    <Sparkles className="w-4 h-4" />
                    Premium
                  </span>
                )}
              </p>
            </div>
            
            {isComplete && currentStory.pdfUrl && (
              <a
                href={currentStory.pdfUrl}
                download
                className="flex items-center gap-2 px-6 py-3 bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-colors"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </a>
            )}
          </div>
        </motion.div>

        {isComplete && currentStory.content ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Chapter List */}
            <div className="lg:col-span-1">
              <div className="bg-fantm-dark-light/50 border border-fantm-gold/20 rounded-xl p-4 sticky top-24">
                <h3 className="font-serif text-lg font-bold text-fantm-cream mb-4">Chapters</h3>
                <div className="space-y-2">
                  {currentStory.content.chapters.map((chapter, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveChapter(index)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeChapter === index
                          ? 'bg-fantm-gold/20 text-fantm-gold'
                          : 'text-fantm-cream/70 hover:bg-fantm-gold/10'
                      }`}
                    >
                      <div className="font-medium">{chapter.title}</div>
                      <div className="text-sm opacity-70">{chapter.wordCount.toLocaleString()} words</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeChapter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-fantm-dark-light/50 border border-fantm-gold/20 rounded-xl p-8"
              >
                <h2 className="font-serif text-3xl font-bold text-fantm-cream mb-2">
                  {currentStory.content.chapters[activeChapter].title}
                </h2>
                <div className="text-fantm-cream/40 mb-8">
                  Chapter {activeChapter + 1} of {currentStory.content.chapters.length}
                </div>

                <div className="prose prose-invert max-w-none">
                  {currentStory.content.chapters[activeChapter].content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-fantm-cream/80 leading-relaxed mb-6">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {isPremium && (
                  <div className="mt-8 pt-8 border-t border-fantm-gold/10">
                    <button
                      onClick={() => {
                        setSelectedBlock({ chapter: activeChapter + 1, block: 1 });
                        setShowRegenModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-fantm-gold/20 text-fantm-gold rounded-lg hover:bg-fantm-gold/30 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Regenerate Section
                    </button>
                    <p className="text-sm text-fantm-cream/40 mt-2">
                      {currentStory.regenerationCount || 0}/5 regenerations used
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-fantm-gold/30 mx-auto mb-4" />
            <p className="text-fantm-cream/60">
              {currentStory.status === 'generating' 
                ? 'Your story is still being generated...'
                : 'Story content not available'
              }
            </p>
            {currentStory.status === 'generating' && (
              <Link
                to={`/story/${currentStory.id}/progress`}
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-fantm-gold/20 text-fantm-gold rounded-lg hover:bg-fantm-gold/30 transition-colors"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                View Progress
              </Link>
            )}
          </div>
        )}

        {/* Regeneration Modal */}
        {showRegenModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-fantm-dark-light border border-fantm-gold/20 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="font-serif text-xl font-bold text-fantm-cream mb-4">
                Regenerate Section
              </h3>
              <p className="text-fantm-cream/60 text-sm mb-4">
                Describe what you'd like changed in this section. Be specific about what should be different.
              </p>
              <textarea
                value={regenInstructions}
                onChange={(e) => setRegenInstructions(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none mb-4"
                placeholder="e.g., Make this scene more dramatic, add more dialogue..."
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowRegenModal(false)}
                  className="flex-1 px-4 py-3 text-fantm-cream/60 hover:text-fantm-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={!regenInstructions || regenerating}
                  className="flex-1 px-4 py-3 bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-colors disabled:opacity-50"
                >
                  {regenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Regenerate'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
