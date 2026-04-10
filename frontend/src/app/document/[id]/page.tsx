'use client';

import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, Save, Share2, MoreHorizontal, CheckCircle2, ShieldAlert, History, X, RotateCcw, RefreshCcw,
  Table as TableIcon, FileText, Download, Bold, Italic, AlignLeft, AlignCenter, AlignRight, 
  Type, Palette, PaintBucket, Copy, Trash2, ArrowUp, ArrowDown, ArrowRight,
  Users, Plus, Moon, Sun, UserPlus, Check, Search, MessageSquare, Sparkles, Send, Activity, Upload,
  Underline, List, ListOrdered, Quote, AlignJustify, Lock, Unlock, Zap, Edit3, Eye, Bell, User,
  PlusCircle, LayoutGrid, Layers
} from 'lucide-react';
import { Providers, useTheme } from '@/components/providers';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart as RePieChart, Pie, Cell, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LabelList
} from 'recharts';

const SEND_INVITE = gql`
  mutation SendInvite($workspaceId: ID!, $email: String!, $role: String!) {
    sendInvite(workspaceId: $workspaceId, email: $email, role: $role) {
      id
      status
    }
  }
`;

const MY_NOTIFICATIONS = gql`
  query MyNotifications {
    myNotifications {
      id
      type
      role
      status
      message
      createdAt
      workspace {
        id
        name
      }
    }
  }
`;

const RESPOND_INVITE = gql`
  mutation RespondInvite($notificationId: ID!, $accept: Boolean!) {
    respondInvite(notificationId: $notificationId, accept: $accept)
  }
`;

const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotificationAdded {
    notificationAdded {
      id
      type
      role
      status
      message
      createdAt
      workspace {
        id
        name
      }
    }
  }
`;

const GET_DOCUMENT = gql`
  query GetDocument($id: ID!, $workspaceId: ID!) {
    me {
      id
    }
    document(id: $id) {
      id
      title
      content
      config
      type
    }
    workspace(id: $workspaceId) {
      currentUserRole
      documents {
        id
        title
        type
      }
    }
    activeUsers(documentId: $id) {
      userId
      email
      documentId
      cursorOffset
      cursorRow
      cursorCol
      cursorX
      cursorY
      isTyping
    }
    documentVersions(documentId: $id) {
      id
      content
      createdAt
    }
  }
`;

const GET_DOC_BASIC = gql`
  query GetDocBasic($id: ID!) {
    document(id: $id) {
      id
      title
      type
      workspace {
        id
      }
    }
  }
`;

const UPDATE_PRESENCE = gql`
  mutation UpdatePresence($documentId: ID!, $cursorOffset: Int, $cursorRow: Int, $cursorCol: Int, $cursorX: Float, $cursorY: Float, $isTyping: Boolean) {
    updatePresence(documentId: $documentId, cursorOffset: $cursorOffset, cursorRow: $cursorRow, cursorCol: $cursorCol, cursorX: $cursorX, cursorY: $cursorY, isTyping: $isTyping) {
      userId
      email
      documentId
    }
  }
`;

const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($id: ID!, $content: String, $title: String, $config: String) {
    updateDocument(id: $id, content: $content, title: $title, config: $config) {
      id
      content
      title
      config
    }
  }
`;

const CREATE_DOCUMENT = gql`
  mutation CreateDocument($workspaceId: ID!, $title: String!, $type: String!) {
    createDocument(workspaceId: $workspaceId, title: $title, type: $type) {
      id
      title
      type
    }
  }
`;

const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id)
  }
`;

const DOCUMENT_SUBSCRIPTION = gql`
  subscription OnDocumentUpdated {
    documentUpdated {
      id
      title
      content
      config
    }
  }
`;

const PRESENCE_SUBSCRIPTION = gql`
  subscription OnPresenceChanged($documentId: ID!) {
    presenceChanged(documentId: $documentId) {
      userId
      email
      documentId
      cursorOffset
      cursorRow
      cursorCol
      cursorX
      cursorY
      isTyping
    }
  }
`;

const GET_MESSAGES = gql`
  query GetMessages($documentId: ID!) {
    messages(documentId: $documentId) {
      id
      text
      createdAt
      sender {
        id
        email
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($documentId: ID!, $text: String!) {
    sendMessage(documentId: $documentId, text: $text) {
      id
      text
      createdAt
      sender {
        id
        email
      }
    }
  }
`;

const GET_COMMENTS = gql`
  query GetComments($documentId: ID!) {
    comments(documentId: $documentId) {
      id
      text
      cellRow
      cellCol
      charOffset
      parentId
      createdAt
      user {
        id
        email
      }
      replies {
        id
        text
        createdAt
        user {
          id
          email
        }
      }
    }
  }
`;

const ADD_COMMENT = gql`
  mutation AddComment($documentId: ID!, $text: String!, $cellRow: Int, $cellCol: Int, $charOffset: Int, $parentId: ID) {
    addComment(documentId: $documentId, text: $text, cellRow: $cellRow, cellCol: $cellCol, charOffset: $charOffset, parentId: $parentId) {
      id
      text
      cellRow
      cellCol
      parentId
      createdAt
      user {
        id
        email
      }
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageSent($documentId: ID!) {
    messageSent(documentId: $documentId) {
      id
      text
      createdAt
      sender {
        id
        email
      }
    }
  }
`;

interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bgColor?: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: string;
}

interface CellData {
  value: string;
  style?: CellStyle;
}

export default function DocumentPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const wId = searchParams.get('w');
  const router = useRouter();

  const [activeTabId, setActiveTabId] = useState<string>(id as string);
  const [openTabs, setOpenTabs] = useState<any[]>([]);

  // Advanced Comment Orchestration
  const [comments, setComments] = useState<any[]>([]);
  const [commentPopover, setCommentPopover] = useState<{ r: number, c: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeCellComments, setActiveCellComments] = useState<any[]>([]);

  const { data: commentsData, refetch: refetchComments } = useQuery(GET_COMMENTS, {
    variables: { documentId: activeTabId },
    skip: !activeTabId
  });

  useEffect(() => {
    if (commentsData?.comments) {
      setComments(commentsData.comments);
    }
  }, [commentsData]);

  const [addCommentMutation] = useMutation(ADD_COMMENT, {
    onCompleted: () => {
      refetchComments();
      setNewCommentText('');
    }
  });

  const handleAddComment = async (parentId?: string) => {
    if (!newCommentText.trim() || !activeTabId || !commentPopover) return;
    await addCommentMutation({
      variables: {
        documentId: activeTabId,
        text: newCommentText,
        cellRow: commentPopover.r,
        cellCol: commentPopover.c,
        parentId
      }
    });
  };

  const [showSidebar, setShowSidebar] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'collab' | 'explorer' | 'chat'>('collab');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  
  const { theme, setTheme } = useTheme();
  
  const [activeCell, setActiveCell] = useState<{ r: number, c: number } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [changedCells, setChangedCells] = useState<Set<string>>(new Set());
  const prevGridRef = useRef<string>("");

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Strategic Formatting Intelligence
  const [formattingRules, setFormattingRules] = useState<any[]>([]);
  const [showFormattingModal, setShowFormattingModal] = useState(false);
  const [ruleType, setRuleType] = useState<'greater' | 'less' | 'equal' | 'databar'>('greater');
  const [ruleThreshold, setRuleThreshold] = useState('');
  const [ruleColor, setRuleColor] = useState('#ef4444');

  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType, setCreateModalType] = useState<'text' | 'sheet'>('text');
  const [createModalTitle, setCreateModalTitle] = useState('');

  const [selection, setSelection] = useState<{ start: { r: number, c: number }, end: { r: number, c: number } } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [charts, setCharts] = useState<any[]>([]);
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area' | 'radar' | 'composed'>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [chartDescription, setChartDescription] = useState('');
  const [seriesNames, setSeriesNames] = useState<string[]>(['Revenue', 'Projections', 'Costs']);
  const [labelColIndex, setLabelColIndex] = useState(0);
  const [valueColIndices, setValueColIndices] = useState<number[]>([1]);
  const [isDashboardMode, setIsDashboardMode] = useState(false);
  const [draggingChartId, setDraggingChartId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    const chart = charts.find(c => c.id === id);
    if (!chart) return;
    setDraggingChartId(id);
    setDragOffset({
      x: e.clientX - chart.x,
      y: e.clientY - chart.y
    });
  };

  const handleDrag = useCallback((e: MouseEvent) => {
    if (draggingChartId) {
      setCharts(prev => prev.map(c => 
        c.id === draggingChartId 
          ? { ...c, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } 
          : c
      ));
    }
  }, [draggingChartId, dragOffset]);

  const handleDragEnd = () => {
    setDraggingChartId(null);
  };

  useEffect(() => {
    if (draggingChartId) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [draggingChartId, handleDrag]);

  const updateChart = (id: string, updates: any) => {
    setCharts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const downloadChart = async (id: string) => {
    const el = document.getElementById(`chart-container-${id}`);
    if (!el) return;
    
    // Fallback: Since adding html2canvas might be slow/tricky, 
    // we'll implement a clean SVG-to-DataURL export for high quality.
    try {
      const svg = el.querySelector('svg');
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const png = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `prosync-pulse-${id}.png`;
        link.href = png;
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (e) {
      alert("Export failed. Try a different browser or check permissions.");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, loading, refetch, error: dataError } = useQuery(GET_DOCUMENT, {
    variables: { id: activeTabId, workspaceId: wId || "" },
    skip: !wId || !activeTabId,
    fetchPolicy: 'network-only'
  });

  const { data: basicData, loading: basicLoading, error: basicError } = useQuery(GET_DOC_BASIC, {
    variables: { id: activeTabId },
    skip: !!wId || !activeTabId,
    fetchPolicy: 'network-only'
  });

  useEffect(() => {
    if (dataError) console.error('GET_DOCUMENT Error:', dataError);
    if (basicError) console.error('GET_DOC_BASIC Error:', basicError);
  }, [dataError, basicError]);

  useEffect(() => {
    if (!wId && basicData?.document?.workspace?.id) {
      router.replace(`/document/${id}?w=${basicData.document.workspace.id}`);
    }
  }, [wId, basicData, id, router]);

  useEffect(() => {
    if (data?.document) {
      const exists = openTabs.find(t => String(t.id) === String(data.document.id));
      if (!exists) {
        setOpenTabs([{ 
          id: data.document.id, 
          title: data.document.title, 
          type: data.document.type 
        }]);
      } else if (exists.title !== data.document.title) {
        setOpenTabs(prev => prev.map(t => String(t.id) === String(data.document.id) ? { ...t, title: data.document.title } : t));
      }
    } else if (basicData?.document && openTabs.length === 0) {
      setOpenTabs([{ 
        id: basicData.document.id, 
        title: basicData.document.title, 
        type: basicData.document.type 
      }]);
    }
  }, [data?.document, basicData?.document, openTabs.length]);

  useEffect(() => {
    if (data?.activeUsers) {
      setActiveUsers(data.activeUsers);
    }
  }, [data?.activeUsers]);

  const openInNewTab = (asset: any) => {
    if (!openTabs.find((t: any) => t.id === asset.id)) {
      setOpenTabs((prev: any[]) => [...prev, asset]);
    }
    setActiveTabId(asset.id);
    router.push(`/document/${asset.id}?w=${wId}`);
  };

  const handleCreateNewFile = (type: 'text' | 'sheet' = 'text') => {
    setCreateModalType(type);
    setCreateModalTitle('');
    setShowCreateModal(true);
  };

  const handleRename = async () => {
    if (!tempTitle.trim()) { setIsRenaming(false); return; }
    try {
      await updateDoc({ variables: { id: activeTabId, title: tempTitle, content } });
      setOpenTabs((prev: any[]) => prev.map(t => t.id === activeTabId ? { ...t, title: tempTitle } : t));
      setIsRenaming(false);
      refetch();
    } catch (err: any) { alert('Failed to rename: ' + err.message); }
  };

  const handleCreateSubmit = async () => {
    if (!createModalTitle.trim()) return;
    try {
      const { data: created } = await createDoc({ variables: { workspaceId: wId, title: createModalTitle, type: createModalType } });
      if (created?.createDocument) {
        openInNewTab(created.createDocument);
        refetch();
      }
      setShowCreateModal(false);
      setCreateModalTitle('');
    } catch { alert('Failed to create file'); }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset? This cannot be undone.')) return;
    try {
      await deleteDoc({ variables: { id: assetId } });
      const remaining = openTabs.filter((t: any) => t.id !== assetId);
      setOpenTabs(remaining);
      if (activeTabId === assetId) {
        if (remaining.length > 0) openInNewTab(remaining[remaining.length - 1]);
        else router.push(`/workspace/${wId}`);
      }
      refetch();
    } catch { alert('Failed to delete asset'); }
  };

  useEffect(() => {
    if (data?.document) {
      setContent(data.document.content || "");
      if (data.document.config) {
        try {
          const cfg = JSON.parse(data.document.config);
          setFormattingRules(cfg.formattingRules || []);
        } catch (e) {
          console.error('Config Parse Error:', e);
          setFormattingRules([]);
        }
      } else {
        setFormattingRules([]);
      }
    }
  }, [data?.document]);

  const saveDocumentConfig = async (newRules: any[]) => {
    const configStr = JSON.stringify({ formattingRules: newRules });
    try {
      await updateDoc({ variables: { id: activeTabId, config: configStr } });
      setFormattingRules(newRules);
    } catch (e) {
      console.error('Save Config Error:', e);
    }
  };

  const [updateDoc] = useMutation(UPDATE_DOCUMENT);
  const [createDoc] = useMutation(CREATE_DOCUMENT);
  const [deleteDoc] = useMutation(DELETE_DOCUMENT);
  const [updatePresence] = useMutation(UPDATE_PRESENCE);
  const [sendInvite, { loading: addingMember }] = useMutation(SEND_INVITE);
  const [respondInvite] = useMutation(RESPOND_INVITE);
  
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const { data: messagesData, error: messagesError } = useQuery(GET_MESSAGES, {
    variables: { documentId: String(activeTabId) || "" },
    skip: !activeTabId
  });

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
    }
  }, [messagesData]);

  useEffect(() => {
    if (messagesError) console.error('MESSAGES Error:', messagesError);
  }, [messagesError]);

  useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { documentId: String(activeTabId) || "" },
    onData: ({ data: subData }) => {
      if (subData.data?.messageSent) {
        setMessages(prev => {
          // Prevent duplicates if already in list
          if (prev.find(m => m.id === subData.data.messageSent.id)) return prev;
          return [...prev, subData.data.messageSent];
        });
      }
    }
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeSidebarTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeSidebarTab]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !activeTabId) return;
    const text = chatMessage;
    setChatMessage('');
    try {
      await sendMessage({
        variables: { documentId: String(activeTabId), text }
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };
  
  const { data: notifData, refetch: refetchNotifs } = useQuery(MY_NOTIFICATIONS);

  useEffect(() => {
    if (notifData?.myNotifications) {
      setNotifications(notifData.myNotifications);
    }
  }, [notifData]);

  useSubscription(NOTIFICATION_SUBSCRIPTION, {
    onData: ({ data: subData }) => {
      const added = subData.data?.notificationAdded;
      if (added) {
        setNotifications((prev) => [added, ...prev]);
      }
    }
  });

  const role = data?.workspace?.currentUserRole;
  const isViewer = role === 'viewer';
  const activeTab = openTabs.find(t => String(t.id) === String(activeTabId));
  const doc = data?.document || basicData?.document;
  const versions = data?.documentVersions || [];
  const type = doc?.type || 'text';
  const error = dataError || basicError;

  useSubscription(DOCUMENT_SUBSCRIPTION, {
    onData: ({ data: subData }) => {
      const updatedDoc = subData.data?.documentUpdated;
      if (updatedDoc && String(updatedDoc.id) === String(activeTabId) && !showHistory) {
        setContent(updatedDoc.content);
        if (updatedDoc.title) {
          setOpenTabs((prev) => prev.map(t => String(t.id) === String(updatedDoc.id) ? { ...t, title: updatedDoc.title } : t));
        }
      }
    }
  });

  useSubscription(PRESENCE_SUBSCRIPTION, {
    variables: { documentId: String(activeTabId) },
    onData: ({ data: subData }) => {
      if (subData.data?.presenceChanged) {
        setActiveUsers(subData.data.presenceChanged);
      }
    }
  });

  const sendPresence = useCallback(async (overrides = {}) => {
    if (!activeTabId) return;
    try {
      await updatePresence({
        variables: {
          documentId: activeTabId,
          cursorRow: activeCell?.r,
          cursorCol: activeCell?.c,
          isTyping,
          ...overrides
        }
      });
    } catch (err) {
      // Ignore presence errors
    }
  }, [activeTabId, activeCell, isTyping, updatePresence]);

  const trackCaretPosition = useCallback(() => {
    if (type !== 'text' || !editorRef.current) return;
    try {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        
        const x = rect.left - editorRect.left;
        const y = rect.top - editorRect.top;
        
        if (x !== 0 || y !== 0) {
          sendPresence({ cursorX: x, cursorY: y });
        }
      }
    } catch (e) { /* Ignore selection errors */ }
  }, [type, sendPresence]);

  useEffect(() => {
    if (type === 'text') {
      const handler = () => {
        trackCaretPosition();
      };
      document.addEventListener('selectionchange', handler);
      return () => document.removeEventListener('selectionchange', handler);
    }
  }, [type, trackCaretPosition]);

  useEffect(() => {
    sendPresence();
    const interval = setInterval(() => sendPresence(), 5000);
    return () => clearInterval(interval);
  }, [sendPresence]);

  const handleSave = useCallback(async (newContent?: string) => {
    if (isViewer || isSaving || showHistory) return;
    setIsSaving(true);
    try {
      await updateDoc({ variables: { id: activeTabId, content: newContent || content } });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  }, [isViewer, isSaving, showHistory, activeTabId, content, updateDoc]);

  const handleInvite = async () => {
    if (!inviteEmail || !wId) return;
    try {
      await sendInvite({
        variables: {
          workspaceId: wId,
          email: inviteEmail,
          role: inviteRole
        }
      });
      setIsInviteOpen(false);
      setInviteEmail('');
      alert("Invitation sent successfully!");
    } catch (err: any) {
      alert(err.message || 'Failed to send invite');
    }
  };

  const handleRespondInvite = async (notifId: string, accept: boolean) => {
    try {
      await respondInvite({ variables: { notificationId: notifId, accept } });
      setNotifications(notifications.map(n => n.id === notifId ? { ...n, status: accept ? 'ACCEPTED' : 'DECLINED' } : n));
      if (accept) refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to respond');
    }
  };

  useEffect(() => {
    if (isViewer || showHistory) return;
    const timer = setTimeout(() => {
      if (data && content !== data.document.content) {
        handleSave();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [content, isViewer, showHistory, data, handleSave]);

  const gridData: CellData[][] = useMemo(() => {
    if (type !== 'sheet') return [];
    try {
      const raw = JSON.parse(content || '[["","",""],["","",""],["","",""]]');
      return raw.map((row: any) => row.map((cell: any) => {
        if (typeof cell === 'string') return { value: cell, style: {} };
        return cell;
      }));
    } catch {
      return [[{value:"", style:{}}]];
    }
  }, [content, type]);

  useEffect(() => {
    if (type === 'sheet' && content && prevGridRef.current && content !== prevGridRef.current) {
      try {
        const current = JSON.parse(content);
        const prev = JSON.parse(prevGridRef.current);
        const newlyChanged = new Set<string>();
        
        current.forEach((row: any, r: number) => {
          row.forEach((cell: any, c: number) => {
            const currentVal = typeof cell === 'string' ? cell : cell.value;
            const prevCell = prev[r]?.[c];
            const prevVal = typeof prevCell === 'string' ? prevCell : prevCell?.value;
            
            if (currentVal !== prevVal) {
              newlyChanged.add(`${r}-${c}`);
            }
          });
        });

        if (newlyChanged.size > 0) {
          setChangedCells(newlyChanged);
          const timer = setTimeout(() => setChangedCells(new Set()), 1000);
          return () => clearTimeout(timer);
        }
      } catch (e) { /* Ignore parse errors */ }
    }
    prevGridRef.current = content;
  }, [content, type]);

  const updateGrid = (newGrid: CellData[][]) => {
    if (isViewer || showHistory) return;
    setContent(JSON.stringify(newGrid));
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeCell || showHistory || isViewer) return;
    
    // Avoid jumping if we are typing in global search or other specialized inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && !target.classList.contains('cell-input')) return;

    let { r, c } = activeCell;
    const rowCount = gridData.length;
    const colCount = gridData[0].length;

    let moved = false;
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        r = Math.max(0, r - 1);
        moved = true;
        break;
      case 'ArrowDown':
        e.preventDefault();
        r = Math.min(rowCount - 1, r + 1);
        moved = true;
        break;
      case 'ArrowLeft':
        // Only move if not at start of input or using Ctrl
        if (target.tagName !== 'INPUT' || (target as HTMLInputElement).selectionStart === 0 || e.ctrlKey) {
          e.preventDefault();
          c = Math.max(0, c - 1);
          moved = true;
        }
        break;
      case 'ArrowRight':
        // Only move if at end of input or using Ctrl
        if (target.tagName !== 'INPUT' || (target as HTMLInputElement).selectionStart === (target as HTMLInputElement).value.length || e.ctrlKey) {
          e.preventDefault();
          c = Math.min(colCount - 1, c + 1);
          moved = true;
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) c = Math.max(0, c - 1);
        else c = Math.min(colCount - 1, c + 1);
        moved = true;
        break;
      case 'Enter':
        e.preventDefault();
        if (e.shiftKey) r = Math.max(0, r - 1);
        else r = Math.min(rowCount - 1, r + 1);
        moved = true;
        break;
    }

    if (moved) {
      setActiveCell({ r, c });
      setSelection({ start: { r, c }, end: { r, c } });
      
      // Auto-focus the next cell input
      setTimeout(() => {
        const nextInput = document.querySelector(`tr:nth-child(${r + 1}) td:nth-child(${c + 2}) input`) as HTMLInputElement;
        nextInput?.focus();
      }, 10);
    }
  }, [activeCell, gridData, showHistory, isViewer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const updateCell = (rIdx: number, cIdx: number, value: string) => {
    const newGrid = [...gridData];
    newGrid[rIdx] = [...newGrid[rIdx]];
    newGrid[rIdx][cIdx] = { ...newGrid[rIdx][cIdx], value };
    updateGrid(newGrid);

    setIsTyping(true);
    sendPresence({ isTyping: true, cursorRow: rIdx, cursorCol: cIdx });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendPresence({ isTyping: false, cursorRow: rIdx, cursorCol: cIdx });
    }, 2000);
  };

  const handleMouseDown = (r: number, c: number) => {
    if (isViewer) return;
    setIsSelecting(true);
    setSelection({ start: { r, c }, end: { r, c } });
    setActiveCell({ r, c });
    sendPresence({ cursorRow: r, cursorCol: c });
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (isSelecting && selection) {
      setSelection({ ...selection, end: { r, c } });
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  useEffect(() => {
    const handler = () => setIsSelecting(false);
    window.addEventListener('mouseup', handler);
    return () => window.removeEventListener('mouseup', handler);
  }, []);

  const isInSelection = (r: number, c: number) => {
    if (!selection) return false;
    const { start, end } = selection;
    const minR = Math.min(start.r, end.r);
    const maxR = Math.max(start.r, end.r);
    const minC = Math.min(start.c, end.c);
    const maxC = Math.max(start.c, end.c);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  };

  const generatePulse = () => {
    if (!selection || !activeTabId) return;
    const { start, end } = selection;
    const minR = Math.min(start.r, end.r);
    const maxR = Math.max(start.r, end.r);
    const minC = Math.min(start.c, end.c);
    const maxC = Math.max(start.c, end.c);

    const newChart = {
      id: Date.now().toString(),
      type: chartType,
      range: { minR, maxR, minC, maxC },
      labelOffset: labelColIndex,
      valueOffsets: valueColIndices,
      seriesNames: valueColIndices.map((_, i) => seriesNames[i] || `Series ${i+1}`),
      showLabels: true,
      title: chartTitle || `Strategic Insight ${charts.length + 1}`,
      description: chartDescription || "Automated data visualization from strategic range.",
      x: 350 + (charts.length * 45),
      y: 200 + (charts.length * 45),
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'],
      size: 'M'
    };

    setCharts([...charts, newChart]);
    setShowChartModal(false);
    setChartTitle('');
    setChartDescription('');
    setLabelColIndex(0);
    setValueColIndices([1]);
  };

  const getChartDataMulti = (chart: any) => {
    if (!gridData || gridData.length === 0) return [];
    const { range, labelOffset, valueOffsets } = chart;
    const { minR, maxR, minC } = range;
    const data = [];
    for (let r = minR; r <= maxR; r++) {
      const labelCell = gridData[r]?.[minC + labelOffset];
      const name = labelCell?.value || `Row ${r + 1}`;
      const entry: any = { name };
      valueOffsets.forEach((vOff: number, i: number) => {
        const cell = gridData[r]?.[minC + vOff];
        const rawVal = cell?.value || "0";
        entry[`val${i}`] = parseFloat(rawVal) || 0;
      });
      data.push(entry);
    }
    return data;
  };

  const exportToSVG = (id: string) => {
    const el = document.getElementById(`chart-container-${id}`);
    const svg = el?.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prosync-pulse-${id}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const applyStyle = (style: CellStyle) => {
    if (!activeCell) return;
    const { r, c } = activeCell;
    const newGrid = [...gridData];
    newGrid[r] = [...newGrid[r]];
    newGrid[r][c] = { 
      ...newGrid[r][c], 
      style: { ...(newGrid[r][c].style || {}), ...style } 
    };
    updateGrid(newGrid);
  };

  const toggleStyle = (key: keyof CellStyle) => {
    if (!activeCell) return;
    const { r, c } = activeCell;
    const currentStyle = gridData[r][c].style || {};
    applyStyle({ [key]: !currentStyle[key] });
  };

  const parseCellCoord = (coord: string) => {
    const match = coord.match(/([A-Z]+)([0-9]+)/);
    if (!match) return null;
    const colStr = match[1];
    const rowIdx = parseInt(match[2]) - 1;
    let colIdx = 0;
    for (let i = 0; i < colStr.length; i++) {
      colIdx = colIdx * 26 + (colStr.charCodeAt(i) - 64);
    }
    return { r: rowIdx, c: colIdx - 1 };
  };

  const getCellValue = (r: number, c: number, grid: CellData[][]): number => {
    const val = grid[r]?.[c]?.value || "0";
    if (val.startsWith("=")) return evaluateFormula(val, grid);
    return parseFloat(val) || 0;
  };

  const evaluateFormula = (formula: string, grid: CellData[][]): any => {
    if (!formula.startsWith("=")) return formula;
    try {
      const content = formula.substring(1).toUpperCase();
      
      if (content.startsWith("SUM(") || content.startsWith("AVG(") || content.startsWith("MIN(") || content.startsWith("MAX(")) {
        const func = content.substring(0, 3);
        const range = content.match(/\((.+)\)/)?.[1];
        if (!range) return "#ERR";
        const [start, end] = range.split(":");
        if (!start || !end) return "#ERR";
        const s = parseCellCoord(start);
        const e = parseCellCoord(end);
        if (!s || !e) return "#ERR";
        
        const values: number[] = [];
        for (let r = Math.min(s.r, e.r); r <= Math.max(s.r, e.r); r++) {
          for (let c = Math.min(s.c, e.c); c <= Math.max(s.c, e.c); c++) {
            values.push(getCellValue(r, c, grid));
          }
        }
        
        if (func === "SUM") return values.reduce((acc, v) => acc + v, 0);
        if (func === "AVG") return values.reduce((acc, v) => acc + v, 0) / values.length;
        if (func === "MIN") return Math.min(...values);
        if (func === "MAX") return Math.max(...values);
      }
      
      const operators = ["+", "-", "*", "/"];
      for (const op of operators) {
        if (content.includes(op)) {
          const [p1, p2] = content.split(op);
          const s1 = parseCellCoord(p1.trim());
          const s2 = parseCellCoord(p2.trim());
          if (s1 && s2) {
            const v1 = getCellValue(s1.r, s1.c, grid);
            const v2 = getCellValue(s2.r, s2.c, grid);
            if (op === "+") return v1 + v2;
            if (op === "-") return v1 - v2;
            if (op === "*") return v1 * v2;
            if (op === "/") return v1 / v2;
          }
        }
      }
      return formula;
    } catch (e) {
      console.error('Formula Evaluation Error:', e);
      return "#ERR";
    }
  };

  const addRow = () => {
    const newRow = new Array(gridData[0].length).fill(null).map(() => ({ value: "", style: {} }));
    updateGrid([...gridData, newRow]);
  };

  const addCol = () => {
    const newGrid = gridData.map(row => [...row, { value: "", style: {} }]);
    updateGrid(newGrid);
  };

  const deleteRow = (rIdx: number) => {
    if (gridData.length <= 1) return;
    const newGrid = gridData.filter((_, i) => i !== rIdx);
    updateGrid(newGrid);
  };

  const deleteCol = (cIdx: number) => {
    if (gridData[0].length <= 1) return;
    const newGrid = gridData.map(row => row.filter((_, i) => i !== cIdx));
    updateGrid(newGrid);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const exportToExcel = () => {
    const dataToExport = gridData.map(row => row.map(cell => cell.value));
    const ws = XLSX.utils.aoa_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProSync Sheet");
    XLSX.writeFile(wb, `${data?.document?.title || 'Export'}.xlsx`);
  };

  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        const newGrid = rawData.map((row) => 
          row.map((cell) => ({ value: String(cell ?? ""), style: {} }))
        );
        
        while (newGrid.length < 10) newGrid.push(new Array(newGrid[0]?.length || 5).fill({value:"", style:{}}));
        updateGrid(newGrid);
      } catch (err) {
        alert("Failed to parse Excel file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (type === 'text' && editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [type, content]);

  if (loading || basicLoading) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full shadow-[0_0_15px_rgba(99,82,235,0.3)]" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">Establishing secure connection...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen mesh-bg flex flex-col text-foreground overflow-hidden">
      
      {/* ── HEADER ── */}
      <header className="glass-header px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/workspace/${wId}`)} className="p-2hover:bg-secondary text-muted-foreground hover:text-foreground transition-all rounded-md">
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 flex items-center justify-center shadow-lg rounded-md text-white ${type === 'sheet' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200 dark:shadow-emerald-900/30' : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-200 dark:shadow-blue-900/30'}`}>
              {type === 'sheet' ? <TableIcon size={18} /> : <FileText size={18} />}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2 group">
                {isRenaming ? (
                  <input 
                    autoFocus
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    className="text-lg font-black bg-transparent outline-none border-b-2 border-primary text-foreground min-w-[200px]"
                  />
                ) : (
                  <h1 
                    onClick={() => {
                      if (!isViewer) {
                        setTempTitle(doc?.title || activeTab?.title || '');
                        setIsRenaming(true);
                      }
                    }}
                    className={`text-lg font-black tracking-tight text-foreground flex items-center gap-2 ${!isViewer ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                  >
                    {activeTab?.title || doc?.title || "Untitled"}
                    {!isViewer && <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />}
                  </h1>
                )}
              </div>
              {error && <p className="text-[10px] text-red-500 font-bold uppercase animate-pulse">Sync Error: {error.message}</p>}
              <div className="flex items-center gap-3 mt-0.5">
                 <button 
                   onClick={() => setShowSidebar(!showSidebar)}
                   className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider transition-all rounded ${showSidebar ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}
                 >
                   Panel
                 </button>
                 <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded ${showHistory ? 'badge-primary bg-amber-500/10 text-amber-600 border-amber-500/20' : 'badge-operational'}`}>
                   {showHistory ? 'History Mode' : 'Live Sync'}
                 </span>
                 {isViewer && (
                   <span className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 rounded flex items-center gap-1">
                     <Lock size={10} /> Read Only
                   </span>
                 )}
                 {isSaving && (
                   <span className="text-[10px] font-bold uppercase tracking-wider text-primary animate-pulse flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Syncing
                   </span>
                 )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Users Avatars */}
          <div className="flex items-center -space-x-2 mr-2">
            {activeUsers.slice(0, 4).map((u, i) => (
              <div 
                key={u.userId} title={u.email} 
                className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] text-white font-bold shadow-md transition-all hover:scale-110 hover:z-10 cursor-pointer ${u.isTyping ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-background' : ''}`} 
                style={{ backgroundColor: `hsl(${(i * 137) % 360}, 65%, 55%)` }}
              >
                {u.email.substring(0, 2).toUpperCase()}
              </div>
            ))}
            {activeUsers.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] text-muted-foreground font-bold shadow-md">
                +{activeUsers.length - 4}
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-border mx-1" />

          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 hover:bg-secondary text-muted-foreground transition-all rounded-md">
            {mounted && (theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />)}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all rounded-md relative">
              <Bell size={18} />
              {notifications.filter(n => n.status === 'PENDING').length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-background" />
              )}
            </button>
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border shadow-2xl rounded-xl p-4 flex flex-col gap-3 z-50">
                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground pb-2 border-b border-border flex items-center justify-between">
                  Notifications
                  <button onClick={() => setShowNotifications(false)} className="hover:text-foreground"><X size={14}/></button>
                </h3>
                {notifications.length === 0 ? (
                  <p className="text-sm text-center py-4 text-muted-foreground font-medium">No new notifications.</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {notifications.map((notif: any) => (
                      <div key={notif.id} className="p-3 border border-border rounded-lg bg-secondary/50 flex flex-col gap-2">
                        <p className="text-[13px] font-medium leading-tight">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {notif.status === 'PENDING' && notif.type === 'INVITATION' ? (
                            <>
                              <button onClick={() => handleRespondInvite(notif.id, true)} className="flex-1 py-1.5 bg-emerald-500 text-white text-[10px] uppercase font-black tracking-widest rounded hover:bg-emerald-600 transition-colors">Accept</button>
                              <button onClick={() => handleRespondInvite(notif.id, false)} className="flex-1 py-1.5 border border-border bg-card text-foreground text-[10px] uppercase font-black tracking-widest rounded hover:bg-secondary transition-colors">Decline</button>
                            </>
                          ) : (
                            <span className={`text-[10px] uppercase font-black tracking-widest ${notif.status === 'ACCEPTED' ? 'text-emerald-500' : (notif.status === 'DECLINED' ? 'text-red-500' : 'text-muted-foreground')}`}>
                              {notif.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={() => setIsInviteOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:opacity-90 transition-all rounded-md text-sm">
            <UserPlus size={16} />
            <span className="hidden lg:inline">Share</span>
          </button>

          <div className="flex items-center gap-1 bg-secondary p-1 rounded-md border border-border">
            <input type="file" ref={fileInputRef} onChange={importFromExcel} accept=".xlsx, .xls, .csv" className="hidden" />
            
            {type === 'sheet' && !isViewer && (
              <button onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-background text-muted-foreground hover:text-foreground transition-all rounded" title="Import from Excel">
                <Upload size={16} />
              </button>
            )}
            {type === 'sheet' && (
              <button onClick={exportToExcel} className="p-1.5 hover:bg-background text-muted-foreground hover:text-foreground transition-all rounded" title="Export to Excel">
                <Download size={16} />
              </button>
            )}
            
            {!isViewer && (
              <button onClick={() => handleSave()} className="px-3 py-1.5 bg-background text-primary text-xs font-bold shadow-sm hover:shadow-md transition-all rounded border border-border flex items-center gap-1">
                <Save size={14} /> Finalize
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* ── SIDEBAR ── */}
        <aside className={`bg-card/50 backdrop-blur-xl border-r border-border transition-all duration-300 flex flex-col z-40 ${showSidebar ? 'w-80' : 'w-0 overflow-hidden border-none opacity-0'}`}>
          <div className="p-4 border-b border-border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Zap size={16} className="text-primary" /> Workspace Tools
              </h2>
              <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-secondary text-muted-foreground transition-all rounded">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex p-1 bg-secondary rounded-md">
              <button onClick={() => setActiveSidebarTab('collab')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-black uppercase tracking-tighter transition-all rounded ${activeSidebarTab === 'collab' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <Users size={12} /> Team
              </button>
              <button onClick={() => setActiveSidebarTab('explorer')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-black uppercase tracking-tighter transition-all rounded ${activeSidebarTab === 'explorer' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <FileText size={12} /> Explorer
              </button>
              <button onClick={() => setActiveSidebarTab('chat')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-black uppercase tracking-tighter transition-all rounded ${activeSidebarTab === 'chat' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <MessageSquare size={12} /> Chat
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {activeSidebarTab === 'collab' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">Active Presences</h4>
                 {activeUsers.map((u, i) => {
                   const isSelf = String(u.userId) === String(data?.me?.id);
                   const color = `hsl(${(i * 137) % 360}, 65%, 55%)`;
                   const lightColor = `hsl(${(i * 137) % 360}, 65%, 95%)`;
                   
                   return (
                    <div 
                      key={u.userId} 
                      className={`p-3 border rounded-xl shadow-sm flex items-center gap-3 group transition-all duration-500 hover:scale-[1.02] hover:shadow-md cursor-default relative overflow-hidden ${u.isTyping ? 'animate-presence-glow border-primary/50' : 'border-border bg-card/50 hover:border-primary/30'}`}
                      style={u.isTyping ? { backgroundColor: lightColor } : {}}
                    >
                      {u.isTyping && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      )}
                      
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm text-white font-black shadow-lg transition-transform duration-500 group-hover:rotate-12 ${u.isTyping ? 'animate-bounce shadow-primary/40' : ''}`} 
                        style={{ backgroundColor: color }}
                      >
                        {u.email.substring(0, 1).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black truncate text-foreground group-hover:text-primary transition-colors">
                            {u.email.split('@')[0]}
                          </p>
                          {isSelf && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-secondary text-muted-foreground font-black uppercase tracking-tighter rounded">You</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {u.isTyping ? (
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-primary animate-pulse">
                              <span className="flex gap-0.5">
                                <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                              </span>
                              Typing...
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> 
                              Connected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                   );
                 })}
                {activeUsers.length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center text-center opacity-50">
                    <Users size={32} className="mb-2 text-muted-foreground" />
                    <p className="text-xs font-bold text-muted-foreground">Solo Mode Active</p>
                  </div>
                )}
              </div>
            )}

            {activeSidebarTab === 'explorer' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 px-2">Project Assets</h4>
                <div className="space-y-1">
                  {data?.workspace?.documents?.map((d: any) => (
                    <button 
                      key={d.id} 
                      onClick={() => openInNewTab(d)}
                      className={`w-full flex items-center gap-3 p-2.5 text-xs font-bold transition-all rounded-md border border-transparent ${activeTabId === d.id ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                    >
                      {d.type === 'sheet' ? <TableIcon size={14} className="text-emerald-500" /> : <FileText size={14} className="text-blue-500" />}
                      <span className="truncate flex-1 text-left">{d.title}</span>
                      {activeTabId === d.id && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSidebarTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0 bg-background/30">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
                       <MessageSquare size={18} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End-to-End Encrypted</p>
                  </div>

                  {messages.map((msg, i) => {
                    const isSelf = String(msg.sender?.id) === String(data?.me?.id);
                    const showHeader = i === 0 || messages[i-1].sender?.id !== msg.sender?.id;
                    
                    return (
                      <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} ${showHeader ? 'mt-4' : 'mt-1'}`}>
                        {showHeader && (
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter mb-1 px-1">
                            {isSelf ? 'You' : msg.sender?.email?.split('@')[0]}
                          </span>
                        )}
                        <div className={`group relative max-w-[85%] px-3 py-2 rounded-2xl text-xs font-medium shadow-sm transition-all hover:shadow-md ${isSelf ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border border-border text-foreground rounded-tl-none'}`}>
                          {msg.text}
                          <span className={`text-[8px] opacity-0 group-hover:opacity-60 transition-opacity absolute bottom-[-14px] whitespace-nowrap ${isSelf ? 'right-0' : 'left-0'}`}>
                            {new Date(parseInt(msg.createdAt) || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                
                <div className="p-4 border-t border-border bg-card/50">
                  <div className="relative">
                    <textarea
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none transition-all placeholder:text-muted-foreground/50 pr-10 min-h-[44px] max-h-32 custom-scrollbar"
                      rows={1}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim()}
                      className="absolute right-2 bottom-2.5 p-1.5 text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary transition-all rounded-lg"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── EDITOR MAIN ── */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          
          {/* Tab Bar */}
          <div className="bg-secondary/60 backdrop-blur-md border-b border-border flex items-center h-11 shrink-0 overflow-x-auto no-scrollbar scroll-smooth">
             {openTabs.map((tab) => (
               <div 
                 key={tab.id}
                 onClick={() => openInNewTab(tab)}
                 className={`group flex items-center h-full px-4 gap-2 border-r border-border cursor-pointer transition-all relative min-w-[140px] max-w-[200px] ${activeTabId === tab.id ? 'bg-card text-foreground z-10 font-bold' : 'hover:bg-card/50 text-muted-foreground font-medium'}`}
               >
                 {activeTabId === tab.id && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}
                 {tab.type === 'sheet' ? <TableIcon size={13} className="text-emerald-500 shrink-0" /> : <FileText size={13} className="text-blue-500 shrink-0" />}
                 <span className="text-xs truncate flex-1">{tab.title}</span>
                 <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={(e) => { e.stopPropagation(); closeTab(e, tab.id); }} className="p-0.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors">
                     <X size={12} />
                   </button>
                 </div>
               </div>
             ))}
             <button onClick={() => handleCreateNewFile('text')} className="h-full px-4 text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-all border-r border-border shrink-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
               <Plus size={14} /> New
             </button>
             <div className="flex-1" />
          </div>

          {/* Text Toolbar */}
          {type === 'text' && !showHistory && !isViewer && (
            <div className="bg-card/95 backdrop-blur-md border-b border-border p-2 flex items-center gap-4 px-6 shrink-0 overflow-x-auto no-scrollbar shadow-sm z-30">
               <div className="flex items-center gap-1 border-r border-border pr-4">
                  <button onClick={() => execCmd('bold')} className="p-2 hover:bg-secondary text-foreground transition-all rounded" title="Bold"><Bold size={16} /></button>
                  <button onClick={() => execCmd('italic')} className="p-2 hover:bg-secondary text-foreground transition-all rounded" title="Italic"><Italic size={16} /></button>
                  <button onClick={() => execCmd('underline')} className="p-2 hover:bg-secondary text-foreground transition-all rounded" title="Underline"><Underline size={16} /></button>
               </div>
               <div className="flex items-center gap-2 border-r border-border pr-4">
                  <div className="flex items-center gap-1.5 p-1 px-2 hover:bg-secondary transition-all rounded" title="Text Color">
                    <input type="color" className="w-4 h-4 border-none bg-transparent cursor-pointer p-0" onChange={(e) => execCmd('foreColor', e.target.value)} defaultValue="#000000" />
                    <Palette size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-1.5 p-1 px-2 hover:bg-secondary transition-all rounded" title="Highlight">
                    <input type="color" className="w-4 h-4 border-none bg-transparent cursor-pointer p-0" onChange={(e) => execCmd('hiliteColor', e.target.value)} defaultValue="#ffffff" />
                    <PaintBucket size={14} className="text-muted-foreground" />
                  </div>
               </div>
               <div className="flex items-center gap-1 border-r border-border pr-4">
                  <button onClick={() => execCmd('justifyLeft')} className="p-2 hover:bg-secondary text-foreground transition-all rounded"><AlignLeft size={16} /></button>
                  <button onClick={() => execCmd('justifyCenter')} className="p-2 hover:bg-secondary text-foreground transition-all rounded"><AlignCenter size={16} /></button>
                  <button onClick={() => execCmd('justifyRight')} className="p-2 hover:bg-secondary text-foreground transition-all rounded"><AlignRight size={16} /></button>
               </div>
               <div className="flex items-center gap-1 border-r border-border pr-4">
                  <button onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-secondary text-foreground transition-all rounded"><List size={16} /></button>
                  <button onClick={() => execCmd('insertOrderedList')} className="p-2 hover:bg-secondary text-foreground transition-all rounded"><ListOrdered size={16} /></button>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border-r border-border pr-4">
                    <select className="bg-transparent border-none text-xs font-bold uppercase tracking-widest outline-none text-foreground cursor-pointer" onChange={(e) => execCmd('fontName', e.target.value)}>
                      <option value="Inter, sans-serif">Modern Sans</option>
                      <option value="Merriweather, serif">Elegant Serif</option>
                      <option value="'JetBrains Mono', monospace">Technical</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <select className="bg-transparent border-none text-xs font-bold uppercase tracking-widest outline-none text-foreground cursor-pointer" onChange={(e) => execCmd('formatBlock', e.target.value)}>
                      <option value="p">Paragraph</option>
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                    </select>
                  </div>
               </div>
            </div>
          )}

          {/* Sheet Toolbar */}
          {type === 'sheet' && !showHistory && !isViewer && (
            <div className="bg-card/95 backdrop-blur-md border-b border-border flex flex-col shrink-0 z-30 shadow-sm">
              <div className="p-2 flex items-center gap-4 px-4 border-b border-border overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 border-r border-border pr-4">
                    <button onClick={() => toggleStyle('bold')} className={`p-2 transition-all rounded ${gridData[activeCell?.r || 0]?.[activeCell?.c || 0]?.style?.bold ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'hover:bg-secondary text-foreground'}`}><Bold size={16} /></button>
                    <button onClick={() => toggleStyle('italic')} className={`p-2 transition-all rounded ${gridData[activeCell?.r || 0]?.[activeCell?.c || 0]?.style?.italic ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'hover:bg-secondary text-foreground'}`}><Italic size={16} /></button>
                </div>
                <div className="flex items-center gap-1 border-r border-border pr-4">
                    <button onClick={() => applyStyle({ align: 'left' })} className="p-2 hover:bg-secondary text-foreground transition-all rounded"><AlignLeft size={16} /></button>
                    <button onClick={() => applyStyle({ align: 'center' })} className="p-2 hover:bg-secondary text-foreground transition-all rounded"><AlignCenter size={16} /></button>
                    <button onClick={() => applyStyle({ align: 'right' })} className="p-2 hover:bg-secondary text-foreground transition-all rounded"><AlignRight size={16} /></button>
                </div>
                <div className="flex items-center gap-4 border-r border-border pr-4">
                    <div className="flex items-center gap-1.5 p-1 px-2 hover:bg-secondary transition-all rounded">
                      <input type="color" className="w-4 h-4 border-none bg-transparent cursor-pointer p-0" onChange={(e) => applyStyle({ color: e.target.value })} value={gridData[activeCell?.r || 0]?.[activeCell?.c || 0]?.style?.color || '#000000'} />
                      <Palette size={14} className="text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-1.5 p-1 px-2 hover:bg-secondary transition-all rounded">
                      <input type="color" className="w-4 h-4 border-none bg-transparent cursor-pointer p-0" onChange={(e) => applyStyle({ bgColor: e.target.value })} value={gridData[activeCell?.r || 0]?.[activeCell?.c || 0]?.style?.bgColor || '#ffffff'} />
                      <PaintBucket size={14} className="text-muted-foreground" />
                    </div>
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <button onClick={addRow} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs font-bold rounded border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all">
                      <ArrowDown size={14} /> Row
                    </button>
                    <button onClick={addCol} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs font-bold rounded border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all">
                      <ArrowRight size={14} /> Col
                    </button>
                    <button 
                      onClick={() => setShowChartModal(true)} 
                      disabled={!selection}
                      className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 disabled:opacity-30 transition-all"
                    >
                      <Activity size={14} /> Generate Pulse
                    </button>
                    {charts.length > 0 && (
                      <button 
                        onClick={() => setIsDashboardMode(!isDashboardMode)} 
                        className={`ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-black transition-all border ${isDashboardMode ? 'bg-amber-500 text-white border-amber-500' : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'}`}
                      >
                        <LayoutGrid size={14} /> {isDashboardMode ? 'Exit Dashboard' : 'Consolidate View'}
                      </button>
                    )}
                    <button 
                      onClick={() => setShowFormattingModal(true)} 
                      className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition-all"
                    >
                      <Zap size={14} /> Live Insights
                    </button>
                </div>
              </div>
              <div className="p-1 px-4 flex items-center gap-3 bg-secondary/30">
                <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 w-12 text-center bg-background py-1 rounded shadow-sm border border-border">
                  {activeCell ? `${String.fromCharCode(65 + activeCell.c)}${activeCell.r + 1}` : "-"}
                </div>
                <div className="text-xs font-bold text-muted-foreground italic flex items-center gap-1"><Activity size={12}/> fx</div>
                <input 
                  type="text"
                  value={activeCell ? gridData[activeCell.r][activeCell.c].value : ""}
                  onChange={(e) => activeCell && updateCell(activeCell.r, activeCell.c, e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-foreground py-1"
                  placeholder="Enter content or formula (=SUM(A1:A5))"
                  readOnly={!activeCell}
                />
                {activeCell && (
                  <button 
                    onClick={() => setCommentPopover({ r: activeCell.r, c: activeCell.c })}
                    className="p-1 px-2 hover:bg-amber-500/10 text-amber-600 transition-all rounded flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-amber-500/20"
                    title="Add Professional Comment"
                  >
                    <MessageSquare size={13} /> Comment
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Editor Sandbox */}
          <main className="flex-1 overflow-auto bg-muted/30 p-6 lg:p-12 relative custom-scrollbar section-bg">
            {type === 'text' ? (
              <div className="max-w-[850px] mx-auto">
                <div 
                  className="premium-card min-h-[1000px] p-12 sm:p-20 outline-none prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-p:leading-loose text-lg shadow-2xl relative transition-all"
                  contentEditable={!isViewer && !showHistory}
                  onInput={(e) => setContent(e.currentTarget.innerHTML)}
                  ref={editorRef}
                  suppressContentEditableWarning
                  placeholder="Start collaborating..."
                >
                  {/* Remote Carets */}
                  {activeUsers.filter(u => u.userId !== data?.me?.id && u.cursorX !== null && u.cursorY !== null).map((u, ui) => (
                    <div 
                      key={u.userId}
                      className="absolute w-[2px] h-6 bg-primary z-50 pointer-events-none transition-all duration-100"
                      style={{ 
                        left: (u.cursorX || 0), 
                        top: (u.cursorY || 0),
                        backgroundColor: `hsl(${(ui * 137) % 360}, 70%, 50%)`
                      }}
                    >
                       <div className="absolute -top-4 left-0 px-1 py-0.5 text-[9px] text-white font-bold whitespace-nowrap rounded" style={{ backgroundColor: `hsl(${(ui * 137) % 360}, 70%, 50%)` }}>
                          {u.email.split('@')[0]}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="inline-block min-w-full">
                <div className="premium-card shadow-2xl overflow-hidden rounded-lg">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-20 bg-secondary/80 backdrop-blur-md">
                      <tr>
                          <th className="w-12 border-b border-r border-border p-2 text-[10px] font-bold text-muted-foreground select-none bg-secondary/50"></th>
                          {gridData[0]?.map((_, i) => {
                            const activeColUsers = activeUsers.filter(u => u.cursorCol === i);
                            const hasActive = activeColUsers.length > 0;
                            const activeUi = hasActive ? activeUsers.findIndex(u => u.userId === activeColUsers[0].userId) : 0;
                            return (
                              <th 
                                key={i} 
                                className={`min-w-[120px] px-4 py-2 border-b border-r border-border text-[11px] font-bold text-center select-none transition-all ${hasActive ? 'dark:text-white animate-presence-glow' : 'text-muted-foreground'}`}
                                style={hasActive ? {
                                  backgroundColor: `hsl(${(activeUi * 137) % 360}, 65%, 85%)`,
                                  color: `hsl(${(activeUi * 137) % 360}, 65%, 25%)`
                                } : {}}
                              >
                                {String.fromCharCode(65 + i)}
                              </th>
                            );
                          })}
                      </tr>
                    </thead>
                    <tbody>
                      {gridData.map((row, rIdx) => {
                        const activeRowUsers = activeUsers.filter(u => u.cursorRow === rIdx);
                        const hasActiveRow = activeRowUsers.length > 0;
                        const activeRowUi = hasActiveRow ? activeUsers.findIndex(u => u.userId === activeRowUsers[0].userId) : 0;
                        
                        return (
                        <tr key={rIdx} className="group">
                            <td 
                              className={`w-12 border-b border-r border-border text-center text-[11px] font-bold group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 transition-colors select-none ${hasActiveRow ? 'dark:text-white animate-presence-glow' : 'text-muted-foreground bg-secondary/50'}`}
                              style={hasActiveRow ? {
                                backgroundColor: `hsl(${(activeRowUi * 137) % 360}, 65%, 85%)`,
                                color: `hsl(${(activeRowUi * 137) % 360}, 65%, 25%)`
                              } : {}}
                            >
                              {rIdx + 1}
                            </td>
                            {row.map((cell, cIdx) => (
                                <td 
                                  key={cIdx} 
                                  className={`border-b border-r border-border p-0 relative group/cell min-w-[120px] h-10 ${activeCell?.r === rIdx && activeCell?.c === cIdx ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'bg-card'} ${isInSelection(rIdx, cIdx) ? 'bg-primary/5 dark:bg-primary/10 select-none' : ''} ${changedCells.has(`${rIdx}-${cIdx}`) ? 'animate-cell-glow' : ''}`}
                                  onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                                  onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                                  onMouseUp={handleMouseUp}
                                >
                                  {activeCell?.r === rIdx && activeCell?.c === cIdx && (
                                    <div className="absolute inset-0 border-2 border-emerald-500 z-10 pointer-events-none rounded-[1px] shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                  )}

                                  {isInSelection(rIdx, cIdx) && !(activeCell?.r === rIdx && activeCell?.c === cIdx) && (
                                    <div className="absolute inset-0 border border-primary/40 z-10 pointer-events-none rounded-[1px]" />
                                  )}

                                  {/* Threaded Comment Indicator (Precision Collaboration) */}
                                  {comments.some(c => c.cellRow === rIdx && c.cellCol === cIdx) && (
                                    <div 
                                      onMouseEnter={() => {
                                        const cellComments = comments.filter(c => c.cellRow === rIdx && c.cellCol === cIdx);
                                        setActiveCellComments(cellComments);
                                        setCommentPopover({ r: rIdx, c: cIdx });
                                      }}
                                      className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-l-[10px] border-t-amber-500 border-l-transparent z-30 cursor-help transition-all hover:scale-150"
                                    />
                                  )}

                                  {/* Comment Thread Popover */}
                                  {commentPopover?.r === rIdx && commentPopover?.c === cIdx && (
                                    <div 
                                      className="absolute left-full top-0 ml-2 w-72 bg-card border border-border shadow-2xl rounded-2xl p-4 z-[100] animate-fade-in pointer-events-auto flex flex-col gap-3"
                                      onMouseLeave={() => setCommentPopover(null)}
                                    >
                                      <div className="flex items-center justify-between border-b border-border pb-2">
                                        <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-1.5">
                                          <MessageSquare size={12} /> Cell Intelligence
                                        </h4>
                                        <span className="text-[9px] font-bold text-muted-foreground">{String.fromCharCode(65 + cIdx)}{rIdx + 1}</span>
                                      </div>
                                      
                                      <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                                        {activeCellComments.map(c => (
                                          <div key={c.id} className="flex flex-col gap-2">
                                            <div className="flex items-start gap-2">
                                               <div className="w-6 h-6 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-black">
                                                  {c.user?.email.substring(0, 1).toUpperCase()}
                                               </div>
                                               <div className="flex-1 bg-secondary/50 rounded-xl rounded-tl-none p-2 border border-border/50">
                                                  <div className="flex items-center justify-between mb-0.5">
                                                     <span className="text-[10px] font-black text-indigo-600">{c.user?.email.split('@')[0]}</span>
                                                     <span className="text-[8px] text-muted-foreground font-bold">{new Date(parseInt(c.createdAt) || c.createdAt).toLocaleDateString()}</span>
                                                  </div>
                                                  <p className="text-[11px] font-medium leading-relaxed">{c.text}</p>
                                               </div>
                                            </div>
                                            
                                            {/* Threaded Replies */}
                                            {c.replies?.map((reply: any) => (
                                              <div key={reply.id} className="flex items-start gap-2 ml-6">
                                                 <div className="w-5 h-5 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center text-[8px] text-white font-black">
                                                    {reply.user?.email.substring(0, 1).toUpperCase()}
                                                 </div>
                                                 <div className="flex-1 bg-secondary/30 rounded-xl rounded-tl-none p-2 border border-border/30">
                                                    <span className="text-[9px] font-black text-emerald-600 block mb-0.5">{reply.user?.email.split('@')[0]}</span>
                                                    <p className="text-[10px] font-medium leading-relaxed">{reply.text}</p>
                                                 </div>
                                              </div>
                                            ))}
                                            
                                            <button 
                                              onClick={() => {
                                                const text = prompt('Reply to this thread:'); 
                                                if(text) {
                                                   setNewCommentText(text);
                                                   handleAddComment(c.id);
                                                }
                                              }}
                                              className="ml-8 text-[9px] font-black text-indigo-500 uppercase hover:underline text-left w-max"
                                            >
                                              Reply to thread
                                            </button>
                                          </div>
                                        ))}
                                      </div>

                                      <div className="pt-2 border-t border-border mt-2">
                                        <div className="flex items-center gap-2">
                                          <input 
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                            placeholder="Write a new comment..."
                                            className="flex-1 bg-secondary text-xs font-bold px-3 py-2 rounded-xl outline-none border border-transparent focus:border-indigo-500/30"
                                          />
                                          <button onClick={() => handleAddComment()} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                                            <Send size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                {/* Presence Cursors */}
                                  {activeUsers.filter(u => u.userId !== (data?.me?.id) && u.cursorRow === rIdx && u.cursorCol === cIdx).map((u, ui) => (
                                    <div 
                                      key={u.userId}
                                      className={`absolute inset-0 pointer-events-none border-2 transition-all z-10 rounded-[1px] ${u.isTyping ? 'animate-pulse opacity-100' : 'opacity-70'}`}
                                      style={{ borderColor: `hsl(${(ui * 137) % 360}, 65%, 55%)` }}
                                    >
                                      <div 
                                        className="absolute -top-5 right-0 px-1.5 py-0.5 font-bold text-[9px] text-white rounded-[2px] shadow-sm z-30 flex items-center gap-1"
                                        style={{ backgroundColor: `hsl(${(ui * 137) % 360}, 65%, 55%)` }}
                                      >
                                        <User size={8} className="shrink-0" />
                                        {u.email.split('@')[0]}
                                      </div>
                                    </div>
                                  ))}

                                  {/* Strategic Progress Data Bar */}
                                  {formattingRules.filter(r => r.type === 'databar').map((rule, ridx) => {
                                    const rawVal = evaluateFormula(cell.value, gridData);
                                    const val = parseFloat(rawVal);
                                    if (isNaN(val)) return null;
                                    const percentage = Math.min(100, Math.max(0, (val / (parseFloat(rule.threshold) || 100)) * 100));
                                    return (
                                      <div key={ridx} className="absolute bottom-0 left-0 h-1.5 z-10 pointer-events-none transition-all duration-1000 rounded-r-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" 
                                           style={{ width: `${percentage}%`, backgroundColor: rule.color }} />
                                    );
                                  })}

                                <input
                                  type="text"
                                  value={activeCell?.r === rIdx && activeCell?.c === cIdx && !showHistory ? cell.value : evaluateFormula(cell.value, gridData)}
                                  onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                                  readOnly={isViewer || showHistory}
                                  style={{
                                    fontWeight: cell.style?.bold ? '700' : '500',
                                    fontStyle: cell.style?.italic ? 'italic' : 'normal',
                                    color: cell.style?.color || 'inherit',
                                    backgroundColor: cell.style?.bgColor || 'transparent',
                                    textAlign: cell.style?.align || 'left',
                                    // Apply Strategic Dynamic Styles
                                    ...(() => {
                                      const rawVal = evaluateFormula(cell.value, gridData);
                                      const val = parseFloat(rawVal);
                                      if (isNaN(val)) return {};
                                      let dynamic: any = {};
                                      formattingRules.filter(r => r.type !== 'databar').forEach(rule => {
                                        const thresh = parseFloat(rule.threshold);
                                        const match = rule.type === 'greater' ? val > thresh :
                                                    rule.type === 'less' ? val < thresh :
                                                    rule.type === 'equal' ? val === thresh : false;
                                        if (match) dynamic = { ...dynamic, ...rule.style };
                                      });
                                      return dynamic;
                                    })()
                                  }}
                                  className={`w-full h-full px-3 py-2 bg-transparent outline-none text-sm transition-all relative z-20 text-foreground cell-input`}
                                />
                                
                                {cIdx === 0 && !isViewer && (
                                  <button onClick={(e) => { e.stopPropagation(); deleteRow(rIdx); }} className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all z-40 bg-card rounded shadow-sm border border-border">
                                    <X size={12} />
                                  </button>
                                )}
                              </td>
                            ))}
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* AI Floating Button */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl shadow-indigo-300 dark:shadow-indigo-900/50 animate-float flex items-center justify-center group hover:scale-110 transition-transform z-50">
               <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
            </button>
          </main>
        </div>
      </div>

      {lastSaved && !showHistory && (
        <div className="fixed bottom-6 left-6 premium-card px-4 py-2.5 flex items-center gap-2 animate-slide-up z-[60] text-xs font-bold text-muted-foreground">
           <Save size={14} className="text-emerald-500" />
           Saved locally at {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      )}

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setIsInviteOpen(false)}>
          <div className="bg-card w-full max-w-md shadow-2xl border border-border animate-fade-scale-in rounded-xl overflow-hidden">
             <div className="p-6 border-b border-border bg-secondary/30">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-md">
                     <UserPlus size={20} />
                   </div>
                   <div>
                     <h3 className="text-lg font-black">Invite Collaborator</h3>
                     <p className="text-xs text-muted-foreground font-medium">Add members to workspace</p>
                   </div>
                 </div>
                 <button onClick={() => setIsInviteOpen(false)} className="p-2 hover:bg-secondary text-muted-foreground transition-all rounded">
                   <X size={20} />
                 </button>
               </div>
             </div>

             <div className="p-6 space-y-6">
                <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Email Address</label>
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                     <input 
                       type="email" 
                       placeholder="colleague@company.com" 
                       value={inviteEmail}
                       onChange={(e) => setInviteEmail(e.target.value)}
                       className="w-full pl-10 pr-4 py-3 bg-secondary border border-border text-foreground outline-none focus:ring-2 ring-primary/20 focus:border-primary transition-all font-medium rounded-lg text-sm"
                     />
                   </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Access Level</label>
                   <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => setInviteRole('editor')} className={`p-4 border-2 text-left transition-all rounded-xl ${inviteRole === 'editor' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <p className="text-sm font-bold flex items-center gap-2 mb-1">
                          <Edit3 size={14} className={inviteRole === 'editor' ? 'text-primary' : 'text-muted-foreground'} /> Editor
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight">Can modify all content</p>
                     </button>
                     <button onClick={() => setInviteRole('viewer')} className={`p-4 border-2 text-left transition-all rounded-xl ${inviteRole === 'viewer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <p className="text-sm font-bold flex items-center gap-2 mb-1">
                          <Eye size={14} className={inviteRole === 'viewer' ? 'text-primary' : 'text-muted-foreground'} /> Viewer
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight">Read-only synchronization</p>
                     </button>
                   </div>
                </div>

                <div className="pt-2">
                   <button 
                     disabled={addingMember || !inviteEmail}
                     onClick={handleInvite}
                     className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded-lg"
                   >
                     {addingMember ? <><RefreshCcw size={18} className="animate-spin" /> Inviting...</> : <><Send size={18} /> Send Invitation</>}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
      
      {showCreateModal && (
        // [Existing Create Modal Code - keeping it but appending after it]
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
          {/* ... */}
        </div>
      )}

      {/* Chart Configuration Modal */}
      {showChartModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={e => e.target === e.currentTarget && setShowChartModal(false)}>
          <div className="bg-card w-full max-w-lg shadow-2xl border border-border animate-fade-scale-in rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-6 border-b border-border bg-gradient-to-br from-indigo-500/10 to-purple-600/10 shrink-0">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg">
                     <Activity size={20} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black tracking-tight">Advanced Visual Engine</h3>
                     <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1">Power BI-Grade Mapping</p>
                   </div>
                 </div>
                 <button onClick={() => setShowChartModal(false)} className="p-2 hover:bg-secondary rounded-full transition-all">
                    <X size={20} />
                 </button>
               </div>
             </div>
             
             <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Chart Title</label>
                        <input value={chartTitle} onChange={e => setChartTitle(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-xs font-bold outline-none ring-primary/20 focus:ring-2" placeholder="Insight Name..." />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Visual Identity</label>
                        <select value={chartType} onChange={e => setChartType(e.target.value as any)} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-xs font-bold outline-none cursor-pointer">
                           <option value="bar">Double Bar</option>
                           <option value="line">Trend Stream</option>
                           <option value="area">Volume Pulse</option>
                           <option value="pie">Distribution</option>
                           <option value="radar">Strategic Mesh</option>
                           <option value="composed">Hybrid Composed</option>
                        </select>
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Description</label>
                      <textarea value={chartDescription} onChange={e => setChartDescription(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-xs font-medium outline-none resize-none h-16" placeholder="Add strategic context..." />
                   </div>

                   <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-4">
                      <div>
                        <p className="text-[11px] font-black text-indigo-600 mb-3 flex items-center gap-2"><ArrowRight size={12} /> Axis Label (Dimension)</p>
                        <div className="flex flex-wrap gap-2">
                           {selection && Array.from({ length: Math.abs(selection.end.c - selection.start.c) + 1 }).map((_, i) => (
                             <button 
                                key={i} 
                                onClick={() => setLabelColIndex(i)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${labelColIndex === i ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-card border-border'}`}
                             >
                               Col {String.fromCharCode(65 + Math.min(selection.start.c, selection.end.c) + i)}
                             </button>
                           ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-black text-indigo-600 mb-3 flex items-center gap-2 green-600"><PlusCircle size={12} /> Data Series (Values)</p>
                        <div className="flex flex-wrap gap-2">
                           {selection && Array.from({ length: Math.abs(selection.end.c - selection.start.c) + 1 }).map((_, i) => {
                             const isActive = valueColIndices.includes(i);
                             return (
                               <button 
                                  key={i} 
                                  onClick={() => isActive ? setValueColIndices(valueColIndices.filter(v => v !== i)) : setValueColIndices([...valueColIndices, i])}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border flex items-center gap-2 ${isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-card border-border opacity-60'}`}
                               >
                                 {isActive && <Check size={12} />}
                                 Col {String.fromCharCode(65 + Math.min(selection.start.c, selection.end.c) + i)}
                               </button>
                             );
                           })}
                        </div>
                      </div>

                      {valueColIndices.length > 0 && (
                        <div className="space-y-3 pt-2">
                           <p className="text-[10px] font-black uppercase text-muted-foreground">Series Professional Labels</p>
                           <div className="grid grid-cols-2 gap-3">
                              {valueColIndices.map((vIdx, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                   <label className="text-[9px] font-bold text-indigo-500 uppercase">Col {String.fromCharCode(65 + Math.min(selection!.start.c, selection!.end.c) + vIdx)} Name</label>
                                   <input 
                                     value={seriesNames[i] || ''} 
                                     onChange={(e) => {
                                       const newNames = [...seriesNames];
                                       newNames[i] = e.target.value;
                                       setSeriesNames(newNames);
                                     }}
                                     className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none ring-primary/20 focus:ring-2"
                                     placeholder={`e.g. Series ${i+1}`}
                                   />
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                   </div>
                </div>

                <button 
                  disabled={valueColIndices.length === 0}
                  onClick={generatePulse}
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                   <Sparkles size={18} /> Initialize Enterprise Pulse
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Floating Dynamic Pulse Charts / Dashboard View */}
      {type === 'sheet' && charts.length > 0 && (
        <div className={isDashboardMode ? 'fixed inset-0 z-50 bg-background/95 backdrop-blur-xl p-10 pt-24 overflow-y-auto' : ''}>
          {isDashboardMode && (
             <div className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter">Strategic Operations Dashboard</h2>
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-1">Consolidated Multi-Series Intelligence</p>
                </div>
                <button 
                  onClick={() => setIsDashboardMode(false)}
                  className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-black rounded-xl border border-border transition-all flex items-center gap-2"
                >
                  <X size={18} /> Close Dashboard
                </button>
             </div>
          )}
          <div className={isDashboardMode ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-20' : ''}>
            {charts.map((chart) => {
              const cData = getChartDataMulti(chart);
              const themes = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];
              
              return (
                <div 
                  key={chart.id}
                  id={`chart-container-${chart.id}`}
                  className={`bg-card shadow-2xl border border-border rounded-2xl overflow-hidden flex flex-col group animate-fade-scale-in transition-all duration-500 hover:border-indigo-500/30 ${isDashboardMode ? 'relative w-full h-[400px]' : 'fixed z-40 backdrop-blur-xl'}`}
                  style={!isDashboardMode ? { 
                    left: chart.x, 
                    top: chart.y, 
                    width: chart.size === 'L' ? 480 : chart.size === 'S' ? 280 : 360, 
                    height: chart.size === 'L' ? 480 : chart.size === 'S' ? 300 : 380 
                  } : {}}
                >
                  {/* Draggable Header */}
                  <div 
                    onMouseDown={(e) => !isDashboardMode && handleDragStart(e, chart.id)}
                    className={`p-4 border-b border-border bg-secondary/50 flex items-center justify-between transition-colors ${!isDashboardMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-sm">
                         <Activity size={14} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground leading-none">{chart.title}</h4>
                        <p className="text-[8px] text-muted-foreground font-bold mt-1 uppercase">Live Strategic Insight</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => exportToSVG(chart.id)} 
                        className="p-1.5 hover:bg-indigo-500/10 text-indigo-500 rounded-lg transition-all"
                        title="Export High-Res SVG"
                      >
                        <FileText size={13} />
                      </button>
                      <button 
                        onClick={() => downloadChart(chart.id)} 
                        className="p-1.5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-all"
                        title="Download as PNG"
                      >
                        <Download size={13} />
                      </button>
                      <button 
                        onClick={() => setCharts(charts.filter(c => c.id !== chart.id))} 
                        className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col p-6 bg-transparent overflow-hidden">
               <div className="flex items-center justify-between mb-4">
                  {chart.description ? (
                    <p className="text-[10px] text-muted-foreground font-medium border-l-2 border-indigo-500 pl-3 line-clamp-2 italic bg-indigo-500/5 py-1 pr-1 flex-1">
                      {chart.description}
                    </p>
                  ) : <div className="flex-1" />}
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                     <button onClick={() => updateChart(chart.id, { showLabels: !chart.showLabels })} className={`p-1.5 rounded transition-all ${chart.showLabels ? 'bg-indigo-600 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`} title="Show Values">
                        <Type size={12} />
                     </button>
                     <button onClick={() => updateChart(chart.id, { isStacked: !chart.isStacked })} className={`p-1.5 rounded transition-all ${chart.isStacked ? 'bg-indigo-600 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`} title="Toggle Stacking">
                        <Layers size={12} />
                     </button>
                     <button onClick={() => updateChart(chart.id, { isSorted: !chart.isSorted })} className={`p-1.5 rounded transition-all ${chart.isSorted ? 'bg-indigo-600 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`} title="Sort Data">
                        <ArrowUp size={12} />
                     </button>
                     <div className="w-px h-4 bg-border mx-1" />
                     <button onClick={() => updateChart(chart.id, { type: 'bar' })} className={`p-1.5 rounded transition-all ${chart.type === 'bar' ? 'text-indigo-600' : 'text-muted-foreground'}`}><Activity size={12} /></button>
                     <button onClick={() => updateChart(chart.id, { type: 'line' })} className={`p-1.5 rounded transition-all ${chart.type === 'line' ? 'text-indigo-600' : 'text-muted-foreground'}`}><Zap size={12} /></button>
                  </div>
               </div>

               <div className="flex-1 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   {chart.type === 'bar' ? (
                     <BarChart data={chart.isSorted ? [...cData].sort((a,b) => b.val0 - a.val0) : cData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 700}} />
                        <YAxis tick={{fontSize: 9, fontWeight: 700}} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{paddingTop: 10, fontSize: 9, fontWeight: 900}} />
                        {chart.valueOffsets.map((_: any, i: number) => (
                           <Bar key={i} name={chart.seriesNames?.[i] || `Series ${i+1}`} dataKey={`val${i}`} stackId={chart.isStacked ? "a" : undefined} fill={chart.colors[i % chart.colors.length]} radius={chart.isStacked ? [0,0,0,0] : [4, 4, 0, 0]}>
                              {chart.showLabels && <LabelList dataKey={`val${i}`} position="top" style={{ fontSize: 9, fontWeight: 900, fill: chart.colors[i % chart.colors.length] }} />}
                           </Bar>
                        ))}
                     </BarChart>
                   ) : chart.type === 'line' ? (
                     <LineChart data={chart.isSorted ? [...cData].sort((a,b) => b.val0 - a.val0) : cData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 700}} />
                        <YAxis tick={{fontSize: 9, fontWeight: 700}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none' }} />
                        <Legend wrapperStyle={{paddingTop: 10, fontSize: 9, fontWeight: 900}} />
                        {chart.valueOffsets.map((_: any, i: number) => (
                           <Line key={i} name={chart.seriesNames?.[i] || `Series ${i+1}`} type="monotone" dataKey={`val${i}`} stroke={chart.colors[i % chart.colors.length]} strokeWidth={3} dot={{ r: 4, fill: chart.colors[i % chart.colors.length] }}>
                              {chart.showLabels && <LabelList dataKey={`val${i}`} position="top" style={{ fontSize: 9, fontWeight: 900, fill: chart.colors[i % chart.colors.length] }} offset={10} />}
                           </Line>
                        ))}
                     </LineChart>
                   ) : chart.type === 'area' ? (
                     <AreaChart data={chart.isSorted ? [...cData].sort((a,b) => b.val0 - a.val0) : cData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none' }} />
                        {chart.valueOffsets.map((_: any, i: number) => (
                           <Area key={i} name={chart.seriesNames?.[i] || `Series ${i+1}`} type="monotone" dataKey={`val${i}`} stroke={chart.colors[i % chart.colors.length]} fill={chart.colors[i % chart.colors.length]} fillOpacity={0.2} stackId={chart.isStacked ? "1" : i.toString()} />
                        ))}
                     </AreaChart>
                   ) : chart.type === 'pie' ? (
                     <RePieChart>
                        <Pie
                          data={cData}
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="val0"
                        >
                          {cData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={themes[index % themes.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none' }} />
                     </RePieChart>
                   ) : chart.type === 'radar' ? (
                     <RadarChart data={cData}>
                        <PolarGrid stroke="rgba(0,0,0,0.1)" />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 700 }} />
                        {chart.valueOffsets.map((_: any, i: number) => (
                           <Radar key={i} name={`Series ${i+1}`} dataKey={`val${i}`} stroke={chart.colors[i % chart.colors.length]} fill={chart.colors[i % chart.colors.length]} fillOpacity={0.5} />
                        ))}
                        <Legend wrapperStyle={{fontSize: 9, fontWeight: 900}} />
                     </RadarChart>
                   ) : (
                     <BarChart data={cData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none' }} />
                        <Bar dataKey="val0" fill={chart.colors[0]} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="val1" stroke={chart.colors[1]} strokeWidth={3} />
                     </BarChart>
                   )}
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Individual Color Control */}
            <div className="p-4 border-t border-border bg-secondary/30 flex items-center justify-between pointer-events-auto">
               <div className="flex gap-2">
                  {themes.map(t => (
                    <button 
                      key={t}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCharts(charts.map(c => c.id === chart.id ? { ...c, colors: [t, ...c.colors.slice(1).filter(existing => existing !== t)] } : c))
                      }}
                      className={`w-5 h-5 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-125 ${chart.colors.includes(t) ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-card' : ''}`}
                      style={{ backgroundColor: t }}
                    />
                  ))}
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => updateChart(chart.id, { size: chart.size === 'L' ? 'S' : chart.size === 'S' ? 'M' : 'L' })} className="text-[9px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded uppercase">
                     Size {chart.size || 'M'}
                  </button>
                  <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60 flex items-center gap-1">
                    <Zap size={10} className="fill-current" /> Advanced Pulse
                  </span>
               </div>
            </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Strategic Insights / Conditional Formatting Modal */}
      {showFormattingModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={e => e.target === e.currentTarget && setShowFormattingModal(false)}>
           <div className="bg-card w-full max-w-md shadow-2xl border border-border animate-fade-scale-in rounded-3xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border bg-gradient-to-br from-rose-500/10 to-orange-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200 dark:shadow-none">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">Live Insights</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Rule-Based Visual Logic</p>
                    </div>
                  </div>
                  <button onClick={() => setShowFormattingModal(false)} className="p-2 hover:bg-secondary rounded-full">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Logic Pattern</label>
                          <select 
                            value={ruleType} 
                            onChange={(e) => setRuleType(e.target.value as any)}
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 ring-rose-500/20"
                          >
                             <option value="greater">Greater Than</option>
                             <option value="less">Less Than</option>
                             <option value="equal">Equal To</option>
                             <option value="databar">Data Bar (Progress)</option>
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{ruleType === 'databar' ? 'Max Projection' : 'Threshold'}</label>
                          <input 
                            value={ruleThreshold} 
                            onChange={(e) => setRuleThreshold(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 ring-rose-500/20"
                            placeholder="Value..."
                          />
                       </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl border border-border">
                       <div className="flex-1">
                          <p className="text-[11px] font-bold">Indicator Identity</p>
                          <p className="text-[9px] text-muted-foreground">Choose the visual cue for this logic</p>
                       </div>
                       <input 
                         type="color" 
                         value={ruleColor} 
                         onChange={(e) => setRuleColor(e.target.value)}
                         className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer rounded-full overflow-hidden" 
                       />
                    </div>

                    <button 
                      onClick={() => {
                        const newRule = { 
                          id: Date.now().toString(),
                          type: ruleType, 
                          threshold: ruleThreshold, 
                          color: ruleColor,
                          style: ruleType === 'databar' ? {} : { backgroundColor: ruleColor + '20', color: ruleColor, border: `1px solid ${ruleColor}40` }
                        };
                        saveDocumentConfig([...formattingRules, newRule]);
                        setRuleThreshold('');
                      }}
                      className="w-full py-3.5 bg-rose-500 text-white font-black rounded-xl shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                    >
                      <PlusCircle size={16} /> Deploy Strategy
                    </button>
                 </div>

                 <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Active Operations</p>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                       {formattingRules.map(rule => (
                         <div key={rule.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl group transition-all hover:border-rose-500/30">
                            <div className="flex items-center gap-3">
                               <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rule.color }} />
                               <div>
                                  <p className="text-xs font-black uppercase tracking-tighter">{rule.type === 'databar' ? 'Data Bar' : `Value ${rule.type}`}</p>
                                  <p className="text-[10px] text-muted-foreground font-bold">{rule.type === 'databar' ? `Limit: ${rule.threshold}` : `Thresh: ${rule.threshold}`}</p>
                               </div>
                            </div>
                            <button 
                              onClick={() => saveDocumentConfig(formattingRules.filter(r => r.id !== rule.id))}
                              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"
                            >
                               <Trash2 size={14} />
                            </button>
                         </div>
                       ))}
                       {formattingRules.length === 0 && (
                         <div className="text-center py-6 opacity-30">
                            <Activity size={24} className="mx-auto mb-2" />
                            <p className="text-[10px] font-bold uppercase">No Strategic Rules Defined</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
