import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface IceCreamAndFriesProps {
  isExpanded?: boolean;
}

interface Fry {
  id: number;
  x: number;
  y: number;
  dipped: boolean;
}

export function IceCreamAndFries({ isExpanded = false }: IceCreamAndFriesProps) {
  const [fries, setFries] = useState<Fry[]>([]);
  const [activeFryId, setActiveFryId] = useState<number | null>(null);
  const iceCreamRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextFryId = useRef(0);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newFry: Fry = {
      id: nextFryId.current++,
      x: clientX - rect.left - 80, // Center the fry on cursor
      y: clientY - rect.top - 80,
      dipped: false,
    };

    setFries(prev => [...prev, newFry]);
    setActiveFryId(newFry.id);
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (activeFryId === null) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const container = containerRef.current;
    const iceCream = iceCreamRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newX = clientX - rect.left - 80;
    const newY = clientY - rect.top - 80;

    // Check if over ice cream (center area only - not edges)
    let isDipped = false;
    if (iceCream) {
      const iceCreamRect = iceCream.getBoundingClientRect();
      // Shrink the detection area to center of ice cream bowl
      const insetX = iceCreamRect.width * 0.3;
      const insetY = iceCreamRect.height * 0.3;
      const fryCenter = {
        x: clientX,
        y: clientY,
      };
      isDipped = (
        fryCenter.x > iceCreamRect.left + insetX &&
        fryCenter.x < iceCreamRect.right - insetX &&
        fryCenter.y > iceCreamRect.top + insetY &&
        fryCenter.y < iceCreamRect.bottom - insetY
      );
    }

    setFries(prev => prev.map(fry =>
      fry.id === activeFryId
        ? { ...fry, x: newX, y: newY, dipped: fry.dipped || isDipped }
        : fry
    ));
  };

  const handleMouseUp = () => {
    setActiveFryId(null);
  };

  // Use effect for event listeners
  useEffect(() => {
    if (activeFryId === null) return;

    const moveHandler = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
    const upHandler = () => handleMouseUp();

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
    window.addEventListener('touchmove', moveHandler);
    window.addEventListener('touchend', upHandler);

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('touchend', upHandler);
    };
  }, [activeFryId]);

  if (!isExpanded) {
    // Collapsed view - just show the combined image at original size
    return (
      <div className="select-none table-object">
        <img
          src="/assets/ice_cream_fries.png"
          alt="Ice cream and fries"
          className="w-40 h-auto md:w-48"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
          }}
          draggable={false}
        />
      </div>
    );
  }

  // Expanded view - ice cream solo and fries solo side by side
  return (
    <div ref={containerRef} className="select-none relative">
      <div className="flex items-end justify-center">
        {/* Ice cream solo - drop zone */}
        <img
          ref={iceCreamRef}
          src="/assets/ice_cream_solo.png"
          alt="Ice cream"
          style={{
            width: '500px',
            height: 'auto',
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
          }}
          draggable={false}
        />

        {/* Fries basket - click and hold to spawn and drag fry */}
        <img
          src="/assets/fries_solo.png"
          alt="Fries"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          style={{
            width: '500px',
            height: 'auto',
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
            marginLeft: '-200px',
            cursor: 'pointer',
          }}
          draggable={false}
        />
      </div>

      {/* Spawned fries */}
      {fries.map(fry => (
        <div
          key={fry.id}
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            left: fry.x,
            top: fry.y,
            zIndex: fry.id === activeFryId ? 20 : 10,
            transform: fry.id === activeFryId ? 'scale(1.1)' : 'scale(1)',
            transition: fry.id === activeFryId ? 'none' : 'transform 0.2s',
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveFryId(fry.id);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setActiveFryId(fry.id);
          }}
        >
          <img
            src={fry.dipped ? '/assets/fry_dipped.png' : '/assets/fry.png'}
            alt={fry.dipped ? 'Dipped fry' : 'Fry'}
            style={{
              width: '160px',
              height: 'auto',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.4))',
              transform: 'scaleX(-1)',
            }}
            draggable={false}
          />
        </div>
      ))}

      {/* Hint text */}
      {fries.length === 0 && (
        <motion.p
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 serif text-2xl whitespace-nowrap"
          style={{ color: 'var(--color-paper-aged)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
        >
          click and drag fries to dip
        </motion.p>
      )}

      {/* Secret message after dipping */}
      {fries.some(fry => fry.dipped) && (
        <motion.div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-5xl">🤫</span>
          <p className="serif text-2xl mt-2" style={{ color: 'var(--color-paper-aged)' }}>
            Nobody will know
          </p>
        </motion.div>
      )}
    </div>
  );
}

export function SecretSnackLabel() {
  return (
    <motion.p
      className="title-display text-sm text-center mt-2"
      style={{ color: 'var(--color-paper-aged)', opacity: 0.7 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ delay: 0.8 }}
    >
      our little secret
    </motion.p>
  );
}

// Legacy exports
export const IceCreamCone = IceCreamAndFries;
export const FriesBasket = () => null;
