
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { FileItem, ViewMode, Page, User, Role } from './types';
import { ItemType, MOCK_DATA, MOCK_USERS } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FileExplorer from './components/FileExplorer';
import FileDetailPanel from './components/FileDetailPanel';
import ShareModal from './components/ShareModal';
import StarredView from './components/StarredView';
import LoginView from './components/auth/LoginView';
import SignupView from './components/auth/SignupView';
import AtaView from './components/AtaView';
import CloudConnectionsView from './components/CloudConnectionsView';
import PdfViewerModal from './components/PdfViewerModal';
import { LoaderCircle } from 'lucide-react';
import AllFilesView from './components/AllFilesView';
import ConnectCloudModal from './components/ConnectCloudModal';
import HomeView from './components/HomeView';
import ClientsView from './components/ClientsView';
import ClientRegistration from './components/ClientRegistration';
import ClientDashboard from './components/ClientDashboard';
import { supabase } from './lib/supabase';
import { getUnreadNotesCountMap } from './lib/noteService';

const GOOGLE_CLIENT_ID = "409424537697-vavde7jsobj6ormha3jkck9trkluv743.apps.googleusercontent.com";
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive';
const DROPBOX_CLIENT_ID = '526sxx6ouop0kwl';
const DROPBOX_REDIRECT_URI = window.location.origin + '/dropbox-auth';

declare global {
  interface Window {
    gapi: any;
    google: any;
    Dropbox: any;
  }
}

type ActiveCloud = 'google' | 'dropbox' | null;

export default function App() {
  // Auth state
  const [session, setSession] = useState<any>(null);
  const isAuthenticated = !!session?.user;
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const [allItems, setAllItems] = useState<FileItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Default to list view
  const [searchQuery, setSearchQuery] = useState<string>(''); // Search query state
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [sharingItem, setSharingItem] = useState<FileItem | null>(null);
  const [activePage, setActivePage] = useState<Page>('home');
  const [fullScreenPreviewItem, setFullScreenPreviewItem] = useState<FileItem | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [activeCloud, setActiveCloud] = useState<ActiveCloud>(null);
  const [isDriveConnected, setDriveConnected] = useState(false);
  const [isDropboxConnected, setDropboxConnected] = useState(false);

  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [googleTokenClient, setGoogleTokenClient] = useState<any>(null);
  const [dropboxClient, setDropboxClient] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gapiInited = useRef(false);
  const gisInited = useRef(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const [isConnectModalOpen, setConnectModalOpen] = useState(false);

  const activeCloudRef = useRef<ActiveCloud>(null);
  const dropboxClientRef = useRef<any>(null);
  useEffect(() => { activeCloudRef.current = activeCloud; }, [activeCloud]);
  useEffect(() => { dropboxClientRef.current = dropboxClient; }, [dropboxClient]);

  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);

  // Storage info state (in bytes)
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    total: number;
  }>({ used: 0, total: 0 });

  // Check for special routes
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const inviteMatch = path.match(/^\/invite\/(.+)$/);
    if (inviteMatch) {
      setInviteToken(inviteMatch[1]);
    }
  }, []);

  // --- Supabase Auth Logic ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        fetchUserProfile(sess.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        console.warn('Error fetching profile (possibly 406/RLS):', error);
        setCurrentUser({
          id: userId,
          name: session?.user?.user_metadata?.name || 'Usuário',
          avatarUrl: '',
          role: 'client',
        });
        return;
      }
      if (data) {
        setCurrentUser({
          id: data.id,
          name: data.name || data.display_name || 'Usuário',
          avatarUrl: data.avatar_url || '',
          role: data.role || 'client',
        });
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
      setCurrentUser({
        id: userId,
        name: session?.user?.user_metadata?.name || 'Usuário',
        avatarUrl: '',
        role: 'client',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setCurrentUser(null);
      setAuthView('login');
      setDriveConnected(false);
      setDropboxConnected(false);
      setActiveCloud(null);
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  // --- Google Drive specific logic ---
  const initGapi = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (gapiInited.current) return resolve();
      if (typeof window.gapi?.load !== 'function') return reject(new Error('GAPI script not loaded.'));
      window.gapi.load('client', () => {
        window.gapi.client.init({
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        }).then(() => { gapiInited.current = true; resolve(); }).catch(reject);
      });
    });
  }, []);

  const initGis = useCallback(() => {
    return new Promise<any>((resolve, reject) => {
      if (gisInited.current && googleTokenClient) return resolve(googleTokenClient);
      if (typeof window.google?.accounts?.oauth2?.initTokenClient !== 'function') return reject(new Error('GIS script not loaded.'));
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID, scope: GOOGLE_SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            window.gapi.client.setToken(tokenResponse);
            setDriveConnected(true);
            setActiveCloud('google');
            localStorage.setItem('google_auth_token', JSON.stringify(tokenResponse));
          }
        },
      });
      setGoogleTokenClient(client);
      gisInited.current = true;
      resolve(client);
    });
  }, [googleTokenClient]);

  const handleDisconnectGoogleDrive = useCallback(() => {
    const token = JSON.parse(localStorage.getItem('google_auth_token') || '{}');
    if (token.access_token && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token.access_token, () => { });
    }
    localStorage.removeItem('google_auth_token');
    localStorage.removeItem('linkarbox_keep_connected_google');
    setDriveConnected(false);
    if (activeCloudRef.current === 'google') setActiveCloud(null);
  }, []);

  // --- Dropbox specific logic ---
  const handleConnectDropbox = useCallback(() => {
    const dbxAuth = new window.Dropbox.DropboxAuth({ clientId: DROPBOX_CLIENT_ID });
    dbxAuth.getAuthenticationUrl(DROPBOX_REDIRECT_URI, undefined, 'token')
      .then((authUrl: string) => {
        window.location.href = authUrl;
      })
      .catch((error: any) => {
        console.error('Dropbox Authentication Error:', error);
        alert('Could not initiate Dropbox authentication. Please check the console.');
      });
  }, []);

  const handleDisconnectDropbox = useCallback(async () => {
    try {
      if (dropboxClientRef.current && dropboxClientRef.current.auth) {
        await dropboxClientRef.current.auth.tokenRevoke();
      }
    } catch (error) {
      console.error("Error revoking Dropbox token:", error);
    } finally {
      localStorage.removeItem('dropbox_auth_token');
      localStorage.removeItem('linkarbox_keep_connected_dropbox');
      setDropboxConnected(false);
      setDropboxClient(null);
      if (activeCloudRef.current === 'dropbox') setActiveCloud(null);
    }
  }, []);

  // --- Unified Cloud Logic ---
  useEffect(() => {
    const handleDropboxRedirect = async () => {
      if (window.location.pathname !== '/dropbox-auth') return;
      const hash = window.location.hash || '';
      if (!hash.includes('access_token')) {
        window.history.replaceState({}, document.title, '/');
        return;
      }
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        localStorage.setItem('dropbox_auth_token', accessToken);
        const dbx = new window.Dropbox.Dropbox({ accessToken });
        try {
          await dbx.usersGetCurrentAccount();
          setDropboxClient(dbx);
          setDropboxConnected(true);
          setActiveCloud('dropbox');
        } catch (error) {
          console.error('Dropbox token validation failed:', error);
          alert('Failed to validate Dropbox token. Please try connecting again.');
          localStorage.removeItem('dropbox_auth_token');
        } finally {
          window.history.replaceState({}, document.title, '/');
        }
      } else {
        window.history.replaceState({}, document.title, '/');
      }
    };
    handleDropboxRedirect();
  }, []);


  useEffect(() => {
    if (!currentUser || !session?.user?.id) return;

    const tryAutoConnect = async () => {
      setIsConnecting(true);
      const keepGoogle = localStorage.getItem('linkarbox_keep_connected_google') === 'true';
      const googleTokenStr = localStorage.getItem('google_auth_token');
      if (keepGoogle && googleTokenStr) {
        try {
          await initGapi();
          window.gapi.client.setToken(JSON.parse(googleTokenStr));
          await window.gapi.client.drive.about.get({ fields: 'user' });
          setDriveConnected(true);
          setActiveCloud('google');
          setIsConnecting(false);
          return;
        } catch (error) {
          console.error("Google auto-connect failed", error);
          handleDisconnectGoogleDrive();
        }
      }

      const keepDropbox = localStorage.getItem('linkarbox_keep_connected_dropbox') === 'true';
      const dropboxToken = localStorage.getItem('dropbox_auth_token');
      if (keepDropbox && dropboxToken) {
        try {
          const dbx = new window.Dropbox.Dropbox({ accessToken: dropboxToken });
          await dbx.usersGetCurrentAccount();
          setDropboxClient(dbx);
          setDropboxConnected(true);
          setActiveCloud('dropbox');
          setIsConnecting(false);
          return;
        } catch (error) {
          console.error("Dropbox auto-connect failed", error);
          handleDisconnectDropbox();
        }
      }

      setIsConnecting(false);
      if (currentUser.role === 'architect') {
        setConnectModalOpen(true);
      }
    };
    tryAutoConnect();
  }, [currentUser, initGapi, handleDisconnectGoogleDrive, handleDisconnectDropbox]);

  const fetchFiles = useCallback(async (folderId: string) => {
    setIsLoadingFiles(true);
    try {
      let formatted: FileItem[] = [];
      const cloud = activeCloudRef.current;
      const dbx = dropboxClientRef.current;

      if (cloud === 'google') {
        const resp = await window.gapi.client.drive.files.list({
          q: `'${folderId}' in parents and trashed = false`,
          fields: 'files(id, name, mimeType, modifiedTime, starred, parents, size)',
          pageSize: 100,
        });
        const files = resp.result.files || [];
        formatted = files.map((f: any) => ({
          id: f.id,
          name: f.name,
          type: f.mimeType === 'application/vnd.google-apps.folder' ? ItemType.FOLDER : ItemType.FILE,
          parentId: f.parents ? f.parents[0] : null,
          mimeType: f.mimeType,
          isStarred: f.starred,
          sharedWith: [],
          modified: new Date(f.modifiedTime).toLocaleDateString(),
          size: f.size,
          cloudId: f.id, // Add cloudId for notes tracking
        }));
      } else if (cloud === 'dropbox' && dbx) {
        let result = await dbx.filesListFolder({ path: folderId === 'root' ? '' : folderId });
        const entries: any[] = [...result.result.entries];
        while (result.result.has_more) {
          result = await dbx.filesListFolderContinue({ cursor: result.result.cursor });
          entries.push(...result.result.entries);
        }
        formatted = entries.map((e: any) => ({
          id: e.path_lower,
          name: e.name,
          type: e['.tag'] === 'folder' ? ItemType.FOLDER : ItemType.FILE,
          parentId: folderId,
          mimeType: e.mime_type,
          isStarred: false,
          sharedWith: [],
          modified: e.client_modified ? new Date(e.client_modified).toLocaleDateString() : 'N/A',
          size: e.size,
          serverModified: e.server_modified, // Store for sorting
          cloudId: e.id, // Add cloudId for notes tracking
        }));
      }

      // Enrich with unread notes count if user is authenticated
      if (session?.user?.id) {
        const unreadCountMap = await getUnreadNotesCountMap(session.user.id);
        formatted = formatted.map(item => ({
          ...item,
          unreadNotesCount: item.cloudId ? (unreadCountMap[item.cloudId] || 0) : 0,
        }));
      }

      setAllItems(formatted);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      if (err?.status === 429) {
        const retryAfter =
          Number(err?.error?.headers?.get?.('Retry-After')) ||
          Number(err?.response?.headers?.get?.('Retry-After')) ||
          2;
        setTimeout(() => fetchFiles(folderId), retryAfter * 1000);
        return;
      }
      if (activeCloudRef.current === 'google' && (err.status === 401 || err.result?.error?.status === 'UNAUTHENTICATED')) {
        handleDisconnectGoogleDrive();
      } else if (activeCloudRef.current === 'dropbox' && err.status === 401) {
        handleDisconnectDropbox();
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, [handleDisconnectDropbox, handleDisconnectGoogleDrive, session?.user?.id]);

  // Fetch recent files from cloud
  const fetchRecentFilesFromCloud = useCallback(async () => {
    const cloud = activeCloudRef.current;
    const dbx = dropboxClientRef.current;

    if (!cloud) return;

    try {
      let recentItems: FileItem[] = [];

      if (cloud === 'dropbox' && dbx) {
        // Get all files recursively from root
        let result = await dbx.filesListFolder({ path: '', recursive: true });
        const entries: any[] = [...result.result.entries];

        while (result.result.has_more) {
          result = await dbx.filesListFolderContinue({ cursor: result.result.cursor });
          entries.push(...result.result.entries);
        }

        // Filter only files (not folders) and sort by server_modified
        const files = entries
          .filter((e: any) => e['.tag'] === 'file')
          .sort((a: any, b: any) => {
            const dateA = new Date(a.server_modified || a.client_modified).getTime();
            const dateB = new Date(b.server_modified || b.client_modified).getTime();
            return dateB - dateA; // Most recent first
          })
          .slice(0, 10); // Get top 10 recent files

        recentItems = files.map((e: any) => ({
          id: e.path_lower,
          name: e.name,
          type: ItemType.FILE,
          parentId: e.path_lower.substring(0, e.path_lower.lastIndexOf('/')),
          mimeType: e.mime_type,
          isStarred: false,
          sharedWith: [],
          modified: e.server_modified ? new Date(e.server_modified).toLocaleDateString() : 'N/A',
          size: e.size,
        }));
      } else if (cloud === 'google') {
        // Google Drive recent files
        const resp = await window.gapi.client.drive.files.list({
          q: 'trashed = false',
          orderBy: 'modifiedTime desc',
          fields: 'files(id, name, mimeType, modifiedTime, starred, parents, size)',
          pageSize: 10,
        });
        const files = resp.result.files || [];
        recentItems = files.map((f: any) => ({
          id: f.id,
          name: f.name,
          type: f.mimeType === 'application/vnd.google-apps.folder' ? ItemType.FOLDER : ItemType.FILE,
          parentId: f.parents ? f.parents[0] : null,
          mimeType: f.mimeType,
          isStarred: f.starred,
          sharedWith: [],
          modified: new Date(f.modifiedTime).toLocaleDateString(),
          size: f.size,
        }));
      }

      setRecentFiles(recentItems);
    } catch (err) {
      console.error('Error fetching recent files:', err);
    }
  }, []);

  // Fetch storage info from cloud
  const fetchStorageInfo = useCallback(async () => {
    const cloud = activeCloudRef.current;
    const dbx = dropboxClientRef.current;

    if (!cloud) return;

    try {
      if (cloud === 'dropbox' && dbx) {
        // Use Dropbox API to get space usage
        const response = await dbx.usersGetSpaceUsage();
        const used = response.result.used || 0;
        const allocated = response.result.allocation?.allocated || 0;

        setStorageInfo({
          used: used,
          total: allocated,
        });
      } else if (cloud === 'google') {
        // Google Drive storage info
        const resp = await window.gapi.client.drive.about.get({
          fields: 'storageQuota'
        });
        const quota = resp.result.storageQuota;
        const used = parseInt(quota?.usage || '0');
        const total = parseInt(quota?.limit || '0');

        setStorageInfo({
          used: used,
          total: total,
        });
      }
    } catch (err) {
      console.error('Error fetching storage info:', err);
    }
  }, []);

  useEffect(() => {
    if (activeCloud && currentFolderId == null) {
      setCurrentFolderId('root');
      setActivePage('all-files');
    }
    if (!activeCloud) {
      setCurrentFolderId(null);
      setAllItems(MOCK_DATA);
      setActivePage('home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCloud]);

  const lastFetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeCloud || !currentFolderId || activePage === 'starred' || activePage === 'atas') return;

    const key = `${activeCloud}:${currentFolderId}`;
    if (lastFetchKeyRef.current === key) return;
    lastFetchKeyRef.current = key;

    fetchFiles(currentFolderId);
  }, [activeCloud, currentFolderId, activePage, fetchFiles]);

  // Fetch recent files when cloud connection changes
  useEffect(() => {
    if (activeCloud) {
      fetchRecentFilesFromCloud();
      fetchStorageInfo();
    } else {
      setRecentFiles([]);
      setStorageInfo({ used: 0, total: 0 });
    }
  }, [activeCloud, fetchRecentFilesFromCloud, fetchStorageInfo]);

  const handleConnectGoogleDrive = async () => {
    setIsConnecting(true);
    if (isDropboxConnected) handleDisconnectDropbox();
    try {
      await initGapi();
      const client = await initGis();
      client.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      console.error("Failed to connect to Google Drive", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSetPage = useCallback((page: Page) => {
    setActivePage(page);
    setSelectedItem(null);
    if (page === 'home') {
      setCurrentFolderId('root');
    }
  }, []);

  const handleModalConnect = (cloud: 'google' | 'dropbox', keepConnected: boolean) => {
    if (cloud === 'google') {
      if (keepConnected) localStorage.setItem('linkarbox_keep_connected_google', 'true');
      else localStorage.removeItem('linkarbox_keep_connected_google');
      handleConnectGoogleDrive();
    } else {
      if (keepConnected) localStorage.setItem('linkarbox_keep_connected_dropbox', 'true');
      else localStorage.removeItem('linkarbox_keep_connected_dropbox');
      handleConnectDropbox();
    }
    setConnectModalOpen(false);
  };

  const handleModalSkip = () => setConnectModalOpen(false);

  const path = useMemo(() => {
    if (activeCloud === 'google') {
      return []; // Path logic for GDrive needs implementation
    }
    if (activeCloud === 'dropbox') {
      if (!currentFolderId || currentFolderId === 'root') return [];
      const parts = currentFolderId.split('/').filter(p => p);
      const breadcrumbs = parts.map((part, i) => {
        const fullPath = '/' + parts.slice(0, i + 1).join('/');
        return {
          id: fullPath,
          name: part,
          type: ItemType.FOLDER,
          parentId: i === 0 ? 'root' : '/' + parts.slice(0, i).join('/'),
        } as FileItem
      });
      // The "root" or "home" button is handled separately in Breadcrumbs component
      return breadcrumbs;
    }
    return [];
  }, [currentFolderId, activeCloud]);

  const displayedItems = useMemo(() => {
    let items: FileItem[];
    if (activeCloud) {
      items = [...allItems];
    } else {
      items = allItems.filter(item => item.parentId === currentFolderId);
    }

    // Apply search filter if searchQuery is not empty
    if (searchQuery.trim()) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === ItemType.FOLDER ? -1 : 1;
    });
  }, [allItems, currentFolderId, activeCloud, searchQuery]);

  const starredItems = useMemo(() => {
    let items = allItems.filter(item => item.isStarred);

    // Apply search filter if searchQuery is not empty
    if (searchQuery.trim()) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [allItems, searchQuery]);

  const ataItems = useMemo(() => {
    let items = allItems.filter(item => item.isAta);

    // Apply search filter if searchQuery is not empty
    if (searchQuery.trim()) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [allItems, searchQuery]);

  const handleItemClick = useCallback((item: FileItem) => {
    if (item.type === ItemType.FOLDER) {
      setCurrentFolderId(item.id);
      setSelectedItem(null);
      if (activePage !== 'all-files' && activeCloud) {
        setActivePage('all-files');
      }
    } else {
      setSelectedItem(item);
    }
  }, [activePage, activeCloud]);

  const handleNavigate = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId || 'root');
    setSelectedItem(null);
  }, []);

  const handleToggleStar = useCallback(async (itemId: string) => {
    if (activeCloud === 'google') {
      const file = allItems.find(it => it.id === itemId);
      if (!file) return;
      await window.gapi.client.drive.files.update({ fileId: itemId, resource: { starred: !file.isStarred } });
      setAllItems(prev => prev.map(it => it.id === itemId ? { ...it, isStarred: !it.isStarred } : it));
    } else {
      alert("Starring is not supported for Dropbox yet.");
    }
  }, [allItems, activeCloud]);

  const handleRenameItem = async (itemId: string, newName: string) => {
    const item = allItems.find(it => it.id === itemId);
    if (!item || !newName) return;

    setIsLoadingFiles(true);
    try {
      if (activeCloud === 'google') {
        const response = await window.gapi.client.drive.files.update({ fileId: itemId, resource: { name: newName }, fields: 'id, name' });
        setAllItems(prev => prev.map(it => it.id === itemId ? { ...it, name: response.result.name } : it));
      } else if (activeCloud === 'dropbox' && dropboxClient) {
        const parentPath = item.id.substring(0, item.id.lastIndexOf('/'));
        const response = await dropboxClient.filesMoveV2({ from_path: item.id, to_path: `${parentPath}/${newName}` });
        const renamedItem = response.result.metadata;
        setAllItems(prev => prev.map(it => it.id === itemId ? { ...it, id: renamedItem.path_lower, name: renamedItem.name } : it));
      }
    } catch (error) {
      console.error("Error renaming item:", error);
      alert("Failed to rename item.");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleDeleteItem = useCallback(async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setIsLoadingFiles(true);
    try {
      if (activeCloud === 'google') {
        await window.gapi.client.drive.files.delete({ fileId: itemId });
      } else if (activeCloud === 'dropbox' && dropboxClient) {
        await dropboxClient.filesDeleteV2({ path: itemId });
      }
      setAllItems(prev => prev.filter(it => it.id !== itemId));
      if (selectedItem?.id === itemId) setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [activeCloud, dropboxClient, selectedItem?.id]);

  const handleCreateFolder = async () => {
    if (!activeCloud || !currentFolderId) return;
    const folderName = window.prompt("Enter new folder name:");
    if (!folderName) return;

    setIsLoadingFiles(true);
    try {
      let newFolder: FileItem;
      if (activeCloud === 'google') {
        const response = await window.gapi.client.drive.files.create({
          resource: { name: folderName, mimeType: 'application/vnd.google-apps.folder', parents: [currentFolderId] },
          fields: 'id, name, mimeType, modifiedTime, starred, parents, size',
        });
        const file = response.result;
        newFolder = { id: file.id, name: file.name, type: ItemType.FOLDER, parentId: file.parents[0], mimeType: file.mimeType, isStarred: file.starred, sharedWith: [], modified: new Date(file.modifiedTime).toLocaleDateString() };
      } else if (activeCloud === 'dropbox' && dropboxClient) {
        const path = (currentFolderId === 'root' ? '' : currentFolderId) + '/' + folderName;
        const response = await dropboxClient.filesCreateFolderV2({ path, autorename: true });
        const entry = response.result.metadata;
        newFolder = { id: entry.path_lower, name: entry.name, type: ItemType.FOLDER, parentId: currentFolderId, isStarred: false, sharedWith: [], modified: new Date().toLocaleDateString() };
      } else return;
      setAllItems(prev => [...prev, newFolder]);
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleUploadClick = () => {
    if (!activeCloud) alert("Please connect to a cloud service to upload files.");
    else fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeCloud || !currentFolderId) return;
    setIsLoadingFiles(true);
    try {
      let newFile: FileItem;
      if (activeCloud === 'google') {
        const metadata = { name: file.name, parents: [currentFolderId] };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);
        const accessToken = window.gapi.client.getToken().access_token;
        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}` }, body: form,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error.message);
        const fileMeta = await window.gapi.client.drive.files.get({ fileId: result.id, fields: 'id, name, mimeType, modifiedTime, starred, parents, size' });
        const f = fileMeta.result;
        newFile = { id: f.id, name: f.name, type: ItemType.FILE, parentId: f.parents[0], mimeType: f.mimeType, isStarred: !!f.starred, sharedWith: [], modified: new Date(f.modifiedTime).toLocaleDateString(), size: f.size };
      } else if (activeCloud === 'dropbox' && dropboxClient) {
        const path = (currentFolderId === 'root' ? '' : currentFolderId) + '/' + file.name;
        const response = await dropboxClient.filesUpload({ path, contents: file });
        const entry = response.result;
        newFile = { id: entry.path_lower, name: entry.name, type: ItemType.FILE, parentId: currentFolderId, isStarred: false, sharedWith: [], modified: new Date(entry.client_modified).toLocaleDateString(), size: entry.size };
      } else return;
      setAllItems(prev => [...prev, newFile]);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePreviewClick = async (item: FileItem) => {
    if (item.url) {
      setFullScreenPreviewItem(item);
      return;
    }

    if (!activeCloud) {
      setFullScreenPreviewItem(item);
      return;
    }

    setIsLoadingFiles(true);
    try {
      let url = '';
      if (activeCloud === 'google') {
        const response = await window.gapi.client.drive.files.get({
          fileId: item.id,
          fields: 'webViewLink, webContentLink'
        });
        // Google Drive webViewLink is usually a viewer. We can try to use it or embed it.
        // For embedding, replacing /view with /preview often works for Google Drive files.
        url = response.result.webViewLink.replace('/view', '/preview');
      } else if (activeCloud === 'dropbox' && dropboxClient) {
        const response = await dropboxClient.filesGetTemporaryLink({ path: item.id });
        url = response.result.link;
      }

      if (url) {
        setFullScreenPreviewItem({ ...item, url });
      } else {
        setFullScreenPreviewItem(item); // Fallback to showing "No URL" message
      }
    } catch (error) {
      console.error("Error fetching preview URL:", error);
      alert("Failed to load document preview.");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const renderContent = () => {
    const commonProps = {
      onItemClick: handleItemClick,
      onToggleStar: handleToggleStar,
      onDeleteItem: handleDeleteItem,
      onShareItem: (item: FileItem) => setSharingItem(item),
      onRenameItem: handleRenameItem,
    };
    if (isLoadingFiles || isConnecting) {
      return <div className="flex items-center justify-center h-full"><LoaderCircle className="w-12 h-12 text-primary animate-spin" /></div>;
    }
    switch (activePage) {
      case 'home':
        // Show ClientDashboard for clients, HomeView for architects
        if (currentUser?.role === 'client') {
          return <ClientDashboard />;
        }
        return (
          <HomeView
            user={currentUser!}
            isDriveConnected={isDriveConnected}
            isDropboxConnected={isDropboxConnected}
            onConnectGoogleDrive={handleConnectGoogleDrive}
            onDisconnectGoogleDrive={handleDisconnectGoogleDrive}
            onConnectDropbox={handleConnectDropbox}
            onDisconnectDropbox={handleDisconnectDropbox}
            onNavigateToCloud={() => handleSetPage('cloud')}
            storageInfo={{
              provider: activeCloud,
              used: Math.round(storageInfo.used / (1024 * 1024)), // Convert bytes to MB
              total: Math.round(storageInfo.total / (1024 * 1024 * 1024)), // Convert bytes to GB
            }}
            recentFiles={recentFiles}
            {...commonProps}
          />
        );
      case 'all-files': return <AllFilesView viewMode={viewMode} items={displayedItems} path={path} onNavigate={handleNavigate} isCloudConnected={!!activeCloud} onConnectDrive={() => handleSetPage('cloud')} selectedItemId={selectedItem?.id || null} {...commonProps} />;
      case 'starred': return <StarredView items={starredItems} viewMode={viewMode} {...commonProps} />;
      case 'atas': return <AtaView items={ataItems} viewMode={viewMode} {...commonProps} />;
      case 'clients': return <ClientsView onNavigate={handleSetPage} searchQuery={searchQuery} />;
      case 'cloud': return <CloudConnectionsView isDriveConnected={isDriveConnected} isDropboxConnected={isDropboxConnected} onConnectGoogleDrive={handleConnectGoogleDrive} onDisconnectGoogleDrive={handleDisconnectGoogleDrive} onConnectDropbox={handleConnectDropbox} onDisconnectDropbox={handleDisconnectDropbox} />;
      default: return null;
    }
  };

  if (isLoadingSession) {
    return <div className="flex items-center justify-center h-screen bg-[#F7F9FC]"><LoaderCircle className="w-12 h-12 text-primary animate-spin" /></div>;
  }

  // Handle client registration via invite link
  if (inviteToken) {
    return (
      <ClientRegistration
        inviteToken={inviteToken}
        onComplete={() => {
          window.location.href = '/';
        }}
      />
    );
  }



  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginView onNavigateToSignup={() => setAuthView('signup')} />
    ) : (
      <SignupView onNavigateToLogin={() => setAuthView('login')} />
    );
  }

  if (!currentUser) return <div className="flex items-center justify-center h-screen bg-[#F7F9FC]"><LoaderCircle className="w-12 h-12 text-primary animate-spin" /></div>;


  return (
    <div className="flex h-screen bg-[#F7F9FC] font-sans overflow-hidden">
      <ConnectCloudModal isOpen={isConnectModalOpen} onConnect={handleModalConnect} onSkip={handleModalSkip} isConnecting={isConnecting} />
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
      <Sidebar
        activePage={activePage}
        onPageChange={handleSetPage}
        userRole={currentUser.role}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCloudConnected={!!activeCloud}
        cloudProvider={activeCloud}
        storageUsed={Math.round(storageInfo.used / (1024 * 1024))} // Convert bytes to MB
        storageTotal={Math.round(storageInfo.total / (1024 * 1024 * 1024))} // Convert bytes to GB
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewMode={viewMode}
          setViewMode={setViewMode}
          user={currentUser}
          onLogout={handleLogout}
          onCreateFolder={handleCreateFolder}
          onUpload={handleUploadClick}
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          showViewToggle={activePage !== 'clients' && activePage !== 'cloud'}
          showActionButtons={activePage !== 'clients' && activePage !== 'cloud'}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activePage={activePage}
        />
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">{renderContent()}</div>
          {selectedItem && <FileDetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} currentUser={currentUser} onPreviewClick={handlePreviewClick} />}
        </main>
      </div>
      {sharingItem && <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} />}
      {fullScreenPreviewItem && <PdfViewerModal item={fullScreenPreviewItem} onClose={() => setFullScreenPreviewItem(null)} />}
    </div>
  );
}
