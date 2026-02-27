import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStory } from '../contexts/StoryContext';
import { 
  Plus, BookOpen, Clock, CheckCircle, AlertCircle, 
  Sparkles, ArrowRight, Download, Loader2, Trash2
} from 'lucide-react';
import type { Story } from '../types';

const statusIcons = {
  draft: Clock,
  pending_payment: AlertCircle,
  generating: Loader2,
  completed: CheckCircle,
  error: AlertCircle,
};

const statusColors = {
  draft: 'text-fantm-cream/60',
  pending_payment: 'text-fantm-gold',
  generating: 'text-fantm-gold animate-spin',
  completed: 'text-green-500',
  error: 'text-red-500',
};

const statusLabels = {
  draft: 'Draft',
  pending_payment: 'Payment Required',
  generating: 'Generating...',
  completed: 'Completed',
  error: 'Error',
};

export default function Dashboard() {
  const { stories, fetchStories, deleteStory, loading } = useStory();
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this story?')) return;
    
    setDeleting(id);
    try {
      await deleteStory(id);
    } catch (error) {
      console.error('Failed to delete story:', error);
    } finally {
      setDeleting(null);
    }
  }

  const groupedStories = {
    active: stories.filter(s => s.status === 'generating'),
    drafts: stories.filter(s => s.status === 'draft' || s.status === 'pending_payment'),
    completed: stories.filter(s => s.status === 'completed'),
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="font-serif text-4xl font-bold text-fantm-cream mb-2">
              Your Stories
            </h1>
            <p className="text-fantm-cream/60">
              Manage and track your creative projects
            </p>
          </div>
          <Link
            to="/create"
            className="flex items-center gap-2 px-6 py-3 bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Story
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-fantm-gold animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-20 h-20 text-fantm-gold/30 mx-auto mb-6" />
            <h2 className="font-serif text-2xl font-bold text-fantm-cream mb-4">
              No stories yet
            </h2>
            <p className="text-fantm-cream/60 mb-8 max-w-md mx-auto">
              Start your first story and bring your ideas to life with AI-powered generation.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Story
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {/* Active Generations */}
            {groupedStories.active.length > 0 && (
              <section>
                <h2 className="font-serif text-xl font-bold text-fantm-cream mb-4 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-fantm-gold animate-spin" />
                  Generating
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedStories.active.map((story) => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      onDelete={handleDelete}
                      deleting={deleting === story.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Drafts */}
            {groupedStories.drafts.length > 0 && (
              <section>
                <h2 className="font-serif text-xl font-bold text-fantm-cream mb-4">
                  Drafts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedStories.drafts.map((story) => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      onDelete={handleDelete}
                      deleting={deleting === story.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Completed */}
            {groupedStories.completed.length > 0 && (
              <section>
                <h2 className="font-serif text-xl font-bold text-fantm-cream mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Completed
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedStories.completed.map((story) => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      onDelete={handleDelete}
                      deleting={deleting === story.id}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface StoryCardProps {
  story: Story;
  onDelete: (id: string) => void;
  deleting: boolean;
}

function StoryCard({ story, onDelete, deleting }: StoryCardProps) {
  const StatusIcon = statusIcons[story.status];
  const statusColor = statusColors[story.status];
  const statusLabel = statusLabels[story.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group bg-fantm-dark-light/50 border border-fantm-gold/20 rounded-xl p-6 hover:border-fantm-gold/40 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center gap-2 ${statusColor}`}>
          <StatusIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{statusLabel}</span>
        </div>
        {story.config.packageType === 'premium' && (
          <span className="flex items-center gap-1 text-xs text-fantm-gold bg-fantm-gold/10 px-2 py-1 rounded">
            <Sparkles className="w-3 h-3" />
            Premium
          </span>
        )}
      </div>

      <h3 className="font-serif text-xl font-bold text-fantm-cream mb-2 line-clamp-1">
        {story.config.title || 'Untitled'}
      </h3>

      <div className="text-sm text-fantm-cream/60 mb-4">
        <span className="capitalize">{story.config.storyType}</span>
        <span className="mx-2">•</span>
        <span>{story.config.targetWordCount.toLocaleString()} words</span>
      </div>

      {story.progress && story.status === 'generating' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-fantm-cream/60">{story.progress.message}</span>
            <span className="text-fantm-gold">{story.progress.percent}%</span>
          </div>
          <div className="h-2 bg-fantm-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-fantm-gold transition-all duration-500"
              style={{ width: `${story.progress.percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {story.status === 'completed' ? (
          <>
            <Link
              to={`/story/${story.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-fantm-gold/20 text-fantm-gold rounded-lg hover:bg-fantm-gold/30 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              View
            </Link>
            {story.pdfUrl && (
              <a
                href={story.pdfUrl}
                download
                className="flex items-center justify-center gap-2 px-4 py-2 bg-fantm-gold text-fantm-dark rounded-lg hover:bg-fantm-gold-light transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF
              </a>
            )}
          </>
        ) : story.status === 'pending_payment' ? (
          <Link
            to={`/story/${story.id}/payment`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-fantm-gold text-fantm-dark rounded-lg hover:bg-fantm-gold-light transition-colors"
          >
            Complete Payment
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : story.status === 'generating' ? (
          <Link
            to={`/story/${story.id}/progress`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-fantm-gold/20 text-fantm-gold rounded-lg hover:bg-fantm-gold/30 transition-colors"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            View Progress
          </Link>
        ) : (
          <Link
            to={`/story/${story.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-fantm-gold/20 text-fantm-gold rounded-lg hover:bg-fantm-gold/30 transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}

        <button
          onClick={() => onDelete(story.id)}
          disabled={deleting}
          className="p-2 text-fantm-cream/40 hover:text-red-400 transition-colors"
        >
          {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
      </div>
    </motion.div>
  );
}
