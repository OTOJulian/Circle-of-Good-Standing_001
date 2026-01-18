import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CafeTableProps {
  children: ReactNode;
}

export function CafeTable({ children }: CafeTableProps) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center">
      {/* Cafe background photo */}
      <img
        src="/assets/background_3.png"
        alt="Parisian cafe table"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          objectPosition: 'center center',
        }}
      />

      {/* Subtle warm overlay to enhance the golden hour feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,245,230,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Content area - positioned over the table */}
      <motion.div
        className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-2xl aspect-square flex items-center justify-center">
          {children}
        </div>
      </motion.div>

      {/* Soft vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(20,10,5,0.5) 100%)',
        }}
      />
    </div>
  );
}
