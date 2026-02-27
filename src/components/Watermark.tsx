import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WatermarkProps {
  opacity?: number;
}

export default function Watermark({ opacity = 0.15 }: WatermarkProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity }}
    >
      {/* Large background text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="text-[30vw] font-serif font-bold text-fantm-gold select-none whitespace-nowrap"
          style={{
            WebkitTextStroke: '1px rgba(201, 162, 39, 0.3)',
            color: 'transparent',
            textShadow: '0 0 100px rgba(201, 162, 39, 0.1)'
          }}
        >
          fantm
        </motion.div>
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 162, 39, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 162, 39, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-fantm-gold/10 rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-fantm-gold/10 rounded-full" />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 border border-fantm-gold/5 rounded-full" />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-fantm-gold/20 rounded-tl-3xl" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-fantm-gold/20 rounded-tr-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-fantm-gold/20 rounded-bl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-fantm-gold/20 rounded-br-3xl" />

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
