import type { CircleInstance, Position, Condition, LetterEntry } from '../types';
import { nanoid } from 'nanoid';
import { getZoneFromPosition } from './calculateZone';

const STORAGE_KEY = 'circle-of-good-standing';

// Generate tokens for sharing
export function generateTokens() {
  return {
    editToken: `edit-${nanoid(16)}`,
    viewToken: `view-${nanoid(16)}`,
  };
}

// Create a new circle instance
export function createCircle(): CircleInstance {
  const tokens = generateTokens();
  const now = new Date();
  const initialDate = new Date('2025-06-28T16:11:00'); // June 28th, 2025 - 4:11 PM

  const circle: CircleInstance = {
    id: nanoid(),
    editToken: tokens.editToken,
    viewToken: tokens.viewToken,
    createdAt: now,
    currentPosition: {
      x: 75, // Start at the edge, as per the story
      y: 50,
      zone: 'edge',
      updatedAt: initialDate,
      note: 'Initial position - hanging on by your humor',
    },
    birthdayList: [],
    positionHistory: [
      {
        id: nanoid(),
        position: { x: 75, y: 50, zone: 'edge' },
        timestamp: initialDate,
        note: 'Initial position - hanging on by your humor',
      },
    ],
    letters: [],
    conditions: [
      {
        id: nanoid(),
        text: 'last six months',
        completed: true,
        createdAt: initialDate,
      },
    ],
  };

  saveCircle(circle);
  return circle;
}

// Save circle to localStorage
export function saveCircle(circle: CircleInstance): void {
  const circles = getAllCircles();
  const index = circles.findIndex(c => c.id === circle.id);
  if (index >= 0) {
    circles[index] = circle;
  } else {
    circles.push(circle);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(circles));
}

// Get all circles from localStorage
export function getAllCircles(): CircleInstance[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    // Convert date strings back to Date objects and handle migration
    return parsed.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      currentPosition: {
        ...c.currentPosition,
        updatedAt: new Date(c.currentPosition.updatedAt),
      },
      birthdayList: c.birthdayList.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt),
      })),
      positionHistory: c.positionHistory.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      })),
      // Migration: convert old letterContent to new letters array
      letters: (c.letters || []).map((letter: any) => ({
        ...letter,
        createdAt: new Date(letter.createdAt),
      })),
      conditions: (c.conditions || []).map((cond: any) => ({
        ...cond,
        addedAt: new Date(cond.addedAt),
      })),
    }));
  } catch {
    return [];
  }
}

// Get circle by token (edit or view)
export function getCircleByToken(token: string): { circle: CircleInstance; mode: 'edit' | 'view' } | null {
  const circles = getAllCircles();

  for (const circle of circles) {
    if (circle.editToken === token) {
      return { circle, mode: 'edit' };
    }
    if (circle.viewToken === token) {
      return { circle, mode: 'view' };
    }
  }

  return null;
}

// Update position
export function updatePosition(circleId: string, x: number, y: number, note?: string): CircleInstance | null {
  const circles = getAllCircles();
  const circle = circles.find(c => c.id === circleId);
  if (!circle) return null;

  const now = new Date();
  const zone = getZoneFromPosition(x, y);
  const position: Position = { x, y, zone };

  circle.currentPosition = {
    ...position,
    updatedAt: now,
    note,
  };

  // Add to history
  circle.positionHistory.unshift({
    id: nanoid(),
    position,
    timestamp: now,
    note,
  });

  saveCircle(circle);
  return circle;
}

// Add birthday list item
export function addBirthdayItem(circleId: string, text: string): CircleInstance | null {
  const circles = getAllCircles();
  const circle = circles.find(c => c.id === circleId);
  if (!circle) return null;

  circle.birthdayList.push({
    id: nanoid(),
    text,
    addedAt: new Date(),
    obtained: false,
  });

  saveCircle(circle);
  return circle;
}

// Remove birthday list item
export function removeBirthdayItem(circleId: string, itemId: string): CircleInstance | null {
  const circles = getAllCircles();
  const circle = circles.find(c => c.id === circleId);
  if (!circle) return null;

  circle.birthdayList = circle.birthdayList.filter(item => item.id !== itemId);

  saveCircle(circle);
  return circle;
}

// Toggle birthday item obtained status
export function toggleBirthdayItem(circleId: string, itemId: string): CircleInstance | null {
  const circles = getAllCircles();
  const circle = circles.find(c => c.id === circleId);
  if (!circle) return null;

  const item = circle.birthdayList.find(i => i.id === itemId);
  if (item) {
    item.obtained = !item.obtained;
  }

  saveCircle(circle);
  return circle;
}

// Add a new letter
export function addLetter(
  circleId: string,
  author: 'julian' | 'mahnoor',
  content: string,
  title?: string
): CircleInstance | null {
  const circles = getAllCircles();
  const circle = circles.find(c => c.id === circleId);
  if (!circle) return null;

  const newLetter: LetterEntry = {
    id: nanoid(),
    author,
    content,
    createdAt: new Date(),
    title,
  };

  circle.letters.unshift(newLetter); // Add to beginning (newest first)

  saveCircle(circle);
  return circle;
}

// Add condition
export function addCondition(circleId: string, text: string): CircleInstance | null {
  const circles = getAllCircles();
  const circle = circles.find(c => c.id === circleId);
  if (!circle) return null;

  circle.conditions.push({
    id: nanoid(),
    text,
    addedAt: new Date(),
    completed: false,
  });

  saveCircle(circle);
  return circle;
}

// Remove condition
export function removeCondition(circleId: string, conditionId: string): CircleInstance | null {
  const circles = getAllCircles();
  const circle = circles.find(c => c.id === circleId);
  if (!circle) return null;

  circle.conditions = circle.conditions.filter(c => c.id !== conditionId);

  saveCircle(circle);
  return circle;
}

// Toggle condition completed status
export function toggleCondition(circleId: string, conditionId: string): CircleInstance | null {
  const circles = getAllCircles();
  const circle = circles.find(c => c.id === circleId);
  if (!circle) return null;

  const condition = circle.conditions.find(c => c.id === conditionId);
  if (condition) {
    condition.completed = !condition.completed;
  }

  saveCircle(circle);
  return circle;
}

// Get share URLs
export function getShareUrls(circle: CircleInstance): { editUrl: string; viewUrl: string } {
  const baseUrl = window.location.origin;
  return {
    editUrl: `${baseUrl}/circle/${circle.editToken}`,
    viewUrl: `${baseUrl}/circle/${circle.viewToken}`,
  };
}
