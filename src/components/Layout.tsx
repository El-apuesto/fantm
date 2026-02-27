import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Menu, X, Feather } from 'lucide-react';
import RotatingLogo from './RotatingLogo';
import Watermark from './Watermark';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Create', href: '/create' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Dashboard', href: '/dashboard', auth: true },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-fantm-dark text-fantm-cream relative overflow-x-hidden">
      {/* Watermark Background */}
      <Watermark />
      
      {/* Navigation */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-fantm-dark/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-fantm-gold to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <RotatingLogo className="w-10 h-10" />
              <span className="font-serif text-2xl font-bold text-fantm-cream group-hover:text-fantm-gold transition-colors">
                fantm.ink
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                if (item.auth && !user) return null;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`relative text-sm font-medium transition-colors ${
                      isActive ? 'text-fantm-gold' : 'text-fantm-cream/70 hover:text-fantm-cream'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="navIndicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-fantm-gold"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-sm text-fantm-cream/70 hover:text-fantm-cream transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {user.profile?.name || user.email}
                  </Link>
                  <button
                    onClick={signOut}
                    className="p-2 text-fantm-cream/70 hover:text-fantm-cream transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-fantm-cream/70 hover:text-fantm-cream transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-fantm-gold text-fantm-dark text-sm font-medium rounded hover:bg-fantm-gold-light transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-fantm-cream"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-20 z-40 bg-fantm-dark/98 backdrop-blur-lg border-b border-fantm-gold/20 md:hidden"
          >
            <nav className="flex flex-col p-6 space-y-4">
              {navItems.map((item) => {
                if (item.auth && !user) return null;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-lg text-fantm-cream/80 hover:text-fantm-gold transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="text-lg text-fantm-cream/80 hover:text-fantm-gold transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-fantm-gold text-fantm-dark text-center font-medium rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-fantm-gold/20 bg-fantm-dark/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <Feather className="w-8 h-8 text-fantm-gold" />
                <span className="font-serif text-2xl font-bold text-fantm-cream">
                  fantm.ink
                </span>
              </Link>
              <p className="text-fantm-cream/60 max-w-md">
                Where stories come to life. AI-powered novel, memoir, and biography generation 
                with professional-quality output.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-serif text-lg text-fantm-cream mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/create" className="text-fantm-cream/60 hover:text-fantm-gold transition-colors">Create Story</Link></li>
                <li><Link to="/pricing" className="text-fantm-cream/60 hover:text-fantm-gold transition-colors">Pricing</Link></li>
                <li><Link to="/dashboard" className="text-fantm-cream/60 hover:text-fantm-gold transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg text-fantm-cream mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-fantm-cream/60 hover:text-fantm-gold transition-colors">Help Center</a></li>
                <li><a href="#" className="text-fantm-cream/60 hover:text-fantm-gold transition-colors">Contact</a></li>
                <li><a href="#" className="text-fantm-cream/60 hover:text-fantm-gold transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-fantm-gold/10 text-center">
            <p className="text-fantm-cream/40 text-sm">
              © {new Date().getFullYear()} fantm.ink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
