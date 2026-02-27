import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, BookOpen, Star, Zap, Crown, Package } from 'lucide-react';
import { paymentApi } from '../services/api';

interface PricingData {
  novella: { normal: { amount: number; display: string }; premium: { amount: number; display: string } };
  novel: { normal: { amount: number; display: string }; premium: { amount: number; display: string } };
  memoir: { normal: { amount: number; display: string }; premium: { amount: number; display: string } };
  autobiography: { normal: { amount: number; display: string }; premium: { amount: number; display: string } };
  bundles: {
    two_premium_novels: { amount: number; display: string; savings: string };
    three_premium_novels: { amount: number; display: string; savings: string };
  };
}

const normalFeatures = [
  'Complete story generation',
  'Professional PDF output',
  'Title page & table of contents',
  'Back cover blurb',
  'Standard formatting',
  'Up to 50,000 words',
];

const premiumFeatures = [
  'Everything in Normal, plus:',
  'AI-generated illustrations',
  'About the author section',
  'Premium formatting (A5)',
  'Edit & regenerate sections',
  'Up to 10,000 words of edits',
  'Priority generation',
];

export default function Pricing() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, []);

  async function loadPricing() {
    try {
      const response = await paymentApi.getPricing();
      setPricing(response.data.pricing);
    } catch (error) {
      console.error('Failed to load pricing:', error);
    } finally {
      setLoading(false);
    }
  }

  const storyTypes = [
    { key: 'novella', label: 'Novella', words: '~20,000 words', icon: BookOpen },
    { key: 'novel', label: 'Novel', words: '~50,000 words', icon: Star },
    { key: 'memoir', label: 'Memoir', words: '~30,000 words', icon: Sparkles },
    { key: 'autobiography', label: 'Autobiography', words: '~60,000 words', icon: Crown },
  ];

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-fantm-cream mb-4">
            Simple, <span className="text-fantm-gold">Transparent</span> Pricing
          </h1>
          <p className="text-fantm-cream/60 text-lg max-w-2xl mx-auto">
            Choose the perfect package for your story. No hidden fees, no subscriptions.
          </p>
        </motion.div>

        {/* Story Type Pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {storyTypes.map((type, index) => (
            <motion.div
              key={type.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-fantm-dark-light/50 border border-fantm-gold/20 rounded-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-fantm-gold/10">
                <div className="flex items-center gap-3 mb-2">
                  <type.icon className="w-6 h-6 text-fantm-gold" />
                  <h3 className="font-serif text-2xl font-bold text-fantm-cream">{type.label}</h3>
                </div>
                <p className="text-fantm-cream/60">{type.words}</p>
              </div>

              <div className="grid grid-cols-2 divide-x divide-fantm-gold/10">
                {/* Normal Package */}
                <div className="p-6">
                  <div className="mb-4">
                    <span className="text-sm text-fantm-cream/60 uppercase tracking-wider">Normal</span>
                    <div className="text-3xl font-bold text-fantm-cream">
                      {pricing && type.key in pricing ? (pricing as any)[type.key].normal.display : '$--'}
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {normalFeatures.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-fantm-cream/70">
                        <Check className="w-4 h-4 text-fantm-gold shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/create"
                    className="block w-full py-2 text-center border border-fantm-gold/50 text-fantm-cream rounded-lg hover:bg-fantm-gold/10 transition-colors"
                  >
                    Choose Normal
                  </Link>
                </div>

                {/* Premium Package */}
                <div className="p-6 bg-fantm-gold/5">
                  <div className="mb-4">
                    <span className="text-sm text-fantm-gold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Premium
                    </span>
                    <div className="text-3xl font-bold text-fantm-gold">
                      {pricing && type.key in pricing ? (pricing as any)[type.key].premium.display : '$--'}
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {premiumFeatures.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-fantm-cream/70">
                        <Check className="w-4 h-4 text-fantm-gold shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/create"
                    className="block w-full py-2 text-center bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-colors"
                  >
                    Choose Premium
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bundles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="font-serif text-3xl font-bold text-fantm-cream text-center mb-8">
            Bundle & <span className="text-fantm-gold">Save</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-fantm-gold/20 to-fantm-gold/5 border border-fantm-gold/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-8 h-8 text-fantm-gold" />
                <div>
                  <h3 className="font-serif text-xl font-bold text-fantm-cream">2 Premium Novels</h3>
                  <p className="text-fantm-gold text-sm">Save {pricing?.bundles.two_premium_novels.savings || '$7'}</p>
                </div>
              </div>
              <div className="text-4xl font-bold text-fantm-gold mb-4">
                {pricing?.bundles.two_premium_novels.display || '$39'}
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-fantm-cream/70">
                  <Check className="w-4 h-4 text-fantm-gold" />
                  2 complete premium novels
                </li>
                <li className="flex items-center gap-2 text-fantm-cream/70">
                  <Check className="w-4 h-4 text-fantm-gold" />
                  All premium features
                </li>
                <li className="flex items-center gap-2 text-fantm-cream/70">
                  <Check className="w-4 h-4 text-fantm-gold" />
                  Perfect for series
                </li>
              </ul>
              <Link
                to="/create"
                className="block w-full py-3 text-center bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-colors"
              >
                Get Bundle
              </Link>
            </div>

            <div className="bg-gradient-to-br from-fantm-gold/20 to-fantm-gold/5 border border-fantm-gold/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-fantm-gold" />
                <div>
                  <h3 className="font-serif text-xl font-bold text-fantm-cream">3 Premium Novels</h3>
                  <p className="text-fantm-gold text-sm">Save {pricing?.bundles.three_premium_novels.savings || '$6'}</p>
                </div>
              </div>
              <div className="text-4xl font-bold text-fantm-gold mb-4">
                {pricing?.bundles.three_premium_novels.display || '$63'}
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-fantm-cream/70">
                  <Check className="w-4 h-4 text-fantm-gold" />
                  3 complete premium novels
                </li>
                <li className="flex items-center gap-2 text-fantm-cream/70">
                  <Check className="w-4 h-4 text-fantm-gold" />
                  All premium features
                </li>
                <li className="flex items-center gap-2 text-fantm-cream/70">
                  <Check className="w-4 h-4 text-fantm-gold" />
                  Best value for trilogies
                </li>
              </ul>
              <Link
                to="/create"
                className="block w-full py-3 text-center bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-colors"
              >
                Get Bundle
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-fantm-dark-light/30 border border-fantm-gold/10 rounded-2xl p-8"
        >
          <h2 className="font-serif text-3xl font-bold text-fantm-cream text-center mb-8">
            Feature Comparison
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-serif text-xl font-bold text-fantm-cream mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-fantm-cream/60" />
                Normal Package
              </h3>
              <ul className="space-y-3">
                {normalFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-fantm-cream/70">
                    <Check className="w-5 h-5 text-fantm-gold shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-fantm-gold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Premium Package
              </h3>
              <ul className="space-y-3">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-fantm-cream/70">
                    <Check className="w-5 h-5 text-fantm-gold shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-fantm-cream/60">
            Questions?{' '}
            <a href="#" className="text-fantm-gold hover:underline">
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
