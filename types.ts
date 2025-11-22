// Fix: Import React to resolve the 'React' namespace for React.ElementType.
import React from 'react';
import { ItemType } from './constants';

export type Role = 'architect' | 'client';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: Role;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  message: string;
  timestamp: string;
}

export interface Note {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: ItemType;
  parentId: string | null;
  mimeType?: string;
  color?: string;
  isStarred: boolean;
  sharedWith: string[]; // Array of user IDs
  modified: string;
  content?: string;
  size?: number;
  isAta?: boolean; // To identify meeting minutes
  chat?: ChatMessage[];
  notes?: Note[];
}

export type ViewMode = 'grid' | 'list';

export type Page = 'home' | 'starred' | 'atas' | 'cloud' | 'all-files';

export type CloudConnection = {
  name: 'Google Drive' | 'Dropbox';
  connected: boolean;
  icon: React.ElementType;
};
