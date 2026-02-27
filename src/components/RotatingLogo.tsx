import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Feather,
  BookOpen,
  PenTool,
  Scroll,
  Sparkles,
  Star,
  Moon,
  Sun,
  Flame,
  Wind,
  Droplets,
  Mountain,
  Flower2,
  Crown,
  Gem,
  Key,
  Lock,
  Eye,
  Heart,
  Compass,
  Anchor,
  Rocket,
  Zap,
  Code,
  Coffee,
  Music,
  Camera,
  Palette,
  Lightbulb,
  Target,
  Trophy,
  Shield
} from 'lucide-react';

// 20 different logo icons that rotate on each session/page refresh
const logoIcons = [
  Feather,
  BookOpen,
  PenTool,
  Scroll,
  Sparkles,
  Star,
  Moon,
  Sun,
  Flame,
  Wind,
  Droplets,
  Mountain,
  Flower2,
  Crown,
  Gem,
  Key,
  Lock,
  Eye,
  Heart,
  Compass,
  Anchor,
  Rocket
];

interface RotatingLogoProps {
  className?: string;
}

export default function RotatingLogo({ className = '' }: RotatingLogoProps) {
  const [LogoIcon, setLogoIcon] = useState<typeof Feather>(Feather);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Use sessionStorage to persist the same logo for the session
    const sessionLogo = sessionStorage.getItem('fantmink-logo');
    
    if (sessionLogo) {
      const iconIndex = parseInt(sessionLogo, 10);
      setLogoIcon(() => logoIcons[iconIndex]);
    } else {
      // Randomly select a logo for this session
      const randomIndex = Math.floor(Math.random() * logoIcons.length);
      sessionStorage.setItem('fantmink-logo', randomIndex.toString());
      setLogoIcon(() => logoIcons[randomIndex]);
    }
  }, []);

  if (!isClient) {
    return <div className={`${className} bg-fantm-gold/20 rounded-full`} />;
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative ${className}`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-fantm-gold/30 blur-xl rounded-full" />
      
      {/* Icon container */}
      <div className="relative w-full h-full bg-gradient-to-br from-fantm-gold to-fantm-gold-dark rounded-full flex items-center justify-center">
        <LogoIcon className="w-1/2 h-1/2 text-fantm-dark" strokeWidth={2.5} />
      </div>
    </motion.div>
  );
}

// Export the list for reference
export { logoIcons };
