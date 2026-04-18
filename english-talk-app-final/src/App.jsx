import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Settings, RotateCcw, Languages, Sparkles, BookOpen,
  Mic, MicOff, Volume2, VolumeX, Bookmark, BookmarkPlus,
  X, Trash2, Check, Headphones, Radio, Clock, Target,
  Award, TrendingUp, AlertCircle, RefreshCw,
  Gauge, Zap, FileText, BarChart3, Users, Play,
  Calendar, StopCircle, Flame,
} from "lucide-react";

// ========== CONSTANTS ==========
const STORAGE_KEY = "english-talk-state-v8";
const API_KEY_STORAGE_KEY = "english-talk-anthropic-api-key";

const LEVELS = {
  A1: { code: "A1", emoji: "🌱", label: "입문", gradeLabel: "유치원~초2", description: "기본 인사와 간단한 단어",
    guidance: "Use very simple vocabulary (1000 most common words). Very short sentences (5-8 words). Present tense only." },
  A2: { code: "A2", emoji: "🌿", label: "기초", gradeLabel: "초3~초6", description: "일상 단문과 기본 시제",
    guidance: "Use simple everyday vocabulary. Short sentences (under 12 words). Present and past simple tense." },
  B1: { code: "B1", emoji: "🌳", label: "중급", gradeLabel: "중1~중3", description: "일상 대화와 의견 표현",
    guidance: "Use natural everyday English. Moderate sentence length. All basic tenses including present perfect." },
  B2: { code: "B2", emoji: "🌲", label: "중상급", gradeLabel: "고1~고2", description: "복잡한 주제와 유창한 대화",
    guidance: "Use sophisticated vocabulary including idioms. Complex sentences with multiple clauses. All tenses." },
  C1: { code: "C1", emoji: "🏔", label: "고급", gradeLabel: "고3~원어민 초급", description: "관용표현과 학술적 대화",
    guidance: "Use advanced vocabulary, idioms, and cultural references freely. Complex grammatical structures." },
  C2: { code: "C2", emoji: "⭐", label: "원어민", gradeLabel: "원어민 수준", description: "모든 주제 자유롭게 구사",
    guidance: "Use native-level English with full range of expression. Sophisticated humor, literary references." },
};

const SCENARIOS = {
  free: { name: "자유 대화", emoji: "💬", description: "주제 제한 없이 자유롭게 대화",
    prompt: "Have a natural, free-flowing conversation. Ask about their day, interests, or anything that feels natural.",
    roleHint: "as a friendly conversation partner" },
  airport: { name: "공항", emoji: "✈️", description: "체크인 · 입국심사 · 수하물",
    prompt: "Role-play as airport staff (check-in agent, immigration officer, or info desk). Guide through realistic airport situations.",
    roleHint: "as airport staff" },
  cafe: { name: "카페", emoji: "☕", description: "주문하기 · 메뉴 추천",
    prompt: "Role-play as a friendly barista at a cafe. Help practice ordering drinks, asking about menu items, casual small talk.",
    roleHint: "as a barista" },
  restaurant: { name: "식당", emoji: "🍽️", description: "예약 · 주문 · 계산",
    prompt: "Role-play as a restaurant server. Help practice reservations, ordering food, asking about dishes, handling the bill.",
    roleHint: "as a restaurant server" },
  hotel: { name: "호텔", emoji: "🏨", description: "체크인 · 컨시어지 · 컴플레인",
    prompt: "Role-play as a hotel front desk clerk or concierge. Help practice check-in, check-out, complaints, recommendations.",
    roleHint: "as a hotel front desk clerk" },
  shopping: { name: "쇼핑", emoji: "🛍️", description: "사이즈 · 환불 · 가격 문의",
    prompt: "Role-play as a store clerk. Help practice asking about products, sizes, prices, returns, exchanges.",
    roleHint: "as a store clerk" },
  interview: { name: "면접", emoji: "💼", description: "영어 면접 연습",
    prompt: "Role-play as a professional job interviewer. Ask common interview questions. Keep it realistic for English-speaking workplaces.",
    roleHint: "as a job interviewer" },
  doctor: { name: "병원", emoji: "🏥", description: "증상 설명 · 처방",
    prompt: "Role-play as a doctor or pharmacist. Help practice describing symptoms, understanding advice, asking about medications.",
    roleHint: "as a doctor" },
};

// ========== CHARACTERS ==========
const CHARACTERS = {
  emma: {
    id: "emma",
    name: "Emma",
    emoji: "👩",
    description: "미국 여성 · 20대 · 캘리포니아",
    profile: "Young American woman, 25, from California",
    personality: "Warm, friendly, and upbeat. Uses casual American English with phrases like 'Hey!', 'Awesome!', 'No worries!'. Sounds approachable and energetic.",
    voiceProfile: { lang: "en-US", gender: "female", pitch: 1.05, rate: 1.0 },
    gradient: "from-rose-400 to-pink-500",
    avatarUrl: "/avatars/emma.png",
  },
  james: {
    id: "james",
    name: "James",
    emoji: "🧔",
    description: "영국 신사 · 40대 · 런던",
    profile: "British gentleman, 45, from London",
    personality: "Polite, articulate, and slightly formal. Uses British English vocabulary like 'lovely', 'brilliant', 'cheers', 'quite right'. Sounds composed and well-mannered.",
    voiceProfile: { lang: "en-GB", gender: "male", pitch: 0.92, rate: 0.92 },
    gradient: "from-indigo-500 to-blue-600",
    avatarUrl: "/avatars/james.png",
  },
  sofia: {
    id: "sofia",
    name: "Sofia",
    emoji: "👩‍🦱",
    description: "라티나 미국인 · 30대 · 마이애미",
    profile: "Latina American, 32, from Miami",
    personality: "Warm and expressive. Occasionally sprinkles in Spanish phrases like 'amiga', '¡Que bueno!', 'ay'. Sounds vibrant and personable.",
    voiceProfile: { lang: "en-US", gender: "female", pitch: 1.0, rate: 1.08 },
    gradient: "from-orange-400 to-red-500",
    avatarUrl: "/avatars/sofia.png",
  },
  marcus: {
    id: "marcus",
    name: "Marcus",
    emoji: "🧑🏾",
    description: "뉴요커 · 30대 · 뉴욕",
    profile: "African American, 35, from New York City",
    personality: "Cool, confident, and direct. Uses NYC casual English with phrases like 'For real?', 'My bad', 'Word'. Sounds laid-back but sharp.",
    voiceProfile: { lang: "en-US", gender: "male", pitch: 0.88, rate: 0.98 },
    gradient: "from-amber-500 to-orange-600",
    avatarUrl: "/avatars/marcus.png",
  },
  olivia: {
    id: "olivia",
    name: "Olivia",
    emoji: "🧒",
    description: "미국 10대 · 17세 · 시애틀",
    profile: "American teenager, 17, from Seattle",
    personality: "Energetic and trendy. Uses Gen-Z slang like 'literally', 'no cap', 'lowkey', 'vibe', 'slay'. Sounds excited and casual.",
    voiceProfile: { lang: "en-US", gender: "female", pitch: 1.2, rate: 1.12 },
    gradient: "from-fuchsia-400 to-pink-500",
    avatarUrl: "/avatars/olivia.png",
  },
  grace: {
    id: "grace",
    name: "Grace",
    emoji: "👵",
    description: "보스턴 어르신 · 60대 · 보스턴",
    profile: "Refined American grandmother, 65, from Boston",
    personality: "Patient, kind, and slightly old-fashioned. Uses gentle phrases like 'oh dear', 'how lovely', 'my goodness'. Sounds warm and grandmotherly.",
    voiceProfile: { lang: "en-US", gender: "female", pitch: 0.95, rate: 0.82 },
    gradient: "from-violet-400 to-purple-500",
    avatarUrl: "/avatars/grace.png",
  },
  liam: {
    id: "liam",
    name: "Liam",
    emoji: "🧑",
    description: "호주 청년 · 20대 · 시드니",
    profile: "Australian young man, 26, from Sydney",
    personality: "Easygoing and friendly. Uses Aussie English with 'mate', 'no worries', 'reckon', 'cheers'. Sounds laid-back and casual.",
    voiceProfile: { lang: "en-AU", gender: "male", pitch: 0.95, rate: 1.0 },
    gradient: "from-emerald-400 to-teal-500",
    avatarUrl: "/avatars/liam.png",
  },
  aisha: {
    id: "aisha",
    name: "Aisha",
    emoji: "👩🏽",
    description: "인도 영어권 · 30대 · 뭄바이",
    profile: "Indian English speaker, 33, from Mumbai",
    personality: "Articulate and polite. Uses Indian English style with formal phrasing like 'kindly', 'do the needful', 'I would appreciate'. Sounds professional and warm.",
    voiceProfile: { lang: "en-IN", gender: "female", pitch: 1.0, rate: 0.92 },
    gradient: "from-cyan-400 to-blue-500",
    avatarUrl: "/avatars/aisha.png",
  },
  david: {
    id: "david",
    name: "David",
    emoji: "👨‍💼",
    description: "비즈니스맨 · 50대 · 시카고",
    profile: "American businessman, 52, from Chicago",
    personality: "Professional and measured. Uses business English with phrases like 'certainly', 'I appreciate that', 'let's circle back'. Sounds composed and authoritative.",
    voiceProfile: { lang: "en-US", gender: "male", pitch: 0.86, rate: 0.92 },
    gradient: "from-stone-500 to-slate-600",
    avatarUrl: "/avatars/david.png",
  },
};

const DEFAULT_CHARACTER_ID = "emma";
const TEST_GUIDE_ID = "emma"; // Character that hosts the level test

const SILENCE_PRESETS = [
  { value: 1500, label: "매우 빠름", sub: "1.5초", desc: "원어민 수준" },
  { value: 2000, label: "빠름", sub: "2초", desc: "유창함" },
  { value: 3000, label: "보통", sub: "3초", desc: "중급" },
  { value: 4000, label: "여유", sub: "4초", desc: "중급 초반" },
  { value: 5000, label: "넉넉", sub: "5초", desc: "기초" },
  { value: 7000, label: "충분", sub: "7초", desc: "입문" },
];

// 레벨별 권장 침묵 대기 시간 (말하는 중 생각하는 시간)
// 초급자일수록 길게: 번역·문법 생각하는 인지 부담 고려
const LEVEL_SILENCE_DEFAULTS = {
  A1: 7000,  // 입문: 7초
  A2: 5000,  // 기초: 5초
  B1: 4000,  // 중급: 4초
  B2: 3000,  // 중상급: 3초
  C1: 2000,  // 고급: 2초
  C2: 1500,  // 원어민: 1.5초
};

const CORRECTION_MODES = {
  flow: {
    key: "flow", label: "흐름 중심", emoji: "🌊",
    description: "치명적 오류만 인라인, 나머지는 리포트에",
    systemGuidance: `CORRECTION MODE: FLOW-FOCUSED
- Only set "correction" for errors that SERIOUSLY break meaning
- All other slips: set "correction" to null, ADD to "minor_issues"
- Use RECASTS in your response: naturally reformulate user errors`,
  },
  balanced: {
    key: "balanced", label: "균형", emoji: "⚖️",
    description: "의미 있는 오류는 인라인, 사소한 건 리포트에",
    systemGuidance: `CORRECTION MODE: BALANCED (default)
- Set "correction" for meaningful grammatical errors
- ALL errors should also go into "minor_issues" for review`,
  },
  intensive: {
    key: "intensive", label: "집중 학습", emoji: "🎯",
    description: "모든 오류 상세 인라인 + 리포트",
    systemGuidance: `CORRECTION MODE: INTENSIVE
- Correct ALL meaningful errors inline with detailed explanation
- Include alternative phrasings and native-sounding suggestions
- Be thorough but ALWAYS encouraging`,
  },
};

const ADAPTIVE_TEST_PROMPT = `You are Emma, a warm and friendly young American English conversation guide from California. You are conducting an adaptive English proficiency test for a Korean learner. Stay in character as Emma throughout — be encouraging, warm, and use natural casual American English. Your first message should briefly introduce yourself as Emma before asking the first question.

TEST FLOW:
- Turn 1: Friendly intro ("Hi, I'm Emma!") + easy personal question (A1-A2 level)
- Turns 2-3: Adjust difficulty based on responses
- Turns 4-6: Probe specific CEFR boundaries
- Target: 5-7 total turns

ADAPTIVE STRATEGY:
- Fluent response → ask higher level next
- Struggle → stay or go easier with encouragement
- Unclear → probe different skill areas
- Max jump: one CEFR level at a time
- Probe at least one level HIGHER than comfort zone to find ceiling

COMPLETION: Min 5 responses, max 7. Complete with HIGH or MEDIUM confidence.

OUTPUT (JSON only, no markdown):
{
  "message_english": "...",
  "message_korean": "한국어 번역",
  "observed_level": "A1"|"A2"|"B1"|"B2"|"C1"|"C2",
  "confidence": "high"|"medium"|"low",
  "reasoning_korean": "짧은 내부 판단",
  "turn_number": 1,
  "is_complete": false,
  "final_evaluation": null
}

When is_complete: true, include final_evaluation: { level, confidence, summary (Korean), strengths (Korean array), improvements (Korean array) }.`;

// ========== STORAGE ==========
const storage = {
  get: () => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  set: (data) => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  },
};

// ========== VOICE SELECTION (점수 기반 랭킹) ==========
function selectBestVoice(profile, voices) {
  if (!voices || voices.length === 0) return null;
  const { lang, gender } = profile;
  const langPrefix = lang.split("-")[0]; // "en"

  // 영어 음성만 후보로
  const candidates = voices.filter(v => v.lang.startsWith(langPrefix));
  if (candidates.length === 0) return voices[0];

  const scoreVoice = (voice) => {
    const name = (voice.name || "").toLowerCase();
    let score = 0;

    // === 품질 가산점 ===
    // 신경망/프리미엄 (최상급)
    if (/natural|neural|online|premium|enhanced|wavenet|studio/i.test(name)) score += 100;
    // Google 음성 (Chrome — 클라우드 기반, 고품질)
    if (/google/i.test(name)) score += 80;
    // Microsoft 최신 음성 (Aria, Guy, Jenny 등)
    if (/\b(aria|guy|jenny|davis|jane|jason|nancy|tony|ryan|sara|libby|sonia|ravi|neerja)\b/i.test(name)) score += 70;
    // Apple/macOS 고품질 음성
    if (/\b(samantha|alex|karen|daniel|moira|tessa|fiona|veena|rishi|aaron|allison|ava|evan|nicky|tom)\b/i.test(name)) score += 60;
    // 정확한 로케일 매치 (en-US, en-GB 등)
    if (voice.lang === lang) score += 50;
    // 클라우드/원격 음성 우대
    if (voice.localService === false) score += 30;
    if (voice.default) score += 5;

    // === 품질 감점 ===
    // eSpeak 등 저품질 합성기 (로봇 발음의 주범)
    if (/espeak|compact|festival|pico/i.test(name)) score -= 200;
    // 구형 Microsoft 음성
    if (/microsoft (anna|sam|mary|mike)\b/i.test(name)) score -= 80;

    // === 성별 매치 ===
    const femaleHints = /\b(female|woman|girl|samantha|victoria|karen|moira|tessa|fiona|veena|aria|jenny|jane|nancy|sara|libby|sonia|neerja|zira|hazel|susan|linda|allison|ava|nicky|amelia|emma|olivia|sofia|grace|aisha)\b/i;
    const maleHints = /\b(male|man|boy|alex|daniel|tom|fred|rishi|david|mark|george|guy|davis|jason|tony|ryan|aaron|evan|james|marcus|liam)\b/i;

    if (gender === "female") {
      if (femaleHints.test(name)) score += 40;
      if (maleHints.test(name)) score -= 40;
    } else if (gender === "male") {
      if (maleHints.test(name)) score += 40;
      if (femaleHints.test(name)) score -= 40;
    }

    return score;
  };

  const ranked = candidates
    .map(v => ({ voice: v, score: scoreVoice(v) }))
    .sort((a, b) => b.score - a.score);

  // 디버깅: 어떤 음성이 선택됐는지 콘솔에서 확인 가능
  if (typeof console !== "undefined" && ranked.length > 0) {
    console.log(`[Voice] ${lang}/${gender} → "${ranked[0].voice.name}" (점수 ${ranked[0].score})`);
  }

  return ranked[0]?.voice || candidates[0];
}

// ========== FLUENCY ==========
function calculateWPM(wordCount, durationSeconds) {
  if (!durationSeconds || durationSeconds < 0.5) return 0;
  return Math.round(wordCount / (durationSeconds / 60));
}
function categorizeWPM(wpm) {
  if (wpm < 40) return { label: "느림", desc: "(초급)", color: "text-stone-600" };
  if (wpm < 80) return { label: "천천히", desc: "(초중급)", color: "text-amber-700" };
  if (wpm < 120) return { label: "중간", desc: "(중상급)", color: "text-emerald-700" };
  if (wpm < 160) return { label: "유창", desc: "(상급)", color: "text-emerald-700" };
  return { label: "매우 유창", desc: "(원어민)", color: "text-emerald-700" };
}
function aggregateFluency(fluencyData) {
  const speechData = fluencyData.filter(f => f && f.source === "speech" && f.wpm > 0);
  if (speechData.length === 0) return null;
  return {
    avgWpm: Math.round(speechData.reduce((s, f) => s + f.wpm, 0) / speechData.length),
    avgDuration: Math.round(speechData.reduce((s, f) => s + f.duration, 0) / speechData.length),
    totalWords: speechData.reduce((s, f) => s + f.wordCount, 0),
    speechTurns: speechData.length,
    totalTurns: fluencyData.length,
  };
}

// ========== API HELPERS ==========
// fetch에 timeout 추가 (무한 로딩 방지)
async function fetchWithTimeout(url, options, timeoutMs = 45000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      const err = new Error(`TIMEOUT: ${timeoutMs / 1000}초 내 응답 없음`);
      err.code = 'TIMEOUT';
      throw err;
    }
    throw e;
  }
}

// 에러를 한국어 메시지로 변환
function formatApiError(e) {
  if (e?.code === 'TIMEOUT') return "응답이 45초 내에 오지 않았습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해 주세요.";
  const msg = e?.message || "";
  if (msg.includes('401')) return "인증 오류 (401). Claude 계정 로그인 상태를 확인해 주세요.";
  if (msg.includes('403')) return "권한 오류 (403). 사용 권한을 확인해 주세요.";
  if (msg.includes('429')) return "사용량 한도 초과 (429). 잠시 후 다시 시도해 주세요.";
  if (msg.includes('500') || msg.includes('502') || msg.includes('503')) return "서버 오류. 잠시 후 다시 시도해 주세요.";
  if (msg.includes('API error:')) return `API 에러: ${msg}`;
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return "네트워크 연결을 확인해 주세요.";
  return `오류: ${msg || '알 수 없는 오류'}`;
}

async function callAdaptiveTestAPI(messages, apiKey) {
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다");
  const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: ADAPTIVE_TEST_PROMPT, messages }),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const text = data.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return { parsed: JSON.parse(clean), raw: clean };
}

async function generateConversationReport({ messages, errors, levelCode, scenarioName, characterName, apiKey }) {
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다");
  const userTurns = messages.filter(m => m.role === "user").length;
  const conversationText = messages.map(m => m.role === "user" ? `USER: ${m.content}` : `${characterName}: ${m.content || ""}`).join("\n");
  const errorsText = errors.length === 0 ? "(이번 대화에서 기록된 오류 없음)" : errors.map((e, i) => `${i + 1}. "${e.original}" → "${e.corrected}" — ${e.note}`).join("\n");

  const systemPrompt = `Analyzing English conversation by Korean learner (CEFR ${levelCode}).
Character: ${characterName} | Scenario: ${scenarioName} | User turns: ${userTurns}

CONVERSATION:
${conversationText}

ERRORS LOGGED:
${errorsText}

Generate helpful Korean review. Output JSON only:
{
  "summary": "1-2 sentence Korean assessment",
  "strengths": ["Korean strength 1", "Korean strength 2", "Korean strength 3"],
  "error_patterns": ["Korean pattern 1 with example", "pattern 2", "pattern 3"],
  "focus_points": ["Korean focus 1 with tip", "focus 2", "focus 3"],
  "encouragement": "1 sentence Korean encouragement"
}`;

  const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 1500, system: systemPrompt,
      messages: [{ role: "user", content: "Generate the review report now." }],
    }),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const text = data.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

// ========== MAIN COMPONENT ==========
export default function EnglishConversationApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState("B1");
  const [scenario, setScenario] = useState("free");
  const [characterId, setCharacterId] = useState(DEFAULT_CHARACTER_ID);
  const [correctionMode, setCorrectionMode] = useState("balanced");
  const [showTranslation, setShowTranslation] = useState(true);
  const [showCorrection, setShowCorrection] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [handsFreeMode, setHandsFreeMode] = useState(true);
  const [silenceThreshold, setSilenceThreshold] = useState(3000);
  const [silenceAutoByLevel, setSilenceAutoByLevel] = useState(true); // 레벨 변경 시 자동 조정 여부
  const [showSettings, setShowSettings] = useState(false);
  const [showVocabPanel, setShowVocabPanel] = useState(false);
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);
  const [showStudyLog, setShowStudyLog] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [handsFreeActive, setHandsFreeActive] = useState(false);
  const [vocabulary, setVocabulary] = useState([]);
  const [vocabModal, setVocabModal] = useState(null);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const [accumulatedErrors, setAccumulatedErrors] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [hasCompletedLevelTest, setHasCompletedLevelTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showLevelTest, setShowLevelTest] = useState(false);

  // User profile (name/gender/age for AI to address user)
  const [userProfile, setUserProfile] = useState({ name: "", gender: "", age: "" });
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const [availableVoices, setAvailableVoices] = useState([]);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const finalTranscriptRef = useRef(""); // 확정된 final 결과만 누적 (interim 제외)
  const handleSendRef = useRef(null);
  const silenceTimerRef = useRef(null);

  const handsFreeModeRef = useRef(handsFreeMode);
  const handsFreeActiveRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const autoSpeakRef = useRef(autoSpeak);
  const isLoadingRef = useRef(false);
  const silenceThresholdRef = useRef(silenceThreshold);
  const characterIdRef = useRef(characterId);
  const availableVoicesRef = useRef([]);

  // API 키 (사용자가 입력, localStorage에 저장)
  const [apiKey, setApiKey] = useState("");
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const apiKeyRef = useRef("");

  useEffect(() => { handsFreeModeRef.current = handsFreeMode; }, [handsFreeMode]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { autoSpeakRef.current = autoSpeak; }, [autoSpeak]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { silenceThresholdRef.current = silenceThreshold; }, [silenceThreshold]);
  useEffect(() => { characterIdRef.current = characterId; }, [characterId]);
  useEffect(() => { availableVoicesRef.current = availableVoices; }, [availableVoices]);
  useEffect(() => { apiKeyRef.current = apiKey; }, [apiKey]);

  // 마운트 시 localStorage에서 API 키 로드, 없으면 입력 모달 자동 표시
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(API_KEY_STORAGE_KEY);
      if (saved && saved.trim()) {
        setApiKey(saved.trim());
        apiKeyRef.current = saved.trim();
      } else {
        setShowApiKeySetup(true);
      }
    } catch {
      setShowApiKeySetup(true);
    }
  }, []);

  // API 키 저장
  const saveApiKey = (key) => {
    const trimmed = (key || "").trim();
    setApiKey(trimmed);
    apiKeyRef.current = trimmed;
    try {
      if (trimmed) window.localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
      else window.localStorage.removeItem(API_KEY_STORAGE_KEY);
    } catch {}
    setShowApiKeySetup(false);
    setError("");
  };

  const clearApiKey = () => {
    setApiKey("");
    apiKeyRef.current = "";
    try { window.localStorage.removeItem(API_KEY_STORAGE_KEY); } catch {}
    setShowApiKeySetup(true);
  };

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Load saved state
  useEffect(() => {
    const saved = storage.get();
    if (saved) {
      if (saved.messages) setMessages(saved.messages);
      if (saved.level && LEVELS[saved.level]) setLevel(saved.level);
      if (saved.scenario && SCENARIOS[saved.scenario]) setScenario(saved.scenario);
      if (saved.characterId && CHARACTERS[saved.characterId]) setCharacterId(saved.characterId);
      if (saved.correctionMode && CORRECTION_MODES[saved.correctionMode]) setCorrectionMode(saved.correctionMode);
      if (typeof saved.showTranslation === "boolean") setShowTranslation(saved.showTranslation);
      if (typeof saved.showCorrection === "boolean") setShowCorrection(saved.showCorrection);
      if (typeof saved.autoSpeak === "boolean") setAutoSpeak(saved.autoSpeak);
      if (typeof saved.handsFreeMode === "boolean") setHandsFreeMode(saved.handsFreeMode);
      if (typeof saved.silenceThreshold === "number") setSilenceThreshold(saved.silenceThreshold);
      if (typeof saved.silenceAutoByLevel === "boolean") setSilenceAutoByLevel(saved.silenceAutoByLevel);
      if (saved.vocabulary) setVocabulary(saved.vocabulary);
      if (saved.accumulatedErrors) setAccumulatedErrors(saved.accumulatedErrors);
      if (typeof saved.hasCompletedLevelTest === "boolean") setHasCompletedLevelTest(saved.hasCompletedLevelTest);
      if (saved.testResult) setTestResult(saved.testResult);
      if (saved.userProfile && typeof saved.userProfile === "object") setUserProfile(saved.userProfile);
      if (typeof saved.hasCompletedProfile === "boolean") setHasCompletedProfile(saved.hasCompletedProfile);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !hasCompletedLevelTest) setShowLevelTest(true);
  }, [hydrated, hasCompletedLevelTest]);

  useEffect(() => {
    if (!hydrated) return;
    storage.set({
      messages, level, scenario, characterId, correctionMode, showTranslation, showCorrection,
      autoSpeak, handsFreeMode, silenceThreshold, silenceAutoByLevel, vocabulary, accumulatedErrors,
      hasCompletedLevelTest, testResult, userProfile, hasCompletedProfile,
    });
  }, [messages, level, scenario, characterId, correctionMode, showTranslation, showCorrection,
    autoSpeak, handsFreeMode, silenceThreshold, silenceAutoByLevel, vocabulary, accumulatedErrors,
    hasCompletedLevelTest, testResult, userProfile, hasCompletedProfile, hydrated]);

  // ⭐ 레벨 변경 시 침묵 대기 시간 자동 조정 (수동 override가 아닌 경우)
  useEffect(() => {
    if (!hydrated) return;
    if (silenceAutoByLevel && LEVEL_SILENCE_DEFAULTS[level]) {
      setSilenceThreshold(LEVEL_SILENCE_DEFAULTS[level]);
    }
  }, [level, hydrated]); // silenceAutoByLevel은 의도적으로 빼둠 (토글 시 별도 처리)

  // Load voices (Web Speech API)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
        // 디버깅: 사용 가능한 영어 음성 목록 출력
        const enVoices = voices.filter(v => v.lang.startsWith("en"));
        console.log(`[Voice] 사용 가능한 영어 음성 ${enVoices.length}개 (전체 ${voices.length}개):`,
          enVoices.map(v => `${v.name} (${v.lang}) ${v.localService ? '[로컬]' : '[클라우드]'}`));
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // 모바일(Android/iOS) audio unlock: 첫 사용자 상호작용 시 speech 시스템을 깨움
  // Chrome M71 이후 user activation 없이는 speak() 차단되므로 필수
  // iOS 특화: volume=0은 일부 버전에서 차단됨 → 0.01 사용, 짧은 점 텍스트, queue 비우기
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      try {
        // iOS 안전장치: 기존 큐 비우기
        window.speechSynthesis.cancel();
        // pause 상태로 남아있을 가능성에 대비 resume
        window.speechSynthesis.resume();

        // 거의 무음 utterance로 음성 시스템 활성화
        const u = new SpeechSynthesisUtterance(".");
        u.volume = 0.01;  // iOS는 완전 0이면 차단됨
        u.rate = 1;
        u.pitch = 1;
        u.onstart = () => console.log("[Voice] unlock utterance started");
        u.onend = () => console.log("[Voice] unlock utterance ended");
        u.onerror = (e) => console.warn("[Voice] unlock utterance error:", e.error);
        window.speechSynthesis.speak(u);
        unlocked = true;
        console.log("[Voice] audio unlock triggered (모바일 음성 활성화)");
      } catch (e) {
        console.warn("[Voice] unlock failed:", e);
      }
      document.removeEventListener("click", unlock, true);
      document.removeEventListener("touchstart", unlock, true);
      document.removeEventListener("touchend", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
    document.addEventListener("click", unlock, true);
    document.addEventListener("touchstart", unlock, true);
    document.addEventListener("touchend", unlock, true);
    document.addEventListener("keydown", unlock, true);
    return () => {
      document.removeEventListener("click", unlock, true);
      document.removeEventListener("touchstart", unlock, true);
      document.removeEventListener("touchend", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
  }, []);

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.warn("[Speech] SpeechRecognition API 미지원 브라우저입니다 (네이버 웨일/Firefox/Brave 등)");
      return;
    }

    // HTTPS 환경 체크 (localhost는 예외)
    const isSecure = window.isSecureContext ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!isSecure) {
      console.warn("[Speech] HTTPS 환경이 아니므로 음성 인식이 차단됩니다. Vercel 등 HTTPS 호스팅에서 사용하세요");
    }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      // ⭐ Android Chrome 하이브리드 방어:
      // Chrome은 각 final이 "이전 final을 포함한 누적 텍스트"로 옴
      //   예: final1="I", final2="I love", final3="I love you"
      // 단순 합치면 "I I love I love you" 중복. 해결:
      //   새 final이 이전 final을 포함하면 덮어쓰고, 아니면 추가
      const finalParts = [];
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (!text) continue;
          if (finalParts.length > 0) {
            const last = finalParts[finalParts.length - 1].toLowerCase();
            const curr = text.toLowerCase();
            // 새 텍스트가 이전 것을 포함 → 덮어쓰기
            if (curr.includes(last) || last.includes(curr)) {
              finalParts[finalParts.length - 1] = curr.length >= last.length ? text : finalParts[finalParts.length - 1];
            } else {
              finalParts.push(text);
            }
          } else {
            finalParts.push(text);
          }
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      const finalTranscript = finalParts.join(" ");
      const combined = (finalTranscript + " " + interimTranscript).replace(/\s+/g, " ").trim();
      transcriptRef.current = combined;
      setInput(combined);

      clearSilenceTimer();
      if (handsFreeActiveRef.current && combined.length >= 2) {
        silenceTimerRef.current = setTimeout(() => {
          try { recognition.stop(); } catch {}
        }, silenceThresholdRef.current);
      }
    };

    recognition.onstart = () => {
      console.log("[Speech] 🎤 음성 인식 시작");
    };

    recognition.onend = () => {
      console.log("[Speech] ⏹ 음성 인식 종료");
      clearSilenceTimer();
      setIsListening(false);
      if (!handsFreeActiveRef.current) return;
      if (isSpeakingRef.current) return;
      if (isLoadingRef.current) return;

      const text = transcriptRef.current.trim();
      if (text.length >= 2) {
        transcriptRef.current = "";
        finalTranscriptRef.current = "";
        if (handleSendRef.current) handleSendRef.current(text);
        return;
      }
      transcriptRef.current = "";
      finalTranscriptRef.current = "";
      setInput("");
      setTimeout(() => {
        if (handsFreeActiveRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
          try {
            recognition.continuous = false; // 항상 false: Android Chrome 중복 방지
            recognition.start();
            setIsListening(true);
          } catch {}
        }
      }, 200);
    };

    recognition.onerror = (event) => {
      console.error("[Speech] ❌ 에러:", event.error, event);
      clearSilenceTimer();
      setIsListening(false);

      // 에러 종류별 친절한 한국어 메시지
      const errorMessages = {
        "not-allowed": "🎤 마이크 권한이 거부되었습니다. 브라우저 주소창 좌측의 자물쇠/마이크 아이콘을 클릭하여 마이크를 '허용'해 주세요. 그 후 페이지를 새로고침하세요.",
        "service-not-allowed": "🎤 마이크 사용이 차단되었습니다. 브라우저 사이트 설정에서 마이크를 허용해 주세요.",
        "audio-capture": "🎤 마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지, 다른 앱이 점유하고 있지 않은지 확인해 주세요.",
        "network": "🌐 인터넷 연결을 확인해 주세요. (음성 인식은 온라인 서비스를 사용합니다)",
        "language-not-supported": "이 브라우저에서 영어 음성 인식이 지원되지 않습니다. Chrome을 사용해 주세요.",
        "no-speech": null, // 음성 미감지 - 자동 재시작이라 메시지 불필요
        "aborted": null,   // 사용자가 의도적 중단
      };

      const msg = errorMessages[event.error];
      if (msg) setError(msg);
      else if (event.error && !["no-speech", "aborted"].includes(event.error)) {
        setError(`음성 인식 오류: ${event.error}`);
      }

      // no-speech인 경우 핸즈프리에서 자동 재시작
      if (event.error === "no-speech" && handsFreeActiveRef.current) {
        setTimeout(() => {
          if (handsFreeActiveRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
            try {
              recognition.continuous = false; // 항상 false: Android Chrome 중복 방지
              recognition.start();
              setIsListening(true);
            } catch {}
          }
        }, 200);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  // 마이크 권한 명시적 사전 요청 (모바일에서 권한 흐름이 명확해짐)
  const requestMicrophonePermission = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("이 브라우저는 마이크 접근을 지원하지 않습니다. Chrome 또는 Edge를 사용해 주세요.");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 권한만 받고 즉시 stream 종료
      stream.getTracks().forEach(track => track.stop());
      console.log("[Mic] ✅ 마이크 권한 OK");
      return true;
    } catch (e) {
      console.error("[Mic] ❌ 권한 요청 실패:", e.name, e.message);
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError("🎤 마이크 권한이 거부되었습니다. 브라우저 주소창 좌측의 자물쇠 아이콘을 클릭하여 마이크를 '허용'해 주세요.");
      } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
        setError("🎤 마이크 장치를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해 주세요.");
      } else if (e.name === "NotReadableError") {
        setError("🎤 마이크가 다른 앱에 의해 사용 중입니다. 다른 앱을 종료한 후 다시 시도해 주세요.");
      } else {
        setError(`🎤 마이크 오류: ${e.message}`);
      }
      return false;
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const character = CHARACTERS[characterId] || CHARACTERS[DEFAULT_CHARACTER_ID];

  // ========== CORE FUNCTIONS ==========
  const buildSystemPrompt = useCallback(() => {
    const char = CHARACTERS[characterId] || CHARACTERS[DEFAULT_CHARACTER_ID];

    // Build user profile section if info is available
    const profileLines = [];
    if (userProfile?.name) profileLines.push(`- The user's name/preferred address: ${userProfile.name} (call them by this name naturally in conversation — not in every single message, but often enough to feel personal)`);
    if (userProfile?.gender) profileLines.push(`- Gender: ${userProfile.gender}`);
    if (userProfile?.age) profileLines.push(`- Age: ${userProfile.age} (adjust conversational tone and topics to suit this age group)`);
    const profileSection = profileLines.length > 0 ? `\nUSER PROFILE:\n${profileLines.join("\n")}\n` : "";

    return `You are ${char.name}, ${char.profile}, having an English conversation with a Korean learner.

CHARACTER:
- Name: ${char.name}
- Background: ${char.profile}
- Personality: ${char.personality}
${profileSection}
LEVEL: CEFR ${level} (${LEVELS[level].label} / ${LEVELS[level].gradeLabel})
LEVEL GUIDANCE: ${LEVELS[level].guidance}

SCENARIO: ${SCENARIOS[scenario].name}
SCENARIO CONTEXT: ${SCENARIOS[scenario].prompt}
- Play this scenario role ${SCENARIOS[scenario].roleHint} while keeping your character's personality, vocabulary style, and accent flavor (e.g., British uses 'lovely', Aussie uses 'mate', Latina uses occasional Spanish).

${CORRECTION_MODES[correctionMode].systemGuidance}

YOUR ROLE:
- Stay fully in character as ${char.name}
- Use vocabulary and phrases that match your character's background
- Strictly follow the level guidance for the Korean learner
- Keep responses concise (2-4 sentences)
- Ask follow-up questions to keep conversation flowing
- Be encouraging and patient

OUTPUT FORMAT (STRICT JSON, no markdown):
{
  "english": "Your English response in character",
  "korean": "한국어 번역",
  "correction": "Inline correction OR null",
  "correction_note": "한국어 교정 설명 OR null",
  "minor_issues": [
    {"original": "user's error snippet", "corrected": "correct form", "note": "한국어 짧은 설명"}
  ]
}

If no corrections: "correction": null, "correction_note": null, "minor_issues": [].`;
  }, [level, scenario, characterId, correctionMode, userProfile]);

  const callClaude = async (userMessage, history) => {
    if (!apiKeyRef.current) throw new Error("API 키가 설정되지 않았습니다");
    const apiMessages = history.map(m => ({
      role: m.role,
      content: m.role === "user" ? m.content : m.rawJson || m.content,
    }));
    apiMessages.push({ role: "user", content: userMessage });

    const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKeyRef.current,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 1200,
        system: buildSystemPrompt(), messages: apiMessages,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const text = data.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    try {
      return { parsed: JSON.parse(clean), raw: clean };
    } catch {
      return {
        parsed: { english: text, korean: null, correction: null, correction_note: null, minor_issues: [] },
        raw: text,
      };
    }
  };

  // ========== 학습 로그 (날짜별 스케줄표) ==========
  const STUDY_LOG_KEY = "english-talk-study-log";

  const getTodayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const recordStudyActivity = ({ messageSent = false, sessionEnd = false, vocabAdded = false } = {}) => {
    try {
      const today = getTodayKey();
      const now = Date.now();
      const raw = localStorage.getItem(STUDY_LOG_KEY);
      const log = raw ? JSON.parse(raw) : {};
      if (!log[today]) {
        log[today] = { messages: 0, sessions: 0, vocab: 0, activeMs: 0, firstSeen: now, lastActivity: now };
      }
      // 활동 시간 누적: 이전 활동으로부터 5분 이내면 시간 차이를 더함
      const FIVE_MIN = 5 * 60 * 1000;
      const prevActivity = log[today].lastActivity || log[today].firstSeen || now;
      const gap = now - prevActivity;
      if (gap > 0 && gap < FIVE_MIN) {
        log[today].activeMs = (log[today].activeMs || 0) + gap;
      }
      if (messageSent) log[today].messages += 1;
      if (sessionEnd) log[today].sessions += 1;
      if (vocabAdded) log[today].vocab += 1;
      log[today].lastActivity = now;
      log[today].lastSeen = now;
      // 최근 365일만 유지
      const cutoff = now - 365 * 24 * 60 * 60 * 1000;
      Object.keys(log).forEach(k => {
        if ((log[k].lastSeen || 0) < cutoff) delete log[k];
      });
      localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(log));
    } catch (e) {
      console.warn("[StudyLog] 기록 실패:", e);
    }
  };

  // 대화 종료 명령어 목록 (한/영)
  const END_CONVERSATION_PHRASES = [
    // 한국어
    "대화 끝내기", "대화끝내기", "대화 종료", "대화종료",
    "대화 그만", "대화 멈춰", "이제 그만", "그만할래",
    // 영어
    "end conversation", "end the conversation",
    "stop conversation", "stop the conversation",
    "finish conversation", "finish the conversation",
    "end chat", "stop chat", "finish chat",
    "let's end", "let's stop", "let's finish",
  ];

  const isEndCommand = (text) => {
    if (!text) return false;
    const normalized = text.trim().toLowerCase().replace(/[.,!?。]/g, "");
    return END_CONVERSATION_PHRASES.some(p => normalized === p.toLowerCase());
  };

  const endConversation = () => {
    stopSpeaking();
    endHandsFreeSession();
    setIsListening(false);
    // 시스템 메시지로 종료 안내 표시
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "Great conversation! Talk to you next time! 👋",
      korean: "좋은 대화였어요! 다음에 또 만나요! 👋",
      correction: null, correctionNote: null, characterId,
      isSystemEnd: true,
    }]);
    // 학습 로그 기록 (대화 종료 시점)
    recordStudyActivity({ sessionEnd: true });
  };

  const handleSend = async (textOverride) => {
    const trimmed = (textOverride ?? input).trim();
    if (!trimmed || isLoading) return;

    // ⭐ 종료 명령어 감지
    if (isEndCommand(trimmed)) {
      setInput("");
      transcriptRef.current = "";
      finalTranscriptRef.current = "";
      endConversation();
      return;
    }

    clearSilenceTimer();
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch {}
    }

    setError("");
    const userMsg = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    transcriptRef.current = "";
    finalTranscriptRef.current = "";
    setIsLoading(true);
    isLoadingRef.current = true;

    // 학습 로그 기록 (메시지 전송 시점)
    recordStudyActivity({ messageSent: true });

    try {
      const { parsed, raw } = await callClaude(trimmed, messages);
      const assistantMsg = {
        role: "assistant", content: parsed.english, korean: parsed.korean,
        correction: parsed.correction, correctionNote: parsed.correction_note,
        rawJson: raw, characterId: characterIdRef.current,
      };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      if (parsed.minor_issues && Array.isArray(parsed.minor_issues) && parsed.minor_issues.length > 0) {
        const newErrors = parsed.minor_issues
          .filter(e => e && e.original && e.corrected)
          .map(e => ({
            original: e.original, corrected: e.corrected, note: e.note || "",
            turnIdx: newMessages.length, timestamp: Date.now(),
          }));
        if (newErrors.length > 0) setAccumulatedErrors(prev => [...prev, ...newErrors]);
      }

      if (autoSpeakRef.current && parsed.english) {
        setTimeout(() => speak(parsed.english, finalMessages.length - 1), 200);
      } else if (handsFreeActiveRef.current) {
        setTimeout(() => {
          if (handsFreeActiveRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.continuous = false; // 항상 false
              recognitionRef.current.start();
              setIsListening(true);
            } catch {}
          }
        }, 300);
      }
    } catch (e) {
      console.error("[handleSend error]", e);
      setError(formatApiError(e));
      if (handsFreeActiveRef.current) {
        setTimeout(() => {
          if (handsFreeActiveRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.continuous = false; // 항상 false
              recognitionRef.current.start();
              setIsListening(true);
            } catch {}
          }
        }, 500);
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  handleSendRef.current = handleSend;

  const handleStart = async () => {
    stopSpeaking();
    endHandsFreeSession();
    // ⭐ 모든 모달/패널 자동 닫기 → 대화 화면으로 즉시 전환
    setShowSettings(false);
    setShowCharacterPicker(false);
    setShowStudyLog(false);
    setShowVocabPanel(false);
    setShowReport(false);
    setVocabModal(null);
    setMessages([]);
    setAccumulatedErrors([]);
    setReportData(null);
    setError("");
    setIsLoading(true);
    isLoadingRef.current = true;

    // ⭐ 페이지 최상단으로 스크롤 (모바일에서 설정 패널이 길 때 대비)
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const char = CHARACTERS[characterId] || CHARACTERS[DEFAULT_CHARACTER_ID];
      const starter = `Please introduce yourself briefly as ${char.name} and start the conversation with a friendly greeting and one easy question. Stay fully in character with your unique personality and speaking style. Invent a unique opening — don't be generic.`;
      const { parsed, raw } = await callClaude(starter, []);
      const firstMsg = {
        role: "assistant", content: parsed.english, korean: parsed.korean,
        correction: null, correctionNote: null, rawJson: raw, characterId,
      };
      setMessages([firstMsg]);
      if (autoSpeak && parsed.english) setTimeout(() => speak(parsed.english, 0), 200);
      // ⭐ 첫 메시지 렌더링 후 대화 영역으로 자동 스크롤
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 500);
    } catch (e) {
      console.error(e);
      setError("시작하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleReset = () => {
    stopSpeaking();
    endHandsFreeSession();
    setMessages([]);
    setAccumulatedErrors([]);
    setReportData(null);
    setInput("");
    setError("");
  };

  const handleScenarioChange = (newScenario) => {
    setScenario(newScenario);
    stopSpeaking();
    endHandsFreeSession();
    setMessages([]);
    setAccumulatedErrors([]);
    setReportData(null);
    setInput("");
    setError("");
  };

  const handleCharacterChange = (newCharacterId) => {
    if (!CHARACTERS[newCharacterId]) return;
    setCharacterId(newCharacterId);
    characterIdRef.current = newCharacterId;
    stopSpeaking();
    endHandsFreeSession();
    setMessages([]);
    setAccumulatedErrors([]);
    setReportData(null);
    setInput("");
    setError("");
    setShowCharacterPicker(false);
  };

  // ========== REPORT ==========
  const handleShowReport = async () => {
    setShowReport(true);
    if (reportData) return;
    setIsGeneratingReport(true);
    try {
      const report = await generateConversationReport({
        messages, errors: accumulatedErrors,
        levelCode: level, scenarioName: SCENARIOS[scenario].name,
        characterName: character.name,
        apiKey: apiKeyRef.current,
      });
      setReportData(report);
    } catch (e) {
      console.error(e);
      setReportData({
        summary: "리포트 생성 중 오류가 발생했습니다.",
        strengths: [], error_patterns: [], focus_points: [], encouragement: "",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSaveErrorsToVocab = () => {
    const newItems = accumulatedErrors.map(e => ({
      id: Date.now() + Math.random(),
      english: e.corrected, korean: e.note || "",
      scenario: SCENARIOS[scenario].name, createdAt: new Date().toISOString(),
    }));
    setVocabulary([...newItems, ...vocabulary]);
  };

  // ========== VOICE ==========
  const buildUtterance = (text, profile) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = profile.lang;
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;

    const voice = selectBestVoice(profile, availableVoicesRef.current);
    if (voice) utterance.voice = voice;
    return utterance;
  };

  const speak = (text, idx = null) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!text || !text.trim()) {
      console.warn("[Voice] speak() 호출됐지만 텍스트가 비어있음");
      return;
    }

    const char = CHARACTERS[characterIdRef.current] || CHARACTERS[DEFAULT_CHARACTER_ID];
    const utterance = buildUtterance(text, char.voiceProfile);

    utterance.onstart = () => {
      console.log(`[Voice] ▶ 재생 시작: "${text.slice(0, 40)}..."`);
      clearSilenceTimer();
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setSpeakingIdx(idx);
      if (recognitionRef.current && isListening) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
    utterance.onend = () => {
      console.log(`[Voice] ⏹ 재생 종료`);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setSpeakingIdx(null);
      if (handsFreeActiveRef.current) {
        setTimeout(() => {
          if (handsFreeActiveRef.current && !isSpeakingRef.current && !isLoadingRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.continuous = false; // 항상 false
              recognitionRef.current.start();
              setIsListening(true);
            } catch {}
          }
        }, 300);
      }
    };
    utterance.onerror = (e) => {
      console.error(`[Voice] ❌ 재생 에러:`, e.error || e);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setSpeakingIdx(null);
    };

    // 모바일(특히 iOS) 호환성: cancel 직후 speak 호출 시 무시되는 버그 우회
    // 1) cancel 후 50ms 지연 2) paused 상태일 가능성 대비 resume
    try {
      window.speechSynthesis.cancel();
    } catch {}
    setTimeout(() => {
      try {
        window.speechSynthesis.resume(); // iOS 안전장치
        window.speechSynthesis.speak(utterance);
        console.log(`[Voice] speak() 호출됨 (queue length: ${window.speechSynthesis.pending ? '대기중' : '비어있음'})`);
      } catch (e) {
        console.error("[Voice] speak() 호출 실패:", e);
      }
    }, 50);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setSpeakingIdx(null);
  };

  // Test voice for character picker (independent of main speak state)
  const testCharacterVoice = (charId) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const char = CHARACTERS[charId];
    if (!char) return;
    const sampleTexts = {
      emma: "Hi there! I'm Emma. So nice to meet you!",
      james: "Good day! James here. Lovely to make your acquaintance.",
      sofia: "¡Hola! I'm Sofia. So happy to chat with you, amiga!",
      marcus: "Yo, what's up? I'm Marcus. Good to meet you, for real.",
      olivia: "OMG hi! I'm Olivia, literally so excited to talk!",
      grace: "Oh, hello dear! I'm Grace. How lovely to meet you.",
      liam: "G'day mate! Liam here. How ya going?",
      aisha: "Hello! I am Aisha. It is my pleasure to meet you.",
      david: "Good afternoon. David speaking. Pleased to make your acquaintance.",
    };
    const text = sampleTexts[charId] || `Hi, I'm ${char.name}.`;
    const utterance = buildUtterance(text, char.voiceProfile);
    window.speechSynthesis.speak(utterance);
  };

  const startHandsFreeSession = async () => {
    if (!recognitionRef.current) {
      setError("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해 주세요.");
      return;
    }
    // 모바일에서 마이크 권한을 명시적으로 미리 받음 (한 번만 받으면 이후 자동 허용)
    const ok = await requestMicrophonePermission();
    if (!ok) return;

    setHandsFreeActive(true);
    handsFreeActiveRef.current = true;
    transcriptRef.current = "";
    finalTranscriptRef.current = "";
    setInput("");
    try {
      recognitionRef.current.continuous = false; // 항상 false: Android Chrome 중복 방지
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error("[Speech] start 실패:", e);
      setError(`음성 인식 시작 실패: ${e.message}`);
    }
  };

  const endHandsFreeSession = () => {
    handsFreeActiveRef.current = false;
    setHandsFreeActive(false);
    clearSilenceTimer();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  };

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      setError("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해 주세요.");
      return;
    }
    if (handsFreeMode) {
      if (handsFreeActive) endHandsFreeSession();
      else startHandsFreeSession();
    } else {
      if (isListening) {
        try { recognitionRef.current.stop(); } catch {}
      } else {
        // 마이크 권한 사전 요청 (모바일 흐름 안정화)
        const ok = await requestMicrophonePermission();
        if (!ok) return;

        transcriptRef.current = "";

        finalTranscriptRef.current = "";
        setInput("");
        try {
          recognitionRef.current.continuous = false;
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error("[Speech] start 실패:", e);
          setError(`음성 인식 시작 실패: ${e.message}`);
        }
      }
    }
  };

  // ========== VOCAB ==========
  const openVocabModal = (english, korean = "") => setVocabModal({ english: english || "", korean: korean || "" });
  const saveVocab = (item) => {
    const newItem = {
      id: Date.now(), english: item.english.trim(), korean: item.korean.trim(),
      scenario: SCENARIOS[scenario].name, createdAt: new Date().toISOString(),
    };
    setVocabulary([newItem, ...vocabulary]);
    setVocabModal(null);
    recordStudyActivity({ vocabAdded: true });
  };
  const deleteVocab = (id) => setVocabulary(vocabulary.filter(v => v.id !== id));

  // ========== LEVEL TEST ==========
  const handleLevelTestComplete = (result) => {
    if (result?.level && LEVELS[result.level]) {
      setLevel(result.level);
      setTestResult(result);
    }
    setHasCompletedLevelTest(true);
    setShowLevelTest(false);
    // After test, if profile not set, show profile setup
    if (!hasCompletedProfile) {
      setTimeout(() => setShowProfileSetup(true), 300);
    }
  };
  const handleLevelTestSkip = () => {
    setHasCompletedLevelTest(true);
    setShowLevelTest(false);
    if (!hasCompletedProfile) {
      setTimeout(() => setShowProfileSetup(true), 300);
    }
  };
  const handleRetakeLevelTest = () => {
    setShowSettings(false);
    stopSpeaking();
    endHandsFreeSession();
    setShowLevelTest(true);
  };

  // ========== USER PROFILE ==========
  const handleProfileComplete = (profile) => {
    setUserProfile(profile);
    setHasCompletedProfile(true);
    setShowProfileSetup(false);
  };
  const handleProfileSkip = () => {
    setHasCompletedProfile(true);
    setShowProfileSetup(false);
  };
  const handleEditProfile = () => {
    setShowSettings(false);
    stopSpeaking();
    endHandsFreeSession();
    setShowProfileSetup(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getHandsFreeStatus = () => {
    if (!handsFreeActive) return null;
    if (isLoading) return { icon: "⏳", text: "응답 생성 중...", color: "bg-stone-100 text-stone-600" };
    if (isSpeaking) return { icon: "🔊", text: `${character.name} 말하는 중 (마이크 일시정지)`, color: "bg-blue-50 text-blue-700" };
    if (isListening) {
      const sec = (silenceThreshold / 1000).toFixed(silenceThreshold % 1000 === 0 ? 0 : 1);
      return { icon: "🎙", text: `듣고 있습니다... (${sec}초 침묵 시 자동 전송)`, color: "bg-emerald-50 text-emerald-700" };
    }
    return { icon: "⏸", text: "대기 중...", color: "bg-stone-100 text-stone-600" };
  };
  const handsFreeStatus = getHandsFreeStatus();
  const currentLevel = LEVELS[level];
  const currentMode = CORRECTION_MODES[correctionMode];
  const userTurnCount = messages.filter(m => m.role === "user").length;
  const canShowReport = userTurnCount >= 2;

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col relative"
      style={{ fontFamily: "'Manrope', 'Pretendard', -apple-system, sans-serif" }}>

      <header className="border-b border-stone-200 bg-white/90 backdrop-blur sticky top-0 z-10">
        {/* ⭐ 상단 브랜드 그라데이션 악센트 라인 */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-emerald-500 via-teal-500 to-cyan-500"></div>

        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowCharacterPicker(true)}
              className="hover:scale-105 transition-transform relative"
              title={`${character.name} (탭하여 캐릭터 변경)`}
            >
              <Avatar character={character} size="sm" />
              {/* 아바타 우하단 작은 star 장식 */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-[8px] shadow-sm ring-1 ring-white">
                ✦
              </span>
            </button>
            <div className="min-w-0">
              {/* ⭐ STUDIO 99 브랜드 배지 (작은 상단 라벨) */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-stone-900 to-stone-700 text-white text-[8px] font-black tracking-[0.15em] rounded-sm uppercase">
                  <span className="text-amber-400">✦</span>STUDIO 99
                </span>
                <span className="text-[9px] font-semibold tracking-wider text-stone-400 uppercase hidden sm:inline">Presents</span>
              </div>
              {/* 메인 타이틀 */}
              <h1 className="text-lg font-bold text-stone-900 tracking-tight leading-none" style={{ fontFamily: "'Fraunces', serif" }}>
                English <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent italic">Talk</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-stone-500 flex-wrap">
                <button
                  onClick={() => setShowCharacterPicker(true)}
                  className="font-medium text-stone-700 hover:text-stone-900 transition-colors"
                >
                  {character.name}
                </button>
                <span className="text-stone-300">·</span>
                <span>{SCENARIOS[scenario].emoji} {SCENARIOS[scenario].name}</span>
                <span className="text-stone-300">·</span>
                <span title={currentLevel.gradeLabel}>{currentLevel.emoji} {currentLevel.code}</span>
                {handsFreeActive && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                      <Radio className="w-3 h-3" />핸즈프리
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* ⭐ 대화 시작 / 새 대화 버튼 (헤더 가장 좌측에 강조 배치) */}
            <button
              onClick={() => {
                if (messages.length > 0) {
                  if (!window.confirm("현재 대화를 초기화하고 새로 시작하시겠습니까?")) return;
                }
                handleStart();
              }}
              disabled={isLoading || !apiKey}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors text-sm font-medium ${
                messages.length === 0
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-stone-300"
                  : "hover:bg-stone-100 text-stone-700 disabled:text-stone-300"
              } disabled:cursor-not-allowed`}
              title={!apiKey ? "API 키를 먼저 입력해주세요" : (messages.length === 0 ? "대화 시작" : "새 대화 시작")}
            >
              <Play className="w-4 h-4" fill="currentColor" />
              <span className="hidden sm:inline">{messages.length === 0 ? "대화 시작" : "새 대화"}</span>
            </button>

            {/* ⭐ 대화 끝내기 버튼 (진행 중일 때만) */}
            {messages.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("대화를 종료하시겠습니까?")) endConversation();
                }}
                className="p-2 rounded-lg hover:bg-red-50 text-stone-600 hover:text-red-600 transition-colors"
                title="대화 끝내기 (또는 '대화 끝내기' / 'end conversation' 이라고 말하기)"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setShowCharacterPicker(true)}
              className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
              title="캐릭터 선택"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={handleShowReport}
              disabled={!canShowReport}
              className={`p-2 rounded-lg transition-colors relative ${
                canShowReport ? "hover:bg-stone-100 text-stone-600" : "text-stone-300 cursor-not-allowed"
              }`}
              title={canShowReport ? "대화 리포트" : "2턴 이상 대화 후 사용 가능"}
            >
              <BarChart3 className="w-4 h-4" />
              {accumulatedErrors.length > 0 && canShowReport && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                  {accumulatedErrors.length > 99 ? "99+" : accumulatedErrors.length}
                </span>
              )}
            </button>
            <button onClick={() => setShowVocabPanel(true)} className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors relative" title="단어장">
              <Bookmark className="w-4 h-4" />
              {vocabulary.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-emerald-600 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                  {vocabulary.length > 99 ? "99+" : vocabulary.length}
                </span>
              )}
            </button>
            {/* ⭐ 학습 기록 (캘린더) 버튼 */}
            <button
              onClick={() => setShowStudyLog(true)}
              className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
              title="학습 기록"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button onClick={handleReset} className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors" title="대화 초기화">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? "bg-stone-900 text-white" : "hover:bg-stone-100 text-stone-600"}`}
              title="설정">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="border-t border-stone-200 bg-stone-50">
            <div className="max-w-3xl mx-auto px-5 py-4 space-y-4">

              {/* Character section in settings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">대화 상대</label>
                  <button onClick={() => setShowCharacterPicker(true)} className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium">
                    <Users className="w-3 h-3" />전체 보기
                  </button>
                </div>
                <button
                  onClick={() => setShowCharacterPicker(true)}
                  className="w-full bg-white border border-stone-200 hover:border-stone-300 rounded-lg px-3 py-2.5 flex items-center gap-3 transition-colors text-left"
                >
                  <Avatar character={character} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-stone-900">{character.name}</div>
                    <div className="text-[11px] text-stone-500 truncate">{character.description}</div>
                  </div>
                  <div className="text-stone-400 text-xs">변경</div>
                </button>
              </div>

              {/* API Key section */}
              <div>
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 block">🔑 Anthropic API 키</label>
                <button
                  onClick={() => setShowApiKeySetup(true)}
                  className="w-full bg-white border border-stone-200 hover:border-stone-300 rounded-lg px-3 py-2.5 flex items-center gap-3 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center flex-shrink-0 text-lg">
                    🔑
                  </div>
                  <div className="flex-1 min-w-0">
                    {apiKey ? (
                      <>
                        <div className="font-semibold text-sm text-stone-900 truncate">
                          {apiKey.slice(0, 12)}...{apiKey.slice(-4)}
                        </div>
                        <div className="text-[11px] text-stone-500">설정됨 · 탭하여 변경</div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-sm text-red-600">키 미설정</div>
                        <div className="text-[11px] text-stone-500">AI 기능 사용을 위해 입력 필요</div>
                      </>
                    )}
                  </div>
                  <div className="text-stone-400 text-xs">변경</div>
                </button>
                {apiKey && (
                  <button
                    onClick={() => {
                      if (confirm("API 키를 삭제하시겠습니까? AI 기능을 다시 사용하려면 재입력이 필요합니다.")) {
                        clearApiKey();
                      }
                    }}
                    className="text-[11px] text-red-600 hover:text-red-700 mt-1.5"
                  >
                    키 삭제
                  </button>
                )}
              </div>

              {/* User profile section */}
              <div>
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 block">내 프로필 (AI가 부를 이름)</label>
                <button
                  onClick={handleEditProfile}
                  className="w-full bg-white border border-stone-200 hover:border-stone-300 rounded-lg px-3 py-2.5 flex items-center gap-3 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center flex-shrink-0 text-lg">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    {userProfile?.name ? (
                      <>
                        <div className="font-semibold text-sm text-stone-900 truncate">{userProfile.name}</div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {[userProfile.gender, userProfile.age ? `${userProfile.age}세` : null].filter(Boolean).join(" · ") || "정보 추가 가능"}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-sm text-stone-900">프로필 미설정</div>
                        <div className="text-[11px] text-stone-500">탭하여 이름·성별·나이 입력</div>
                      </>
                    )}
                  </div>
                  <div className="text-stone-400 text-xs">변경</div>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">레벨 (CEFR)</label>
                  <button onClick={handleRetakeLevelTest} className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium">
                    <RefreshCw className="w-3 h-3" />재테스트
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Object.entries(LEVELS).map(([key, val]) => (
                    <button key={key} onClick={() => setLevel(key)}
                      className={`px-2 py-2 rounded-lg text-center transition-all ${
                        level === key ? "bg-emerald-700 text-white shadow-sm" : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
                      }`}
                      title={val.gradeLabel}>
                      <div className="text-base mb-0.5">{val.emoji}</div>
                      <div className="font-semibold text-[11px]">{val.label}</div>
                      <div className={`text-[9px] ${level === key ? "text-emerald-100" : "text-stone-500"}`}>{val.code}</div>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                  현재: <strong>{currentLevel.emoji} {currentLevel.label}</strong> · {currentLevel.gradeLabel} · {currentLevel.description}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 block">교정 모드</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(CORRECTION_MODES).map(mode => (
                    <button key={mode.key} onClick={() => setCorrectionMode(mode.key)}
                      className={`px-3 py-2.5 rounded-lg text-center transition-all ${
                        correctionMode === mode.key ? "bg-stone-900 text-white shadow-sm" : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
                      }`}>
                      <div className="text-base mb-0.5">{mode.emoji}</div>
                      <div className="font-semibold text-[11px]">{mode.label}</div>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                  <strong>{currentMode.emoji} {currentMode.label}</strong>: {currentMode.description}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 block">시나리오 (변경 시 대화 초기화)</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {Object.entries(SCENARIOS).map(([key, val]) => (
                    <button key={key} onClick={() => handleScenarioChange(key)}
                      className={`px-2 py-2 rounded-lg text-xs transition-all ${
                        scenario === key ? "bg-stone-900 text-white shadow-sm" : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
                      }`}>
                      <div className="text-base mb-0.5">{val.emoji}</div>
                      <div className="font-medium">{val.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 block">대화 모드</label>
                <div className="grid grid-cols-2 gap-2">
                  <ToggleButton icon={<Headphones className="w-3.5 h-3.5" />} label="핸즈프리 모드" on={handsFreeMode}
                    onClick={() => { if (handsFreeMode && handsFreeActive) endHandsFreeSession(); setHandsFreeMode(!handsFreeMode); }} />
                  <ToggleButton icon={<Volume2 className="w-3.5 h-3.5" />} label="자동 발음" on={autoSpeak} onClick={() => setAutoSpeak(!autoSpeak)} />
                </div>
                {handsFreeMode && (
                  <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                    💡 <strong>이어폰 사용 권장</strong>: AI 음성이 스피커로 나오면 마이크가 다시 듣게 되어 오작동할 수 있습니다.
                  </p>
                )}
              </div>

              {handsFreeMode && (
                <div>
                  <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />말하는 중 침묵 대기 시간
                  </label>
                  <p className="text-[11px] text-stone-500 mb-2.5 leading-relaxed">
                    문장 말하는 중 잠시 멈춰도 기다려주는 시간입니다. 초급자는 길게, 고급자는 짧게 권장.
                  </p>

                  {/* ⭐ 레벨 자동 조정 토글 */}
                  <div className={`mb-3 p-2.5 rounded-lg border ${silenceAutoByLevel ? "bg-emerald-50 border-emerald-200" : "bg-stone-50 border-stone-200"}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex-1 pr-3">
                        <div className="text-xs font-semibold text-stone-900">🎯 내 레벨에 맞춰 자동 조정</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          현재 레벨 {LEVELS[level].code} ({LEVELS[level].label}) · 권장 {(LEVEL_SILENCE_DEFAULTS[level] / 1000).toFixed(LEVEL_SILENCE_DEFAULTS[level] % 1000 === 0 ? 0 : 1)}초
                        </div>
                      </div>
                      <input type="checkbox" checked={silenceAutoByLevel}
                        onChange={(e) => {
                          setSilenceAutoByLevel(e.target.checked);
                          if (e.target.checked && LEVEL_SILENCE_DEFAULTS[level]) {
                            setSilenceThreshold(LEVEL_SILENCE_DEFAULTS[level]);
                          }
                        }}
                        className="w-4 h-4 accent-emerald-600" />
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {SILENCE_PRESETS.map(preset => (
                      <button key={preset.value}
                        onClick={() => {
                          setSilenceThreshold(preset.value);
                          setSilenceAutoByLevel(false); // 수동 선택 시 자동 조정 해제
                        }}
                        className={`px-3 py-2.5 rounded-lg text-center transition-all ${
                          silenceThreshold === preset.value ? "bg-emerald-700 text-white shadow-sm" : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
                        }`}>
                        <div className="font-semibold text-xs">{preset.label}</div>
                        <div className={`text-[10px] mt-0.5 ${silenceThreshold === preset.value ? "text-emerald-100" : "text-stone-500"}`}>{preset.sub}</div>
                        <div className={`text-[9px] mt-0.5 ${silenceThreshold === preset.value ? "text-emerald-100" : "text-stone-400"}`}>{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <ToggleButton icon={<Languages className="w-3.5 h-3.5" />} label="한글 번역" on={showTranslation} onClick={() => setShowTranslation(!showTranslation)} />
                <ToggleButton icon={<BookOpen className="w-3.5 h-3.5" />} label="문법 교정" on={showCorrection} onClick={() => setShowCorrection(!showCorrection)} />
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Avatar character={character} size="xl" className="mb-4 shadow-md" />
              <h2 className="text-2xl font-semibold text-stone-900 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                {character.name}
              </h2>
              <p className="text-stone-500 text-sm mb-1">{character.description}</p>
              <p className="text-stone-400 text-xs mb-4 max-w-xs">{SCENARIOS[scenario].emoji} {SCENARIOS[scenario].description}</p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs">
                  <span>{currentLevel.emoji}</span>
                  <span className="font-semibold">{currentLevel.label} ({currentLevel.code})</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-700 rounded-full text-xs">
                  <span>{currentMode.emoji}</span>
                  <span className="font-semibold">{currentMode.label}</span>
                </div>
              </div>
              <button onClick={handleStart} className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors flex items-center gap-2">
                <Sparkles className="w-4 h-4" />{character.name}와 대화 시작
              </button>
              {handsFreeMode && (
                <p className="text-xs text-stone-400 mt-4 max-w-xs leading-relaxed">
                  대화 시작 후 🎙 마이크를 누르면 핸즈프리 모드로 대화할 수 있습니다.
                </p>
              )}
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} idx={idx} character={CHARACTERS[msg.characterId] || character}
                showTranslation={showTranslation} showCorrection={showCorrection}
                onSpeak={speak} onStopSpeak={stopSpeaking} speakingIdx={speakingIdx} isSpeaking={isSpeaking} onBookmark={openVocabModal} />
            ))}
            {isLoading && <LoadingBubble character={character} />}
          </div>
          <div ref={chatEndRef} />

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}
        </div>
      </main>

      {handsFreeStatus && (
        <div className={`${handsFreeStatus.color} border-t border-stone-200 px-5 py-2 text-sm flex items-center justify-center gap-2`}>
          <span className="text-base">{handsFreeStatus.icon}</span>
          <span className="font-medium">{handsFreeStatus.text}</span>
        </div>
      )}

      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-3xl mx-auto px-5 py-3">
          <div className="flex items-end gap-2">
            <button onClick={toggleListening} disabled={isLoading && !handsFreeActive}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                handsFreeActive ? "bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-200"
                  : isListening ? "bg-red-500 text-white animate-pulse" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              } disabled:opacity-50`}
              title={handsFreeActive ? "핸즈프리 세션 종료" : handsFreeMode ? "핸즈프리 대화 시작" : isListening ? "녹음 중지" : "음성 입력"}>
              {handsFreeActive ? <Headphones className="w-5 h-5" /> : isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <textarea ref={inputRef} value={input}
              onChange={(e) => { setInput(e.target.value); transcriptRef.current = e.target.value; }}
              onKeyDown={handleKeyDown}
              placeholder={handsFreeActive ? "🎙 말씀하세요 또는 여기에 타이핑..." : isListening ? "Listening..." : "Type in English... (Shift+Enter for new line)"}
              rows={1} disabled={isLoading}
              className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl resize-none focus:outline-none focus:border-stone-400 focus:bg-white transition-colors text-stone-900 placeholder-stone-400 disabled:opacity-50"
              style={{ minHeight: "48px", maxHeight: "200px" }} />
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-stone-400 mt-2 text-center">
            {handsFreeMode
              ? `🎧 핸즈프리 모드 · 침묵 ${(silenceThreshold / 1000).toFixed(silenceThreshold % 1000 === 0 ? 0 : 1)}초 뒤 자동 전송`
              : "🎙 마이크로 음성 입력 · Enter 전송 · Shift+Enter 줄바꿈"}
          </p>
        </div>
      </footer>

      {showCharacterPicker && (
        <CharacterPickerModal
          characters={CHARACTERS}
          currentId={characterId}
          onSelect={handleCharacterChange}
          onClose={() => setShowCharacterPicker(false)}
          onTestVoice={testCharacterVoice}
          availableVoices={availableVoices}
          conversationActive={messages.length > 0}
        />
      )}

      {showApiKeySetup && (
        <APIKeySetupModal
          initialKey={apiKey}
          onSave={saveApiKey}
          onClose={() => setShowApiKeySetup(false)}
          canClose={!!apiKey}
        />
      )}

      {showLevelTest && (
        <AdaptiveLevelTest onComplete={handleLevelTestComplete} onSkip={handleLevelTestSkip}
          speak={speak} stopSpeaking={stopSpeaking} recognitionRef={recognitionRef}
          guideCharacter={CHARACTERS[TEST_GUIDE_ID]} apiKey={apiKey} />
      )}

      {showProfileSetup && (
        <ProfileSetupScreen
          initial={userProfile}
          onComplete={handleProfileComplete}
          onSkip={handleProfileSkip}
          guideCharacter={CHARACTERS[TEST_GUIDE_ID]}
        />
      )}

      {showVocabPanel && (
        <VocabPanel vocabulary={vocabulary} onClose={() => setShowVocabPanel(false)} onDelete={deleteVocab} onSpeak={(text) => speak(text)} />
      )}

      {showStudyLog && (
        <StudyLogModal onClose={() => setShowStudyLog(false)} />
      )}

      {vocabModal && (
        <SaveVocabModal initial={vocabModal} onSave={saveVocab} onClose={() => setVocabModal(null)} />
      )}

      {showReport && (
        <ReportModal report={reportData} errors={accumulatedErrors} isLoading={isGeneratingReport}
          levelInfo={currentLevel} scenarioName={SCENARIOS[scenario].name}
          characterName={character.name} userTurnCount={userTurnCount}
          onClose={() => setShowReport(false)} onSaveAllToVocab={handleSaveErrorsToVocab}
          onSpeak={(text) => speak(text)} />
      )}
    </div>
  );
}

// ========== SUB-COMPONENTS ==========

function StudyLogModal({ onClose }) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [log, setLog] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("english-talk-study-log");
      setLog(raw ? JSON.parse(raw) : {});
    } catch {
      setLog({});
    }
  }, []);

  // OK 달성 기준: 공부 시간 20분 이상 OR 메시지 20회 이상
  const OK_MIN_MINUTES = 20;
  const OK_MIN_MESSAGES = 20;
  const isDayOK = (entry) => {
    if (!entry) return false;
    const minutes = (entry.activeMs || 0) / 60000;
    return minutes >= OK_MIN_MINUTES || (entry.messages || 0) >= OK_MIN_MESSAGES;
  };

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const totalDays = Object.values(log).filter(v => (v.messages || 0) > 0).length;
  const totalMessages = Object.values(log).reduce((s, v) => s + (v.messages || 0), 0);
  const okDays = Object.values(log).filter(isDayOK).length;

  // OK 달성 연속일 계산 (오늘 포함 or 어제부터)
  let okStreak = 0;
  const sd = new Date();
  const sdKey = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, "0")}-${String(sd.getDate()).padStart(2, "0")}`;
  if (!isDayOK(log[sdKey])) {
    sd.setDate(sd.getDate() - 1);
  }
  while (true) {
    const k = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, "0")}-${String(sd.getDate()).padStart(2, "0")}`;
    if (isDayOK(log[k])) {
      okStreak++;
      sd.setDate(sd.getDate() - 1);
    } else {
      break;
    }
  }

  const getColor = (entry) => {
    if (!entry || !entry.messages) return "bg-stone-100";
    if (isDayOK(entry)) return "bg-emerald-600"; // OK 달성: 진한 녹색
    const count = entry.messages || 0;
    if (count < 5) return "bg-emerald-200";
    if (count < 10) return "bg-emerald-300";
    return "bg-emerald-400"; // 공부했지만 OK 미달
  };

  const selectedEntry = log[todayKey];
  const selectedMinutes = Math.floor((selectedEntry?.activeMs || 0) / 60000);
  const selectedIsOK = isDayOK(selectedEntry);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />학습 기록
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OK 기준 안내 */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-xs text-emerald-800">
          <div className="font-semibold mb-1">🎯 OK 달성 기준</div>
          <div>• 공부 시간 <b>{OK_MIN_MINUTES}분 이상</b> 또는</div>
          <div>• 대화 메시지 <b>{OK_MIN_MESSAGES}회 이상</b></div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <div className="text-[10px] text-stone-500 mb-1">✓ OK 달성일</div>
            <div className="text-lg font-bold text-emerald-700">{okDays}일</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-[10px] text-stone-500 mb-1">연속 OK</div>
            <div className="text-lg font-bold text-amber-600 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />{okStreak}일
            </div>
          </div>
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <div className="text-[10px] text-stone-500 mb-1">총 학습일</div>
            <div className="text-lg font-bold text-stone-900">{totalDays}일</div>
          </div>
        </div>

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-3 px-2">
          <button onClick={() => { const m = new Date(viewMonth); m.setMonth(m.getMonth() - 1); setViewMonth(m); }}
            className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-600 text-lg">‹</button>
          <div className="font-semibold text-stone-900">{year}년 {month + 1}월</div>
          <button onClick={() => { const m = new Date(viewMonth); m.setMonth(m.getMonth() + 1); setViewMonth(m); }}
            className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-600 text-lg">›</button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-stone-400 font-medium mb-1">
          {["일", "월", "화", "수", "목", "금", "토"].map(d => <div key={d}>{d}</div>)}
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i}></div>;
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const entry = log[key];
            const isToday = key === todayKey;
            const ok = isDayOK(entry);
            const minutes = Math.floor((entry?.activeMs || 0) / 60000);
            return (
              <div
                key={i}
                className={`relative aspect-square rounded-md flex items-center justify-center text-xs ${getColor(entry)} ${isToday ? "ring-2 ring-amber-500 ring-offset-1" : ""} transition-all`}
                title={entry ? `${d}일: ${entry.messages}개 메시지, ${minutes}분 학습${ok ? " ✓ OK!" : ""}` : `${d}일`}
              >
                <span className={entry && entry.messages > 0 ? (ok ? "text-white font-bold" : "text-stone-900 font-semibold") : "text-stone-400"}>{d}</span>
                {ok && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-sm">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-2 mt-4 text-[10px] text-stone-500 justify-center flex-wrap">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-stone-100 rounded-sm"></div><span>미공부</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-200 rounded-sm"></div><span>소량</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-400 rounded-sm"></div><span>공부 중</span></div>
          <div className="flex items-center gap-1">
            <div className="relative w-3 h-3 bg-emerald-600 rounded-sm">
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full flex items-center justify-center text-[6px] text-white font-black">✓</span>
            </div>
            <span>OK 달성</span>
          </div>
        </div>

        {/* 오늘 상세 */}
        {selectedEntry && (
          <div className={`mt-5 pt-5 border-t border-stone-200 ${selectedIsOK ? "" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-stone-500">📅 오늘의 학습</div>
              {selectedIsOK && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                  ✓ OK 달성!
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">공부 시간</span>
              <span className={`font-semibold ${selectedMinutes >= OK_MIN_MINUTES ? "text-emerald-600" : ""}`}>
                {selectedMinutes}분 {selectedMinutes >= OK_MIN_MINUTES ? "✓" : `(${OK_MIN_MINUTES}분 목표)`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-stone-600">메시지</span>
              <span className={`font-semibold ${(selectedEntry.messages || 0) >= OK_MIN_MESSAGES ? "text-emerald-600" : ""}`}>
                {selectedEntry.messages || 0}개 {(selectedEntry.messages || 0) >= OK_MIN_MESSAGES ? "✓" : `(${OK_MIN_MESSAGES}개 목표)`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-stone-600">대화 세션</span>
              <span className="font-semibold">{selectedEntry.sessions || 0}회</span>
            </div>
            {selectedEntry.vocab > 0 && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-stone-600">저장한 단어</span>
                <span className="font-semibold">{selectedEntry.vocab}개</span>
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-stone-400 mt-4 text-center">
          하루 20분 또는 20회 메시지면 OK! 연속 달성이 끊기지 않게 꾸준히 💪
        </p>
      </div>
    </div>
  );
}

function ToggleButton({ icon, label, on, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-2 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all ${
        on ? "bg-stone-900 text-white" : "bg-white text-stone-700 border border-stone-200"
      }`}>
      {icon}<span className="font-medium">{label}</span>
    </button>
  );
}

// Avatar component: shows DiceBear illustrated avatar with emoji fallback
function Avatar({ character, size = "md", className = "" }) {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    xs: { wrapper: "w-8 h-8", emoji: "text-base" },
    sm: { wrapper: "w-10 h-10", emoji: "text-xl" },
    md: { wrapper: "w-12 h-12", emoji: "text-2xl" },
    lg: { wrapper: "w-16 h-16", emoji: "text-3xl" },
    xl: { wrapper: "w-24 h-24", emoji: "text-5xl" },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`${s.wrapper} rounded-full bg-gradient-to-br ${character.gradient} flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm ${className}`}
    >
      {character.avatarUrl && !imgError ? (
        <img
          src={character.avatarUrl}
          alt={character.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className={s.emoji}>{character.emoji}</span>
      )}
    </div>
  );
}

function MessageBubble({ message, idx, character, showTranslation, showCorrection, onSpeak, onStopSpeak, speakingIdx, isSpeaking, onBookmark }) {
  const isUser = message.role === "user";
  const isThisSpeaking = isSpeaking && speakingIdx === idx;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <div className="bg-stone-900 text-white px-4 py-3 rounded-2xl rounded-br-md">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2">
      <Avatar character={character} size="xs" className="mt-0.5" />
      <div className="max-w-[80%] space-y-2 w-full">
        <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
          <div className="text-[10px] text-stone-400 font-medium mb-1">{character.name}</div>
          <p className="text-[15px] leading-relaxed text-stone-900 whitespace-pre-wrap">{message.content}</p>
          {showTranslation && message.korean && (
            <p className="text-sm text-stone-500 mt-2 pt-2 border-t border-stone-100 leading-relaxed">{message.korean}</p>
          )}
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-stone-100">
            <button onClick={() => (isThisSpeaking ? onStopSpeak() : onSpeak(message.content, idx))}
              className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 transition-colors ${
                isThisSpeaking ? "bg-emerald-100 text-emerald-700" : "text-stone-500 hover:bg-stone-100"
              }`}>
              {isThisSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isThisSpeaking ? "중지" : "듣기"}</span>
            </button>
            <button onClick={() => onBookmark(message.content, message.korean)} className="px-2 py-1 rounded-md text-xs flex items-center gap-1 text-stone-500 hover:bg-stone-100 transition-colors">
              <BookmarkPlus className="w-3.5 h-3.5" /><span>저장</span>
            </button>
          </div>
        </div>

        {showCorrection && message.correction && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl rounded-bl-md">
            <div className="flex items-center gap-1.5 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">교정</span>
            </div>
            <p className="text-sm text-stone-800 leading-relaxed"><span className="font-medium">✓ </span>{message.correction}</p>
            {message.correctionNote && <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">{message.correctionNote}</p>}
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-amber-200">
              <button onClick={() => onSpeak(message.correction)} className="px-2 py-1 rounded-md text-xs flex items-center gap-1 text-amber-800 hover:bg-amber-100 transition-colors">
                <Volume2 className="w-3.5 h-3.5" /><span>듣기</span>
              </button>
              <button onClick={() => onBookmark(message.correction, message.correctionNote || "")} className="px-2 py-1 rounded-md text-xs flex items-center gap-1 text-amber-800 hover:bg-amber-100 transition-colors">
                <BookmarkPlus className="w-3.5 h-3.5" /><span>저장</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingBubble({ character }) {
  return (
    <div className="flex justify-start gap-2">
      <Avatar character={character} size="xs" className="mt-0.5" />
      <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// ========== CHARACTER PICKER ==========
function CharacterPickerModal({ characters, currentId, onSelect, onClose, onTestVoice, availableVoices, conversationActive }) {
  const [pendingId, setPendingId] = useState(null);

  const handleCardClick = (charId) => {
    if (conversationActive && charId !== currentId) {
      setPendingId(charId);
    } else {
      onSelect(charId);
    }
  };

  const handleConfirmChange = () => {
    if (pendingId) onSelect(pendingId);
    setPendingId(null);
  };

  const voiceCount = availableVoices ? availableVoices.length : 0;
  const langs = availableVoices ? [...new Set(availableVoices.filter(v => v.lang.startsWith("en")).map(v => v.lang))] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-stone-900" />
            <h2 className="text-lg font-semibold text-stone-900" style={{ fontFamily: "'Fraunces', serif" }}>
              대화 상대 선택
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4 text-xs text-blue-800">
            💡 각 캐릭터마다 성격과 음성 스타일이 다릅니다. <strong>음성 테스트</strong>로 미리 들어보세요.
            {voiceCount === 0 && <div className="mt-1 text-amber-700">⚠ 브라우저 음성을 불러오는 중...</div>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(characters).map(char => {
              const isSelected = char.id === currentId;
              return (
                <div
                  key={char.id}
                  className={`border-2 rounded-xl p-3 transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <button
                    onClick={() => handleCardClick(char.id)}
                    className="w-full flex items-start gap-3 text-left"
                  >
                    <Avatar character={char} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-stone-900 text-sm">{char.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{char.description}</div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        🎙 {char.voiceProfile.lang} · {char.voiceProfile.gender === "female" ? "여성" : "남성"}
                      </div>
                    </div>
                  </button>
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTestVoice(char.id);
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    >
                      <Play className="w-3 h-3" />음성 테스트
                    </button>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-700 font-medium">선택됨</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-lg">
            <div className="text-[11px] text-stone-600 leading-relaxed">
              <strong>⚠ 음성 안내</strong>: 캐릭터별 음성은 브라우저에 설치된 음성 엔진에 따라 달라집니다.
              현재 사용 가능한 영어 음성: <strong>{langs.length}개 언어 변형</strong> ({langs.join(", ") || "로딩 중"})
              <br />
              일부 캐릭터(특히 인도/호주)는 브라우저에 해당 음성이 없으면 미국 영어로 대체 재생됩니다.
              <br />
              가장 다양한 음성을 위해 <strong>Chrome 데스크톱</strong> 사용을 권장합니다.
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm bg-stone-900 text-white hover:bg-stone-800 transition-colors font-medium">
            완료
          </button>
        </div>

        {/* Confirm change dialog (when conversation is active) */}
        {pendingId && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm p-5">
              <h3 className="font-semibold text-stone-900 mb-2">대화 상대를 변경하시겠어요?</h3>
              <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                <strong>{characters[pendingId].name}</strong>으로 변경하면 현재 진행 중인 대화가 초기화됩니다.
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setPendingId(null)} className="px-4 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-100">
                  취소
                </button>
                <button onClick={handleConfirmChange} className="px-4 py-2 rounded-lg text-sm bg-stone-900 text-white hover:bg-stone-800">
                  변경하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== REPORT MODAL ==========
function ReportModal({ report, errors, isLoading, levelInfo, scenarioName, characterName, userTurnCount, onClose, onSaveAllToVocab, onSpeak }) {
  const [savedToVocab, setSavedToVocab] = useState(false);

  const handleSaveAll = () => {
    onSaveAllToVocab();
    setSavedToVocab(true);
    setTimeout(() => setSavedToVocab(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-stone-900" />
            <h2 className="text-lg font-semibold text-stone-900" style={{ fontFamily: "'Fraunces', serif" }}>대화 리포트</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">{levelInfo.emoji} {levelInfo.label} ({levelInfo.code})</span>
            <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">👤 {characterName}</span>
            <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">💬 {scenarioName}</span>
            <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">🔄 {userTurnCount}턴</span>
            <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">📝 교정 {errors.length}개</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex gap-1.5 mb-3">
                <span className="w-2.5 h-2.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2.5 h-2.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2.5 h-2.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-sm text-stone-500">대화를 분석하고 있습니다...</p>
            </div>
          ) : report ? (
            <>
              {report.summary && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-sm text-stone-800 leading-relaxed">{report.summary}</p>
                </div>
              )}
              {report.strengths && report.strengths.length > 0 && (
                <div className="bg-white border border-stone-200 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />잘한 점
                  </h3>
                  <ul className="space-y-2">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-stone-700 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-600 flex-shrink-0 mt-0.5">•</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.error_patterns && report.error_patterns.length > 0 && (
                <div className="bg-white border border-stone-200 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />오류 패턴
                  </h3>
                  <ul className="space-y-2">
                    {report.error_patterns.map((s, i) => (
                      <li key={i} className="text-sm text-stone-700 flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-600 flex-shrink-0 mt-0.5">•</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.focus_points && report.focus_points.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />다음 대화에서 집중할 포인트
                  </h3>
                  <ul className="space-y-2">
                    {report.focus_points.map((s, i) => (
                      <li key={i} className="text-sm text-stone-700 flex items-start gap-2 leading-relaxed">
                        <span className="text-blue-600 flex-shrink-0 mt-0.5">→</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {errors.length > 0 && (
                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />교정 내역 ({errors.length}개)
                    </h3>
                    <button onClick={handleSaveAll} disabled={savedToVocab}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                        savedToVocab ? "bg-emerald-100 text-emerald-700" : "bg-stone-900 text-white hover:bg-stone-800"
                      }`}>
                      {savedToVocab ? <><Check className="w-3 h-3" />저장 완료</> : <><BookmarkPlus className="w-3 h-3" />단어장에 모두 저장</>}
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                    {errors.map((e, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-stone-50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] text-stone-500 line-through mb-0.5">{e.original}</div>
                            <div className="text-[14px] text-stone-900 font-medium">✓ {e.corrected}</div>
                            {e.note && <div className="text-xs text-amber-700 mt-1">{e.note}</div>}
                          </div>
                          <button onClick={() => onSpeak(e.corrected)}
                            className="p-1.5 rounded-md text-stone-500 hover:bg-stone-200 transition-colors flex-shrink-0" title="교정된 문장 듣기">
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {report.encouragement && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-emerald-800 font-medium leading-relaxed">💪 {report.encouragement}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-sm text-stone-500">리포트를 불러올 수 없습니다.</div>
          )}
        </div>

        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm bg-stone-900 text-white hover:bg-stone-800 transition-colors font-medium">닫기</button>
        </div>
      </div>
    </div>
  );
}

// ========== ADAPTIVE LEVEL TEST ==========
function AdaptiveLevelTest({ onComplete, onSkip, speak, stopSpeaking, recognitionRef, guideCharacter, apiKey }) {
  const [phase, setPhase] = useState("intro");
  const [testMessages, setTestMessages] = useState([]);
  const [fluencyData, setFluencyData] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const speechStartTimeRef = useRef(null);
  const currentSourceRef = useRef("text");
  const testScrollRef = useRef(null);

  useEffect(() => {
    testScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testMessages, isAIThinking]);

  useEffect(() => {
    if (phase !== "testing" || !recognitionRef?.current) return;
    const rec = recognitionRef.current;
    const origOnResult = rec.onresult;
    const origOnEnd = rec.onend;
    const origOnError = rec.onerror;

    rec.onresult = (event) => {
      // 하이브리드: Android Chrome 누적 final 덮어쓰기
      const finalParts = [];
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (!text) continue;
          if (finalParts.length > 0) {
            const last = finalParts[finalParts.length - 1].toLowerCase();
            const curr = text.toLowerCase();
            if (curr.includes(last) || last.includes(curr)) {
              finalParts[finalParts.length - 1] = curr.length >= last.length ? text : finalParts[finalParts.length - 1];
            } else {
              finalParts.push(text);
            }
          } else {
            finalParts.push(text);
          }
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      const combined = (finalParts.join(" ") + " " + interimTranscript).replace(/\s+/g, " ").trim();
      if (!speechStartTimeRef.current) speechStartTimeRef.current = Date.now();
      setCurrentInput(combined);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    return () => {
      rec.onresult = origOnResult;
      rec.onend = origOnEnd;
      rec.onerror = origOnError;
      try { rec.stop(); } catch {}
    };
  }, [phase, recognitionRef]);

  const buildAPIMessages = (msgs) => msgs.map(m => ({
    role: m.role,
    content: m.role === "user" ? m.content : (m.rawJson || m.content),
  }));

  const handleBegin = async () => {
    setPhase("testing");
    setIsAIThinking(true);
    setError("");
    try {
      const { parsed, raw } = await callAdaptiveTestAPI([
        { role: "user", content: "Please begin the test now. Greet me briefly and ask an easy opening question." },
      ], apiKey);
      const aiMsg = { role: "assistant", content: parsed.message_english, korean: parsed.message_korean, rawJson: raw };
      setTestMessages([
        { role: "user", content: "Please begin the test now. Greet me briefly and ask an easy opening question." },
        aiMsg,
      ]);
      setCurrentAssessment({ level: parsed.observed_level, confidence: parsed.confidence, turn: parsed.turn_number });
      if (speak) setTimeout(() => speak(parsed.message_english), 300);
    } catch (e) {
      console.error("[level test start error]", e);
      setError(formatApiError(e));
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleMicToggle = async () => {
    if (!recognitionRef?.current) {
      setError("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해 주세요.");
      return;
    }
    if (isListening) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    } else {
      // 마이크 권한 명시적 요청 (모바일 호환성)
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
        } catch (e) {
          console.error("[Mic] 권한 거부:", e);
          if (e.name === "NotAllowedError") {
            setError("🎤 마이크 권한이 거부되었습니다. 브라우저 주소창의 자물쇠 아이콘에서 마이크를 허용해 주세요.");
          } else {
            setError(`마이크 오류: ${e.message}`);
          }
          return;
        }
      }

      if (stopSpeaking) stopSpeaking();
      speechStartTimeRef.current = null;
      currentSourceRef.current = "speech";
      setCurrentInput("");
      try {
        recognitionRef.current.continuous = false;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("[Speech] start 실패:", e);
        setError(`음성 인식 시작 실패: ${e.message}`);
      }
    }
  };

  const handleReplay = () => {
    const lastAI = [...testMessages].reverse().find(m => m.role === "assistant");
    if (lastAI && speak) speak(lastAI.content);
  };

  const handleSend = async () => {
    const trimmed = currentInput.trim();
    if (!trimmed || isAIThinking) return;

    let fluency;
    if (currentSourceRef.current === "speech" && speechStartTimeRef.current) {
      const duration = (Date.now() - speechStartTimeRef.current) / 1000;
      const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
      fluency = { source: "speech", duration: Math.round(duration * 10) / 10, wordCount, wpm: calculateWPM(wordCount, duration) };
    } else {
      fluency = { source: "text", duration: null, wordCount: trimmed.split(/\s+/).filter(Boolean).length, wpm: 0 };
    }

    const newFluencyData = [...fluencyData, fluency];
    setFluencyData(newFluencyData);

    speechStartTimeRef.current = null;
    currentSourceRef.current = "text";

    if (isListening && recognitionRef?.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const userMsg = { role: "user", content: trimmed };
    const newMessages = [...testMessages, userMsg];
    setTestMessages(newMessages);
    setCurrentInput("");
    setIsAIThinking(true);

    try {
      const { parsed, raw } = await callAdaptiveTestAPI(buildAPIMessages(newMessages), apiKey);
      setCurrentAssessment({ level: parsed.observed_level, confidence: parsed.confidence, turn: parsed.turn_number });

      if (parsed.is_complete && parsed.final_evaluation) {
        const fluencyStats = aggregateFluency(newFluencyData);
        setResult({ ...parsed.final_evaluation, fluency: fluencyStats });
        if (speak) speak(parsed.message_english);
        setPhase("result");
      } else {
        const aiMsg = { role: "assistant", content: parsed.message_english, korean: parsed.message_korean, rawJson: raw };
        setTestMessages([...newMessages, aiMsg]);
        if (speak) setTimeout(() => speak(parsed.message_english), 300);
      }
    } catch (e) {
      console.error("[level test send error]", e);
      setError(formatApiError(e));
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleFinish = () => {
    stopSpeaking?.();
    onComplete(result);
  };

  return (
    <div className="fixed inset-0 z-40 bg-stone-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        <div className="max-w-2xl mx-auto w-full px-5 py-6 flex-1 flex flex-col">
          {phase === "intro" && <IntroScreen onBegin={handleBegin} onSkip={onSkip} guideCharacter={guideCharacter} />}
          {phase === "testing" && (
            <TestingAdaptiveScreen messages={testMessages} currentInput={currentInput} setCurrentInput={setCurrentInput}
              isListening={isListening} isAIThinking={isAIThinking} onMicToggle={handleMicToggle}
              onReplay={handleReplay} onSend={handleSend} assessment={currentAssessment} error={error} scrollRef={testScrollRef}
              guideCharacter={guideCharacter} />
          )}
          {phase === "result" && result && <ResultScreen result={result} onFinish={handleFinish} guideCharacter={guideCharacter} />}
        </div>
      </div>
    </div>
  );
}

function IntroScreen({ onBegin, onSkip, guideCharacter }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
      {guideCharacter ? (
        <>
          <Avatar character={guideCharacter} size="xl" className="mb-4 shadow-md ring-4 ring-emerald-100" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs mb-4">
            <span>👋</span>
            <span className="font-semibold">{guideCharacter.name}가 도와드립니다</span>
          </div>
        </>
      ) : (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center mb-6">
          <Target className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
      )}
      <h1 className="text-3xl font-semibold text-stone-900 mb-3 tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>레벨 테스트</h1>
      <p className="text-stone-600 max-w-md mb-6 leading-relaxed">
        {guideCharacter ? (
          <><strong>{guideCharacter.name}</strong>가 친근하게 대화하며<br /><strong>실시간으로 난이도를 조정</strong>하여 레벨을 측정합니다.</>
        ) : (
          <>자연스러운 대화를 통해<br /><strong>AI가 실시간으로 난이도를 조정</strong>하며 레벨을 측정합니다.</>
        )}
      </p>
      <div className="bg-white border border-stone-200 rounded-xl p-4 max-w-md mb-8 text-left">
        <p className="text-sm text-stone-700 flex items-start gap-2 mb-2">
          <span className="text-emerald-600 flex-shrink-0">💡</span><span><strong>약 3-5분 소요</strong> · 편안하게 대화하세요</span>
        </p>
        <p className="text-sm text-stone-700 flex items-start gap-2 mb-2">
          <span className="text-emerald-600 flex-shrink-0">🎯</span><span>답변 수준에 따라 <strong>질문 난이도가 자동 변경</strong>됩니다</span>
        </p>
        <p className="text-sm text-stone-700 flex items-start gap-2 mb-2">
          <span className="text-emerald-600 flex-shrink-0">🎙</span><span>음성 사용 시 <strong>발화 속도·유창성</strong>도 측정됩니다</span>
        </p>
        <p className="text-sm text-stone-700 flex items-start gap-2">
          <span className="text-emerald-600 flex-shrink-0">🎧</span><span>AI가 질문을 읽어주고 한글 번역도 제공합니다</span>
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={onSkip} className="px-5 py-3 rounded-full text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 transition-colors font-medium">건너뛰기</button>
        <button onClick={onBegin} className="px-6 py-3 rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-colors font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4" />지금 시작
        </button>
      </div>
      <p className="text-xs text-stone-400 mt-4">건너뛰기 시 기본 중급(B1)으로 시작 · 설정에서 언제든 변경 가능</p>
    </div>
  );
}

function TestingAdaptiveScreen({ messages, currentInput, setCurrentInput, isListening, isAIThinking, onMicToggle, onReplay, onSend, assessment, error, scrollRef, guideCharacter }) {
  const displayMessages = messages.filter((m, i) => !(i === 0 && m.role === "user" && m.content.startsWith("Please begin")));
  const userTurnCount = messages.filter(m => m.role === "user" && !m.content.startsWith("Please begin")).length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {guideCharacter && (
        <div className="flex items-center gap-2 mb-3 bg-white border border-stone-200 rounded-full px-3 py-1.5 self-start">
          <Avatar character={guideCharacter} size="xs" />
          <span className="text-xs font-medium text-stone-700">{guideCharacter.name}</span>
          <span className="text-[10px] text-stone-400">· 진행 중</span>
        </div>
      )}
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-stone-600 font-medium flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />턴 {userTurnCount} / 최대 7
        </span>
        {assessment && (
          <span className="text-stone-500 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" />
            추정 중: <strong className="text-emerald-700">{assessment.level}</strong> · 신뢰도 {assessment.confidence === "high" ? "높음" : assessment.confidence === "medium" ? "보통" : "낮음"}
          </span>
        )}
      </div>
      <div className="w-full bg-stone-200 rounded-full h-1.5 mb-4 overflow-hidden">
        <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${Math.min((userTurnCount / 7) * 100, 100)}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[300px]">
        {displayMessages.map((msg, idx) => <TestBubble key={idx} message={msg} guideCharacter={guideCharacter} />)}
        {isAIThinking && (
          <div className="flex justify-start gap-2">
            {guideCharacter && <Avatar character={guideCharacter} size="xs" className="mt-0.5" />}
            <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {messages.length > 0 && !isAIThinking && (
        <button onClick={onReplay} className="self-start px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors mb-2">
          <Volume2 className="w-3.5 h-3.5" />마지막 질문 다시 듣기
        </button>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl p-3 mb-2">
        <textarea value={currentInput} onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder={isListening ? "🎙 Listening..." : "영어로 답변해주세요... (Enter로 전송)"}
          rows={2} disabled={isAIThinking}
          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-[15px] focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none text-stone-900 placeholder-stone-400 disabled:opacity-50" />
        <div className="flex items-center justify-between mt-2 gap-2">
          <button onClick={onMicToggle} disabled={isAIThinking}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            } disabled:opacity-50`}>
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="text-sm font-medium">{isListening ? "녹음 중..." : "음성 입력"}</span>
          </button>
          <button onClick={onSend} disabled={!currentInput.trim() || isAIThinking}
            className="px-5 py-2 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />전송
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      <p className="text-[11px] text-stone-400 text-center mt-2">
        💡 완벽하지 않아도 괜찮습니다. 편하게 답변하면 AI가 적절한 난이도로 조정합니다.
      </p>
    </div>
  );
}

function TestBubble({ message, guideCharacter }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-stone-900 text-white px-4 py-2.5 rounded-2xl rounded-br-md">
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start gap-2">
      {guideCharacter && <Avatar character={guideCharacter} size="xs" className="mt-0.5" />}
      <div className="max-w-[85%] bg-white border border-stone-200 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm">
        <p className="text-[14px] leading-relaxed text-stone-900 whitespace-pre-wrap">{message.content}</p>
        {message.korean && (
          <p className="text-xs text-stone-500 mt-1.5 pt-1.5 border-t border-stone-100 leading-relaxed">{message.korean}</p>
        )}
      </div>
    </div>
  );
}

function ResultScreen({ result, onFinish, guideCharacter }) {
  const levelInfo = LEVELS[result.level] || LEVELS.B1;
  const confidenceLabel = { high: "높음", medium: "보통", low: "낮음" }[result.confidence] || "보통";
  const fluency = result.fluency;
  const wpmCategory = fluency && fluency.avgWpm > 0 ? categorizeWPM(fluency.avgWpm) : null;

  return (
    <div className="flex flex-col flex-1 py-4">
      <div className="flex items-center justify-center mb-4 gap-3">
        {guideCharacter && <Avatar character={guideCharacter} size="md" className="ring-2 ring-emerald-100" />}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Award className="w-7 h-7 text-white" />
        </div>
      </div>
      <h1 className="text-2xl font-semibold text-stone-900 text-center mb-1" style={{ fontFamily: "'Fraunces', serif" }}>분석 완료</h1>
      <p className="text-center text-sm text-stone-500 mb-6">
        {guideCharacter ? `${guideCharacter.name}가 분석한 ` : ""}당신의 영어 레벨은...
      </p>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 mb-4 text-center">
        <div className="text-6xl mb-2">{levelInfo.emoji}</div>
        <div className="text-3xl font-bold text-stone-900 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>{levelInfo.label}</div>
        <div className="text-sm text-stone-600 mb-2">CEFR <strong>{levelInfo.code}</strong> · {levelInfo.gradeLabel}</div>
        <div className="text-xs text-stone-500">평가 신뢰도: {confidenceLabel}</div>
      </div>

      {result.summary && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 mb-3">
          <p className="text-sm text-stone-700 leading-relaxed">{result.summary}</p>
        </div>
      )}

      {fluency && fluency.avgWpm > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
          <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />유창성 지표 (음성 입력 기준)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] text-blue-700 mb-1">발화 속도</div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold ${wpmCategory.color}`}>{fluency.avgWpm}</span>
                <span className="text-xs text-stone-500">WPM</span>
              </div>
              <div className={`text-[11px] ${wpmCategory.color}`}>{wpmCategory.label} {wpmCategory.desc}</div>
            </div>
            <div>
              <div className="text-[11px] text-blue-700 mb-1">평균 응답 시간</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-stone-900">{fluency.avgDuration}</span>
                <span className="text-xs text-stone-500">초</span>
              </div>
              <div className="text-[11px] text-stone-500">음성 {fluency.speechTurns}/{fluency.totalTurns} 턴</div>
            </div>
          </div>
          <p className="text-[10px] text-stone-500 mt-3 leading-relaxed border-t border-blue-200 pt-2">
            ※ 발음 정확도는 평가 범위에 포함되지 않습니다.
          </p>
        </div>
      )}

      {result.strengths && result.strengths.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 mb-3">
          <h3 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />강점
          </h3>
          <ul className="space-y-1.5">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                <span className="text-emerald-600 flex-shrink-0">•</span><span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.improvements && result.improvements.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6">
          <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />발전할 영역
          </h3>
          <ul className="space-y-1.5">
            {result.improvements.map((s, i) => (
              <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                <span className="text-amber-600 flex-shrink-0">→</span><span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={onFinish} className="px-6 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 mx-auto">
        <Sparkles className="w-4 h-4" />이 레벨로 대화 시작
      </button>
      <p className="text-xs text-stone-400 text-center mt-3">레벨은 설정에서 언제든 변경할 수 있습니다.</p>
    </div>
  );
}

// ========== PROFILE SETUP SCREEN ==========
function ProfileSetupScreen({ initial, onComplete, onSkip, guideCharacter }) {
  const [name, setName] = useState(initial?.name || "");
  const [gender, setGender] = useState(initial?.gender || "");
  const [age, setAge] = useState(initial?.age || "");

  const isValid = name.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    onComplete({
      name: name.trim(),
      gender: gender || "",
      age: age ? String(age).trim() : "",
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-stone-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        <div className="max-w-lg mx-auto w-full px-5 py-8 flex-1 flex flex-col">
          {/* Guide intro */}
          <div className="flex flex-col items-center text-center mb-6">
            {guideCharacter && (
              <Avatar character={guideCharacter} size="xl" className="mb-4 shadow-md ring-4 ring-emerald-100" />
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs mb-3">
              <span>💬</span>
              <span className="font-semibold">
                {guideCharacter ? `${guideCharacter.name}가 묻습니다` : "프로필 설정"}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-stone-900 mb-2 tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              당신을 어떻게 부를까요?
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed max-w-sm">
              대화할 때 AI가 당신의 <strong>이름</strong>을 자연스럽게 불러줍니다.<br />
              성별과 나이는 <strong>대화 톤을 맞추는 데</strong> 참고됩니다.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-5 mb-4">
            {/* Name (required) */}
            <div>
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 block">
                호칭 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && isValid) handleSubmit(); }}
                placeholder="예: Min-su, Tom, 민수, Jay"
                maxLength={40}
                autoFocus
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-[15px] focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors text-stone-900 placeholder-stone-400"
              />
              <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                AI가 대화 중 이 이름으로 불러줍니다. 영어 이름·닉네임·한글 이름 모두 가능합니다.
              </p>
            </div>

            {/* Gender (optional) */}
            <div>
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 block">
                성별 <span className="text-stone-400 font-normal normal-case">(선택)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "male", label: "남성", emoji: "👨" },
                  { value: "female", label: "여성", emoji: "👩" },
                  { value: "", label: "선택 안 함", emoji: "—" },
                ].map(opt => (
                  <button
                    key={opt.value || "none"}
                    onClick={() => setGender(opt.value)}
                    className={`px-3 py-2.5 rounded-lg text-center transition-all ${
                      gender === opt.value
                        ? "bg-stone-900 text-white shadow-sm"
                        : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="text-base mb-0.5">{opt.emoji}</div>
                    <div className="font-semibold text-[11px]">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Age (optional) */}
            <div>
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 block">
                나이 <span className="text-stone-400 font-normal normal-case">(선택)</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") { setAge(""); return; }
                  const n = parseInt(v, 10);
                  if (!isNaN(n) && n >= 0 && n <= 120) setAge(String(n));
                }}
                placeholder="예: 28"
                min={0}
                max={120}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-[15px] focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors text-stone-900 placeholder-stone-400"
              />
              <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                AI가 연령대에 맞춰 대화 주제와 표현을 조정합니다.
              </p>
            </div>
          </div>

          {/* Privacy note */}
          <div className="bg-stone-100 border border-stone-200 rounded-lg p-3 mb-4 text-[11px] text-stone-600 leading-relaxed">
            🔒 입력하신 정보는 <strong>브라우저에만 저장</strong>되며 서버로 전송되지 않습니다. 언제든 설정에서 수정·삭제할 수 있습니다.
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end mt-auto">
            <button
              onClick={onSkip}
              className="px-5 py-3 rounded-full text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 transition-colors font-medium"
            >
              건너뛰기
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="px-6 py-3 rounded-full bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isValid ? `${name}으로 시작하기` : "호칭을 입력해 주세요"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VocabPanel({ vocabulary, onClose, onDelete, onSpeak }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-stone-900" />
            <h2 className="text-lg font-semibold text-stone-900" style={{ fontFamily: "'Fraunces', serif" }}>단어장</h2>
            <span className="text-xs text-stone-500">{vocabulary.length}개</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {vocabulary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Bookmark className="w-10 h-10 text-stone-300 mb-3" />
              <p className="text-sm text-stone-500">아직 저장된 표현이 없습니다.<br />대화 중 마음에 드는 표현을 저장해 보세요.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {vocabulary.map(item => (
                <div key={item.id} className="px-5 py-4 hover:bg-stone-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-stone-900 font-medium leading-snug">{item.english}</p>
                      {item.korean && <p className="text-sm text-stone-500 mt-1 leading-snug">{item.korean}</p>}
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-stone-400">
                        <span>{item.scenario}</span><span>·</span>
                        <span>{new Date(item.createdAt).toLocaleDateString("ko-KR")}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => onSpeak(item.english)} className="p-1.5 rounded-md text-stone-500 hover:bg-stone-200 transition-colors" title="듣기">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-md text-stone-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="삭제">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SaveVocabModal({ initial, onSave, onClose }) {
  const [english, setEnglish] = useState(initial.english);
  const [korean, setKorean] = useState(initial.korean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-stone-900" />
            <h2 className="text-base font-semibold text-stone-900">단어장에 저장</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 block">English</label>
            <textarea value={english} onChange={(e) => setEnglish(e.target.value)} rows={2}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none" placeholder="저장할 영어 표현" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 block">한국어 뜻</label>
            <textarea value={korean} onChange={(e) => setKorean(e.target.value)} rows={2}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none" placeholder="한국어 뜻 또는 메모" />
          </div>
        </div>
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-200 transition-colors">취소</button>
          <button onClick={() => onSave({ english, korean })} disabled={!english.trim()}
            className="px-4 py-2 rounded-lg text-sm bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5">
            <Check className="w-4 h-4" />저장
          </button>
        </div>
      </div>
    </div>
  );
}

function APIKeySetupModal({ initialKey, onSave, onClose, canClose }) {
  const [key, setKey] = useState(initialKey || "");
  const [showKey, setShowKey] = useState(false);
  const trimmed = key.trim();
  const looksValid = trimmed.startsWith("sk-ant-") && trimmed.length > 30;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={canClose ? onClose : undefined} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-lg font-semibold text-stone-900" style={{ fontFamily: "'Fraunces', serif" }}>
              🔑 Anthropic API 키 입력
            </h2>
            <p className="text-xs text-stone-500 mt-1">AI 대화 기능을 사용하려면 API 키가 필요합니다</p>
          </div>
          {canClose && (
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-200 text-stone-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* 안내 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5 text-[13px] text-amber-900 leading-relaxed">
            <p className="font-semibold mb-2">📌 API 키 발급 방법</p>
            <ol className="list-decimal list-inside space-y-1 ml-1">
              <li><a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">console.anthropic.com</a> 가입 (무료)</li>
              <li>왼쪽 메뉴 "API Keys" → "Create Key" 클릭</li>
              <li>키 이름 입력 → 생성된 키(sk-ant-...) 복사</li>
              <li>아래 입력란에 붙여넣기 → 저장</li>
            </ol>
            <p className="mt-3 text-[12px] text-amber-800">
              💳 Anthropic 콘솔에서 결제 수단 등록 + 크레딧 충전이 필요합니다 (최소 $5).
              사용량만큼 본인 카드로 청구됩니다.
            </p>
          </div>

          {/* 입력 필드 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 block">
              API 키
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                autoComplete="off"
                spellCheck={false}
                className="w-full px-3 py-2.5 pr-20 bg-stone-50 border border-stone-200 rounded-lg text-[14px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors text-stone-900 placeholder-stone-400"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] rounded text-stone-600 hover:bg-stone-200 transition-colors"
              >
                {showKey ? "숨김" : "보기"}
              </button>
            </div>
            {trimmed && !looksValid && (
              <p className="text-[11px] text-red-600 mt-1.5">
                ⚠️ 키 형식이 이상합니다. "sk-ant-"로 시작해야 합니다.
              </p>
            )}
          </div>

          {/* 보안 안내 */}
          <div className="bg-stone-100 border border-stone-200 rounded-lg p-3 text-[11px] text-stone-600 leading-relaxed">
            🔒 입력한 키는 <strong>본인 브라우저에만 저장</strong>되며 외부로 전송되지 않습니다 (Anthropic API 호출 외).
            언제든 설정에서 삭제할 수 있습니다.
          </div>
        </div>

        {/* 버튼 */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
          {canClose && (
            <button onClick={onClose} className="px-5 py-2.5 rounded-full text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 transition-colors text-sm font-medium">
              취소
            </button>
          )}
          <button
            onClick={() => onSave(trimmed)}
            disabled={!looksValid}
            className="px-6 py-2.5 rounded-full bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            저장하고 시작
          </button>
        </div>
      </div>
    </div>
  );
}
