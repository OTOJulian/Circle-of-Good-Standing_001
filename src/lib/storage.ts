import type { CircleInstance, Position, LetterEntry } from '../types';
import { nanoid } from 'nanoid';
import { getZoneFromPosition } from './calculateZone';
import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';

const COLLECTION_NAME = 'circles';

// Generate tokens for sharing
export function generateTokens() {
  return {
    editToken: `edit-${nanoid(16)}`,
    viewToken: `view-${nanoid(16)}`,
  };
}

// Helper to convert Firestore timestamps to Dates
function convertTimestamps(data: any): any {
  if (!data) return data;

  const result = { ...data };

  // Convert top-level dates
  if (result.createdAt?.toDate) {
    result.createdAt = result.createdAt.toDate();
  } else if (result.createdAt) {
    result.createdAt = new Date(result.createdAt);
  }

  // Convert currentPosition.updatedAt
  if (result.currentPosition?.updatedAt?.toDate) {
    result.currentPosition.updatedAt = result.currentPosition.updatedAt.toDate();
  } else if (result.currentPosition?.updatedAt) {
    result.currentPosition.updatedAt = new Date(result.currentPosition.updatedAt);
  }

  // Convert birthdayList dates
  if (result.birthdayList) {
    result.birthdayList = result.birthdayList.map((item: any) => ({
      ...item,
      addedAt: item.addedAt?.toDate ? item.addedAt.toDate() : new Date(item.addedAt),
    }));
  }

  // Convert positionHistory dates
  if (result.positionHistory) {
    result.positionHistory = result.positionHistory.map((entry: any) => ({
      ...entry,
      timestamp: entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp),
    }));
  }

  // Convert letters dates
  if (result.letters) {
    result.letters = result.letters.map((letter: any) => ({
      ...letter,
      createdAt: letter.createdAt?.toDate ? letter.createdAt.toDate() : new Date(letter.createdAt),
    }));
  }

  // Convert conditions dates
  if (result.conditions) {
    result.conditions = result.conditions.map((cond: any) => ({
      ...cond,
      addedAt: cond.addedAt?.toDate ? cond.addedAt.toDate() : new Date(cond.addedAt),
    }));
  }

  return result as CircleInstance;
}

// Create a new circle instance
export async function createCircle(): Promise<CircleInstance> {
  const tokens = generateTokens();
  const now = new Date();
  const initialDate = new Date('2025-06-28T16:11:00');

  const circle: CircleInstance = {
    id: nanoid(),
    editToken: tokens.editToken,
    viewToken: tokens.viewToken,
    createdAt: now,
    currentPosition: {
      x: 75,
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
        addedAt: initialDate,
      },
    ],
  };

  await saveCircle(circle);
  return circle;
}

// Save circle to Firestore
export async function saveCircle(circle: CircleInstance): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, circle.id);
  await setDoc(docRef, circle);
}

// Get circle by ID
export async function getCircleById(id: string): Promise<CircleInstance | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return convertTimestamps(docSnap.data());
  }
  return null;
}

// Get circle by token (edit or view)
export async function getCircleByToken(token: string): Promise<{ circle: CircleInstance; mode: 'edit' | 'view' } | null> {
  // Try edit token first
  const editQuery = query(
    collection(db, COLLECTION_NAME),
    where('editToken', '==', token)
  );
  const editSnapshot = await getDocs(editQuery);

  if (!editSnapshot.empty) {
    const circle = convertTimestamps(editSnapshot.docs[0].data());
    return { circle, mode: 'edit' };
  }

  // Try view token
  const viewQuery = query(
    collection(db, COLLECTION_NAME),
    where('viewToken', '==', token)
  );
  const viewSnapshot = await getDocs(viewQuery);

  if (!viewSnapshot.empty) {
    const circle = convertTimestamps(viewSnapshot.docs[0].data());
    return { circle, mode: 'view' };
  }

  return null;
}

// Subscribe to real-time updates for a circle
export function subscribeToCircle(
  circleId: string,
  callback: (circle: CircleInstance | null) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTION_NAME, circleId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(convertTimestamps(docSnap.data()));
    } else {
      callback(null);
    }
  });
}

// Update position (atomic with transaction)
export async function updatePosition(circleId: string, x: number, y: number, note?: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, circleId);
  const now = new Date();
  const zone = getZoneFromPosition(x, y);
  const position: Position = { x, y, zone };

  const newHistoryEntry = {
    id: nanoid(),
    position,
    timestamp: now,
    note,
  };

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists()) {
      throw new Error('Circle not found');
    }
    const data = docSnap.data();
    const updatedHistory = [newHistoryEntry, ...(data.positionHistory || [])];

    transaction.update(docRef, {
      currentPosition: {
        ...position,
        updatedAt: now,
        note,
      },
      positionHistory: updatedHistory,
    });
  });
}

// Add birthday list item (atomic)
export async function addBirthdayItem(circleId: string, text: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, circleId);
  await updateDoc(docRef, {
    birthdayList: arrayUnion({
      id: nanoid(),
      text,
      addedAt: new Date(),
      obtained: false,
    })
  });
}

// Remove birthday list item (atomic with transaction)
export async function removeBirthdayItem(circleId: string, itemId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, circleId);
  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists()) {
      throw new Error('Circle not found');
    }
    const data = docSnap.data();
    const itemToRemove = data.birthdayList?.find((item: any) => item.id === itemId);
    if (itemToRemove) {
      transaction.update(docRef, {
        birthdayList: arrayRemove(itemToRemove)
      });
    }
  });
}

// Toggle birthday item obtained status (atomic with transaction)
export async function toggleBirthdayItem(circleId: string, itemId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, circleId);
  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists()) {
      throw new Error('Circle not found');
    }
    const data = docSnap.data();
    const updatedList = data.birthdayList.map((item: any) =>
      item.id === itemId ? { ...item, obtained: !item.obtained } : item
    );
    transaction.update(docRef, { birthdayList: updatedList });
  });
}

// Add a new letter (atomic)
export async function addLetter(
  circleId: string,
  author: 'julian' | 'mahnoor',
  content: string,
  title?: string
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, circleId);
  const newLetter: LetterEntry = {
    id: nanoid(),
    author,
    content,
    createdAt: new Date(),
    title,
  };
  await updateDoc(docRef, {
    letters: arrayUnion(newLetter)
  });
}

// Add condition (atomic)
export async function addCondition(circleId: string, text: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, circleId);
  await updateDoc(docRef, {
    conditions: arrayUnion({
      id: nanoid(),
      text,
      addedAt: new Date(),
      completed: false,
    })
  });
}

// Remove condition (atomic with transaction)
export async function removeCondition(circleId: string, conditionId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, circleId);
  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists()) {
      throw new Error('Circle not found');
    }
    const data = docSnap.data();
    const conditionToRemove = data.conditions?.find((c: any) => c.id === conditionId);
    if (conditionToRemove) {
      transaction.update(docRef, {
        conditions: arrayRemove(conditionToRemove)
      });
    }
  });
}

// Toggle condition completed status (atomic with transaction)
export async function toggleCondition(circleId: string, conditionId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, circleId);
  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists()) {
      throw new Error('Circle not found');
    }
    const data = docSnap.data();
    const updatedConditions = data.conditions.map((c: any) =>
      c.id === conditionId ? { ...c, completed: !c.completed } : c
    );
    transaction.update(docRef, { conditions: updatedConditions });
  });
}

// Get share URLs
export function getShareUrls(circle: CircleInstance): { editUrl: string; viewUrl: string } {
  const baseUrl = window.location.origin;
  return {
    editUrl: `${baseUrl}/circle/${circle.editToken}`,
    viewUrl: `${baseUrl}/circle/${circle.viewToken}`,
  };
}
