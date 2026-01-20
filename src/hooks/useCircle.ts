import { useState, useEffect, useCallback } from 'react';
import type { CircleInstance } from '../types';
import {
  getCircleById,
  subscribeToCircle,
  updatePosition,
  addBirthdayItem,
  removeBirthdayItem,
  toggleBirthdayItem,
  addLetter,
  addCondition,
  removeCondition,
  toggleCondition,
} from '../lib/storage';

// The ONE shared circle ID
export const SHARED_CIRCLE_ID = '1U_-Vmb5CaTbtB4kIgDGl';

interface UseSharedCircleResult {
  circle: CircleInstance | null;
  isLoading: boolean;
  error: string | null;
  updateMarkerPosition: (x: number, y: number, note?: string) => Promise<void>;
  addItem: (text: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  toggleItem: (itemId: string) => Promise<void>;
  addNewLetter: (author: 'julian' | 'mahnoor', content: string, title?: string) => Promise<void>;
  addConditionItem: (text: string) => Promise<void>;
  removeConditionItem: (conditionId: string) => Promise<void>;
  toggleConditionItem: (conditionId: string) => Promise<void>;
}

export function useSharedCircle(): UseSharedCircleResult {
  const [circle, setCircle] = useState<CircleInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the shared circle and subscribe to real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function loadCircle() {
      try {
        const loadedCircle = await getCircleById(SHARED_CIRCLE_ID);
        if (loadedCircle) {
          setCircle(loadedCircle);

          // Subscribe to real-time updates
          unsubscribe = subscribeToCircle(SHARED_CIRCLE_ID, (updatedCircle) => {
            if (updatedCircle) {
              setCircle(updatedCircle);
            }
          });
        } else {
          setError('Circle not found');
        }
      } catch (err) {
        console.error('Error loading circle:', err);
        setError('Failed to load circle');
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
  }, []);

  const updateMarkerPosition = useCallback(async (x: number, y: number, note?: string) => {
    if (!circle) return;
    try {
      await updatePosition(circle.id, x, y, note);
    } catch (err) {
      console.error('Failed to update position:', err);
    }
  }, [circle]);

  const addItem = useCallback(async (text: string) => {
    if (!circle) return;
    try {
      await addBirthdayItem(circle.id, text);
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  }, [circle]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!circle) return;
    try {
      await removeBirthdayItem(circle.id, itemId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  }, [circle]);

  const toggleItem = useCallback(async (itemId: string) => {
    if (!circle) return;
    try {
      await toggleBirthdayItem(circle.id, itemId);
    } catch (err) {
      console.error('Failed to toggle item:', err);
    }
  }, [circle]);

  const addNewLetter = useCallback(async (author: 'julian' | 'mahnoor', content: string, title?: string) => {
    if (!circle) return;
    try {
      await addLetter(circle.id, author, content, title);
    } catch (err) {
      console.error('Failed to add letter:', err);
    }
  }, [circle]);

  const addConditionItem = useCallback(async (text: string) => {
    if (!circle) return;
    try {
      await addCondition(circle.id, text);
    } catch (err) {
      console.error('Failed to add condition:', err);
    }
  }, [circle]);

  const removeConditionItem = useCallback(async (conditionId: string) => {
    if (!circle) return;
    try {
      await removeCondition(circle.id, conditionId);
    } catch (err) {
      console.error('Failed to remove condition:', err);
    }
  }, [circle]);

  const toggleConditionItem = useCallback(async (conditionId: string) => {
    if (!circle) return;
    try {
      await toggleCondition(circle.id, conditionId);
    } catch (err) {
      console.error('Failed to toggle condition:', err);
    }
  }, [circle]);

  return {
    circle,
    isLoading,
    error,
    updateMarkerPosition,
    addItem,
    removeItem,
    toggleItem,
    addNewLetter,
    addConditionItem,
    removeConditionItem,
    toggleConditionItem,
  };
}
