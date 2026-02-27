import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Check, Loader2, Sparkles } from 'lucide-react';
import { useStory } from '../contexts/StoryContext';
import { paymentApi } from '../services/api';
import { loadSquare } from '../services/square';

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentStory, fetchStory, startGeneration } = useStory();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStory(id).then(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (!currentStory) return;

    const initSquare = async () => {
      try {
        const payments = await loadSquare();
        const cardInstance = await payments.card({
          style: {
            '.input-container': {
              borderColor: '#c9a22740',
              borderRadius: '8px',
            },
            '.input-container.is-focus': {
              borderColor: '#c9a227',
            },
            '.input-container.is-error': {
              borderColor: '#ef4444',
            },
          },
        });
        await cardInstance.attach('#card-container');
        setCard(cardInstance);
      } catch (err) {
        console.error('Square init error:', err);
        setError('Failed to initialize payment form');
      }
    };

    initSquare();
  }, [currentStory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card || !currentStory) return;

    setProcessing(true);
    setError('');

    try {
      const result = await card.tokenize();
      if (result.status !== 'OK') {
        throw new Error(result.errors?.[0]?.message || 'Card tokenization failed');
      }

      await paymentApi.processPayment({
        nonce: result.token,
        storyType: currentStory.config.storyType,
        packageType: currentStory.config.packageType,
        storyId: currentStory.id,
      });

      setSuccess(true);
      
      // Start generation
      await startGeneration(currentStory.id);
      
      // Navigate to progress page
      setTimeout(() => {
        navigate(`/story/${currentStory.id}/progress`);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

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
        <div className="text-center">
          <p className="text-fantm-cream/60">Story not found</p>
        </div>
      </div>
    );
  }

  const price = currentStory.config.packageType === 'premium' 
    ? currentStory.config.storyType === 'novella' ? 15 
    : currentStory.config.storyType === 'novel' ? 23 
    : currentStory.config.storyType === 'memoir' ? 19 
    : 28
    : currentStory.config.storyType === 'novella' ? 13 
    : currentStory.config.storyType === 'novel' ? 21 
    : currentStory.config.storyType === 'memoir' ? 17 
    : 26;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-fantm-cream mb-4">
            Payment Successful!
          </h2>
          <p className="text-fantm-cream/60 mb-4">
            Your story is now being generated. You'll be redirected to track progress.
          </p>
          <Loader2 className="w-6 h-6 text-fantm-gold animate-spin mx-auto" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-serif text-4xl font-bold text-fantm-cream mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-fantm-cream/60">
            Secure payment powered by Square
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-fantm-dark-light/50 border border-fantm-gold/20 rounded-2xl p-8"
        >
          {/* Order Summary */}
          <div className="mb-8 p-6 bg-fantm-dark border border-fantm-gold/10 rounded-xl">
            <h3 className="font-serif text-lg font-bold text-fantm-cream mb-4">Order Summary</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-fantm-cream/60 capitalize">
                {currentStory.config.packageType} {currentStory.config.storyType}
              </span>
              {currentStory.config.packageType === 'premium' && (
                <Sparkles className="w-4 h-4 text-fantm-gold" />
              )}
            </div>
            <div className="text-fantm-cream/40 text-sm mb-4">
              {currentStory.config.targetWordCount.toLocaleString()} words
            </div>
            <div className="border-t border-fantm-gold/10 pt-4 flex items-center justify-between">
              <span className="font-medium text-fantm-cream">Total</span>
              <span className="font-serif text-2xl font-bold text-fantm-gold">${price}.00</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Payment Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-fantm-cream mb-2">
                Card Information
              </label>
              <div 
                id="card-container" 
                className="p-4 bg-fantm-dark border border-fantm-gold/20 rounded-lg min-h-[60px]"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-fantm-cream/40 mb-6">
              <Lock className="w-4 h-4" />
              <span>Your payment is secured with 256-bit encryption</span>
            </div>

            <button
              type="submit"
              disabled={processing || !card}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-colors disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay ${price}.00
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
