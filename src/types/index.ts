export type Zone = 'center' | 'inner' | 'middle' | 'edge' | 'off';

export interface Position {
  x: number; // 0-100 percentage from center
  y: number; // 0-100 percentage from center
  zone: Zone;
}

export interface CurrentPosition extends Position {
  updatedAt: Date;
  note?: string;
}

export interface PositionHistoryEntry {
  id: string;
  position: Position;
  timestamp: Date;
  note?: string;
}

export interface BirthdayItem {
  id: string;
  text: string;
  addedAt: Date;
  obtained: boolean;
}

export interface Condition {
  id: string;
  text: string;
  addedAt: Date;
  completed: boolean;
}

export interface LetterEntry {
  id: string;
  author: 'julian' | 'mahnoor';
  content: string;
  createdAt: Date;
  title?: string;
}

export interface CircleInstance {
  id: string;
  editToken: string;
  viewToken: string;
  createdAt: Date;
  currentPosition: CurrentPosition;
  birthdayList: BirthdayItem[];
  positionHistory: PositionHistoryEntry[];
  letters: LetterEntry[];
  conditions: Condition[];
}

export type AccessMode = 'edit' | 'view' | 'loading' | 'not-found';
