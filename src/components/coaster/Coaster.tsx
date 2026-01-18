import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type { CurrentPosition, PositionHistoryEntry, Condition } from '../../types';
import { getZoneFromPosition, zoneInfo } from '../../lib/calculateZone';

interface CoasterProps {
  position: CurrentPosition;
  isEditable: boolean;
  onPositionChange: (x: number, y: number, note?: string) => void;
  isExpanded?: boolean;
  positionHistory?: PositionHistoryEntry[];
  conditions?: Condition[];
  onAddCondition?: (text: string) => void;
  onRemoveCondition?: (id: string) => void;
  onToggleCondition?: (id: string) => void;
}

export function Coaster({
  position,
  isEditable,
  onPositionChange,
  isExpanded = false,
  positionHistory = [],
  conditions = [],
  onAddCondition,
  onRemoveCondition,
  onToggleCondition,
}: CoasterProps) {
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [pendingNote, setPendingNote] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const coasterRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localPosition, setLocalPosition] = useState({ x: position.x, y: position.y });

  useEffect(() => {
    setLocalPosition({ x: position.x, y: position.y });
  }, [position.x, position.y]);

  const handleDrag = useCallback((clientX: number, clientY: number) => {
    if (!coasterRef.current || !isEditable) return;

    const rect = coasterRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(-10, Math.min(110, x));
    const clampedY = Math.max(-10, Math.min(110, y));

    setLocalPosition({ x: clampedX, y: clampedY });
  }, [isEditable]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    setIsDragging(true);
    handleDrag(e.clientX, e.clientY);
  }, [isEditable, handleDrag]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleDrag(e.clientX, e.clientY);
  }, [isDragging, handleDrag]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(localPosition.x, localPosition.y, pendingNote || undefined);
      setPendingNote('');
    }
  }, [isDragging, localPosition, onPositionChange, pendingNote]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    handleDrag(touch.clientX, touch.clientY);
  }, [isEditable, handleDrag]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleDrag(touch.clientX, touch.clientY);
  }, [isDragging, handleDrag]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const currentZone = getZoneFromPosition(localPosition.x, localPosition.y);
  const zoneData = zoneInfo[currentZone];

  const handleAddCondition = () => {
    if (newCondition.trim() && onAddCondition) {
      onAddCondition(newCondition.trim());
      setNewCondition('');
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Left panel: Notes & Conditions - visible when coaster is expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute right-full mr-6 top-0 w-64"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div
              className="relative overflow-hidden rounded-lg"
              style={{
                backgroundColor: 'var(--color-paper)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              }}
            >
              {/* Notes section */}
              <div
                className="px-4 py-3"
                style={{ borderBottom: '2px dashed var(--color-paper-lines)' }}
              >
                <h3
                  className="handwritten text-lg text-center mb-2"
                  style={{ color: 'var(--color-ink)' }}
                >
                  Add a Note
                </h3>
                <p
                  className="text-xs text-center mb-3"
                  style={{ color: 'var(--color-ink-faded)' }}
                >
                  Why the change?
                </p>
                {isEditable && (
                  <textarea
                    value={pendingNote}
                    onChange={(e) => setPendingNote(e.target.value)}
                    placeholder="e.g., Made me laugh today..."
                    className="w-full p-2 rounded text-sm resize-none handwritten"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      color: 'var(--color-ink)',
                      border: '1px solid var(--color-paper-lines)',
                      minHeight: '60px',
                    }}
                  />
                )}
                {pendingNote && (
                  <p className="text-xs mt-2 italic serif" style={{ color: 'var(--color-ink-faded)' }}>
                    Note will be saved with next position change
                  </p>
                )}
              </div>

              {/* Conditions section */}
              <div className="px-4 py-3">
                <h3
                  className="handwritten text-lg text-center mb-2"
                  style={{ color: 'var(--color-ink)' }}
                >
                  Conditions
                </h3>
                <p
                  className="text-xs text-center mb-3"
                  style={{ color: 'var(--color-ink-faded)' }}
                >
                  What needs to happen?
                </p>

                {/* Conditions list */}
                <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                  {conditions.length === 0 ? (
                    <p className="text-center text-xs italic serif" style={{ color: 'var(--color-ink-faded)' }}>
                      No conditions yet
                    </p>
                  ) : (
                    conditions.map((condition) => (
                      <div
                        key={condition.id}
                        className="flex items-start gap-2 group"
                      >
                        <button
                          onClick={() => onToggleCondition?.(condition.id)}
                          disabled={!isEditable}
                          className="flex-shrink-0 mt-0.5"
                        >
                          <div
                            className="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
                            style={{
                              borderColor: condition.completed ? 'var(--color-zone-center)' : 'var(--color-paper-lines)',
                              backgroundColor: condition.completed ? 'var(--color-zone-center)' : 'transparent',
                            }}
                          >
                            {condition.completed && (
                              <svg viewBox="0 0 24 24" className="w-3 h-3 text-white">
                                <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                            )}
                          </div>
                        </button>
                        <span
                          className={`flex-grow text-sm handwritten ${condition.completed ? 'line-through' : ''}`}
                          style={{ color: condition.completed ? 'var(--color-ink-faded)' : 'var(--color-ink)' }}
                        >
                          {condition.text}
                        </span>
                        {isEditable && (
                          <button
                            onClick={() => onRemoveCondition?.(condition.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            style={{ color: 'var(--color-zone-edge)' }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add condition input */}
                {isEditable && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCondition()}
                      placeholder="Add condition..."
                      className="flex-grow px-2 py-1 rounded text-sm handwritten"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        color: 'var(--color-ink)',
                        border: '1px solid var(--color-paper-lines)',
                      }}
                    />
                    <button
                      onClick={handleAddCondition}
                      disabled={!newCondition.trim()}
                      className="px-2 py-1 rounded text-sm title-display disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--color-brass)',
                        color: 'var(--color-cafe-shadow)',
                      }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coaster with realistic shadow */}
      <div className="table-object">
        <div
          ref={coasterRef}
          className="relative rounded-full select-none"
          style={{
            width: 'min(320px, 80vw)',
            height: 'min(320px, 80vw)',
            cursor: isEditable ? (isDragging ? 'grabbing' : 'grab') : 'default',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Coaster image background */}
          <img
            src="/assets/coaster.png"
            alt="Vintage coaster"
            className="absolute inset-0 w-full h-full rounded-full object-cover pointer-events-none"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
            }}
            draggable={false}
          />

          {/* Zone highlight overlays - subtle glows that work with the vintage design */}
          {/* Off zone indicator */}
          <AnimatePresence>
            {currentZone === 'off' && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  inset: '-12px',
                  border: '3px dashed var(--color-zone-off)',
                  boxShadow: '0 0 20px rgba(90, 74, 74, 0.5)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          {/* Edge zone glow - near the checkered border */}
          <div
            className="absolute inset-[6%] rounded-full transition-all duration-500 pointer-events-none"
            style={{
              boxShadow: currentZone === 'edge'
                ? 'inset 0 0 30px rgba(180, 60, 60, 0.4), 0 0 20px rgba(180, 60, 60, 0.3)'
                : 'none',
            }}
          />

          {/* Middle zone glow - the filigree area */}
          <div
            className="absolute inset-[20%] rounded-full transition-all duration-500 pointer-events-none"
            style={{
              boxShadow: currentZone === 'middle'
                ? 'inset 0 0 25px rgba(201, 169, 98, 0.5), 0 0 15px rgba(201, 169, 98, 0.4)'
                : 'none',
            }}
          />

          {/* Inner zone glow - inside the golden circles */}
          <div
            className="absolute inset-[35%] rounded-full transition-all duration-500 pointer-events-none"
            style={{
              boxShadow: currentZone === 'inner'
                ? 'inset 0 0 20px rgba(181, 199, 122, 0.5), 0 0 12px rgba(181, 199, 122, 0.4)'
                : 'none',
            }}
          />

          {/* Center zone glow - the innermost circle */}
          <div
            className="absolute inset-[48%] rounded-full transition-all duration-500 pointer-events-none"
            style={{
              background: currentZone === 'center'
                ? 'radial-gradient(circle, rgba(124, 181, 144, 0.4) 0%, transparent 70%)'
                : 'none',
              boxShadow: currentZone === 'center'
                ? '0 0 25px rgba(124, 181, 144, 0.6), inset 0 0 15px rgba(124, 181, 144, 0.4)'
                : 'none',
            }}
          />

          {/* Position marker - elegant pin style */}
          <motion.div
            className="absolute pointer-events-none"
            animate={{
              left: `${localPosition.x}%`,
              top: `${localPosition.y}%`,
              scale: isDragging ? 1.15 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: isDragging ? 400 : 250,
              damping: isDragging ? 25 : 30,
            }}
            style={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Pin shadow */}
            <div
              className="absolute rounded-full"
              style={{
                width: '28px',
                height: '28px',
                top: '4px',
                left: '2px',
                background: 'rgba(0,0,0,0.25)',
                filter: 'blur(4px)',
              }}
            />
            {/* Pin body */}
            <div
              className="relative w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(ellipse 60% 40% at 35% 30%, rgba(255,255,255,0.4) 0%, transparent 50%),
                  linear-gradient(145deg, ${zoneData.color} 0%, color-mix(in srgb, ${zoneData.color} 60%, #1a1a1a) 100%)
                `,
                boxShadow: `
                  0 2px 8px rgba(0,0,0,0.3),
                  inset 0 1px 2px rgba(255,255,255,0.4),
                  0 0 12px ${zoneData.color}
                `,
                border: '2px solid rgba(255,255,255,0.8)',
              }}
            >
              <span
                className="text-sm"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                💥
              </span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Zone indicator - only visible when expanded */}
      {isExpanded && (
        <>
          <motion.div
            className="mt-5 text-center"
            animate={{ scale: isDragging ? 1.02 : 1 }}
          >
            <motion.div
              key={currentZone}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="zone-label text-2xl md:text-3xl font-medium"
              style={{
                color: zoneData.color,
                textShadow: `0 0 30px ${zoneData.color}, 0 2px 4px rgba(0,0,0,0.2)`,
              }}
            >
              {zoneData.label}
            </motion.div>
            <p
              className="serif text-sm mt-1 italic"
              style={{ color: 'var(--color-paper-aged)', opacity: 0.9 }}
            >
              {zoneData.description}
            </p>
          </motion.div>

          {/* Edit hint */}
          {isEditable && (
            <motion.p
              className="serif text-xs mt-3 italic"
              style={{ color: 'var(--color-paper-aged)', opacity: 0.6 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.5 }}
            >
              drag to reposition
            </motion.p>
          )}
        </>
      )}

      {/* Position History - visible to the right when coaster is expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute left-full ml-6 top-0 w-64"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Receipt paper style */}
            <div
              className="relative overflow-hidden rounded-lg"
              style={{
                backgroundColor: 'var(--color-paper)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              }}
            >
              {/* Receipt header */}
              <div
                className="px-4 py-3 text-center"
                style={{
                  borderBottom: '2px dashed var(--color-paper-lines)',
                }}
              >
                <h3
                  className="handwritten text-lg"
                  style={{ color: 'var(--color-ink)' }}
                >
                  Position History
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--color-ink-faded)' }}
                >
                  The journey of Julian's standing
                </p>
              </div>

              {/* Timeline entries */}
              <div className="px-4 py-3 max-h-72 overflow-y-auto">
                {positionHistory.length === 0 ? (
                  <div
                    className="text-center py-4 italic serif"
                    style={{ color: 'var(--color-ink-faded)' }}
                  >
                    No history yet
                  </div>
                ) : (
                  (historyExpanded ? positionHistory : positionHistory.slice(0, 5)).map((entry, index, arr) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-6 pb-3 last:pb-0"
                    >
                      {/* Timeline line */}
                      {index < arr.length - 1 && (
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
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-semibold mb-1"
                          style={{
                            backgroundColor: zoneInfo[entry.position.zone].color,
                            color: entry.position.zone === 'off' ? 'white' : 'var(--color-ink)',
                          }}
                        >
                          {zoneInfo[entry.position.zone].label}
                        </span>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--color-ink-faded)' }}
                        >
                          {format(entry.timestamp, 'MMM d, yyyy - h:mm a')}
                        </p>
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

                {/* Show more/less button */}
                {positionHistory.length > 5 && (
                  <button
                    onClick={() => setHistoryExpanded(!historyExpanded)}
                    className="w-full py-2 text-xs transition-colors hover:opacity-80 serif"
                    style={{
                      color: 'var(--color-cork-dark)',
                      borderTop: '1px dashed var(--color-paper-lines)',
                    }}
                  >
                    {historyExpanded ? 'Show less' : `Show ${positionHistory.length - 5} more...`}
                  </button>
                )}
              </div>

              {/* Receipt footer */}
              <div
                className="px-4 py-2 text-center text-xs serif"
                style={{
                  borderTop: '2px dashed var(--color-paper-lines)',
                  color: 'var(--color-ink-faded)',
                }}
              >
                * * * Thank you for your patience * * *
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
