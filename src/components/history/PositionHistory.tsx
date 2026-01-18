import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type { PositionHistoryEntry } from '../../types';
import { zoneInfo } from '../../lib/calculateZone';

interface PositionHistoryProps {
  history: PositionHistoryEntry[];
}

export function PositionHistory({ history }: PositionHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Show first 3 entries, or all if expanded
  const visibleHistory = isExpanded ? history : history.slice(0, 3);

  return (
    <div
      className="table-item w-full max-w-xs"
      style={{
        transform: 'rotate(1deg)',
      }}
    >
      {/* Receipt paper style */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: 'var(--color-paper)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Receipt header with dotted line */}
        <div
          className="px-4 py-3 text-center"
          style={{
            borderBottom: '2px dashed var(--color-paper-lines)',
          }}
        >
          <h3
            className="handwritten text-xl"
            style={{ color: 'var(--color-ink)' }}
          >
            Position History
          </h3>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--color-ink-faded)' }}
          >
            The journey of Julian's standing
          </p>
        </div>

        {/* Timeline entries */}
        <div className="px-4 py-3">
          <AnimatePresence mode="popLayout">
            {visibleHistory.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4 italic"
                style={{ color: 'var(--color-ink-faded)' }}
              >
                No history yet
              </motion.div>
            ) : (
              visibleHistory.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-6 pb-4 last:pb-0"
                >
                  {/* Timeline line */}
                  {index < visibleHistory.length - 1 && (
                    <div
                      className="absolute left-2 top-3 bottom-0 w-px"
                      style={{ backgroundColor: 'var(--color-paper-lines)' }}
                    />
                  )}

                  {/* Timeline dot */}
                  <div
                    className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2"
                    style={{
                      backgroundColor: zoneInfo[entry.position.zone].color,
                      borderColor: 'var(--color-paper)',
                      boxShadow: `0 0 0 2px ${zoneInfo[entry.position.zone].color}`,
                    }}
                  />

                  {/* Entry content */}
                  <div>
                    {/* Zone badge */}
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-semibold mb-1"
                      style={{
                        backgroundColor: zoneInfo[entry.position.zone].color,
                        color: entry.position.zone === 'off' ? 'white' : 'var(--color-ink)',
                      }}
                    >
                      {zoneInfo[entry.position.zone].label}
                    </span>

                    {/* Timestamp */}
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-ink-faded)' }}
                    >
                      {format(entry.timestamp, 'MMM d, yyyy - h:mm a')}
                    </p>

                    {/* Note */}
                    {entry.note && (
                      <p
                        className="handwritten text-sm mt-1 italic"
                        style={{ color: 'var(--color-ink)' }}
                      >
                        "{entry.note}"
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* Show more/less button */}
          {history.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-2 text-sm transition-colors hover:opacity-80"
              style={{
                color: 'var(--color-cork-dark)',
                borderTop: '1px dashed var(--color-paper-lines)',
              }}
            >
              {isExpanded ? 'Show less' : `Show ${history.length - 3} more...`}
            </button>
          )}
        </div>

        {/* Receipt footer */}
        <div
          className="px-4 py-2 text-center text-xs"
          style={{
            borderTop: '2px dashed var(--color-paper-lines)',
            color: 'var(--color-ink-faded)',
          }}
        >
          * * * Thank you for your patience * * *
        </div>
      </div>

      {/* Torn bottom edge */}
      <div
        className="absolute left-0 right-0 h-3 overflow-hidden"
        style={{ bottom: '-12px' }}
      >
        <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0 0 L3 6 L6 1 L9 5 L12 2 L15 7 L18 0 L21 4 L24 1 L27 6 L30 2 L33 5 L36 0 L39 7 L42 3 L45 6 L48 1 L51 5 L54 2 L57 7 L60 0 L63 4 L66 1 L69 6 L72 2 L75 5 L78 0 L81 7 L84 3 L87 6 L90 1 L93 5 L96 2 L100 0 L100 8 L0 8 Z"
            fill="var(--color-paper)"
          />
        </svg>
      </div>
    </div>
  );
}
