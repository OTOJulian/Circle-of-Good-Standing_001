import { useState, useEffect, useCallback } from 'react';
import type { CircleInstance, AccessMode } from '../types';
import {
  getCircleByToken,
  updatePosition,
  addBirthdayItem,
  removeBirthdayItem,
  toggleBirthdayItem,
  addLetter,
  createCircle,
  getShareUrls,
  addCondition,
  removeCondition,
  toggleCondition,
} from '../lib/storage';

interface UseCircleResult {
  circle: CircleInstance | null;
  mode: AccessMode;
  isEditable: boolean;
  updateMarkerPosition: (x: number, y: number, note?: string) => void;
  addItem: (text: string) => void;
  removeItem: (itemId: string) => void;
  toggleItem: (itemId: string) => void;
  addNewLetter: (author: 'julian' | 'mahnoor', content: string, title?: string) => void;
  addConditionItem: (text: string) => void;
  removeConditionItem: (conditionId: string) => void;
  toggleConditionItem: (conditionId: string) => void;
  shareUrls: { editUrl: string; viewUrl: string } | null;
}

export function useCircle(token: string | undefined): UseCircleResult {
  const [circle, setCircle] = useState<CircleInstance | null>(null);
  const [mode, setMode] = useState<AccessMode>('loading');

  useEffect(() => {
    if (!token) {
      setMode('not-found');
      return;
    }

    const result = getCircleByToken(token);
    if (result) {
      setCircle(result.circle);
      setMode(result.mode);
    } else {
      setMode('not-found');
    }
  }, [token]);

  const updateMarkerPosition = useCallback((x: number, y: number, note?: string) => {
    if (!circle || mode !== 'edit') return;
    const updated = updatePosition(circle.id, x, y, note);
    if (updated) setCircle(updated);
  }, [circle, mode]);

  const addItem = useCallback((text: string) => {
    if (!circle || mode !== 'edit') return;
    const updated = addBirthdayItem(circle.id, text);
    if (updated) setCircle(updated);
  }, [circle, mode]);

  const removeItem = useCallback((itemId: string) => {
    if (!circle || mode !== 'edit') return;
    const updated = removeBirthdayItem(circle.id, itemId);
    if (updated) setCircle(updated);
  }, [circle, mode]);

  const toggleItem = useCallback((itemId: string) => {
    if (!circle || mode !== 'edit') return;
    const updated = toggleBirthdayItem(circle.id, itemId);
    if (updated) setCircle(updated);
  }, [circle, mode]);

  // Both edit and view modes can add letters
  const addNewLetter = useCallback((author: 'julian' | 'mahnoor', content: string, title?: string) => {
    if (!circle) return;
    const updated = addLetter(circle.id, author, content, title);
    if (updated) setCircle(updated);
  }, [circle]);

  const addConditionItem = useCallback((text: string) => {
    if (!circle || mode !== 'edit') return;
    const updated = addCondition(circle.id, text);
    if (updated) setCircle(updated);
  }, [circle, mode]);

  const removeConditionItem = useCallback((conditionId: string) => {
    if (!circle || mode !== 'edit') return;
    const updated = removeCondition(circle.id, conditionId);
    if (updated) setCircle(updated);
  }, [circle, mode]);

  const toggleConditionItem = useCallback((conditionId: string) => {
    if (!circle || mode !== 'edit') return;
    const updated = toggleCondition(circle.id, conditionId);
    if (updated) setCircle(updated);
  }, [circle, mode]);

  const shareUrls = circle ? getShareUrls(circle) : null;

  return {
    circle,
    mode,
    isEditable: mode === 'edit',
    updateMarkerPosition,
    addItem,
    removeItem,
    toggleItem,
    addNewLetter,
    addConditionItem,
    removeConditionItem,
    toggleConditionItem,
    shareUrls,
  };
}

// Hook for creating a new circle
export function useCreateCircle() {
  const [circle, setCircle] = useState<CircleInstance | null>(null);

  const create = useCallback(() => {
    const newCircle = createCircle();
    setCircle(newCircle);
    return newCircle;
  }, []);

  return { circle, create };
}
