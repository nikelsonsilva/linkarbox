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

export interface Note {
  id: string;
  file_registry_id: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileRegistry {
  id: string;
  architect_id: string;
  file_name: string;
  file_path?: string;
  cloud_provider: 'google' | 'dropbox';
  cloud_file_id: string;
  mime_type?: string;
  created_at: string;
  updated_at: string;
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
  url?: string;
  cloudId?: string; // Specific ID from cloud provider (e.g. Dropbox id:...)
  size?: number;
  isAta?: boolean; // To identify meeting minutes
  notes?: Note[];
  unreadNotesCount?: number; // Number of unread notes for this file
}

export type ViewMode = 'grid' | 'list';

export type Page = 'home' | 'starred' | 'atas' | 'cloud' | 'all-files' | 'clients';

export type CloudConnection = {
  name: 'Google Drive' | 'Dropbox';
  connected: boolean;
  icon: React.ElementType;
};
