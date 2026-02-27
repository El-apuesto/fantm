import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RotatingLogoProps {
  className?: string;
}

export default function RotatingLogo({ className = '' }: RotatingLogoProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
        <img 
          src="/logo.png" 
          alt="fantm.ink logo"
          className="w-1/2 h-1/2"
        />
      </div>
    </motion.div>
  );
}
