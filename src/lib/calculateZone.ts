import type { Zone } from '../types';

// Calculate zone based on distance from center (0-100 scale)
// distance is the percentage from center (0 = center, 100 = edge)
export function calculateZone(distance: number): Zone {
  if (distance <= 15) return 'center';
  if (distance <= 35) return 'inner';
  if (distance <= 55) return 'middle';
  if (distance <= 75) return 'edge';
  return 'off';
}

// Calculate distance from center given x,y coordinates (0-100 scale where 50,50 is center)
export function calculateDistance(x: number, y: number): number {
  const centerX = 50;
  const centerY = 50;
  const dx = x - centerX;
  const dy = y - centerY;
  // Max distance is ~70.7 (diagonal from center to corner), normalize to 0-100
  const distance = Math.sqrt(dx * dx + dy * dy);
  return Math.min(100, (distance / 50) * 100);
}

// Get zone from x,y coordinates
export function getZoneFromPosition(x: number, y: number): Zone {
  const distance = calculateDistance(x, y);
  return calculateZone(distance);
}

// Zone display names and colors
export const zoneInfo: Record<Zone, { label: string; description: string; color: string }> = {
  center: {
    label: 'Perfect',
    description: 'The golden center - all is well',
    color: 'var(--color-zone-center)',
  },
  inner: {
    label: 'Good',
    description: 'In good standing',
    color: 'var(--color-zone-inner)',
  },
  middle: {
    label: 'Neutral',
    description: 'Not great, not terrible',
    color: 'var(--color-zone-middle)',
  },
  edge: {
    label: 'Edge',
    description: 'Hanging on by your humor',
    color: 'var(--color-zone-edge)',
  },
  off: {
    label: 'Off',
    description: 'The point of no return',
    color: 'var(--color-zone-off)',
  },
};
