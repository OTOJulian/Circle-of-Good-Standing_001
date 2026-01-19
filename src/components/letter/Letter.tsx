import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LetterEntry } from '../../types';

interface LetterProps {
  isExpanded: boolean;
  letters: LetterEntry[];
  onAddLetter: (author: 'julian' | 'mahnoor', content: string, title?: string) => void;
}

// Initial letter from Julian (will be added as first letter if none exist)
const initialLetterContent = `Dear Mahnoor,

I wanted to write you something special, something that captures how much you mean to me. But every time I try, words feel insufficient.

So instead, I made this.

---

This little corner of the internet is yours. A place where I can show you, not just tell you, how I feel.

Every song in that playlist reminds me of you. Every detail here was chosen with you in mind.

---

You've changed my life in ways I'm still discovering. Your laugh, your kindness, the way you see the world - it all makes everything brighter.

Thank you for being you.

With all my love,
Julian`;

// ~700 chars per page - must split before visual overflow
const MAX_CHARS_PER_PAGE = 700;

// Split a long text block at sentence boundaries
function splitAtSentences(text: string): string[] {
  if (text.length <= MAX_CHARS_PER_PAGE) {
    return [text];
  }

  const pages: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHARS_PER_PAGE) {
      pages.push(remaining.trim());
      break;
    }

    // Find a good break point - look for sentence endings near the limit
    let breakPoint = MAX_CHARS_PER_PAGE;

    // Search backwards from the limit to find a sentence ending
    const searchStart = Math.min(remaining.length, MAX_CHARS_PER_PAGE);
    const searchEnd = Math.max(0, MAX_CHARS_PER_PAGE - 200); // Don't go too far back

    let foundBreak = false;
    for (let i = searchStart; i >= searchEnd; i--) {
      const char = remaining[i];
      // Look for sentence endings followed by space
      if ((char === '.' || char === '!' || char === '?') &&
          (i + 1 >= remaining.length || remaining[i + 1] === ' ' || remaining[i + 1] === '\n')) {
        breakPoint = i + 1;
        foundBreak = true;
        break;
      }
    }

    // If no sentence break found, try to break at a space
    if (!foundBreak) {
      for (let i = searchStart; i >= searchEnd; i--) {
        if (remaining[i] === ' ') {
          breakPoint = i;
          foundBreak = true;
          break;
        }
      }
    }

    // If still no break found, just hard break at the limit
    if (!foundBreak) {
      breakPoint = MAX_CHARS_PER_PAGE;
    }

    pages.push(remaining.slice(0, breakPoint).trim());
    remaining = remaining.slice(breakPoint).trim();
  }

  return pages;
}

// Split content into pages by "---" delimiter or by character count
function splitIntoPages(content: string): string[] {
  // First handle explicit '---' page breaks
  if (content.includes('---')) {
    const explicitPages = content.split('---').map(page => page.trim()).filter(page => page.length > 0);
    // Recursively split any explicit pages that are still too long
    const result: string[] = [];
    for (const page of explicitPages) {
      result.push(...splitAtSentences(page));
    }
    return result;
  }

  // For content without explicit breaks, first try paragraph splitting
  const paragraphs = content.split('\n\n');

  if (paragraphs.length > 1) {
    // Has paragraph breaks - group paragraphs into pages
    const pages: string[] = [];
    let currentPage = '';

    for (const para of paragraphs) {
      const potentialPage = currentPage + (currentPage ? '\n\n' : '') + para;

      if (potentialPage.length > MAX_CHARS_PER_PAGE && currentPage.length > 100) {
        // Current page is substantial, push it and start new page with this para
        pages.push(...splitAtSentences(currentPage.trim()));
        currentPage = para;
      } else {
        currentPage = potentialPage;
      }
    }

    if (currentPage.trim()) {
      pages.push(...splitAtSentences(currentPage.trim()));
    }

    return pages.length > 0 ? pages : [content];
  }

  // No paragraph breaks - split at sentences
  return splitAtSentences(content);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function Letter({ isExpanded, letters, onAddLetter }: LetterProps) {
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isWriting, setIsWriting] = useState(false);
  const [newLetterContent, setNewLetterContent] = useState('');
  const [newLetterTitle, setNewLetterTitle] = useState('');
  const [newLetterAuthor, setNewLetterAuthor] = useState<'julian' | 'mahnoor'>('julian');

  // Use letters from props, or show initial letter if none exist
  const displayLetters: LetterEntry[] = letters.length > 0 ? letters : [{
    id: 'initial',
    author: 'julian',
    content: initialLetterContent,
    createdAt: new Date('2025-06-28T16:11:00'),
    title: 'Welcome',
  }];

  // Select first letter by default
  useEffect(() => {
    if (isExpanded && !selectedLetterId && displayLetters.length > 0) {
      setSelectedLetterId(displayLetters[0].id);
    }
  }, [isExpanded, selectedLetterId, displayLetters]);

  // Reset state when collapsed
  useEffect(() => {
    if (!isExpanded) {
      setCurrentPage(0);
      setIsWriting(false);
      setNewLetterContent('');
      setNewLetterTitle('');
      setNewLetterAuthor('julian');
    }
  }, [isExpanded]);

  const selectedLetter = displayLetters.find(l => l.id === selectedLetterId);
  const letterPages = selectedLetter ? splitIntoPages(selectedLetter.content) : [];

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftSide = clickX < rect.width / 2;

    if (isLeftSide) {
      setCurrentPage((prev) => (prev - 1 + letterPages.length) % letterPages.length);
    } else {
      setCurrentPage((prev) => (prev + 1) % letterPages.length);
    }
  };

  const handleSelectLetter = (letterId: string) => {
    setSelectedLetterId(letterId);
    setCurrentPage(0);
  };

  const handleSubmitLetter = () => {
    if (newLetterContent.trim()) {
      onAddLetter(newLetterAuthor, newLetterContent.trim(), newLetterTitle.trim() || undefined);
      setNewLetterContent('');
      setNewLetterTitle('');
      setNewLetterAuthor('julian');
      setIsWriting(false);
    }
  };

  if (!isExpanded) {
    // Collapsed view - just show envelope with notification badge
    return (
      <div className="select-none relative">
        <img
          src="/assets/letter.png"
          alt="Letter envelope"
          className="w-48 h-auto md:w-56"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
          }}
          draggable={false}
        />
        {/* Red notification badge */}
        <div
          className="absolute top-8 right-10 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: '#FF3B30',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            border: '2.5px solid white',
          }}
        >
          <span className="text-white text-sm font-bold">{displayLetters.length}</span>
        </div>
      </div>
    );
  }

  // Expanded view - two panel layout
  return (
    <div
      className="select-none flex gap-6"
      style={{ width: '750px', height: '520px' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left Panel - Letter List */}
      <div
        className="flex flex-col rounded-lg overflow-hidden"
        style={{
          width: '220px',
          background: 'rgba(244, 236, 216, 0.95)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div
          className="p-4"
          style={{ borderBottom: '1px solid var(--color-paper-lines)' }}
        >
          <h3 className="title-display text-lg" style={{ color: 'var(--color-ink)' }}>
            Letters
          </h3>
        </div>

        {/* New Letter Button */}
        <div className="p-3">
          <motion.button
            className="w-full py-2 px-3 rounded-lg serif text-sm"
            style={{
              background: 'linear-gradient(145deg, var(--color-brass-shine), var(--color-brass))',
              color: 'var(--color-cafe-shadow)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsWriting(true)}
          >
            + Write New Letter
          </motion.button>
        </div>

        {/* Letter List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {displayLetters.map((letter) => (
            <motion.div
              key={letter.id}
              className="p-3 rounded-lg cursor-pointer"
              style={{
                background: selectedLetterId === letter.id
                  ? 'rgba(180, 140, 90, 0.2)'
                  : 'rgba(255, 255, 255, 0.5)',
                border: selectedLetterId === letter.id
                  ? '1px solid var(--color-brass)'
                  : '1px solid transparent',
              }}
              whileHover={{
                background: 'rgba(180, 140, 90, 0.15)',
              }}
              onClick={() => handleSelectLetter(letter.id)}
            >
              <p className="serif text-xs font-medium" style={{ color: 'var(--color-ink)' }}>
                From {letter.author === 'julian' ? 'Julian' : 'Mahnoor'}
              </p>
              <p className="serif text-xs mt-1" style={{ color: 'var(--color-ink-faded)' }}>
                {formatDate(letter.createdAt)}
              </p>
              {letter.title && (
                <p className="serif text-xs mt-1 italic truncate" style={{ color: 'var(--color-ink-faded)' }}>
                  "{letter.title}"
                </p>
              )}
              <p className="serif text-xs mt-1 truncate" style={{ color: 'var(--color-ink-faded)' }}>
                {letter.content.slice(0, 50)}...
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Panel - Letter Reader or Write Modal */}
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          {isWriting ? (
            // Write New Letter Modal
            <motion.div
              key="write"
              className="absolute inset-0 rounded-lg flex flex-col"
              style={{
                background: 'linear-gradient(180deg, rgba(244, 236, 216, 1) 0%, rgba(232, 220, 196, 1) 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="p-6 flex flex-col h-full">
                {/* Header */}
                <div
                  className="flex justify-between items-center mb-4 pb-3"
                  style={{ borderBottom: '1px solid var(--color-paper-lines)' }}
                >
                  <h3 className="title-display text-lg" style={{ color: 'var(--color-ink)' }}>
                    New Letter
                  </h3>
                  <button
                    className="serif text-sm px-3 py-1 rounded"
                    style={{ color: 'var(--color-ink-faded)' }}
                    onClick={() => setIsWriting(false)}
                  >
                    Cancel
                  </button>
                </div>

                {/* Title Input */}
                <input
                  type="text"
                  placeholder="Title (optional)"
                  value={newLetterTitle}
                  onChange={(e) => setNewLetterTitle(e.target.value)}
                  className="w-full px-3 py-2 mb-3 rounded serif text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid var(--color-paper-lines)',
                    color: 'var(--color-ink)',
                  }}
                />

                {/* Content Textarea */}
                <textarea
                  placeholder="Write your letter here... Use '---' to create page breaks."
                  value={newLetterContent}
                  onChange={(e) => setNewLetterContent(e.target.value)}
                  className="flex-1 w-full px-3 py-3 rounded serif text-sm resize-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid var(--color-paper-lines)',
                    color: 'var(--color-ink)',
                    lineHeight: '1.8',
                  }}
                />

                {/* Footer */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="serif text-xs" style={{ color: 'var(--color-ink-faded)' }}>From:</span>
                    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-paper-lines)' }}>
                      <button
                        className="px-3 py-1 serif text-xs transition-colors"
                        style={{
                          background: newLetterAuthor === 'julian' ? 'var(--color-brass)' : 'transparent',
                          color: newLetterAuthor === 'julian' ? 'var(--color-cafe-shadow)' : 'var(--color-ink-faded)',
                        }}
                        onClick={() => setNewLetterAuthor('julian')}
                      >
                        Julian
                      </button>
                      <button
                        className="px-3 py-1 serif text-xs transition-colors"
                        style={{
                          background: newLetterAuthor === 'mahnoor' ? 'var(--color-brass)' : 'transparent',
                          color: newLetterAuthor === 'mahnoor' ? 'var(--color-cafe-shadow)' : 'var(--color-ink-faded)',
                        }}
                        onClick={() => setNewLetterAuthor('mahnoor')}
                      >
                        Mahnoor
                      </button>
                    </div>
                  </div>
                  <motion.button
                    className="py-2 px-6 rounded-lg serif text-sm"
                    style={{
                      background: newLetterContent.trim()
                        ? 'linear-gradient(145deg, var(--color-brass-shine), var(--color-brass))'
                        : 'rgba(180, 140, 90, 0.3)',
                      color: newLetterContent.trim() ? 'var(--color-cafe-shadow)' : 'var(--color-ink-faded)',
                      boxShadow: newLetterContent.trim() ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    }}
                    whileHover={newLetterContent.trim() ? { scale: 1.02 } : {}}
                    whileTap={newLetterContent.trim() ? { scale: 0.98 } : {}}
                    onClick={handleSubmitLetter}
                    disabled={!newLetterContent.trim()}
                  >
                    Send Letter
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : selectedLetter ? (
            // Letter Reader - Stacked Pages
            <motion.div
              key="read"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {letterPages.map((content, index) => {
                const isCurrentPage = index === currentPage;
                const distanceFromCurrent = (index - currentPage + letterPages.length) % letterPages.length;
                const offset = distanceFromCurrent * 4;
                const rotation = distanceFromCurrent * 0.8;
                const zIndex = letterPages.length - distanceFromCurrent;

                return (
                  <motion.div
                    key={index}
                    className="absolute inset-0 rounded-lg cursor-pointer"
                    style={{
                      zIndex,
                      background: `linear-gradient(180deg,
                        rgba(244, 236, 216, 1) 0%,
                        rgba(232, 220, 196, 1) 100%
                      )`,
                      boxShadow: isCurrentPage
                        ? '0 8px 32px rgba(0,0,0,0.3)'
                        : '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                    animate={{
                      x: offset,
                      y: offset,
                      rotate: rotation,
                      scale: isCurrentPage ? 1 : 0.98,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                    }}
                    onClick={isCurrentPage ? handlePageClick : undefined}
                    whileHover={isCurrentPage ? { scale: 1.02 } : {}}
                    whileTap={isCurrentPage ? { scale: 0.98 } : {}}
                  >
                    <div className="p-8 h-full flex flex-col">
                      {/* Decorative header */}
                      <div
                        className="text-center mb-4 pb-3"
                        style={{ borderBottom: '1px solid var(--color-paper-lines)' }}
                      >
                        <p className="serif text-xs" style={{ color: 'var(--color-ink-faded)' }}>
                          From {selectedLetter.author === 'julian' ? 'Julian' : 'Mahnoor'}
                          {selectedLetter.title && ` — "${selectedLetter.title}"`}
                        </p>
                      </div>

                      {/* Letter text */}
                      <div
                        className="flex-1 typewriter text-base whitespace-pre-wrap overflow-hidden"
                        style={{
                          color: 'var(--color-ink)',
                          lineHeight: '1.8',
                        }}
                      >
                        {content}
                      </div>

                      {/* Page indicator - minimal footprint */}
                      {letterPages.length > 1 && isCurrentPage && (
                        <p
                          className="serif text-xs text-center mt-1"
                          style={{ color: 'var(--color-ink-faded)', opacity: 0.6 }}
                        >
                          {index + 1} / {letterPages.length}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            // No letter selected
            <div
              className="absolute inset-0 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(244, 236, 216, 0.5)',
              }}
            >
              <p className="serif text-sm italic" style={{ color: 'var(--color-ink-faded)' }}>
                Select a letter to read
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
