import { HardDrive, Cloud, FileText, Image as ImageIcon, Video, Music, Archive, type LucideProps, Home, Star, Files, FolderOpen, Users, Link, Share2 } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { FileItem, User, ChatMessage, Note } from './types';

export enum ItemType {
  FILE = 'FILE',
  FOLDER = 'FOLDER',
}

export const MOCK_USERS: Record<string, User> = {
  '1': { id: '1', name: 'Alice (Arquiteta)', avatarUrl: 'https://i.pravatar.cc/150?u=alice', role: 'architect' },
  '2': { id: '2', name: 'Bob (Cliente)', avatarUrl: 'https://i.pravatar.cc/150?u=bob', role: 'client' },
  '3': { id: '3', name: 'Charlie (Eng.)', avatarUrl: 'https://i.pravatar.cc/150?u=charlie', role: 'architect' },
  '4': { id: '4', name: 'Diana (Cliente)', avatarUrl: 'https://i.pravatar.cc/150?u=diana', role: 'client' },
};

const MOCK_CHAT: ChatMessage[] = [
  { id: 'c1', userId: '1', userName: 'Alice', avatarUrl: MOCK_USERS['1'].avatarUrl, message: 'Bob, por favor, revise os blueprints. Alguma dúvida, me avise.', timestamp: '2h ago' },
  { id: 'c2', userId: '2', userName: 'Bob', avatarUrl: MOCK_USERS['2'].avatarUrl, message: 'Parece ótimo, Alice! Aprovado da minha parte.', timestamp: '1h ago' },
];

const MOCK_NOTES: Note[] = [
  { id: 'n1', userId: '1', content: 'Lembrar de verificar as medidas da janela da cozinha.', timestamp: '3d ago' },
];

export const MOCK_DATA: FileItem[] = [
  // Root level
  {
    id: '1',
    name: 'Projeto Alpha',
    type: ItemType.FOLDER,
    parentId: null,
    isStarred: true,
    sharedWith: ['1', '2'], // Alice, Bob
    modified: 'Aug 5, 2023',
    color: 'bg-folder-blue',
  },
  {
    id: '2',
    name: 'Marketing',
    type: ItemType.FOLDER,
    parentId: null,
    isStarred: false,
    sharedWith: ['3', '4', '1'], // Charlie, Diana, Alice
    modified: 'Aug 4, 2023',
    color: 'bg-folder-green',
  },
  {
    id: '3',
    name: 'Website_Design.fig',
    type: ItemType.FILE,
    parentId: null,
    isStarred: true,
    mimeType: 'image/figma',
    sharedWith: ['1'], // Alice
    modified: 'Aug 3, 2023',
    content: 'This is a Figma design file for the new company website.',
  },
  {
    id: '4',
    name: 'ATA - Reunião 12.08.pdf',
    type: ItemType.FILE,
    parentId: null,
    isStarred: false,
    mimeType: 'application/pdf',
    sharedWith: ['2', '4'], // Bob, Diana
    modified: 'Aug 12, 2023',
    content: 'Ata da reunião de kick-off do projeto. Decisões: aprovação do cronograma inicial. Próximos passos: detalhamento da planta baixa.',
    isAta: true,
  },
  // Inside 'Projeto Alpha' (id: '1')
  {
    id: '5',
    name: 'Blueprints_v2.pdf',
    type: ItemType.FILE,
    parentId: '1',
    isStarred: false,
    mimeType: 'application/pdf',
    sharedWith: ['2'], // Bob
    modified: 'Jul 28, 2023',
    content: 'Versão 2 das plantas do projeto. Inclui alterações na suíte master.',
    url: 'https://pdfobject.com/pdf/sample.pdf',
    chat: MOCK_CHAT,
    notes: MOCK_NOTES,
  },
  {
    id: '6',
    name: 'Architecture_Diagram.png',
    type: ItemType.FILE,
    parentId: '1',
    isStarred: true,
    mimeType: 'image/png',
    sharedWith: ['1', '2'], // Alice, Bob
    modified: 'Jul 25, 2023',
    content: 'A PNG image of the system architecture diagram.',
  },
  // Inside 'Marketing' (id: '2')
  {
    id: '7',
    name: 'Brand_Guidelines.pdf',
    type: ItemType.FILE,
    parentId: '2',
    isStarred: false,
    mimeType: 'application/pdf',
    sharedWith: ['3', '4'], // Charlie, Diana
    modified: 'Jul 20, 2023',
    content: 'Official brand guidelines.',
    url: 'https://pdfobject.com/pdf/sample.pdf',
  },
];

export const SIDEBAR_ITEMS = {
  architect: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'all-files', icon: FolderOpen, label: 'Todos os arquivos' },
    { id: 'starred', icon: Star, label: 'Favoritos' },
    { id: 'atas', icon: Share2, label: 'Compartilhado' },
    { id: 'clients', icon: Users, label: 'Clientes' },
    { id: 'cloud', icon: Link, label: 'Minhas conexões', isSection: true },
  ],
  client: [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'atas', icon: Share2, label: 'Compartilhados' },
  ],
};

export const getFileIcon = (mimeType?: string): ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> => {
  if (!mimeType) return FileText;
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('zip') || mimeType.includes('archive')) return Archive;
  return FileText;
};
