import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, BookOpen, Sparkles, Zap, Shield, Star, Feather, Download } from 'lucide-react';
import RotatingLogo from '../components/RotatingLogo';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Writing',
    description: 'Advanced Grok AI creates compelling narratives with coherent plots and vivid characters.'
  },
  {
    icon: BookOpen,
    title: 'Multiple Formats',
    description: 'Generate novels, novellas, memoirs, and autobiographies tailored to your vision.'
  },
  {
    icon: Zap,
    title: 'Block-Based Generation',
    description: 'Our unique algorithm maintains story coherence by building chapters in interconnected blocks.'
  },
  {
    icon: Star,
    title: 'Premium Features',
    description: 'Get AI-generated illustrations, professional formatting, and editing capabilities.'
  },
  {
    icon: Download,
    title: 'Professional Output',
    description: 'Receive beautifully formatted PDFs with title pages, table of contents, and back cover blurbs.'
  },
  {
    icon: Shield,
    title: 'Your Story, Your Rights',
    description: 'Full ownership of everything generated. Use it commercially or personally.'
  }
];

const steps = [
  {
    number: '01',
    title: 'Define Your Vision',
    description: 'Tell us about your story - genre, characters, themes, and key events.'
  },
  {
    number: '02',
    title: 'Choose Your Package',
    description: 'Select Normal or Premium based on your needs and budget.'
  },
  {
    number: '03',
    title: 'Watch It Come to Life',
    description: 'Our AI crafts your story block by block, maintaining perfect coherence.'
  },
  {
    number: '04',
    title: 'Download & Enjoy',
    description: 'Receive your professionally formatted book ready to share or publish.'
  }
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fantm-gold/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex justify-center mb-8">
                <RotatingLogo className="w-24 h-24" />
              </div>
              
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-fantm-cream mb-6">
                Where Stories
                <span className="block text-fantm-gold">Come to Life</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-fantm-cream/70 max-w-2xl mx-auto mb-10">
                AI-powered novel, memoir, and biography generation. 
                Professional-quality books in minutes, not months.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={user ? '/create' : '/signup'}
                  className="group px-8 py-4 bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-all flex items-center gap-2"
                >
                  Start Creating
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/pricing"
                  className="px-8 py-4 border border-fantm-gold/50 text-fantm-cream font-medium rounded-lg hover:bg-fantm-gold/10 transition-all"
                >
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-fantm-gold/50 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-fantm-gold rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-fantm-cream mb-4">
              Why Choose <span className="text-fantm-gold">fantm.ink</span>?
            </h2>
            <p className="text-fantm-cream/60 text-lg max-w-2xl mx-auto">
              Professional storytelling powered by cutting-edge AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 bg-fantm-dark-light/50 border border-fantm-gold/10 rounded-xl hover:border-fantm-gold/30 transition-all"
              >
                <div className="w-14 h-14 bg-fantm-gold/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-fantm-gold/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-fantm-gold" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-fantm-cream mb-3">
                  {feature.title}
                </h3>
                <p className="text-fantm-cream/60">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative bg-fantm-dark-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-fantm-cream mb-4">
              How It <span className="text-fantm-gold">Works</span>
            </h2>
            <p className="text-fantm-cream/60 text-lg max-w-2xl mx-auto">
              From idea to book in four simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-serif font-bold text-fantm-gold/20 mb-4">
                  {step.number}
                </div>
                <h3 className="font-serif text-xl font-semibold text-fantm-cream mb-3">
                  {step.title}
                </h3>
                <p className="text-fantm-cream/60">
                  {step.description}
                </p>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 w-full h-px">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-fantm-gold/30 rotate-45" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-12 bg-gradient-to-br from-fantm-gold/20 to-fantm-gold/5 border border-fantm-gold/30 rounded-2xl"
          >
            <Feather className="w-16 h-16 text-fantm-gold mx-auto mb-6" />
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-fantm-cream mb-4">
              Ready to Create Your Story?
            </h2>
            <p className="text-fantm-cream/70 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of writers who have brought their ideas to life with fantm.ink
            </p>
            <Link
              to={user ? '/create' : '/signup'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-all"
            >
              {user ? 'Start Creating' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
