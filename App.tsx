import {
  NeuralEngine,
  AcademicLevel,
  HistoryItem,
  QuickSource,
  StrictRule,
  SettingsTab,
  UserSession,
  BrandSettings,
  InstructionTemplate,
  Priority,
  RuleCategory,
  ExternalKeys,
  ChatMessage,
  AnswerStrategy
} from './types';
import {
  INITIAL_MODULES,
  LANGUAGES,
  ACADEMIC_LEVELS,
  GLOBAL_STRICT_COMMAND,
  BORDER_FRAME_INSTRUCTION,
  PART_BACKGROUND_INSTRUCTION,
  INSTRUCTION_HEADER_BACKGROUND_INSTRUCTION,
  PAGE_STYLES,
  DEFAULT_STRICT_RULES,
  DEFAULT_MASTER_PROTOCOLS,
  INITIAL_TEMPLATES,
  THEMES
} from './constants';

// --- THE NEW FIREBASE MAGIC ---
import { db, auth, googleProvider } from './firebase';
import { collection, addDoc, doc, getDoc, setDoc, updateDoc, query, where, getDocs, orderBy, limit, getDocFromServer } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
// ------------------------------

import { callNeuralEngine } from './services/neuralService';
import { exportToWord } from './services/wordExportService';
import React, { useState, useEffect, useRef } from 'react';
import Worksheet from './components/Worksheet';
import NeuralChatAssistant from './components/NeuralChatAssistant'
import Sidebar from './components/Sidebar';
import { OnboardingTutorial } from './components/OnboardingTutorial';
const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  fontSize: 12,
  fontWeight: '800',
  letterSpacing: 0,
  textTransform: 'none',
  schoolName: 'DPSS ULTIMATE TEST BUILDER',
  schoolAddress: 'Developing Potential for Success School',
  logos: Array(30).fill(undefined),
  logoWidth: 300,
  logoData: undefined,
  activeFont: 'Times New Roman',
  randomizeFont: true
};

const DEFAULT_SESSION: UserSession = {
  name: 'Public User',
  email: 'public@dpss.edu',
  code: 'dpss',
  loginTime: Date.now()
};

const MASTER_PROTOCOLS_KEY = 'dp_master_v46';
const STRICT_RULES_KEY = 'dp_rules_v46';
const TEMPLATES_KEY = 'dp_templates_v46';
const HISTORY_KEY = 'dp_history_v46';
const BRAND_SETTINGS_KEY = 'dp_brand_v46';
const USER_SESSION_KEY = 'dp_session_v46';
const ENGINE_CONFIG_KEY = 'dp_engine_config_v46';
const ONBOARDING_KEY = 'dp_onboarding_v1';

function App() {
  const [session, setSession] = useState<UserSession>({
    name: 'Public User',
    email: 'public@dpss.edu',
    code: 'dpss',
    loginTime: Date.now()
  });

  const [authLoading, setAuthLoading] = useState(false);

  const [viewMode, setViewMode] = useState<'generator' | 'preview' | 'book_creation' | 'ielts_master' | 'dpss_studio' | 'grammar_iframe' | 'khmer_program'>('generator');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);
  const [activeModule, setActiveModule] = useState<string>('Grammar');
  const [activeLanguage, setActiveLanguage] = useState<string>('English');
  const [activeLevel, setActiveLevel] = useState<AcademicLevel>('Level 1');
  const [answerStrategy, setAnswerStrategy] = useState<AnswerStrategy>('GENERAL_MIXED');
  const [topic, setTopic] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [worksheetContent, setWorksheetContent] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('COMMAND');
  const [isFrameEnabled, setIsFrameEnabled] = useState(true);
  const [enablePages, setEnablePages] = useState(false);
  const [isPartBackgroundEnabled, setIsPartBackgroundEnabled] = useState(false);
  const [isInstructionBackgroundEnabled, setIsInstructionBackgroundEnabled] = useState(true);
  const [globalLayout, setGlobalLayout] = useState<number>(0); // 0: Clean, 1: Lined, 2: Grid
  
  const [activeLogicCategory, setActiveLogicCategory] = useState<RuleCategory>('General');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [activeProtocolCategory, setActiveProtocolCategory] = useState<RuleCategory>('General');
  const [expandedProtocolId, setExpandedProtocolId] = useState<string | null>(null);
  const [activeTemplateCategory, setActiveTemplateCategory] = useState<string>('GRAMMAR');
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('dp_theme_v30');
      return saved || 'default';
    } catch { return 'default'; }
  });

  const [activeEngine, setActiveEngine] = useState<NeuralEngine>(() => {
    try {
      const saved = localStorage.getItem(ENGINE_CONFIG_KEY);
      return saved ? JSON.parse(saved).active : NeuralEngine.GEMINI_3_FLASH_LITE;
    } catch { return NeuralEngine.GEMINI_3_FLASH_LITE; }
  });

  const [externalKeys, setExternalKeys] = useState<ExternalKeys>(() => {
    try {
      const saved = localStorage.getItem(ENGINE_CONFIG_KEY);
      return saved ? JSON.parse(saved).keys : {};
    } catch { return {}; }
  });
  
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => {
    try {
      const saved = localStorage.getItem(BRAND_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_BRAND_SETTINGS;
    } catch { return DEFAULT_BRAND_SETTINGS; }
  });

  const [isBrandLoaded, setIsBrandLoaded] = useState(false);
  const loadedEmailRef = useRef<string | null>(null);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSession({
          name: user.displayName || 'User',
          email: user.email || '',
          code: 'dpss',
          loginTime: Date.now()
        });
      } else {
        setSession(DEFAULT_SESSION);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSession(DEFAULT_SESSION);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

  // Handle Module Defaults
  useEffect(() => {
    if (activeModule === 'Grammar') {
      setSelectedInstructionIds(['g_mcq', 'g_correct_incorrect', 'g_circle', 'g_complete_sentences', 'g_pair', 'g_best_rewrite']);
      setItemCountOverrides(prev => ({
        ...prev,
        'g_mcq': 10,
        'g_correct_incorrect': 20,
        'g_circle': 10,
        'g_complete_sentences': 10,
        'g_pair': 10,
        'g_best_rewrite': 10
      }));
      setColumnOverrides(prev => ({
        ...prev,
        'g_mcq': 1,
        'g_correct_incorrect': 2,
        'g_circle': 1,
        'g_complete_sentences': 1,
        'g_pair': 1,
        'g_best_rewrite': 1
      }));
    } else if (activeModule === 'Reading') {
      const readingIds = ['r_tf_stmt', 'r_mcq', 'r_short_answer', 'r_inferential', 'r_critical_thinking'];
      setSelectedInstructionIds(readingIds);
      setItemCountOverrides(prev => {
        const next = { ...prev };
        readingIds.forEach(id => next[id] = 10);
        return next;
      });
      setColumnOverrides(prev => {
        const next = { ...prev };
        readingIds.forEach(id => next[id] = 1);
        return next;
      });
    } else if (activeModule === 'Vocabulary') {
      const vocabIds = ['v_study_table', 'v_sentence_study', 'v_supply_terms', 'v_copy', 'v_synonym_writing', 'v_circle', 'v_mcq', 'v_speaking'];
      setSelectedInstructionIds(vocabIds);
      setItemCountOverrides(prev => {
        const next = { ...prev };
        vocabIds.forEach(id => next[id] = 15);
        return next;
      });
      setColumnOverrides(prev => {
        const next = { ...prev };
        vocabIds.forEach(id => next[id] = 1);
        return next;
      });
    }
  }, [activeModule]);

  // Validate connection to Firestore
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setIsFirebaseConnected(true);
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
          setIsFirebaseConnected(false);
        }
      }
    };
    testConnection();
  }, []);

  // Fetch brand settings from Firestore on login
  useEffect(() => {
    const fetchBrandSettings = async () => {
      // Reset load state when user changes
      setIsBrandLoaded(false);
      loadedEmailRef.current = null;

      if (session?.email) {
        try {
          const docRef = doc(db, 'user_settings', session.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().brandSettings) {
            setBrandSettings(docSnap.data().brandSettings);
          }
          // Mark this email as loaded
          loadedEmailRef.current = session.email;
        } catch (e) {
          handleFirestoreError(e, 'get' as any, `user_settings/${session.email}`);
        } finally {
          setIsBrandLoaded(true);
        }
      } else {
        setIsBrandLoaded(true);
      }
    };
    fetchBrandSettings();
  }, [session?.email]);
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const fetchCloudHistory = async (email: string) => {
    try {
      const q = query(
        collection(db, 'generatedTests'),
        where('authorEmail', '==', email)
      );
      const querySnapshot = await getDocs(q);
      const cloudHistory: HistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        cloudHistory.push(doc.data() as HistoryItem);
      });
      
      // Sort in memory to avoid composite index requirement
      const sortedHistory = cloudHistory
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 30);

      if (sortedHistory.length > 0) {
        setHistory(sortedHistory);
      }
    } catch (e) {
      handleFirestoreError(e, 'list' as any, 'generatedTests');
    }
  };

  useEffect(() => {
    if (session?.email) {
      fetchCloudHistory(session.email);
    }
  }, [session?.email]);

  const [masterProtocols, setMasterProtocols] = useState<StrictRule[]>(() => {
    try {
      const saved = localStorage.getItem(MASTER_PROTOCOLS_KEY);
      let parsed = saved ? JSON.parse(saved) : DEFAULT_MASTER_PROTOCOLS;
      if (!Array.isArray(parsed)) parsed = DEFAULT_MASTER_PROTOCOLS;
      
      // Force update existing defaults from constants.ts
      const updated = parsed.map((p: any) => {
        const fresh = DEFAULT_MASTER_PROTOCOLS.find(f => f.id === p.id);
        return fresh ? { ...p, ...fresh } : p;
      });

      // Auto-merge missing defaults
      const existingIds = new Set(updated.map((p: any) => p.id));
      const missing = DEFAULT_MASTER_PROTOCOLS.filter(p => !existingIds.has(p.id));
      return [...updated, ...missing];
    } catch { return DEFAULT_MASTER_PROTOCOLS; }
  });
  const [strictRules, setStrictRules] = useState<StrictRule[]>(() => {
    try {
      const saved = localStorage.getItem(STRICT_RULES_KEY);
      let parsed = saved ? JSON.parse(saved) : DEFAULT_STRICT_RULES;
      if (!Array.isArray(parsed)) parsed = DEFAULT_STRICT_RULES;

      // Force update existing defaults from constants.ts
      const updated = parsed.map((r: any) => {
        const fresh = DEFAULT_STRICT_RULES.find(f => f.id === r.id);
        return fresh ? { ...r, ...fresh } : r;
      });

      // Auto-merge missing defaults
      const existingIds = new Set(updated.map((r: any) => r.id));
      const missing = DEFAULT_STRICT_RULES.filter(r => !existingIds.has(r.id));
      return [...updated, ...missing];
    } catch { return DEFAULT_STRICT_RULES; }
  });
  const [instructionTemplates, setInstructionTemplates] = useState<InstructionTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(TEMPLATES_KEY);
      let parsed = saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
      if (!Array.isArray(parsed)) parsed = INITIAL_TEMPLATES;
      
      // Force update all fields from INITIAL_TEMPLATES for existing IDs
      const updated = parsed.map((t: any) => {
        const fresh = INITIAL_TEMPLATES.find(f => f.id === t.id);
        if (fresh) {
          return {
            ...t,
            ...fresh
          };
        }
        return t;
      });

      // Auto-merge missing defaults
      const existingIds = new Set(updated.map((t: any) => t.id));
      const missing = INITIAL_TEMPLATES.filter(t => !existingIds.has(t.id));
      return [...updated, ...missing];
    } catch { return INITIAL_TEMPLATES; }
  });

  const [selectedInstructionIds, setSelectedInstructionIds] = useState<string[]>(['g_mcq', 'g_correct_incorrect', 'g_circle', 'g_complete_sentences', 'g_pair', 'g_spelling']);
  const [columnOverrides, setColumnOverrides] = useState<Record<string, number>>({
    'g_mcq': 1,
    'g_correct_incorrect': 2,
    'g_circle': 1,
    'g_complete_sentences': 1,
    'g_pair': 1,
    'g_spelling': 0
  });
  const [itemCountOverrides, setItemCountOverrides] = useState<Record<string, number>>({
    'g_mcq': 10,
    'g_correct_incorrect': 20,
    'g_circle': 10,
    'g_complete_sentences': 10,
    'g_pair': 10,
    'g_spelling': 30,
    'g_write_correct_form': 4,
    'g_rewrite_sentences': 5
  });
  
  const [sourceMaterial, setSourceMaterial] = useState<QuickSource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoUploadRef = useRef<HTMLInputElement>(null);

  const [loginName, setLoginName] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_KEY);
      return saved !== 'completed';
    } catch { return true; }
  });

  const [exportSettings, setExportSettings] = useState({
    filename: '',
    title: '',
    showModal: false
  });

  useEffect(() => { 
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); 
    } catch (e) {
      console.warn("History storage limit reached. Oldest items may be lost.", e);
      // Optional: Try to save a smaller subset if full save fails
      try {
        const smallerHistory = history.slice(0, 10);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(smallerHistory));
      } catch (innerE) {
        console.error("Critical storage failure for history", innerE);
      }
    }
  }, [history]);

  useEffect(() => { 
    try {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(instructionTemplates)); 
    } catch (e) { console.warn("Templates storage limit reached", e); }
  }, [instructionTemplates]);

  useEffect(() => { 
    try {
      localStorage.setItem(STRICT_RULES_KEY, JSON.stringify(strictRules)); 
    } catch (e) { console.warn("Rules storage limit reached", e); }
  }, [strictRules]);

  useEffect(() => { 
    try {
      localStorage.setItem(MASTER_PROTOCOLS_KEY, JSON.stringify(masterProtocols)); 
    } catch (e) { console.warn("Protocols storage limit reached", e); }
  }, [masterProtocols]);
  useEffect(() => { 
    try {
      localStorage.setItem(BRAND_SETTINGS_KEY, JSON.stringify(brandSettings)); 
    } catch (e) {
      console.warn("Storage quota exceeded. Some branding settings might not persist locally.", e);
    }
    
    // Persist brand settings to Firestore
    const persistBrandSettings = async () => {
      // Only save if we are logged in AND the current user's data has been loaded
      if (session?.email && isBrandLoaded && loadedEmailRef.current === session.email) {
        try {
          const docRef = doc(db, 'user_settings', session.email);
          await setDoc(docRef, { brandSettings }, { merge: true });
        } catch (e) {
          handleFirestoreError(e, 'write' as any, `user_settings/${session.email}`);
          // Alert user if save fails, likely due to size
          if (e instanceof Error && e.message.includes('too large')) {
             alert("CRITICAL: Your logo collection is too large to save to the cloud. Please delete some logos or use smaller images.");
          }
        }
      }
    };
    persistBrandSettings();
  }, [brandSettings, session?.email, isBrandLoaded]);
  useEffect(() => { 
    localStorage.setItem('dp_theme_v30', activeThemeId); 
    const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
    
    // Core Colors
    document.documentElement.style.setProperty('--primary-orange', theme.color);
    document.documentElement.style.setProperty('--accent-orange-light', theme.accent);
    document.documentElement.style.setProperty('--accent-orange-dark', theme.color);
    
    // Body Background
    const body = document.body;
    if (theme.bg.startsWith('linear-gradient') || theme.bg.startsWith('radial-gradient')) {
      body.style.background = theme.bg;
    } else {
      body.style.background = theme.bg;
      body.style.backgroundImage = 'none';
    }

    // Handle text contrast (simple heuristic)
    const isDark = theme.id === 'midnight' || theme.id === 'nebula';
    body.style.color = isDark ? '#f8fafc' : '#1e293b';
    
    // Update sidebar/main backgrounds if they are too dark
    const main = document.querySelector('main');
    const aside = document.querySelector('aside');
    if (main) {
      main.style.backgroundColor = isDark ? '#0b1221' : 'rgba(255, 255, 255, 0.4)';
      main.style.backdropFilter = 'blur(20px)';
    }
    if (aside) {
      aside.style.backgroundColor = isDark ? '#0b1221' : 'rgba(255, 255, 255, 0.6)';
      aside.style.backdropFilter = 'blur(20px)';
    }

  }, [activeThemeId]);
  useEffect(() => { 
    localStorage.setItem(ENGINE_CONFIG_KEY, JSON.stringify({ active: activeEngine, keys: externalKeys }));
  }, [activeEngine, externalKeys]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
      setActiveThemeId(randomTheme.id);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const cyclePriority = (current: Priority): Priority => {
    const priorities: Priority[] = ['Low', 'Average', 'Medium', 'High'];
    const currentIndex = priorities.indexOf(current);
    return priorities[(currentIndex + 1) % priorities.length];
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'completed');
  };

  const toggleInstruction = (id: string) => setSelectedInstructionIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const setItemCount = (id: string, count: number) => setItemCountOverrides(prev => ({ ...prev, [id]: count }));
  const adjustColumns = (id: string, delta: number) => {
    setColumnOverrides(prev => ({ ...prev, [id]: Math.max(0, Math.min(6, (prev[id] || 0) + delta)) }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setSourceMaterial({ data: (event.target?.result as string).split(',')[1], mimeType: file.type, name: file.name });
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Initial size check
      if (file.size > 10 * 1024 * 1024) {
        alert("Image is too large. Please use a file smaller than 10MB.");
        if (logoUploadRef.current) logoUploadRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // 2. Resize & Compress Logic
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 600px is sufficient for A4 header logos
          // This keeps file size very low (~50-100KB)
          const MAX_DIM = 600; 
          
          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             // Compress to JPEG 0.7 quality
             const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
             
             setBrandSettings(prev => {
               const newLogos = [...prev.logos];
               const firstEmpty = newLogos.findIndex(l => !l);
               if (firstEmpty !== -1) {
                 newLogos[firstEmpty] = dataUrl;
               } else {
                 newLogos.push(dataUrl);
               }
               return { ...prev, logos: newLogos, logoData: dataUrl };
             });
          }
          
          if (logoUploadRef.current) logoUploadRef.current.value = '';
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = (index: number) => {
    setBrandSettings(prev => {
      const newLogos = [...prev.logos];
      newLogos[index] = undefined;
      return { ...prev, logos: newLogos };
    });
  };

  const generateNeuralBlueprint = (count: number) => {
    const keys = ['A', 'B', 'C', 'D'];
    let blueprint: string[] = [];
    
    // Bucket logic: For every 10 items, pre-select a bucket
    const numBuckets = Math.ceil(count / 10);
    
    for (let b = 0; b < numBuckets; b++) {
      const bucketSize = Math.min(10, count - b * 10);
      const bucket: string[] = [];
      
      if (bucketSize === 10) {
        // Specific distribution for 10: e.g. 3A, 2B, 2C, 3D
        const dist = ['A', 'A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'D'];
        bucket.push(...dist);
      } else {
        // Mandatory presence for smaller buckets
        const mandatoryKeys = bucketSize >= 4 ? [...keys] : keys.slice(0, bucketSize);
        bucket.push(...mandatoryKeys);
        while (bucket.length < bucketSize) {
          bucket.push(keys[Math.floor(Math.random() * keys.length)]);
        }
      }
      
      // Shuffle the bucket
      for (let i = bucket.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bucket[i], bucket[j]] = [bucket[j], bucket[i]];
      }
      
      blueprint.push(...bucket);
    }

    // Enforce Streak Limit: Max 2 identical
    for (let i = 2; i < blueprint.length; i++) {
      if (blueprint[i] === blueprint[i-1] && blueprint[i] === blueprint[i-2]) {
        for (let j = i + 1; j < blueprint.length; j++) {
          if (blueprint[j] !== blueprint[i]) {
            [blueprint[i], blueprint[j]] = [blueprint[j], blueprint[i]];
            break;
          }
        }
      }
    }

    return blueprint;
  };

  const handleGenerate = async () => {
    if (selectedInstructionIds.length === 0) { alert("Please select at least one component."); return; }
    setIsGenerating(true);
    setGenerationStep('Initializing Neural Core...');
    
    const selectedTemps = instructionTemplates.filter(t => selectedInstructionIds.includes(t.id));

    // Filter Master Protocols and Strict Rules by category
    const filterByCategory = (rules: StrictRule[]) => 
      rules.filter(r => r.active && (r.category === 'General' || r.category.toLowerCase() === activeModule.toLowerCase()));

    const filteredProtocols = filterByCategory(masterProtocols);
    const filteredRules = filterByCategory(strictRules);

    let pageStyleInstruction = '';
    if (enablePages) {
      const randomStyle = PAGE_STYLES[Math.floor(Math.random() * PAGE_STYLES.length)];
      pageStyleInstruction = `\n[PAGE STYLE - CRITICAL]: Wrap the ENTIRE assessment content in a single <div> with the following style: "${randomStyle.style}". This creates a unique beautiful page border/frame.`;
    }

    let partBackgroundInstruction = '';
    if (isPartBackgroundEnabled) {
      partBackgroundInstruction = `\n${PART_BACKGROUND_INSTRUCTION}`;
    }

    let instructionHeaderBackgroundInstruction = '';
    if (isInstructionBackgroundEnabled) {
      instructionHeaderBackgroundInstruction = `\n${INSTRUCTION_HEADER_BACKGROUND_INSTRUCTION}`;
    }

    // Enforce Shift + Underscore style
    const selectedBlankStyle = '____________________';

    const protocolsPrompt = filteredProtocols.map(p => `[PROTOCOL - ${p.priority}]: ${p.promptInjection.replace(/{{BLANK}}/g, selectedBlankStyle)}`).join('\n');
    const rulesPrompt = filteredRules.map(r => `[STRICT RULE - ${r.priority}]: ${r.promptInjection.replace(/{{BLANK}}/g, selectedBlankStyle)}`).join('\n');
    
    const strategyInstruction = answerStrategy === 'GENERAL_MIXED' 
      ? `[STRATEGY]: GENERAL-MIXED (Horizontal Logic). The context is {{TOPIC}}, but distractors should test high-frequency "general" errors (Gerunds, Prepositions, Agreement).`
      : `[STRATEGY]: TOPIC-FOCUSED (Vertical Logic). Every item and distractor must focus strictly on the rules of {{TOPIC}}.`;

    const componentLogic = selectedTemps.map((t, idx) => {
      const overrideCol = columnOverrides[t.id] || 0;
      const overrideItems = itemCountOverrides[t.id] || 10;
      
      // Generate unique blueprint for this part
      const blueprint = generateNeuralBlueprint(overrideItems);
      const blueprintStr = blueprint.map((key, i) => `${i + 1}:${key}`).join(', ');

      let formatInstruction = '';
      const headerStyle = isInstructionBackgroundEnabled 
        ? 'class="header-row", text-align: center, font-weight: bold, padding: 10px' 
        : 'class="header-row", background-color: #334155, color: white, text-align: center, font-weight: bold, padding: 10px';

      // Use overrideCol if it's > 0, otherwise use globalLayout defaults
      const effectiveCols = overrideCol > 0 ? overrideCol : (globalLayout === 2 ? 2 : 1);

      if (globalLayout === 0) {
        // Option 1 (Clean): 1 column, 2 rows (Header + All items in one cell)
        if (effectiveCols > 1) {
          formatInstruction = `(MANDATORY FORMAT: Use a real HTML <table> with ${effectiveCols} columns. 
            ${isPartBackgroundEnabled ? 'MANDATORY: Apply a unique background style from the PART BACKGROUND PROTOCOL to this <table> tag.' : ''}
            - Row 1: Header row spanning all ${effectiveCols} columns (colspan="${effectiveCols}"), with ${headerStyle}. Title: "PART ${String.fromCharCode(65 + idx)}: ${t.professionalLabel || t.label}".
            - Row 2: Distribute the ${overrideItems} items STRICTLY EVENLY across ${effectiveCols} columns. (e.g. if 10 items, put 5 in Col 1 and 5 in Col 2).
            - The table MUST have a border: 1.5pt solid #334155.
            - DO NOT put borders between the items inside the cells. This is the "Clean" layout with ${effectiveCols} columns.)`;
        } else {
          formatInstruction = `(MANDATORY FORMAT: Use a real HTML <table> with 1 column and EXACTLY 2 rows. 
            ${isPartBackgroundEnabled ? 'MANDATORY: Apply a unique background style from the PART BACKGROUND PROTOCOL to this <table> tag.' : ''}
            - Row 1: Header row with ${headerStyle}. Title: "PART ${String.fromCharCode(65 + idx)}: ${t.professionalLabel || t.label}".
            - Row 2: A single <td> containing ALL ${overrideItems} items as a standard numbered list. 
            - The table MUST have a border: 1.5pt solid #334155.
            - DO NOT put borders between the items inside the second row. This is the "Clean" layout.)`;
        }
      } else if (globalLayout === 1) {
        // Option 2 (Lined): 1 column, multiple rows (Header + One row per item)
        if (effectiveCols > 1) {
          formatInstruction = `(MANDATORY FORMAT: Use a real HTML <table> with ${effectiveCols} columns. 
            ${isPartBackgroundEnabled ? 'MANDATORY: Apply a unique background style from the PART BACKGROUND PROTOCOL to this <table> tag.' : ''}
            - Row 1: Header row spanning all ${effectiveCols} columns (colspan="${effectiveCols}"), with ${headerStyle}. Title: "PART ${String.fromCharCode(65 + idx)}: ${t.professionalLabel || t.label}".
            - Subsequent rows: Distribute the ${overrideItems} items STRICTLY EVENLY across ${effectiveCols} columns.
            - Every <td> MUST have a border: 1pt solid #334155; padding: 10px;
            - This creates a lined grid with ${effectiveCols} columns.)`;
        } else {
          formatInstruction = `(MANDATORY FORMAT: Use a real HTML <table> with 1 column. 
            ${isPartBackgroundEnabled ? 'MANDATORY: Apply a unique background style from the PART BACKGROUND PROTOCOL to this <table> tag.' : ''}
            - Row 1: Header row with ${headerStyle}. Title: "PART ${String.fromCharCode(65 + idx)}: ${t.professionalLabel || t.label}".
            - Subsequent rows: Each row contains EXACTLY ONE item.
            - Every <td> MUST have a border: 1pt solid #334155; padding: 10px;
            - This creates lines between every question.)`;
        }
      } else if (globalLayout === 2) {
        // Option 3 (Grid): 2 columns, multiple rows (Header + Items distributed)
        formatInstruction = `(MANDATORY FORMAT: Use a real HTML <table> with ${effectiveCols} columns. 
            ${isPartBackgroundEnabled ? 'MANDATORY: Apply a unique background style from the PART BACKGROUND PROTOCOL to this <table> tag.' : ''}
            - Row 1: Header row spanning all ${effectiveCols} columns (colspan="${effectiveCols}"), with ${headerStyle}. Title: "PART ${String.fromCharCode(65 + idx)}: ${t.professionalLabel || t.label}".
            - Subsequent rows: Distribute the ${overrideItems} items STRICTLY EVENLY across ${effectiveCols} columns (one item per cell).
            - Every <td> MUST have a border: 1pt solid #334155; padding: 10px; vertical-align: top;
            - This creates a professional worksheet grid with ${effectiveCols} columns.)`;
      } else {
        formatInstruction = `(FORMAT: Standard numbered list. ${isPartBackgroundEnabled ? 'MANDATORY: Wrap the entire part in a <div style="..."> with a unique background style from the PART BACKGROUND PROTOCOL.' : ''} Every numbered item (1., 2., 3., etc.) MUST start on a NEW LINE using an HTML <p> or <br> tag. DO NOT bunch them together in a single paragraph. DO NOT use tables or columns.)`;
      }
        
      return `PART ${String.fromCharCode(65 + idx)} [MANDATORY INSTRUCTION HEADER: ${t.professionalLabel || t.label}]: ${t.prompt.replace(/{{BLANK}}/g, selectedBlankStyle)} (GENERATE EXACTLY ${overrideItems} ITEMS) (USE THIS ANSWER KEY: ${blueprintStr}) ${formatInstruction}`;
    }).join('\n\n');

    const moduleSafetyGuard = activeModule === 'Grammar'
      ? `[MODULE SAFETY GUARD - CRITICAL]: You are generating a GRAMMAR assessment. You are strictly FORBIDDEN from including reading passages or vocabulary-only definitions. Focus 100% on grammar rules, situational logic, and positional word order. Ensure NO LEAKAGE from Reading or Vocabulary modules.`
      : activeModule === 'Vocabulary'
      ? `[MODULE SAFETY GUARD - CRITICAL]: You are generating a VOCABULARY assessment. You are strictly FORBIDDEN from testing grammar rules, injecting grammar errors, or including reading passages. 
         - NO READING LOGIC: Do NOT include "Not Mentioned" or "Unknown" options. 
         - NO GRAMMAR LOGIC: Protocol 21 (Cross-Topic Injection) and Rule 1 (No-Free-Verb) are DISABLED. 
         - NO GRAMMAR TOPICS: Avoid using sentences that test "Must/Have to", "Should", or other modal verbs. Focus on the meaning of the word itself.
         - PURE SEMANTICS: Focus 100% on word meanings. All distractors must be grammatically identical to the correct answer.`
      : activeModule === 'Reading'
      ? `[MODULE SAFETY GUARD - CRITICAL]: You are generating a READING assessment. You are strictly FORBIDDEN from testing grammar rules or injecting grammar errors. Focus 100% on comprehension and inference logic.
         - PASSAGE DIVERSITY: Use a DIFFERENT reading passage for EACH part of the test.
         - LEVEL ADAPTATION: The length and level of thinking must strictly match the selected Academic Level (${activeLevel}).`
      : '';

    const mandatorySequence = activeModule === 'Grammar' 
      ? `1. PRE-ASSIGN balanced answer keys (A-D).\n2. GENERATE ALL REQUESTED PARTS. ADAPT TITLES TO MATCH "${topic}".\n3. ENFORCE "NO FREE VERB" & "SITUATIONAL EVIDENCE" rules for all grammar stems.\n4. [SOURCE PRIORITY]: If source material is provided, strictly use ALL grammar rules and examples from it. If there are 6 rules, use all 6.`
      : activeModule === 'Reading'
      ? `1. GENERATE A PASSAGE (~300-500 words) about "${topic}".\n2. APPLY [NATURAL PARAPHRASE] logic to all questions (No keyword matching).\n3. ENFORCE [READING LOGIC FIREWALL] (Strictly forbidden from testing grammar).\n4. ENSURE all distractors are grammatically identical to the correct answer.`
      : `1. PRE-ASSIGN balanced answer keys (A-D).\n2. GENERATE ALL REQUESTED PARTS. ADAPT TITLES TO MATCH "${topic}".\n3. ENFORCE [VOCABULARY FIREWALL] (No grammar clues).`;

    const finalLogic = `
${moduleSafetyGuard}
${GLOBAL_STRICT_COMMAND.replace(/{{TOPIC}}/g, topic || "General English").replace(/{{BLANK}}/g, selectedBlankStyle)}
${isFrameEnabled ? BORDER_FRAME_INSTRUCTION : ''}
${pageStyleInstruction}
${partBackgroundInstruction}
${instructionHeaderBackgroundInstruction}
${protocolsPrompt}
${strategyInstruction.replace(/{{TOPIC}}/g, topic || "General English")}
${rulesPrompt}

[SYSTEM OBJECTIVE]: Generate a COMPLETE assessment based on the requested components.
[TARGET TOPIC]: "${topic || "General English"}"
[TARGET LEVEL]: ${activeLevel}
[LANGUAGE]: ${activeLanguage}

[HEADER RULE]: You are strictly FORBIDDEN from generating a title, school name, or metadata header. The application provides this automatically. Start immediately with the first instruction.

### MANDATORY SEQUENCE ###
${mandatorySequence}

${componentLogic}
    `;
    
    try {
      setGenerationStep('Applying Master Protocols...');
      // Randomize logo from available logos
      const availableLogos = brandSettings.logos.filter(l => !!l);
      if (availableLogos.length > 0) {
        const randomLogo = availableLogos[Math.floor(Math.random() * availableLogos.length)];
        setBrandSettings(prev => ({ ...prev, logoData: randomLogo }));
      }

      // Randomize Font between Times New Roman and Garamond if enabled
      if (brandSettings.randomizeFont) {
        const fonts = ['Times New Roman', 'Garamond'];
        const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
        setBrandSettings(prev => ({ ...prev, activeFont: randomFont }));
      }

      setGenerationStep('Synthesizing Test Items...');
      // FIREBASE CLOUD SAVE IMPLEMENTATION
      // ==================================================
      // 1. Call the AI Brain
      const result = await callNeuralEngine(activeEngine, finalLogic, protocolsPrompt, sourceMaterial, externalKeys);
      
      if (result.text.includes('Error:')) {
        setGenerationError(result.text);
        setIsGenerating(false);
        setGenerationStep('');
        return;
      }

      setGenerationStep('Finalizing Layout...');
      setWorksheetContent(result.text);
      setIsGenerating(false);
      setGenerationStep('');
      setGenerationError(null);
      setViewMode('preview');

      // 2. Create the data package
      const newTestItem = {
        id: `hist-${Date.now()}`,
        title: `${activeLanguage} ${activeModule}: ${activeLevel} - ${topic || "Synthesis"}`,
        content: result.text,
        timestamp: Date.now(),
        promptId: 'manual',
        logicSnapshot: finalLogic,
        module: activeModule,
        level: activeLevel,
        topic: topic,
        // Add who created it
        authorName: session?.name || 'Anonymous',
        authorCode: session?.code || 'N/A',
        authorEmail: session?.email || 'N/A'
      };

      // 3. Update Local History (so you see it on screen)
      setHistory(prev => [newTestItem, ...prev].slice(0, 30));

      // 4. SEND TO THE CLOUD (The Magic Step!)
      try {
           // This line sends the data to a collection named 'generatedTests' in your Firebase database
           await addDoc(collection(db, 'generatedTests'), newTestItem);
           console.log("✅☁️ Test successfully saved to the Firebase Cloud Notebook!");
      } catch (e) {
           // If something goes wrong, tell the console
           handleFirestoreError(e, 'create' as any, 'generatedTests');
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      alert("Neural synthesis failed. Please check your connection or API keys.");
      setIsGenerating(false);
    }
  };

  const handleAssistantMessage = async (msg: string, file?: QuickSource) => {
    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', text: msg, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);
    const context = `Assistant Mode. Worksheet: ${worksheetContent.slice(0, 1000)}. Edit based on: ${msg}`;
    const result = await callNeuralEngine(activeEngine, msg, context, file || sourceMaterial, externalKeys);
    setChatMessages(prev => [...prev, { id: `msg-bot-${Date.now()}`, role: 'architect', text: "Synthesis updated.", timestamp: Date.now() }]);
    setWorksheetContent(result.text);
    setIsGenerating(false);
  };

  const handlePrint = () => {
    // Ensure the window is focused before printing
    window.focus();
    window.print();
  };

  const handleExportWord = () => {
    if (!worksheetContent) return;
    
    // Create a cleaner filename from the topic
    const cleanTopic = (topic || 'Assessment').trim().replace(/[^a-z0-9]/gi, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    
    setExportSettings(prev => ({
      ...prev,
      filename: `DPSS_${activeLanguage}_${activeLevel}_${cleanTopic}_${timestamp}`,
      title: `${activeModule} Assessment: ${topic || 'General'}`,
      showModal: true
    }));
  };

  const confirmExportWord = () => {
    const { filename, title } = exportSettings;
    const logoHtml = brandSettings.logoData ? `<table style="width: 100%; border: none; margin-bottom: 2pt;"><tr><td style="border: none; text-align: center;"><img src="${brandSettings.logoData}" width="624" style="width: 6.5in;" /></td></tr></table>` : '';
    const header = `${logoHtml}<table style="width: 100%; border-bottom: 2pt solid black; margin-bottom: 2pt; font-family: '${brandSettings.activeFont || 'Times New Roman'}', serif;"><tr><td style="border: none; width: 100%; text-align: center;"><b>${activeLevel}: ${activeModule}: ${topic || 'Assessment'}</b></td></tr></table>`;
    
    // Use the headerHtml argument correctly
    exportToWord(
      worksheetContent, 
      filename || `DPSS_Test_${activeLanguage}_${activeLevel}`,
      header,
      '0.4in 0.6in 0.4in 0.6in',
      brandSettings.activeFont || 'Times New Roman',
      '1.15',
      undefined,
      isFrameEnabled
    );
    
    setExportSettings(prev => ({ ...prev, showModal: false }));
  };

  const updateRule = (id: string, updates: Partial<StrictRule>) => setStrictRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  const updateProtocol = (id: string, updates: Partial<StrictRule>) => setMasterProtocols(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const updateTemplate = (id: string, updates: Partial<InstructionTemplate>) => setInstructionTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTemplate = (id: string) => setInstructionTemplates(prev => prev.filter(t => t.id !== id));
  const deleteRule = (id: string) => setStrictRules(prev => prev.filter(r => r.id !== id));
  const deleteProtocol = (id: string) => setMasterProtocols(prev => prev.filter(p => p.id !== id));
  
  const syncWithDefaults = () => {
    setMasterProtocols(prev => {
      const updated = prev.map(p => {
        const defaultProtocol = DEFAULT_MASTER_PROTOCOLS.find(dp => dp.id === p.id);
        return defaultProtocol ? { ...p, ...defaultProtocol } : p;
      });
      const existingIds = new Set(prev.map(p => p.id));
      const newItems = DEFAULT_MASTER_PROTOCOLS.filter(p => !existingIds.has(p.id));
      return [...updated, ...newItems];
    });
    setStrictRules(prev => {
      const updated = prev.map(r => {
        const defaultRule = DEFAULT_STRICT_RULES.find(dr => dr.id === r.id);
        return defaultRule ? { ...r, ...defaultRule } : r;
      });
      const existingIds = new Set(prev.map(r => r.id));
      const newItems = DEFAULT_STRICT_RULES.filter(r => !existingIds.has(r.id));
      return [...updated, ...newItems];
    });
    setInstructionTemplates(prev => {
      const updated = prev.map(t => {
        const defaultTemp = INITIAL_TEMPLATES.find(dt => dt.id === t.id);
        return defaultTemp ? { ...t, ...defaultTemp } : t;
      });
      const existingIds = new Set(prev.map(t => t.id));
      const newItems = INITIAL_TEMPLATES.filter(t => !existingIds.has(t.id));
      return [...updated, ...newItems];
    });
    alert("Neural protocols and templates synchronized with latest definitions.");
  };

  const hardReset = () => {
    if (confirm("WARNING: This will delete all custom rules, protocols, and templates. Are you sure?")) {
      localStorage.removeItem(MASTER_PROTOCOLS_KEY);
      localStorage.removeItem(STRICT_RULES_KEY);
      localStorage.removeItem(TEMPLATES_KEY);
      window.location.reload();
    }
  };

  const addRule = () => {
    const newRule: StrictRule = { id: `rule-${Date.now()}`, label: 'NEW LOGIC NODE', description: '', promptInjection: '', active: true, priority: 'Medium', category: activeLogicCategory };
    setStrictRules([...strictRules, newRule]); setExpandedRuleId(newRule.id);
  };
  const addProtocol = () => {
    const newProtocol: StrictRule = { id: `mp-${Date.now()}`, label: 'NEW PROTOCOL', description: '', promptInjection: '', active: true, priority: 'Medium', category: activeProtocolCategory };
    setMasterProtocols([...masterProtocols, newProtocol]); setExpandedProtocolId(newProtocol.id);
  };
  const addTemplate = () => {
    const newId = `temp-${Date.now()}`;
    setInstructionTemplates(prev => [...prev, { id: newId, label: `NEW PART`, prompt: `Detail logic for {{TOPIC}}...`, category: activeTemplateCategory as any, columnCount: 0 }]);
    setExpandedTemplateId(newId);
  };

  const handleFirestoreError = (error: any, operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write', path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    // We don't necessarily want to throw and crash the app, but we want the agent to see it
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-300 relative transition-all duration-500">
      {showOnboarding && <OnboardingTutorial onComplete={handleOnboardingComplete} />}
      {viewMode === 'generator' && (
        <>
          <Sidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            curriculum={[]}
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            activeLevel={activeLevel}
            onLevelChange={setActiveLevel}
            topic={topic}
            onTopicChange={setTopic}
            onClearCanvas={() => { setWorksheetContent(''); setTopic(''); setSelectedInstructionIds([]); }}
            onToggleSettings={() => setShowSettings(true)}
            history={history}
            onLoadHistory={(item) => { setWorksheetContent(item.content); setViewMode('preview'); }}
            onDeleteHistory={async (id) => {
              try {
                const newHistory = history.filter(h => h.id !== id);
                setHistory(newHistory);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
                if (session?.email) {
                  const docRef = doc(db, 'user_history', session.email);
                  await setDoc(docRef, { history: newHistory });
                }
              } catch (e) { console.error(e); }
            }}
            onRenameHistory={async (id, newTitle) => {
              try {
                const newHistory = history.map(h => h.id === id ? { ...h, title: newTitle } : h);
                setHistory(newHistory);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
                if (session?.email) {
                  const docRef = doc(db, 'user_history', session.email);
                  await setDoc(docRef, { history: newHistory });
                }
              } catch (e) { console.error(e); }
            }}
            brandSettings={brandSettings}
            templates={instructionTemplates.filter(t => t.category?.toUpperCase() === activeModule.toUpperCase())}
            activeTemplate={null}
            onTemplateSelect={(t) => toggleInstruction(t.id)}
          />

          <main className={`flex-1 bg-slate-50 flex flex-col overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'md:ml-[240px] ml-0' : 'ml-0'}`}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-slate-900/20 z-[100] md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            {/* Top Navigation Bar */}
            <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                {!isSidebarOpen && (
                  <button onClick={() => setIsSidebarOpen(true)} className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 transition-all">
                    <i className="fa-solid fa-bars"></i>
                  </button>
                )}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-2 bg-white text-orange-600 hover:bg-orange-50 rounded-lg text-[11px] font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95"
                  >
                    <i className="fa-solid fa-eye text-[10px]"></i> Workspace
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 text-slate-500 hover:text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-2"
                  >
                    <i className="fa-solid fa-file-import text-[10px]"></i> Insert Source
                  </button>
                  <button 
                    onClick={() => setIsFrameEnabled(!isFrameEnabled)}
                    className={`px-6 py-2 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all ${isFrameEnabled ? 'bg-orange-100 text-orange-600 shadow-inner' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <i className={`fa-solid ${isFrameEnabled ? 'fa-square-check' : 'fa-square'} text-[10px]`}></i> Beautiful Frame
                  </button>
                  <button 
                    onClick={() => setEnablePages(!enablePages)}
                    className={`px-6 py-2 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all ${enablePages ? 'bg-purple-100 text-purple-600 shadow-inner' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <i className={`fa-solid ${enablePages ? 'fa-square-check' : 'fa-square'} text-[10px]`}></i> Enable Pages
                  </button>
                  <button 
                    onClick={() => setIsPartBackgroundEnabled(!isPartBackgroundEnabled)}
                    className={`px-6 py-2 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all ${isPartBackgroundEnabled ? 'bg-green-100 text-green-600 shadow-inner' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <i className={`fa-solid ${isPartBackgroundEnabled ? 'fa-square-check' : 'fa-square'} text-[10px]`}></i> Part Backgrounds
                  </button>
                  <button 
                    onClick={() => setIsInstructionBackgroundEnabled(!isInstructionBackgroundEnabled)}
                    className={`px-6 py-2 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all ${isInstructionBackgroundEnabled ? 'bg-cyan-100 text-cyan-600 shadow-inner' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <i className={`fa-solid ${isInstructionBackgroundEnabled ? 'fa-square-check' : 'fa-square'} text-[10px]`}></i> Instruction Background
                  </button>
                  <button 
                    onClick={() => setGlobalLayout((prev) => (prev + 1) % 3)}
                    className={`px-6 py-2 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all ${globalLayout > 0 ? 'bg-blue-100 text-blue-600 shadow-inner' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <i className={`fa-solid ${globalLayout === 2 ? 'fa-table-columns' : globalLayout === 1 ? 'fa-grip-lines' : 'fa-list'} text-[10px]`}></i> 
                    {globalLayout === 0 ? 'Option 1 (Clean)' : globalLayout === 1 ? 'Option 2 (Lined)' : 'Option 3 (Grid)'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="h-10 w-10 text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fa-solid fa-palette text-lg"></i>
                </button>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-slate-100 text-slate-400 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                >
                  {isGenerating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                  Build Test
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              <div className="max-w-6xl mx-auto space-y-8">
                {/* 3-Column Layout: Templates Left | Global Config | Templates Right */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                  {/* Templates Left (Half) */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 px-2 mb-4">
                      <div className="h-1 w-4 bg-orange-500 rounded-full"></div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Templates (A-M)</h3>
                    </div>
                    <div className="space-y-3">
                      {instructionTemplates
                        .filter(t => t.category?.toUpperCase() === activeModule.toUpperCase())
                        .sort((a, b) => {
                          const order = ['g_mcq', 'g_correct_incorrect', 'g_circle', 'g_complete_sentences', 'g_pair', 'g_spelling'];
                          const aIdx = order.indexOf(a.id);
                          const bIdx = order.indexOf(b.id);
                          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                          if (aIdx !== -1) return -1;
                          if (bIdx !== -1) return 1;
                          return 0;
                        })
                        .slice(0, Math.ceil(instructionTemplates.filter(t => t.category?.toUpperCase() === activeModule.toUpperCase()).length / 2))
                        .map((t, idx) => {
                          const isSelected = selectedInstructionIds.includes(t.id);
                          const cat = t.category?.toUpperCase();
                          const colorClass = cat === 'VOCABULARY' ? 'emerald' : cat === 'READING' ? 'blue' : 'orange';
                          
                          return (
                            <div
                              key={idx}
                              className={`group bg-white border rounded-2xl p-4 flex items-center justify-between hover:border-${colorClass}-200 hover:shadow-md transition-all cursor-pointer ${isSelected ? `border-${colorClass}-500 bg-${colorClass}-50/30` : 'border-slate-100'}`}
                              onClick={() => toggleInstruction(t.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${isSelected ? `bg-${colorClass}-600 text-white` : `bg-slate-50 text-slate-400 group-hover:bg-${colorClass}-50 group-hover:text-${colorClass}-500`}`}>
                                  <i className="fa-solid fa-book text-sm"></i>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-tight ${isSelected ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{t.label}</span>
                              </div>
                              <div className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${isSelected ? `bg-${colorClass}-600 border-${colorClass}-600 text-white` : `border-slate-100 text-slate-300 group-hover:border-${colorClass}-500 group-hover:text-${colorClass}-500`}`}>
                                <i className={`fa-solid ${isSelected ? 'fa-check' : 'fa-plus'} text-[10px]`}></i>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm space-y-8">
                      {sourceMaterial && (
                        <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 w-fit">
                          <i className="fa-solid fa-file-circle-check text-emerald-500"></i>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{sourceMaterial.name} attached</span>
                          <button onClick={() => setSourceMaterial(null)} className="text-emerald-400 hover:text-emerald-600 ml-2">
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Language</label>
                          <select 
                            value={activeLanguage}
                            onChange={(e) => setActiveLanguage(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 font-bold text-sm outline-none focus:border-orange-200 transition-all appearance-none cursor-pointer"
                          >
                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Level</label>
                          <select 
                            value={activeLevel}
                            onChange={(e) => setActiveLevel(e.target.value as AcademicLevel)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 font-bold text-sm outline-none focus:border-orange-200 transition-all appearance-none cursor-pointer"
                          >
                            {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Universal Topic</label>
                          <input 
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. Present Simple, My Family..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 font-bold text-sm outline-none focus:border-orange-200 transition-all placeholder:text-slate-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Test Structure Section (Moved here for better flow) */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Selected Exercises ({selectedInstructionIds.length})</h3>
                        {selectedInstructionIds.length > 0 && (
                          <button 
                            onClick={() => setSelectedInstructionIds([])}
                            className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {instructionTemplates.filter(t => t.category?.toUpperCase() === activeModule.toUpperCase() && selectedInstructionIds.includes(t.id)).map((t, idx) => {
                          const curItems = itemCountOverrides[t.id] || 10;
                          const curCols = globalLayout === 2 ? 2 : (globalLayout === 1 ? 1 : (columnOverrides[t.id] || 0));
                          
                          // Diverse color mapping based on index
                          const colors = ['orange', 'blue', 'emerald', 'rose', 'violet', 'amber', 'indigo', 'cyan'];
                          const colorClass = colors[idx % colors.length];
                          
                          // Relaxing backgrounds
                          const backgrounds = [
                            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400&h=200', // Forest
                            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400&h=200', // Mountain
                            'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=400&h=200', // Ocean
                            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=400&h=200', // Lake
                            'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=400&h=200', // Meadow
                          ];
                          const bgUrl = backgrounds[idx % backgrounds.length];

                          return (
                            <div key={t.id} className={`card-gradient-${colorClass} rounded-2xl p-3 border border-${colorClass}-100 compact-shadow group hover:shadow-md transition-all relative overflow-hidden`}>
                              {/* Relaxing Background Overlay */}
                              <div 
                                className="absolute inset-0 opacity-[0.08] pointer-events-none bg-cover bg-center mix-blend-multiply"
                                style={{ backgroundImage: `url(${bgUrl})` }}
                              />
                              
                              <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button onClick={() => toggleInstruction(t.id)} className="h-6 w-6 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                  <i className="fa-solid fa-trash-can text-[9px]"></i>
                                </button>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2 relative z-10">
                                <div className={`h-7 w-7 bg-white text-${colorClass}-600 rounded-lg flex items-center justify-center shadow-sm border border-${colorClass}-100 flex-shrink-0`}>
                                  <i className="fa-solid fa-star text-[10px]"></i>
                                </div>
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-tight truncate">{t.label}</span>
                              </div>
                              
                              <div className="flex flex-col gap-2 relative z-10">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center px-1">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Item</span>
                                    <span className={`text-[9px] font-black text-${colorClass}-600`}>{curItems}</span>
                                  </div>
                                  <div className="flex bg-white/60 backdrop-blur-sm rounded-lg p-0.5 gap-0.5 border border-slate-100 shadow-inner">
                                    {[5, 10, 15, 20, 25, 30].map(num => (
                                      <button 
                                        key={num} 
                                        onClick={() => setItemCount(t.id, num)} 
                                        className={`flex-1 h-5 rounded-md text-[8px] font-bold transition-all ${curItems === num ? `bg-white text-${colorClass}-600 shadow-sm border border-${colorClass}-50` : 'text-slate-400 hover:text-slate-600'}`}
                                      >
                                        {num}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center px-1">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Column</span>
                                    <span className="text-[9px] font-black text-slate-600">{curCols || 'L'}</span>
                                  </div>
                                  <div className="flex bg-white/60 backdrop-blur-sm rounded-lg p-0.5 gap-0.5 border border-slate-100 shadow-inner">
                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                      <button 
                                        key={num} 
                                        onClick={() => setColumnOverrides(prev => ({ ...prev, [t.id]: num }))} 
                                        className={`flex-1 h-5 rounded-md text-[8px] font-bold transition-all ${curCols === num ? `bg-white text-${colorClass}-600 shadow-sm border border-${colorClass}-50` : 'text-slate-400 hover:text-slate-600'}`}
                                      >
                                        {num}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {selectedInstructionIds.length === 0 && (
                          <div className="md:col-span-2 h-40 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50 flex flex-col items-center justify-center text-center p-6">
                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-slate-200 mb-3 shadow-sm">
                              <i className="fa-solid fa-plus text-lg"></i>
                            </div>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No Exercises Selected</h4>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Templates Right (Half) */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 px-2 mb-4 justify-end">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Templates (N-Z)</h3>
                      <div className="h-1 w-4 bg-orange-500 rounded-full"></div>
                    </div>
                    <div className="space-y-3">
                      {instructionTemplates
                        .filter(t => t.category?.toUpperCase() === activeModule.toUpperCase())
                        .sort((a, b) => {
                          const order = ['g_mcq', 'g_correct_incorrect', 'g_circle', 'g_complete_sentences', 'g_pair', 'g_spelling'];
                          const aIdx = order.indexOf(a.id);
                          const bIdx = order.indexOf(b.id);
                          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                          if (aIdx !== -1) return -1;
                          if (bIdx !== -1) return 1;
                          return 0;
                        })
                        .slice(Math.ceil(instructionTemplates.filter(t => t.category?.toUpperCase() === activeModule.toUpperCase()).length / 2))
                        .map((t, idx) => {
                          const isSelected = selectedInstructionIds.includes(t.id);
                          const cat = t.category?.toUpperCase();
                          const colorClass = cat === 'VOCABULARY' ? 'emerald' : cat === 'READING' ? 'blue' : 'orange';
                          
                          return (
                            <div
                              key={idx}
                              className={`group bg-white border rounded-2xl p-4 flex items-center justify-between hover:border-${colorClass}-200 hover:shadow-md transition-all cursor-pointer ${isSelected ? `border-${colorClass}-500 bg-${colorClass}-50/30` : 'border-slate-100'}`}
                              onClick={() => toggleInstruction(t.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${isSelected ? `bg-${colorClass}-600 text-white` : `bg-slate-50 text-slate-400 group-hover:bg-${colorClass}-50 group-hover:text-${colorClass}-500`}`}>
                                  <i className="fa-solid fa-book text-sm"></i>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-tight ${isSelected ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{t.label}</span>
                              </div>
                              <div className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${isSelected ? `bg-${colorClass}-600 border-${colorClass}-600 text-white` : `border-slate-100 text-slate-300 group-hover:border-${colorClass}-500 group-hover:text-${colorClass}-500`}`}>
                                <i className={`fa-solid ${isSelected ? 'fa-check' : 'fa-plus'} text-[10px]`}></i>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Main Content Grid (Now just Live Output) */}
                <div className="grid grid-cols-1 gap-8">
                  {/* Live Output Section */}
                  <div className="space-y-6">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Live Output</h3>
                    <div className="h-[400px] bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center p-10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none"></div>
                      <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-100 mb-8">
                        <i className="fa-solid fa-sparkles text-4xl"></i>
                      </div>
                      <h4 className="text-base font-bold text-slate-800 mb-3">Ready to Build</h4>
                      <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">Configure your test and click "Build Test" to generate your assessment.</p>
                      
                      {isGenerating && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                          <div className="h-12 w-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{generationStep || 'Neural Synthesis...'}</span>
                        </div>
                      )}

                      {generationError && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-30 p-10">
                          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6 shadow-xl shadow-red-600/10">
                            <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 mb-2">Neural Synthesis Failed</h4>
                          <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed mb-8">The AI engine encountered an issue. This could be due to a complex prompt or temporary service interruption.</p>
                          <div className="flex gap-4">
                            <button onClick={() => setGenerationError(null)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Dismiss</button>
                            <button onClick={handleGenerate} className="px-6 py-3 bg-orange-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2">
                              <i className="fa-solid fa-rotate-right"></i>
                              Retry Synthesis
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      {viewMode === 'preview' && (
        <section className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 bg-slate-50 ml-[280px]">
          <div className="p-4 lg:p-6 bg-white border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center z-10 no-print shadow-sm">
            <button onClick={() => setViewMode('generator')} className="border border-slate-200 text-slate-600 px-6 lg:px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 flex items-center gap-4 group transition-all">
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> WORKSPACE
            </button>
            <div className="flex gap-2 lg:gap-3 ml-auto">
              <button onClick={handleExportWord} className="px-6 lg:px-10 py-3 bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-orange-700 shadow-sm transition-all">EXPORT DOC</button>
              <button onClick={handlePrint} className="h-10 w-10 lg:h-12 lg:w-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 transition-all shadow-sm">
                <i className="fa-solid fa-print"></i>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <Worksheet 
              content={worksheetContent} 
              onContentChange={setWorksheetContent} 
              isGenerating={isGenerating} 
              theme={THEMES.find(t => t.id === activeThemeId) || THEMES[0]} 
              paperType="Plain" 
              brandSettings={brandSettings} 
              level={activeLevel} 
              module={activeModule} 
              topic={topic} 
            />
          </div>
        </section>
      )}

      {viewMode === 'grammar_iframe' && (
        <section className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 bg-slate-50 ml-[280px]">
          <div className="p-4 lg:p-6 bg-white border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center z-10 no-print shadow-sm">
            <button onClick={() => setViewMode('generator')} className="border border-slate-200 text-slate-600 px-6 lg:px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 flex items-center gap-4 group transition-all">
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> WORKSPACE
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-slate-800 font-bold uppercase tracking-widest text-[12px]">Neural Grammar Engine</h2>
            </div>
            <div className="flex gap-2">
              <a 
                href="https://aistudio.google.com/apps/f6448ec0-06de-44f2-93d6-13cd43bceb87?showPreview=true&showAssistant=true" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-orange-700 shadow-sm flex items-center gap-2 transition-all"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Launch Tool
              </a>
            </div>
          </div>
          <div className="flex-1 bg-white overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center bg-slate-50 -z-10">
              <i className="fa-solid fa-circle-exclamation text-4xl text-slate-300 mb-4"></i>
              <p className="text-slate-500 font-bold text-sm">If the tool refuses to connect, please use the "Launch Tool" button above.</p>
            </div>
            <iframe 
              src="https://aistudio.google.com/apps/f6448ec0-06de-44f2-93d6-13cd43bceb87?showPreview=true&showAssistant=true"
              className="w-full h-full min-h-[800px] border-none relative z-10"
              title="Grammar Tool"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-top-navigation-by-user-activation"
            />
          </div>
        </section>
      )}

      {viewMode === 'khmer_program' && (
        <section className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 bg-slate-50 ml-[280px]">
          <div className="p-4 lg:p-6 bg-white border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center z-10 no-print shadow-sm">
            <button onClick={() => setViewMode('generator')} className="border border-slate-200 text-slate-600 px-6 lg:px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 flex items-center gap-4 group transition-all">
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> WORKSPACE
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-slate-800 font-bold uppercase tracking-widest text-[12px]">Khmer Program Test Builder</h2>
            </div>
            <div className="flex gap-2">
              <a 
                href="https://chanthy-master-engine-gbcdawq79gtmzdw7cqfh7f.streamlit.app/?tool=khmer_program&embed=true" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-orange-700 shadow-sm flex items-center gap-2 transition-all"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Launch Tool
              </a>
            </div>
          </div>
          <div className="flex-1 bg-white overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center bg-slate-50 -z-10">
              <i className="fa-solid fa-circle-exclamation text-4xl text-slate-300 mb-4"></i>
              <p className="text-slate-500 font-bold text-sm">If the tool refuses to connect, please use the "Launch Tool" button above.</p>
            </div>
            <iframe 
              src="https://chanthy-master-engine-gbcdawq79gtmzdw7cqfh7f.streamlit.app/?tool=khmer_program&embed=true"
              className="w-full h-full min-h-[800px] border-none relative z-10"
              title="Khmer Program Tool"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-top-navigation-by-user-activation"
            />
          </div>
        </section>
      )}

      {viewMode === 'book_creation' && (
        <section className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 bg-slate-50 ml-[280px]">
          <div className="p-4 lg:p-6 bg-white border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center z-10 no-print shadow-sm">
            <button onClick={() => setViewMode('generator')} className="border border-slate-200 text-slate-600 px-6 lg:px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 flex items-center gap-4 group transition-all">
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> WORKSPACE
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-slate-800 font-bold uppercase tracking-widest text-[12px]">Neural Book Engine</h2>
            </div>
            <div className="flex gap-2">
              <a 
                href="https://chanthy-master-engine-gbcdawq79gtmzdw7cqfh7f.streamlit.app/?tool=book_creation&embed=true" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-orange-700 shadow-sm flex items-center gap-2 transition-all"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Launch Tool
              </a>
            </div>
          </div>
          <div className="flex-1 bg-white overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center bg-slate-50 -z-10">
              <i className="fa-solid fa-circle-exclamation text-4xl text-slate-300 mb-4"></i>
              <p className="text-slate-500 font-bold text-sm">If the tool refuses to connect, please use the "Launch Tool" button above.</p>
            </div>
            <iframe 
              src="https://chanthy-master-engine-gbcdawq79gtmzdw7cqfh7f.streamlit.app/?tool=book_creation&embed=true"
              className="w-full h-full min-h-[800px] border-none relative z-10"
              title="Book Creation Tool"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-top-navigation-by-user-activation"
            />
          </div>
        </section>
      )}

      {viewMode === 'ielts_master' && (
        <section className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 bg-slate-50 ml-[280px]">
          <div className="p-4 lg:p-6 bg-white border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center z-10 no-print shadow-sm">
            <button onClick={() => setViewMode('generator')} className="border border-slate-200 text-slate-600 px-6 lg:px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 flex items-center gap-4 group transition-all">
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> WORKSPACE
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-slate-800 font-bold uppercase tracking-widest text-[12px]">IELTS Mastermind</h2>
            </div>
            <div className="flex gap-2">
              <a 
                href="https://chanthy-master-engine-gbcdawq79gtmzdw7cqfh7f.streamlit.app/?tool=ielts_master&embed=true" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-orange-700 shadow-sm flex items-center gap-2 transition-all"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Launch Tool
              </a>
            </div>
          </div>
          <div className="flex-1 bg-white overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center bg-slate-50 -z-10">
              <i className="fa-solid fa-circle-exclamation text-4xl text-slate-300 mb-4"></i>
              <p className="text-slate-500 font-bold text-sm">If the tool refuses to connect, please use the "Launch Tool" button above.</p>
            </div>
            <iframe 
              src="https://chanthy-master-engine-gbcdawq79gtmzdw7cqfh7f.streamlit.app/?tool=ielts_master&embed=true"
              className="w-full h-full min-h-[800px] border-none"
              title="IELTS Master Tool"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-top-navigation-by-user-activation"
            />
          </div>
        </section>
      )}

      {viewMode === 'dpss_studio' && (
        <section className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 bg-slate-50 ml-[280px]">
          <div className="p-4 lg:p-6 bg-white border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center z-10 no-print shadow-sm">
            <button onClick={() => setViewMode('generator')} className="border border-slate-200 text-slate-600 px-6 lg:px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 flex items-center gap-4 group transition-all">
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> WORKSPACE
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-slate-800 font-bold uppercase tracking-widest text-[12px]">DPSS Studio</h2>
            </div>
            <div className="flex gap-2">
              <a 
                href="https://chanthy-master-engine-gbcdawq79gtmzdw7cqfh7f.streamlit.app/?tool=dpss_studio&embed=true" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-orange-700 shadow-sm flex items-center gap-2 transition-all"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Launch Tool
              </a>
            </div>
          </div>
          <div className="flex-1 bg-white overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center bg-slate-50 -z-10">
              <i className="fa-solid fa-circle-exclamation text-4xl text-slate-300 mb-4"></i>
              <p className="text-slate-500 font-bold text-sm">If the tool refuses to connect, please use the "Launch Tool" button above.</p>
            </div>
            <iframe 
              src="https://chanthy-master-engine-gbcdawq79gtmzdw7cqfh7f.streamlit.app/?tool=dpss_studio&embed=true"
              className="w-full h-full min-h-[800px] border-none"
              title="DPSS Studio Tool"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-top-navigation-by-user-activation"
            />
          </div>
        </section>
      )}
      {!showSettings && isAssistantVisible && (
        <div className="fixed bottom-24 right-6 w-[340px] max-w-[90vw] h-[500px] bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 z-[200]">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800">Live Assistant</span>
              </div>
              <button onClick={() => setIsAssistantVisible(false)} className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all">
                <i className="fa-solid fa-minus"></i>
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <NeuralChatAssistant 
                messages={chatMessages} 
                input={chatInput} 
                onInputChange={setChatInput} 
                onSendMessage={handleAssistantMessage} 
                isGenerating={isGenerating} 
                quickSource={sourceMaterial} 
                inline={true} 
              />
            </div>
        </div>
      )}
      {!showSettings && (
        <button 
          onClick={() => setIsAssistantVisible(!isAssistantVisible)} 
          className={`fixed bottom-6 right-6 h-16 w-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all z-[200] ${isAssistantVisible ? 'bg-orange-600 rotate-90' : 'bg-slate-800 hover:bg-slate-900'}`}
        >
          <i className={`fa-solid ${isAssistantVisible ? 'fa-xmark' : 'fa-wand-magic-sparkles text-xl'}`}></i>
        </button>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-[#f8fafc] bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.03),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.03),transparent_40%)] rounded-[48px] lg:rounded-[64px] w-full max-w-7xl h-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-white/50">
             <div className="p-8 lg:p-12 pb-4 flex justify-between items-center"><div className="flex items-center gap-4"><div className="h-4 w-4 bg-orange-600 rounded-full animate-pulse"></div><h2 className="text-[12px] font-black uppercase text-slate-900 tracking-widest">Workspace Control Node</h2></div><button onClick={() => setShowSettings(false)} className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900"><i className="fa-solid fa-xmark text-xl"></i></button></div>
             <div className="px-6 lg:px-12 mb-8"><div className="flex bg-slate-100/70 p-2 rounded-[32px] gap-1 overflow-x-auto no-scrollbar shadow-inner">{['COMMAND', 'ACCOUNT', 'ENGINE', 'BACKBONE LOGIC', 'DESIGN', 'LOGO'].map(tab => (<button key={tab} onClick={() => setSettingsTab(tab as SettingsTab)} className={`px-6 lg:px-10 py-4 rounded-[28px] text-[10px] font-black uppercase tracking-widest transition-all ${settingsTab === tab ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>{tab}</button>))}</div></div>
             <div className="flex-1 overflow-y-auto px-6 lg:px-12 pb-12 space-y-12 no-scrollbar">
                {settingsTab === 'LOGO' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6">
                    <div className="space-y-8">
                      <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Branding & Logo Registry</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Identity</label>
                          <input value={brandSettings.schoolName} onChange={e => setBrandSettings({ ...brandSettings, schoolName: e.target.value })} className="w-full bg-slate-100 border border-slate-200 rounded-3xl px-8 py-5 text-[14px] font-black text-slate-900 uppercase focus:border-orange-500 outline-none" placeholder="School Name" />
                          <input value={brandSettings.schoolAddress} onChange={e => setBrandSettings({ ...brandSettings, schoolAddress: e.target.value })} className="w-full bg-slate-100 border border-slate-200 rounded-3xl px-8 py-5 text-[14px] font-black text-slate-900 uppercase focus:border-orange-500 outline-none" placeholder="Address / Motto" />
                        </div>
                        <div className="space-y-6">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Header Logo (A4 Precision)</label>
                          <div className="border-4 border-dashed border-slate-200 rounded-[48px] p-10 flex flex-col items-center justify-center gap-6 hover:border-orange-500 transition-all cursor-pointer relative" onClick={() => logoUploadRef.current?.click()}>
                            {brandSettings.logoData ? <img src={brandSettings.logoData} className="max-h-24 w-auto rounded-xl" /> : <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-300"></i>}
                            <span className="text-[10px] font-black text-slate-400 uppercase">Upload Header Graphic</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="flex justify-between items-center px-2">
                        <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Neural Logo Registry ({brandSettings.logos.filter(l => !!l).length} / {brandSettings.logos.length})</h3>
                        <div className="flex gap-4">
                          <button onClick={() => { if(window.confirm("Clear all logos to free up space?")) setBrandSettings(prev => ({ ...prev, logos: Array(30).fill(undefined) })); }} className="text-[11px] font-black text-rose-500 uppercase border-b-2 border-rose-500">Clear All</button>
                          <button onClick={() => logoUploadRef.current?.click()} className="text-[11px] font-black text-orange-600 uppercase border-b-2 border-orange-600">+ Add Logo</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {brandSettings.logos.map((logo, idx) => (
                          <div key={idx} className={`aspect-video rounded-3xl border-2 flex items-center justify-center relative group overflow-hidden transition-all ${logo ? 'border-slate-200 bg-white' : 'border-dashed border-slate-100 bg-slate-50/50'}`}>
                            {logo ? (
                              <>
                                <img src={logo} className="max-h-full max-w-full p-4 object-contain" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                  <button onClick={() => setBrandSettings(prev => ({ ...prev, logoData: logo }))} className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-slate-900 hover:bg-orange-500 hover:text-white transition-all shadow-lg"><i className="fa-solid fa-eye"></i></button>
                                  <button onClick={() => removeLogo(idx)} className="h-10 w-10 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-all shadow-lg"><i className="fa-solid fa-trash-can"></i></button>
                                </div>
                              </>
                            ) : (
                              <div 
                                onClick={() => logoUploadRef.current?.click()} 
                                className="w-full h-full flex items-center justify-center cursor-pointer group/slot"
                              >
                                <i className="fa-solid fa-plus text-2xl text-slate-200 group-hover/slot:text-orange-500 transition-colors"></i>
                              </div>
                            )}
                            <div className="absolute bottom-3 left-4 text-[8px] font-black text-slate-300 uppercase tracking-widest">Slot {idx + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {settingsTab === 'COMMAND' && (
                   <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
                     <div className="flex justify-between items-center px-2"><h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Instruction Templates</h3><button onClick={addTemplate} className="text-[11px] font-black text-orange-600 uppercase border-b-2 border-orange-600">+ New Part</button></div>
                     <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] gap-1 overflow-x-auto no-scrollbar shadow-sm border border-slate-100 self-start">{['GRAMMAR', 'VOCABULARY', 'READING', 'TABLES', 'KIDS'].map(cat => (<button key={cat} onClick={() => setActiveTemplateCategory(cat)} className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTemplateCategory === cat ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{cat}</button>))}</div>
                     <div className="space-y-3">
                        {instructionTemplates.filter(t => t.category === activeTemplateCategory).map(t => {
                            const isExpanded = expandedTemplateId === t.id;
                            return (
                              <div key={t.id} className={`bg-white border rounded-[32px] overflow-hidden transition-all duration-300 ${isExpanded ? 'border-orange-200 shadow-xl' : 'border-slate-100 shadow-sm'}`}>
                                 <div className="p-6 lg:p-8 cursor-pointer flex items-center justify-between" onClick={() => setExpandedTemplateId(isExpanded ? null : t.id)}><div className="flex items-center gap-4 flex-1"><div className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform ${isExpanded ? 'rotate-90 bg-orange-600 text-white' : 'bg-slate-50 text-slate-400'}`}><i className="fa-solid fa-chevron-right text-[10px]"></i></div><div className="flex flex-col gap-0.5"><div className={`text-[13px] font-black uppercase tracking-wide transition-colors ${isExpanded ? 'text-orange-600' : 'text-slate-900'}`}>{t.label}</div>{!isExpanded && <div className="text-[9px] font-black text-slate-300 uppercase line-clamp-1">{t.prompt.slice(0, 100)}...</div>}</div></div><div className="flex items-center gap-3"><div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-400 text-[8px] font-black uppercase">{t.category}</div>{isExpanded && <button onClick={() => deleteTemplate(t.id)} className="h-8 w-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can text-[10px]"></i></button>}</div></div>
                                 {isExpanded && (<div className="px-8 pb-8 space-y-6 animate-in fade-in slide-in-from-top-4"><div className="h-px bg-slate-100 w-full mb-6"></div><div className="space-y-4"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label><input value={t.label} onChange={e => updateTemplate(t.id, { label: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold text-slate-700" /></div><div className="space-y-4"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Neural Prompt Logic</label><textarea value={t.prompt} onChange={e => updateTemplate(t.id, { prompt: e.target.value })} className="w-full h-32 bg-slate-50 border border-slate-100 rounded-3xl p-6 text-[11px] text-slate-600 font-medium italic outline-none resize-none focus:bg-white transition-all" /></div></div>)}
                              </div>
                            );
                        })}
                     </div>
                   </div>
                )}
                {settingsTab === 'ENGINE' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Neural Core Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { id: NeuralEngine.GEMINI_3_FLASH_LITE, name: 'Gemini 3.1 Flash Lite', desc: 'Ultra-fast, low-latency generation.' },
                        { id: NeuralEngine.GEMINI_3_FLASH, name: 'Gemini 3 Flash', desc: 'High-speed, balanced reasoning.' },
                        { id: NeuralEngine.GEMINI_3_PRO, name: 'Gemini 3 Pro', desc: 'Maximum intelligence for complex tests.' },
                        { id: NeuralEngine.GPT_4O, name: 'GPT-4o', desc: 'Advanced multimodal capabilities.' },
                        { id: NeuralEngine.GROK_3, name: 'Grok 3', desc: 'Real-time knowledge and reasoning.' },
                        { id: NeuralEngine.DEEPSEEK_V3, name: 'DeepSeek V3', desc: 'Efficient large-scale processing.' }
                      ].map(engine => (
                        <div key={engine.id} className={`p-8 rounded-[40px] border-2 transition-all ${activeEngine === engine.id ? 'bg-white border-orange-600 shadow-xl' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                              <div className="text-[14px] font-black text-slate-900 uppercase">{engine.name}</div>
                              <div className="text-[10px] font-medium text-slate-400">{engine.desc}</div>
                            </div>
                            {activeEngine === engine.id && <div className="h-6 w-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-[10px]"><i className="fa-solid fa-check"></i></div>}
                          </div>
                          <div className="space-y-4">
                            {(engine.id === NeuralEngine.GEMINI_3_FLASH_LITE || engine.id === NeuralEngine.GEMINI_3_FLASH || engine.id === NeuralEngine.GEMINI_3_PRO) && (
                              <button 
                                onClick={async () => {
                                  if ((window as any).aistudio?.openSelectKey) {
                                    await (window as any).aistudio.openSelectKey();
                                  } else {
                                    alert("The 'Select AI Studio Key' feature only works when you are using the app inside the AI Studio preview pane. \n\nIf you are viewing the app at the Shared URL directly, you must set a 'GEMINI_API_KEY' in your environment variables for it to work standalone.");
                                  }
                                }}
                                className="w-full bg-slate-100 border border-slate-200 text-slate-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                              >
                                <i className="fa-solid fa-key"></i>
                                Select AI Studio Key
                              </button>
                            )}
                            <input 
                              type="password"
                              value={externalKeys[engine.id as keyof ExternalKeys] || ''} 
                              onChange={e => setExternalKeys({ ...externalKeys, [engine.id]: e.target.value })}
                              placeholder={ (engine.id === NeuralEngine.GEMINI_3_FLASH_LITE || engine.id === NeuralEngine.GEMINI_3_FLASH || engine.id === NeuralEngine.GEMINI_3_PRO) ? "Or Paste Custom Gemini Key" : "Custom API Key (Optional)" }
                              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3 text-[11px] outline-none focus:border-orange-500"
                            />
                            <button 
                              onClick={() => setActiveEngine(engine.id as NeuralEngine)}
                              className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeEngine === engine.id ? 'bg-orange-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-900'}`}
                            >
                              {activeEngine === engine.id ? 'Currently Active' : 'Switch Engine'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {settingsTab === 'DESIGN' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Typography & Layout</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Font</label>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                          {['Times New Roman', 'Garamond'].map(font => (
                            <button key={font} onClick={() => setBrandSettings({ ...brandSettings, activeFont: font })} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${brandSettings.activeFont === font ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{font}</button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between px-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Randomize on Generate</span>
                          <button 
                            onClick={() => setBrandSettings({ ...brandSettings, randomizeFont: !brandSettings.randomizeFont })}
                            className={`w-12 h-6 rounded-full transition-all relative ${brandSettings.randomizeFont ? 'bg-orange-600' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${brandSettings.randomizeFont ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Font Size (px)</label>
                        <div className="flex items-center gap-4">
                          <input type="range" min="8" max="24" value={brandSettings.fontSize} onChange={e => setBrandSettings({ ...brandSettings, fontSize: parseInt(e.target.value) })} className="flex-1 accent-orange-600" />
                          <span className="text-xl font-black text-slate-900 w-12">{brandSettings.fontSize}</span>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Font Weight</label>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                          {['400', '500', '600', '700', '800', '900'].map(weight => (
                            <button key={weight} onClick={() => setBrandSettings({ ...brandSettings, fontWeight: weight })} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${brandSettings.fontWeight === weight ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{weight}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Letter Spacing</label>
                        <div className="flex items-center gap-4">
                          <input type="range" min="-2" max="10" step="0.5" value={brandSettings.letterSpacing} onChange={e => setBrandSettings({ ...brandSettings, letterSpacing: parseFloat(e.target.value) })} className="flex-1 accent-orange-600" />
                          <span className="text-xl font-black text-slate-900 w-12">{brandSettings.letterSpacing}</span>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Text Transform</label>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                          {['none', 'uppercase', 'capitalize'].map(transform => (
                            <button key={transform} onClick={() => setBrandSettings({ ...brandSettings, textTransform: transform as any })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${brandSettings.textTransform === transform ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{transform}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Worksheet Theme</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {THEMES.map(theme => (
                          <button key={theme.id} onClick={() => setActiveThemeId(theme.id)} className={`p-4 rounded-2xl border-2 transition-all text-left space-y-2 ${activeThemeId === theme.id ? 'border-orange-600 bg-white shadow-lg' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                            <div className="w-full h-2 rounded-full" style={{ backgroundColor: theme.color }}></div>
                            <div className="text-[10px] font-black uppercase text-slate-900 truncate">{theme.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {settingsTab === 'BACKBONE LOGIC' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="space-y-8">
                       <div className="flex justify-between items-center px-2">
                         <h3 className="text-[13px] font-black text-master-green uppercase tracking-widest">Master Protocols</h3>
                         {!(session?.code === 'dpss' || session?.code === 'gratitude' || session?.code === 'virtues') && (
                           <div className="flex items-center gap-2 text-rose-500 animate-pulse">
                             <i className="fa-solid fa-lock text-[10px]"></i>
                             <span className="text-[10px] font-black uppercase tracking-widest">Restricted Access</span>
                           </div>
                         )}
                         {(session?.code === 'dpss' || session?.code === 'gratitude' || session?.code === 'virtues') && (
                           <button onClick={addProtocol} className="text-[11px] font-black text-master-green uppercase border-b-2 border-master-green">+ New Protocol</button>
                         )}
                       </div>
                       {(session?.code === 'dpss' || session?.code === 'gratitude' || session?.code === 'virtues') ? (
                         <>
                           <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] gap-1 overflow-x-auto no-scrollbar shadow-sm border border-slate-100 self-start">
                             {['General', 'Grammar', 'Vocabulary', 'Reading'].map(cat => (
                               <button key={cat} onClick={() => setActiveProtocolCategory(cat as RuleCategory)} className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeProtocolCategory === cat ? 'bg-master-green text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{cat}</button>
                             ))}
                           </div>
                           <div className="space-y-3">
                             {masterProtocols.filter(p => p.category === activeProtocolCategory).map(p => {
                               const isExpanded = expandedProtocolId === p.id;
                               return (
                                 <div key={p.id} className={`bg-white border rounded-[32px] overflow-hidden transition-all duration-300 ${isExpanded ? 'border-master-green/30 shadow-xl' : 'border-slate-100 shadow-sm'}`}>
                                   <div className="p-6 lg:p-8 cursor-pointer flex items-center justify-between" onClick={() => setExpandedProtocolId(isExpanded ? null : p.id)}>
                                     <div className="flex items-center gap-4 flex-1">
                                       <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform ${isExpanded ? 'rotate-90 bg-master-green text-white' : 'bg-slate-50 text-slate-400'}`}>
                                         <i className="fa-solid fa-chevron-right text-[10px]"></i>
                                       </div>
                                       <div className="flex flex-col gap-0.5">
                                         <div className={`text-[13px] font-black uppercase tracking-wide transition-colors ${isExpanded ? 'text-master-green' : 'text-slate-900'}`}>{p.label}</div>
                                         {!isExpanded && <div className="text-[9px] font-black text-slate-300 uppercase line-clamp-1">{p.promptInjection.slice(0, 100)}...</div>}
                                       </div>
                                     </div>
                                     <div className="flex items-center gap-3">
                                       <button 
                                         onClick={(e) => { e.stopPropagation(); updateProtocol(p.id, { priority: cyclePriority(p.priority) }); }}
                                         className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all hover:scale-105 ${p.priority === 'High' ? 'bg-rose-100 text-rose-600' : p.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : p.priority === 'Average' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
                                       >
                                         {p.priority}
                                       </button>
                                       <button 
                                         onClick={(e) => { e.stopPropagation(); updateProtocol(p.id, { active: !p.active }); }} 
                                         className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase transition-all ${p.active ? 'bg-master-green/10 text-master-green' : 'bg-slate-100 text-slate-400'}`}
                                       >
                                         {p.active ? 'Active' : 'Disabled'}
                                       </button>
                                       {isExpanded && <button onClick={(e) => { e.stopPropagation(); deleteProtocol(p.id); }} className="h-8 w-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can text-[10px]"></i></button>}
                                     </div>
                                   </div>
                                   {isExpanded && (
                                     <div className="px-8 pb-8 space-y-6 animate-in fade-in slide-in-from-top-4">
                                       <div className="h-px bg-slate-100 w-full mb-6"></div>
                                       <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Protocol Name</label>
                                            <input value={p.label} onChange={e => updateProtocol(p.id, { label: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-master-green font-bold text-slate-700" />
                                          </div>
                                          <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Priority Level</label>
                                            <button 
                                              onClick={() => updateProtocol(p.id, { priority: cyclePriority(p.priority) })}
                                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none hover:border-master-green font-bold text-slate-700 uppercase text-left flex justify-between items-center"
                                            >
                                              <span>{p.priority}</span>
                                              <i className="fa-solid fa-rotate text-[10px] text-slate-300"></i>
                                            </button>
                                          </div>
                                       </div>
                                       <div className="space-y-4">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Protocol Logic</label>
                                         <textarea value={p.promptInjection} onChange={e => updateProtocol(p.id, { promptInjection: e.target.value })} className="w-full h-32 bg-slate-50 border border-slate-100 rounded-3xl p-6 text-[11px] text-slate-600 font-medium italic outline-none resize-none focus:bg-white transition-all" />
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               );
                             })}
                           </div>
                         </>
                       ) : (
                         <div className="p-12 border-2 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center gap-4 bg-slate-50/50">
                           <i className="fa-solid fa-shield-halved text-slate-200 text-4xl"></i>
                           <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Neural Protocols Encrypted</div>
                           <div className="text-[9px] font-medium text-slate-400 text-center max-w-[200px]">Please authenticate with a Master code to modify core protocols.</div>
                         </div>
                       )}
                    </div>
                     <div className="space-y-8">
                        <div className="flex justify-between items-center px-2">
                          <h3 className="text-[13px] font-black text-strict-purple uppercase tracking-widest">Logic Node Registry</h3>
                          <button onClick={addRule} className="text-[11px] font-black text-strict-purple uppercase border-b-2 border-strict-purple">+ New Logic Node</button>
                        </div>
                        <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] gap-1 overflow-x-auto no-scrollbar shadow-sm border border-slate-100 self-start">
                          {['General', 'Grammar', 'Vocabulary', 'Reading'].map(cat => (
                            <button key={cat} onClick={() => setActiveLogicCategory(cat as RuleCategory)} className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeLogicCategory === cat ? 'bg-strict-purple text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{cat}</button>
                          ))}
                        </div>
                        <div className="space-y-3">
                          {strictRules.filter(rule => rule.category === activeLogicCategory).map(rule => {
                            const isExpanded = expandedRuleId === rule.id;
                            return (
                              <div key={rule.id} className={`bg-white border rounded-[32px] overflow-hidden transition-all duration-300 ${isExpanded ? 'border-strict-purple/30 shadow-xl' : 'border-slate-100 shadow-sm'}`}>
                                <div className="p-6 lg:p-8 cursor-pointer flex items-center justify-between" onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}>
                                  <div className="flex items-center gap-4 flex-1">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform ${isExpanded ? 'rotate-90 bg-strict-purple text-white' : 'bg-slate-50 text-slate-400'}`}>
                                      <i className="fa-solid fa-chevron-right text-[10px]"></i>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <div className={`text-[13px] font-black uppercase tracking-wide transition-colors ${isExpanded ? 'text-strict-purple' : 'text-slate-900'}`}>{rule.label}</div>
                                      {!isExpanded && <div className="text-[9px] font-black text-slate-300 uppercase line-clamp-1">{rule.promptInjection.slice(0, 100)}...</div>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); updateRule(rule.id, { priority: cyclePriority(rule.priority) }); }}
                                      className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all hover:scale-105 ${rule.priority === 'High' ? 'bg-rose-100 text-rose-600' : rule.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : rule.priority === 'Average' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                      {rule.priority}
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); updateRule(rule.id, { active: !rule.active }); }} 
                                      className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase transition-all ${rule.active ? 'bg-strict-purple/10 text-strict-purple' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                      {rule.active ? 'Active' : 'Disabled'}
                                    </button>
                                    {isExpanded && <button onClick={(e) => { e.stopPropagation(); deleteRule(rule.id); }} className="h-8 w-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can text-[10px]"></i></button>}
                                  </div>
                                </div>
                                {isExpanded && (
                                  <div className="px-8 pb-8 space-y-6 animate-in fade-in slide-in-from-top-4">
                                    <div className="h-px bg-slate-100 w-full mb-6"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-4">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Logic Name</label>
                                         <input value={rule.label} onChange={e => updateRule(rule.id, { label: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-strict-purple font-bold text-slate-700" />
                                       </div>
                                       <div className="space-y-4">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Priority Level</label>
                                         <button 
                                           onClick={() => updateRule(rule.id, { priority: cyclePriority(rule.priority) })}
                                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none hover:border-strict-purple font-bold text-slate-700 uppercase text-left flex justify-between items-center"
                                         >
                                           <span>{rule.priority}</span>
                                           <i className="fa-solid fa-rotate text-[10px] text-slate-300"></i>
                                         </button>
                                       </div>
                                    </div>
                                    <div className="space-y-4">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Prompt Injection</label>
                                      <textarea value={rule.promptInjection} onChange={e => updateRule(rule.id, { promptInjection: e.target.value })} className="w-full h-32 bg-slate-50 border border-slate-100 rounded-3xl p-6 text-[11px] text-slate-600 font-medium italic outline-none resize-none focus:bg-white transition-all" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                     </div>
                  </div>
                )}
                {settingsTab === 'ACCOUNT' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {!isFirebaseConnected && (
                      <div className="bg-rose-50 border border-rose-100 p-8 rounded-[32px] space-y-4">
                        <div className="flex items-center gap-4 text-rose-600">
                          <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
                          <h4 className="font-black uppercase tracking-widest text-sm">Cloud Connection Error</h4>
                        </div>
                        <p className="text-rose-500 text-[11px] font-bold leading-relaxed">
                          Your application is unable to connect to the Firebase cloud. This usually happens if you haven't set up your environment variables (like GEMINI_API_KEY or Firebase config) on your hosting provider (e.g., Vercel).
                          <br/><br/>
                          If you are seeing this on a published site, please ensure you have copied the <code className="bg-rose-100 px-2 py-0.5 rounded">firebase-applet-config.json</code> values to your environment.
                        </p>
                      </div>
                    )}
                    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl">
                          <i className="fa-solid fa-cloud"></i>
                        </div>
                        <div>
                          <h3 className="text-[16px] font-black text-slate-900 uppercase tracking-widest">Cloud Sync Status</h3>
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Sync your branding and history across devices</p>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 w-full"></div>

                      {session?.email && session.email !== 'public@dpss.edu' ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black">
                                {session.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-[13px] font-black text-slate-900 uppercase">{session.name}</div>
                                <div className="text-[10px] font-medium text-slate-400">{session.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Connected</span>
                            </div>
                          </div>
                          <button 
                            onClick={handleLogout}
                            className="w-full py-5 rounded-3xl bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-3"
                          >
                            <i className="fa-solid fa-right-from-bracket"></i>
                            Disconnect Cloud Account
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          <div className="p-8 bg-orange-50 rounded-[32px] border border-orange-100 text-center space-y-4">
                            <i className="fa-solid fa-shield-halved text-3xl text-orange-500"></i>
                            <div className="text-[13px] font-black text-slate-900 uppercase tracking-wide">Cloud Storage Disabled</div>
                            <p className="text-[11px] font-medium text-slate-500 max-w-md mx-auto">Sign in with your DPSS account to automatically save your brand settings, logos, and worksheet history to the cloud.</p>
                          </div>
                          <button 
                            onClick={handleGoogleLogin}
                            disabled={authLoading}
                            className="w-full py-6 rounded-[32px] bg-slate-900 text-white text-[12px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-50"
                          >
                            {authLoading ? (
                              <i className="fa-solid fa-circle-notch fa-spin"></i>
                            ) : (
                              <i className="fa-brands fa-google"></i>
                            )}
                            Connect with Google Cloud
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-4">
                        <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                          <i className="fa-solid fa-palette"></i>
                        </div>
                        <div className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Brand Persistence</div>
                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed">Your school name, address, and logo collection are automatically synced. No more re-uploading logos on different computers.</p>
                      </div>
                      <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-4">
                        <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                          <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <div className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Infinite History</div>
                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed">Access your generated tests from anywhere. Your history is stored securely in your private cloud partition.</p>
                      </div>
                    </div>
                  </div>
                )}
             </div>
              <div className="p-12 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                <button onClick={hardReset} className="px-16 py-6 bg-rose-600 text-white rounded-full text-[12px] font-black uppercase shadow-xl hover:bg-rose-700 transition-all">Hard Reset</button>
                <button onClick={syncWithDefaults} className="px-16 py-6 bg-slate-900 text-white rounded-full text-[12px] font-black uppercase shadow-xl hover:bg-black transition-all">Sync Settings</button>
                <button onClick={() => setShowSettings(false)} className="px-16 py-6 bg-gradient-to-r from-accent-orange-dark to-accent-orange-light text-white rounded-full text-[12px] font-black uppercase shadow-xl hover:brightness-110 transition-all">Close Panel</button>
              </div>
          </div>
        </div>
      )}
      {/* EXPORT SETTINGS MODAL */}
      {exportSettings.showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setExportSettings(prev => ({ ...prev, showModal: false }))}></div>
          <div className="relative w-full max-w-md bg-white rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                  <i className="fa-solid fa-file-word text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Export Settings</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customize your Word document</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Filename</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={exportSettings.filename} 
                      onChange={e => setExportSettings(prev => ({ ...prev, filename: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold text-slate-700 pr-16"
                      placeholder="Enter filename..."
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">.doc</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Document Title</label>
                  <input 
                    type="text" 
                    value={exportSettings.title} 
                    onChange={e => setExportSettings(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold text-slate-700"
                    placeholder="Enter title..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button 
                  onClick={() => setExportSettings(prev => ({ ...prev, showModal: false }))}
                  className="py-5 bg-slate-100 text-slate-500 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmExportWord}
                  className="py-5 bg-orange-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-orange-600/20 transition-all"
                >
                  Confirm Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* HIDDEN FILE INPUTS */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" 
        onChange={handleFileUpload} 
      />
      <input 
        type="file" 
        ref={logoUploadRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleLogoUpload} 
      />
    </div>
  );
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
          <div className="space-y-6">
            <i className="fa-solid fa-triangle-exclamation text-6xl text-orange-500"></i>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest">Neural Circuit Interrupted</h1>
            <p className="text-slate-400 max-w-md mx-auto">A critical error has occurred in the matrix. Please refresh the architect's interface.</p>
            <button onClick={() => window.location.reload()} className="px-8 py-4 bg-orange-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-orange-500 transition-all">Reboot Interface</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default App;
