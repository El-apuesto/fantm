import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { User, Mail, Globe, MapPin, Loader2, Check } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    website: '',
    location: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data.profile);
      setStats(response.data.stats);
      setFormData({
        name: response.data.profile.name || '',
        bio: response.data.profile.bio || '',
        website: response.data.profile.website || '',
        location: response.data.profile.location || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch('/users/profile', formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-fantm-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl font-bold text-fantm-cream mb-4">
            Your Profile
          </h1>
          <p className="text-fantm-cream/60">
            Manage your account and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-fantm-dark-light/50 border border-fantm-gold/20 rounded-xl p-6">
              <h3 className="font-serif text-lg font-bold text-fantm-cream mb-6">Statistics</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-fantm-dark border border-fantm-gold/10 rounded-lg">
                  <div className="text-3xl font-bold text-fantm-gold">{stats?.totalStories || 0}</div>
                  <div className="text-sm text-fantm-cream/60">Total Stories</div>
                </div>
                
                <div className="p-4 bg-fantm-dark border border-fantm-gold/10 rounded-lg">
                  <div className="text-3xl font-bold text-fantm-gold">{stats?.completedStories || 0}</div>
                  <div className="text-sm text-fantm-cream/60">Completed</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-fantm-gold/10">
                <div className="text-sm text-fantm-cream/40">
                  Member since {new Date(profile?.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-fantm-dark-light/50 border border-fantm-gold/20 rounded-xl p-8">
              <h3 className="font-serif text-lg font-bold text-fantm-cream mb-6">Profile Information</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream/40 cursor-not-allowed"
                  />
                  <p className="text-xs text-fantm-cream/40 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-fantm-cream mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-fantm-dark border border-fantm-gold/20 rounded-lg text-fantm-cream focus:border-fantm-gold focus:outline-none"
                    placeholder="City, Country"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-fantm-gold text-fantm-dark font-medium rounded-lg hover:bg-fantm-gold-light transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : saved ? (
                      <>
                        <Check className="w-5 h-5" />
                        Saved!
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
