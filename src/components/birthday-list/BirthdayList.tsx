import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BirthdayItem } from '../../types';

interface BirthdayListProps {
  items: BirthdayItem[];
  isEditable: boolean;
  isExpanded?: boolean;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

const MAX_VISIBLE_ON_TABLE = 4;

export function BirthdayList({ items, isEditable, isExpanded = false, onAdd, onRemove, onToggle }: BirthdayListProps) {
  const [newItem, setNewItem] = useState('');

  // Show limited items when on table, all items when expanded
  const visibleItems = isExpanded ? items : items.slice(0, MAX_VISIBLE_ON_TABLE);
  const hiddenCount = items.length - MAX_VISIBLE_ON_TABLE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
    }
  };

  return (
    <div
      className="table-object relative max-w-sm w-full"
      style={{
        transform: 'rotate(-2deg)',
      }}
    >
      {/* Napkin paper */}
      <div
        className="relative rounded-sm overflow-hidden"
        style={{
          backgroundColor: 'var(--color-paper)',
          boxShadow: `
            0 1px 3px rgba(0,0,0,0.12),
            0 4px 12px rgba(0,0,0,0.08),
            inset 0 0 80px rgba(0,0,0,0.03)
          `,
        }}
      >
        {/* Paper texture */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23paper)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Fold line */}
        <div
          className="absolute left-0 right-0 h-px opacity-20"
          style={{
            top: '50%',
            background: 'linear-gradient(90deg, transparent, var(--color-ink), transparent)',
          }}
        />

        {/* Content */}
        <div className="relative p-5">
          {/* Header */}
          <h2
            className="title-display text-xl md:text-2xl text-center mb-3 pb-2"
            style={{
              color: 'var(--color-ink)',
              borderBottom: '1px solid var(--color-paper-lines)',
            }}
          >
            Birthday List
          </h2>

          <p
            className="serif text-xs text-center mb-4 italic"
            style={{ color: 'var(--color-ink-faded)' }}
          >
            Today is birthday rules — everything you want, you get.
          </p>

          {/* Items */}
          <ul className="space-y-2 min-h-[100px]">
            <AnimatePresence mode="popLayout">
              {visibleItems.length === 0 ? (
                <motion.li
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4 italic"
                  style={{ color: 'var(--color-ink-faded)' }}
                >
                  No items yet...
                </motion.li>
              ) : (
                visibleItems.map((item, index) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-2 group"
                  >
                    {/* Checkbox/bullet */}
                    <button
                      onClick={() => isEditable && onToggle(item.id)}
                      disabled={!isEditable}
                      className="mt-1 flex-shrink-0 w-4 h-4 rounded-sm border transition-all"
                      style={{
                        borderColor: 'var(--color-ink-faded)',
                        backgroundColor: item.obtained ? 'var(--color-zone-center)' : 'transparent',
                        cursor: isEditable ? 'pointer' : 'default',
                      }}
                    >
                      {item.obtained && (
                        <svg viewBox="0 0 24 24" className="w-full h-full" style={{ color: 'var(--color-ink)' }}>
                          <path
                            fill="currentColor"
                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Text */}
                    <span
                      className="handwritten text-lg flex-grow"
                      style={{
                        color: 'var(--color-ink)',
                        textDecoration: item.obtained ? 'line-through' : 'none',
                        opacity: item.obtained ? 0.6 : 1,
                      }}
                    >
                      {item.text}
                    </span>

                    {/* Delete button */}
                    {isEditable && (
                      <button
                        onClick={() => onRemove(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100"
                        style={{ color: 'var(--color-zone-edge)' }}
                        aria-label="Remove item"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4">
                          <path
                            fill="currentColor"
                            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                          />
                        </svg>
                      </button>
                    )}
                  </motion.li>
                ))
              )}
            </AnimatePresence>

            {/* Hidden items indicator when on table */}
            {!isExpanded && hiddenCount > 0 && (
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center pt-2 italic serif text-sm"
                style={{ color: 'var(--color-ink-faded)' }}
              >
                +{hiddenCount} more...
              </motion.li>
            )}
          </ul>

          {/* Add form - only show when expanded */}
          {isEditable && isExpanded && (
            <form onSubmit={handleSubmit} className="mt-4 pt-4" style={{ borderTop: '1px dashed var(--color-paper-lines)' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add a wish..."
                  className="flex-grow px-3 py-2 rounded handwritten text-lg outline-none transition-shadow"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    color: 'var(--color-ink)',
                    border: '1px solid var(--color-paper-lines)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newItem.trim()}
                  className="px-4 py-2 rounded transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-cork)',
                    color: 'var(--color-paper)',
                  }}
                >
                  +
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Torn edge effect at bottom */}
      <div
        className="absolute left-0 right-0 h-4 overflow-hidden"
        style={{ bottom: '-16px' }}
      >
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0 0 L5 8 L10 2 L15 7 L20 3 L25 9 L30 1 L35 6 L40 4 L45 8 L50 2 L55 7 L60 3 L65 9 L70 1 L75 6 L80 4 L85 8 L90 2 L95 7 L100 0 L100 10 L0 10 Z"
            fill="var(--color-paper)"
          />
        </svg>
      </div>
    </div>
  );
}
