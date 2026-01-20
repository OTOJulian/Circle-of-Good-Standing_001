import { useState, useEffect, useCallback } from 'react';
import type { CircleInstance, AccessMode } from '../types';
import {
  getCircleByToken,
  subscribeToCircle,
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
  isLoading: boolean;
  updateMarkerPosition: (x: number, y: number, note?: string) => Promise<void>;
  addItem: (text: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  toggleItem: (itemId: string) => Promise<void>;
  addNewLetter: (author: 'julian' | 'mahnoor', content: string, title?: string) => Promise<void>;
  addConditionItem: (text: string) => Promise<void>;
  removeConditionItem: (conditionId: string) => Promise<void>;
  toggleConditionItem: (conditionId: string) => Promise<void>;
  shareUrls: { editUrl: string; viewUrl: string } | null;
}

export function useCircle(token: string | undefined): UseCircleResult {
  const [circle, setCircle] = useState<CircleInstance | null>(null);
  const [mode, setMode] = useState<AccessMode>('loading');
  const [isLoading, setIsLoading] = useState(true);

  // Initial load and real-time subscription
  useEffect(() => {
    if (!token) {
      setMode('not-found');
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    async function loadCircle() {
      try {
        const result = await getCircleByToken(token!);
        if (result) {
          setCircle(result.circle);
          setMode(result.mode);

          // Subscribe to real-time updates
          unsubscribe = subscribeToCircle(result.circle.id, (updatedCircle) => {
            if (updatedCircle) {
              setCircle(updatedCircle);
            }
          });
        } else {
          setMode('not-found');
        }
      } catch (error) {
        console.error('Error loading circle:', error);
        setMode('not-found');
      } finally {
        setIsLoading(false);
      }
    }

    loadCircle();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [token]);

  const updateMarkerPosition = useCallback(async (x: number, y: number, note?: string) => {
    if (!circle || mode !== 'edit') return;
    await updatePosition(circle.id, x, y, note);
    // Real-time subscription will update the state
  }, [circle, mode]);

  const addItem = useCallback(async (text: string) => {
    if (!circle || mode !== 'edit') return;
    await addBirthdayItem(circle.id, text);
  }, [circle, mode]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!circle || mode !== 'edit') return;
    await removeBirthdayItem(circle.id, itemId);
  }, [circle, mode]);

  const toggleItem = useCallback(async (itemId: string) => {
    if (!circle || mode !== 'edit') return;
    await toggleBirthdayItem(circle.id, itemId);
  }, [circle, mode]);

  // Both edit and view modes can add letters
  const addNewLetter = useCallback(async (author: 'julian' | 'mahnoor', content: string, title?: string) => {
    if (!circle) return;
    await addLetter(circle.id, author, content, title);
  }, [circle]);

  const addConditionItem = useCallback(async (text: string) => {
    if (!circle || mode !== 'edit') return;
    await addCondition(circle.id, text);
  }, [circle, mode]);

  const removeConditionItem = useCallback(async (conditionId: string) => {
    if (!circle || mode !== 'edit') return;
    await removeCondition(circle.id, conditionId);
  }, [circle, mode]);

  const toggleConditionItem = useCallback(async (conditionId: string) => {
    if (!circle || mode !== 'edit') return;
    await toggleCondition(circle.id, conditionId);
  }, [circle, mode]);

  const shareUrls = circle ? getShareUrls(circle) : null;

  return {
    circle,
    mode,
    isEditable: mode === 'edit',
    isLoading,
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
  const [isCreating, setIsCreating] = useState(false);

  const create = useCallback(async () => {
    setIsCreating(true);
    try {
      const newCircle = await createCircle();
      setCircle(newCircle);
      return newCircle;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { circle, create, isCreating };
}
