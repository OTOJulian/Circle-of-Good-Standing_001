import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface TableItemProps {
  children: ReactNode;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  label: string;
  rotation?: number;
  expandedWidth?: string;
  expandedHeight?: string;
}

export function TableItem({
  children,
  isExpanded,
  onExpand,
  onCollapse,
  label,
  rotation = 0,
  expandedWidth = '90vw',
  expandedHeight = 'auto',
}: TableItemProps) {
  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <motion.div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(26, 15, 10, 0.85)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCollapse}
        />
      )}

      {/* The item itself */}
      <motion.div
        className="cursor-pointer"
        onClick={() => !isExpanded && onExpand()}
        initial={false}
        animate={isExpanded ? {
          scale: 1,
          rotate: 0,
          zIndex: 50,
          x: 0,
          y: 0,
        } : {
          scale: 1,
          rotate: rotation,
          zIndex: 1,
          x: 0,
          y: 0,
        }}
        whileHover={!isExpanded ? {
          scale: 1.05,
          rotate: rotation * 0.5,
          y: -8,
          zIndex: 10,
          transition: { duration: 0.2 },
        } : {}}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        style={{
          position: isExpanded ? 'fixed' : 'relative',
          top: isExpanded ? '50%' : 'auto',
          left: isExpanded ? '50%' : 'auto',
          transform: isExpanded ? 'translate(-50%, -50%)' : 'none',
          maxWidth: isExpanded ? expandedWidth : 'none',
          maxHeight: isExpanded ? expandedHeight : 'none',
        }}
      >
        {/* Hover hint label */}
        {!isExpanded && (
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap serif text-xs"
            style={{ color: 'var(--color-paper-aged)' }}
            initial={{ opacity: 0, y: -5 }}
            whileHover={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            {label}
          </motion.div>
        )}

        {/* Close button when expanded */}
        {isExpanded && (
          <motion.button
            className="absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center z-50"
            style={{
              background: 'var(--color-brass)',
              color: 'var(--color-cafe-shadow)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCollapse();
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.1 }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
              />
            </svg>
          </motion.button>
        )}

        {children}
      </motion.div>
    </>
  );
}
