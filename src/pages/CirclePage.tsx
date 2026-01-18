import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { CafeTable } from '../components/layout/CafeTable';
import { Coaster } from '../components/coaster/Coaster';
import { BirthdayList } from '../components/birthday-list/BirthdayList';
import { Letter } from '../components/letter/Letter';
import { IceCreamAndFries } from '../components/decorations/IceCreamFries';
import { Epok } from '../components/decorations/Epok';
import { Phone } from '../components/decorations/Phone';
import { useCircle } from '../hooks/useCircle';

type ExpandedItem = 'coaster' | 'birthday' | 'letter' | 'snacks' | 'epok' | 'phone' | null;

export function CirclePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState<ExpandedItem>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Motion values for each draggable item - these don't cause re-renders
  const coasterX = useMotionValue(30);
  const coasterY = useMotionValue(-60);
  const birthdayX = useMotionValue(-130);
  const birthdayY = useMotionValue(-40);
  const snacksX = useMotionValue(100);
  const snacksY = useMotionValue(-200);
  const letterX = useMotionValue(160);
  const letterY = useMotionValue(50);
  const wineX = useMotionValue(-100);
  const wineY = useMotionValue(-140);
  const wine2X = useMotionValue(110);
  const wine2Y = useMotionValue(-60);
  const phoneX = useMotionValue(-20);
  const phoneY = useMotionValue(90);
  const epokX = useMotionValue(-80);
  const epokY = useMotionValue(-230);

  const {
    circle,
    mode,
    isEditable,
    updateMarkerPosition,
    addItem,
    removeItem,
    toggleItem,
    addNewLetter,
    addConditionItem,
    removeConditionItem,
    toggleConditionItem,
    shareUrls,
  } = useCircle(token);

  // Auto-redirect to home (which creates a new table) when circle not found
  useEffect(() => {
    if (mode === 'not-found') {
      navigate('/', { replace: true });
    }
  }, [mode, navigate]);

  if (mode === 'loading' || mode === 'not-found') {
    return (
      <CafeTable>
        <div className="flex items-center justify-center h-full">
          <motion.div
            className="title-display text-2xl"
            style={{ color: 'var(--color-paper)' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            finding your table...
          </motion.div>
        </div>
      </CafeTable>
    );
  }

  // This shouldn't render, but safety fallback
  if (!circle) {
    return null;
  }

  return (
    <CafeTable>
      <div className="h-full flex flex-col relative">
        {/* Title */}
        <motion.header
          className="text-center mb-4 md:mb-6 opacity-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
        >
          <h1 className="title-display text-xl md:text-2xl" style={{ color: 'var(--color-ink)' }}>
            Circle of Good Standing
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="serif text-xs italic" style={{ color: 'var(--color-ink-faded)' }}>
              — Mahnoor's judgement —
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs serif"
              style={{
                backgroundColor: isEditable ? 'var(--color-zone-center)' : 'var(--color-paper-aged)',
                color: 'var(--color-ink)',
              }}
            >
              {isEditable ? 'editing' : 'viewing'}
            </span>
          </div>
        </motion.header>

        {/* Table surface with all items */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* Backdrop when any item is expanded */}
          <AnimatePresence>
            {expandedItem && (
              <motion.div
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(26, 15, 10, 0.9)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setExpandedItem(null)}
              />
            )}
          </AnimatePresence>

          {/* Floating hint - positioned off to the side */}
          <AnimatePresence>
            {showHint && !expandedItem && (
              <motion.div
                className="fixed top-[38%] left-[65%] z-30 pointer-events-auto cursor-pointer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
                onClick={() => setShowHint(false)}
              >
                {/* Arrow pointing toward wine glass */}
                <motion.svg
                  className="absolute -left-14 top-1/2 -translate-y-1/2 w-14 h-12"
                  viewBox="0 0 80 48"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  {/* Simple curved line going left */}
                  <path
                    d="M76 24 Q40 24 8 28"
                    fill="none"
                    stroke="#1a0f0a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Arrow head pointing left */}
                  <path
                    d="M8 28 L16 20 M8 28 L16 36"
                    fill="none"
                    stroke="#1a0f0a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </motion.svg>

                <div
                  className="px-5 py-3 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(26, 15, 10, 0.9)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    border: '1px solid var(--color-brass)',
                  }}
                >
                  <p className="serif text-base" style={{ color: 'var(--color-paper)' }}>
                    Move the wine glass<br />and click on the coaster
                  </p>
                  <p className="serif text-xs mt-2 italic" style={{ color: 'var(--color-paper-aged)' }}>
                    tap to dismiss
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Items arranged on table */}
          <div className="relative w-full max-w-xl aspect-square flex items-center justify-center">

            {/* Center: Coaster */}
            <motion.div
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                zIndex: expandedItem === 'coaster' ? 50 : 3,
                x: expandedItem === 'coaster' ? 0 : coasterX,
                y: expandedItem === 'coaster' ? 0 : coasterY,
              }}
              drag={!expandedItem}
              dragMomentum={false}
              onDragStart={() => { setIsDragging(true); setShowHint(false); }}
              onDragEnd={() => {
                setTimeout(() => setIsDragging(false), 50);
              }}
              onClick={() => { if (!expandedItem && !isDragging) { setExpandedItem('coaster'); setShowHint(false); } }}
              animate={expandedItem === 'coaster' ? {
                scale: 1.2,
              } : {
                scale: 0.5,
              }}
              whileHover={!expandedItem ? { scale: 0.55 } : {}}
              whileDrag={{ scale: 0.55, zIndex: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <Coaster
                position={circle.currentPosition}
                isEditable={isEditable && expandedItem === 'coaster'}
                onPositionChange={updateMarkerPosition}
                isExpanded={expandedItem === 'coaster'}
                positionHistory={circle.positionHistory}
                conditions={circle.conditions}
                onAddCondition={addConditionItem}
                onRemoveCondition={removeConditionItem}
                onToggleCondition={toggleConditionItem}
              />
              {expandedItem === 'coaster' && (
                <CloseButton onClick={() => setExpandedItem(null)} />
              )}
            </motion.div>

            {/* Top left: Birthday List */}
            <motion.div
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                zIndex: expandedItem === 'birthday' ? 50 : 2,
                x: expandedItem === 'birthday' ? 0 : birthdayX,
                y: expandedItem === 'birthday' ? 0 : birthdayY,
              }}
              drag={!expandedItem}
              dragMomentum={false}
              onDragStart={() => { setIsDragging(true); setShowHint(false); }}
              onDragEnd={() => {
                setTimeout(() => setIsDragging(false), 50);
              }}
              onClick={() => !expandedItem && !isDragging && setExpandedItem('birthday')}
              animate={expandedItem === 'birthday' ? {
                scale: 1.1,
                rotate: 0,
              } : {
                scale: 0.5,
                rotate: -4,
              }}
              whileHover={!expandedItem ? { scale: 0.55, rotate: -2 } : {}}
              whileDrag={{ scale: 0.55, rotate: 0, zIndex: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <BirthdayList
                items={circle.birthdayList}
                isEditable={isEditable && expandedItem === 'birthday'}
                isExpanded={expandedItem === 'birthday'}
                onAdd={addItem}
                onRemove={removeItem}
                onToggle={toggleItem}
              />
              {expandedItem === 'birthday' && (
                <CloseButton onClick={() => setExpandedItem(null)} />
              )}
            </motion.div>

            {/* Top right: Ice cream and fries (interactive, draggable) */}
            <motion.div
              className={expandedItem === 'snacks'
                ? "fixed inset-0 flex items-center justify-center cursor-default"
                : "absolute cursor-grab active:cursor-grabbing"}
              style={{
                zIndex: expandedItem === 'snacks' ? 50 : 4,
                x: expandedItem === 'snacks' ? 0 : snacksX,
                y: expandedItem === 'snacks' ? 0 : snacksY,
              }}
              drag={!expandedItem}
              dragMomentum={false}
              onDragStart={() => { setIsDragging(true); setShowHint(false); }}
              onDragEnd={() => {
                setTimeout(() => setIsDragging(false), 50);
              }}
              onClick={() => { if (!expandedItem && !isDragging) { setExpandedItem('snacks'); setShowHint(false); } }}
              animate={expandedItem === 'snacks' ? {
                scale: 1,
                rotate: 0,
              } : {
                scale: 1.3,
                rotate: 2,
              }}
              whileHover={!expandedItem ? { scale: 1.35 } : {}}
              whileDrag={{ scale: 1.4, rotate: 0, zIndex: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="relative">
                <IceCreamAndFries isExpanded={expandedItem === 'snacks'} />
                {expandedItem === 'snacks' && (
                  <CloseButton onClick={() => setExpandedItem(null)} />
                )}
              </div>
            </motion.div>

            {/* Bottom right: Wine (decorative, draggable) */}
            <motion.div
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                zIndex: 4,
                x: wineX,
                y: wineY,
              }}
              drag
              dragMomentum={false}
              onDragStart={() => setShowHint(false)}
              animate={{
                scale: 1.4,
                rotate: -2,
              }}
              whileHover={{ scale: 1.45 }}
              whileDrag={{ scale: 1.5, rotate: 0, zIndex: 10 }}
            >
              <img
                src="/assets/wine.png"
                alt="Wine glass"
                className="w-32 h-auto"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                }}
                draggable={false}
              />
            </motion.div>

            {/* Second wine glass (decorative, draggable) */}
            <motion.div
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                zIndex: 4,
                x: wine2X,
                y: wine2Y,
              }}
              drag
              dragMomentum={false}
              onDragStart={() => setShowHint(false)}
              animate={{
                scale: 1.4,
                rotate: 3,
              }}
              whileHover={{ scale: 1.45 }}
              whileDrag={{ scale: 1.5, rotate: 0, zIndex: 10 }}
            >
              <img
                src="/assets/wine.png"
                alt="Wine glass"
                className="w-32 h-auto"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                }}
                draggable={false}
              />
            </motion.div>

            {/* Epok (expandable, draggable) */}
            <motion.div
              className={expandedItem === 'epok'
                ? "fixed inset-0 flex items-center justify-center cursor-default"
                : "absolute cursor-grab active:cursor-grabbing"}
              style={{
                zIndex: expandedItem === 'epok' ? 50 : 4,
                x: expandedItem === 'epok' ? 0 : epokX,
                y: expandedItem === 'epok' ? 0 : epokY,
              }}
              drag={!expandedItem}
              dragMomentum={false}
              onDragStart={() => { setIsDragging(true); setShowHint(false); }}
              onDragEnd={() => {
                setTimeout(() => setIsDragging(false), 50);
              }}
              onClick={() => { if (!expandedItem && !isDragging) { setExpandedItem('epok'); setShowHint(false); } }}
              animate={expandedItem === 'epok' ? {
                scale: 1,
                rotate: 0,
              } : {
                scale: 1.3,
                rotate: 90,
              }}
              whileHover={!expandedItem ? { scale: 1.35 } : {}}
              whileDrag={{ scale: 1.4, rotate: 85, zIndex: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="relative">
                <Epok isExpanded={expandedItem === 'epok'} />
                {expandedItem === 'epok' && (
                  <CloseButton onClick={() => setExpandedItem(null)} />
                )}
              </div>
            </motion.div>

            {/* Phone (expandable, draggable) */}
            <motion.div
              className={expandedItem === 'phone'
                ? "fixed inset-0 flex items-center justify-center cursor-default"
                : "absolute cursor-grab active:cursor-grabbing"}
              style={{
                zIndex: expandedItem === 'phone' ? 50 : 4,
                x: expandedItem === 'phone' ? 0 : phoneX,
                y: expandedItem === 'phone' ? 0 : phoneY,
              }}
              drag={!expandedItem}
              dragMomentum={false}
              onDragStart={() => { setIsDragging(true); setShowHint(false); }}
              onDragEnd={() => {
                setTimeout(() => setIsDragging(false), 50);
              }}
              onClick={() => { if (!expandedItem && !isDragging) { setExpandedItem('phone'); setShowHint(false); } }}
              animate={expandedItem === 'phone' ? {
                scale: 1,
                rotate: 0,
              } : {
                scale: 1.2,
                rotate: 90,
              }}
              whileHover={!expandedItem ? { scale: 1.25 } : {}}
              whileDrag={{ scale: 1.3, rotate: 85, zIndex: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="relative">
                <Phone isExpanded={expandedItem === 'phone'} />
                {expandedItem === 'phone' && (
                  <CloseButton onClick={() => setExpandedItem(null)} />
                )}
              </div>
            </motion.div>

            {/* Bottom left: Letter */}
            <motion.div
              className={expandedItem === 'letter'
                ? "fixed inset-0 flex items-center justify-center cursor-default"
                : "absolute cursor-grab active:cursor-grabbing"}
              style={{
                zIndex: expandedItem === 'letter' ? 50 : 2,
                x: expandedItem === 'letter' ? 0 : letterX,
                y: expandedItem === 'letter' ? 0 : letterY,
              }}
              drag={!expandedItem}
              dragMomentum={false}
              onDragStart={() => { setIsDragging(true); setShowHint(false); }}
              onDragEnd={() => {
                setTimeout(() => setIsDragging(false), 50);
              }}
              onClick={() => { if (!expandedItem && !isDragging) { setExpandedItem('letter'); setShowHint(false); } }}
              animate={expandedItem === 'letter' ? {
                scale: 1,
                rotate: 0,
              } : {
                scale: 0.7,
                rotate: -3,
              }}
              whileHover={!expandedItem ? { scale: 0.75, rotate: 0 } : {}}
              whileDrag={{ scale: 0.75, rotate: 0, zIndex: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="relative">
                <Letter
                  isExpanded={expandedItem === 'letter'}
                  letters={circle.letters}
                  onAddLetter={addNewLetter}
                />
                {expandedItem === 'letter' && (
                  <CloseButton onClick={() => setExpandedItem(null)} />
                )}
              </div>
            </motion.div>

          </div>
        </div>

        {/* Share URLs - fixed bottom left */}
        <AnimatePresence>
          {isEditable && shareUrls && !expandedItem && (
            <motion.div
              className="fixed bottom-4 left-4 p-4 rounded-lg max-w-xs z-20"
              style={{
                backgroundColor: 'var(--color-paper)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="title-display text-lg mb-3 text-center" style={{ color: 'var(--color-ink)' }}>
                share the table
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="serif block mb-1" style={{ color: 'var(--color-ink-faded)' }}>
                    your private link:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrls.editUrl}
                      className="flex-grow px-2 py-1.5 rounded serif truncate"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        color: 'var(--color-ink)',
                        border: '1px solid var(--color-paper-lines)',
                      }}
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(shareUrls.editUrl)}
                      className="px-3 py-1.5 rounded serif"
                      style={{ backgroundColor: 'var(--color-brass)', color: 'var(--color-cafe-shadow)' }}
                    >
                      copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="serif block mb-1" style={{ color: 'var(--color-ink-faded)' }}>
                    Julian's link:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrls.viewUrl}
                      className="flex-grow px-2 py-1.5 rounded serif truncate"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        color: 'var(--color-ink)',
                        border: '1px solid var(--color-paper-lines)',
                      }}
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(shareUrls.viewUrl)}
                      className="px-3 py-1.5 rounded serif"
                      style={{ backgroundColor: 'var(--color-brass)', color: 'var(--color-cafe-shadow)' }}
                    >
                      copy
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          className="text-center mt-4 serif text-xs italic"
          style={{ color: 'var(--color-paper-aged)', opacity: 0.4 }}
        >
          Paris, May 2025
        </motion.footer>
      </div>
    </CafeTable>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      className="absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center z-50"
      style={{
        background: 'linear-gradient(145deg, var(--color-brass-shine), var(--color-brass))',
        color: 'var(--color-cafe-shadow)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
        />
      </svg>
    </motion.button>
  );
}
