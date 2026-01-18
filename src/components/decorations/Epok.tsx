import React, { useState, useRef, useEffect } from 'react';

interface EpokProps {
  isExpanded?: boolean;
}

interface Snus {
  id: number;
  x: number;
  y: number;
}

export function Epok({ isExpanded = false }: EpokProps) {
  const [snusList, setSnusList] = useState<Snus[]>([]);
  const [activeSnusId, setActiveSnusId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextSnusId = useRef(0);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newSnus: Snus = {
      id: nextSnusId.current++,
      x: clientX - rect.left - 60,
      y: clientY - rect.top - 60,
    };

    setSnusList(prev => [...prev, newSnus]);
    setActiveSnusId(newSnus.id);
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (activeSnusId === null) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newX = clientX - rect.left - 60;
    const newY = clientY - rect.top - 60;

    setSnusList(prev => prev.map(snus =>
      snus.id === activeSnusId
        ? { ...snus, x: newX, y: newY }
        : snus
    ));
  };

  const handleMouseUp = () => {
    setActiveSnusId(null);
  };

  useEffect(() => {
    if (activeSnusId === null) return;

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
  }, [activeSnusId]);

  if (!isExpanded) {
    // Collapsed view - just show the combined epok image
    return (
      <div className="select-none table-object">
        <img
          src="/assets/epok.png"
          alt="Epok"
          className="w-24 h-auto"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
          }}
          draggable={false}
        />
      </div>
    );
  }

  // Expanded view - cap on left, bin on right
  return (
    <div ref={containerRef} className="select-none relative">
      <div className="flex items-end justify-center">
        {/* Epok cap - left side */}
        <img
          src="/assets/epok_cap.png"
          alt="Epok cap"
          style={{
            width: '550px',
            height: 'auto',
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
          }}
          draggable={false}
        />

        {/* Epok bin - right side (click to spawn snus) */}
        <img
          src="/assets/epok_bin.png"
          alt="Epok bin"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          style={{
            width: '550px',
            height: 'auto',
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
            marginLeft: '-200px',
            cursor: 'pointer',
          }}
          draggable={false}
        />
      </div>

      {/* Spawned snus */}
      {snusList.map(snus => (
        <div
          key={snus.id}
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            left: snus.x,
            top: snus.y,
            zIndex: snus.id === activeSnusId ? 20 : 10,
            transform: snus.id === activeSnusId ? 'scale(1.1)' : 'scale(1)',
            transition: snus.id === activeSnusId ? 'none' : 'transform 0.2s',
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveSnusId(snus.id);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setActiveSnusId(snus.id);
          }}
        >
          <img
            src="/assets/epok_solo.png"
            alt="Snus"
            style={{
              width: '180px',
              height: 'auto',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.4))',
            }}
            draggable={false}
          />
        </div>
      ))}

      {/* Hint text or emoji */}
      {snusList.length === 0 ? (
        <p
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 serif text-3xl whitespace-nowrap"
          style={{ color: 'var(--color-paper-aged)', opacity: 0.8 }}
        >
          grab a snus
        </p>
      ) : (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
          <span className="text-7xl">🫣</span>
        </div>
      )}
    </div>
  );
}
