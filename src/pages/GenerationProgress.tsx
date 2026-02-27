import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStory } from '../contexts/StoryContext';
import { Loader2, CheckCircle, BookOpen, Download, Sparkles } from 'lucide-react';

export default function GenerationProgress() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentStory, fetchStory, checkProgress } = useStory();
  
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStory(id).then(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const interval = setInterval(async () => {
      const data = await checkProgress(id);
      if (data) {
        setProgress(data);
        if (data.status === 'completed') {
          clearInterval(interval);
          fetchStory(id);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-fantm-gold animate-spin" />
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-fantm-cream/60">Story not found</p>
      </div>
    );
  }

  const isComplete = currentStory.status === 'completed';
  const currentProgress = progress || currentStory.progress;

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl font-bold text-fantm-cream mb-4">
            {isComplete ? 'Story Complete!' : 'Generating Your Story'}
          </h1>
          <p className="text-fantm-cream/60">
            {isComplete 
              ? 'Your book is ready for download'
              : 'Our AI is crafting your narrative block by block'
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-fantm-dark-light/50 border border-fantm-gold/20 rounded-2xl p-8"
        >
          {/* Story Info */}
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-fantm-cream mb-2">
              {currentStory.config.title || 'Untitled'}
            </h2>
            <p className="text-fantm-cream/60 capitalize">
              {currentStory.config.storyType} • {currentStory.config.targetWordCount.toLocaleString()} words
            </p>
            {currentStory.config.packageType === 'premium' && (
              <span className="inline-flex items-center gap-1 mt-2 text-fantm-gold text-sm">
                <Sparkles className="w-4 h-4" />
                Premium Package
              </span>
            )}
          </div>

          {/* Progress */}
          {!isComplete && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-fantm-cream/60">
                  {currentProgress?.message || 'Initializing...'}
                </span>
                <span className="text-fantm-gold font-medium">
                  {currentProgress?.percent || 0}%
                </span>
              </div>
              <div className="h-3 bg-fantm-dark rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-fantm-gold to-fantm-gold-light"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgress?.percent || 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-fantm-cream/40">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">This may take 10-30 minutes</span>
              </div>
            </div>
          )}

          {/* Completion State */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2 text-green-500 mb-6">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">Generation Complete</span>
              </div>

              {currentStory.pdfUrl && (
                <a
                  href={currentStory.pdfUrl}
                  download
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </a>
              )}

              <button
                onClick={() => navigate(`/story/${currentStory.id}`)}
                className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-fantm-gold/20 text-fantm-gold font-medium rounded-lg hover:bg-fantm-gold/30 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                View Story
              </button>
            </motion.div>
          )}

          {/* What's Included */}
          <div className="mt-8 pt-8 border-t border-fantm-gold/10">
            <h3 className="font-medium text-fantm-cream mb-4">Your book includes:</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-fantm-cream/60">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-fantm-gold" />
                Title page
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-fantm-gold" />
                Table of contents
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-fantm-gold" />
                Complete chapters
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-fantm-gold" />
                Back cover blurb
              </li>
              {currentStory.config.packageType === 'premium' && (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-fantm-gold" />
                    AI illustrations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-fantm-gold" />
                    About the author
                  </li>
                </>
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
