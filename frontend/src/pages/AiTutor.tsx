import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

const SYSTEM_PROMPT = `Я хочу, чтобы ты был моим собеседником для практики разговорного английского. Отвечай мне на английском языке, но если нужно объяснить правило или ошибку — объясняй на русском. Исправляй мои грамматические ошибки, опечатки и фактические ошибки. Делай ответ кратким, не более 100 слов. Всегда задавай мне вопрос в конце, чтобы продолжить диалог. Начни с приветствия и первого вопроса.`;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

const API_BASE = import.meta.env.VITE_AI_API_URL || 'https://openrouter.ai/api/v1';
const API_KEY = import.meta.env.VITE_AI_API_KEY || '';

export const AiTutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState<string>('free');
  const [showSettings, setShowSettings] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState<string>('en-US');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Speech synthesis (built-in browser API)
  const speak = (text: string, messageId: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Voices load asynchronously, get them
    const voices = window.speechSynthesis.getVoices();
    const isRussian = recognitionLang === 'ru-RU';
    const targetLang = isRussian ? 'ru' : 'en';

    // Priority: Google > Natural > Microsoft > any matching
    const preferredVoice = voices.find(v =>
      v.lang.startsWith(targetLang) && v.name.toLowerCase().includes('google')
    ) || voices.find(v =>
      v.lang.startsWith(targetLang) && v.name.toLowerCase().includes('natural')
    ) || voices.find(v =>
      v.lang.startsWith(targetLang) && v.name.toLowerCase().includes('microsoft')
    ) || voices.find(v =>
      v.lang.startsWith(targetLang)
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.lang = isRussian ? 'ru-RU' : 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(messageId);

    // Ensure voices are loaded
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const loadedVoices = window.speechSynthesis.getVoices();
        const loadedVoice = loadedVoices.find(v =>
          v.lang.startsWith(targetLang) && v.name.toLowerCase().includes('google')
        ) || loadedVoices.find(v =>
          v.lang.startsWith(targetLang) && v.name.toLowerCase().includes('natural')
        ) || loadedVoices.find(v =>
          v.lang.startsWith(targetLang)
        );
        if (loadedVoice) utterance.voice = loadedVoice;
        window.speechSynthesis.speak(utterance);
      };
    } else {
      window.speechSynthesis.speak(utterance);
    }
  };

  // Google Translate TTS (fallback — no API key needed)
  const speakGoogle = (text: string, messageId: string) => {
    window.speechSynthesis.cancel();
    setSpeakingId(messageId);

    // Truncate to ~200 chars (Google Translate limit)
    const trimmed = text.length > 200 ? text.slice(0, 200) : text;
    const lang = recognitionLang === 'ru-RU' ? 'ru' : 'en';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(trimmed)}&tl=${lang}&client=tw-ob`;

    const audio = new Audio(url);
    currentAudioRef.current = audio;
    audio.onended = () => {
      setSpeakingId(null);
      currentAudioRef.current = null;
    };
    audio.onerror = () => {
      // Fallback to browser SpeechSynthesis
      setSpeakingId(null);
      currentAudioRef.current = null;
      speak(text, messageId);
    };
    audio.play().catch(() => {
      setSpeakingId(null);
      currentAudioRef.current = null;
    });
  };

  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  };

  // Speech recognition (built-in browser API)
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // On mobile, suggest keyboard dictation
      alert('На телефоне используйте 🎤 на клавиатуре — нажмите на микрофон когда появится клавиатура.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = recognitionLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + ' ' : '') + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const getTopicPrompt = (): string => {
    const topicPrompts: Record<string, string> = {
      free: '',
      restaurant: "Давай потренируемся в ресторане. Ты — официант, я — клиент. Начни.",
      airport: "Давай потренируемся в аэропорту. Ты — сотрудник регистрации, я — пассажир. Начни.",
      shopping: "Давай потренируемся в магазине. Ты — продавец, я — покупатель. Начни.",
      doctor: "Давай потренируемся у врача. Ты — доктор, я — пациент. Начни.",
      interview: "Давай потренируем собеседование. Ты — интервьюер, я — кандидат. Начни.",
    };
    return topicPrompts[topic] || '';
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Build messages for API
    const apiMessages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add topic context if starting
    if (messages.length === 0) {
      const topicPrompt = getTopicPrompt();
      if (topicPrompt) {
        apiMessages.push({ role: 'assistant', content: topicPrompt });
      }
    }

    // Add conversation history (last 20 messages to avoid token limit)
    const history = messages.slice(-20);
    for (const msg of history) {
      apiMessages.push({ role: msg.role, content: msg.content });
    }

    apiMessages.push({ role: 'user', content: userMessage.trim() });

    try {
      const response = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'English Master',
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_AI_MODEL || 'openai/gpt-4o-mini',
          messages: apiMessages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'Sorry, I did not understand. Could you repeat?';

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      // Add error message to chat
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Ошибка: ${message}\n\nПроверьте API ключ в настройках (кнопка ⚙️)`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  const handleStartWithTopic = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setMessages([]);
    // Auto-send first message
    setTimeout(() => {
      sendMessage('Привет!');
    }, 100);
  };

  // Check if speech recognition is supported
  const isSpeechSupported = !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🤖 AI Тьютор
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Практикуйте разговорный английский с AI
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Настройки"
          >
            ⚙️
          </button>
          {messages.length > 0 && (
            <Button variant="secondary" size="sm" onClick={handleNewChat}>
              🔄 Новый чат
            </Button>
          )}
        </div>
      </div>

      {/* Настройки */}
      {showSettings && (
        <Card className="bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">⚙️ Настройки API</h3>
          <div className="space-y-3 text-sm">
            <p className="text-gray-500 dark:text-gray-400">
              Для работы нужен API ключ от OpenAI или совместимого сервиса.
            </p>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">API URL</label>
              <code className="block bg-white dark:bg-gray-700 p-2 rounded text-xs">
                {API_BASE || 'https://api.openai.com/v1'}
              </code>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Модель</label>
              <code className="block bg-white dark:bg-gray-700 p-2 rounded text-xs">
                {import.meta.env.VITE_AI_MODEL || 'openai/gpt-4o-mini'}
              </code>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">API ключ</label>
              <code className="block bg-white dark:bg-gray-700 p-2 rounded text-xs">
                {API_KEY ? `${API_KEY.slice(0, 8)}...` : 'Не установлен'}
              </code>
            </div>
            <p className="text-xs text-gray-400">
              Установите переменные окружения: <code>VITE_AI_API_KEY</code>, <code>VITE_AI_API_URL</code> (опционально), <code>VITE_AI_MODEL</code> (опционально). Подробнее: <a href="https://openrouter.ai/docs" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">openrouter.ai/docs</a>
            </p>
          </div>
        </Card>
      )}

      {/* Выбор темы */}
      {messages.length === 0 && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-200 dark:border-indigo-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💬 Выберите тему разговора</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'free', icon: '🗣️', label: 'Свободная тема' },
              { id: 'restaurant', icon: '🍽️', label: 'В ресторане' },
              { id: 'airport', icon: '✈️', label: 'В аэропорту' },
              { id: 'shopping', icon: '🛍️', label: 'Покупки' },
              { id: 'doctor', icon: '🏥', label: 'У врача' },
              { id: 'interview', icon: '💼', label: 'Собеседование' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => handleStartWithTopic(t.id)}
                className="p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors text-left"
              >
                <span className="text-xl">{t.icon}</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{t.label}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Сообщения */}
      <div className="space-y-3 overflow-y-auto pb-4" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-lg font-medium">Начните разговор!</p>
            <p className="text-sm mt-1">Выберите тему выше или напишите что-нибудь на английском</p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : msg.id.startsWith('error')
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-bl-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
              }`}
            >
              <div className="flex items-start gap-2">
                <p className="text-sm whitespace-pre-wrap flex-1">{msg.content}</p>
                {msg.role === 'assistant' && !msg.id.startsWith('error') && (
                  <button
                    onClick={() => speakingId === msg.id ? stopSpeaking() : speakGoogle(msg.content, msg.id)}
                    className={`shrink-0 text-lg transition-all ${
                      speakingId === msg.id
                        ? 'text-blue-500 animate-pulse'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    title={speakingId === msg.id ? 'Остановить' : 'Прослушать'}
                  >
                    {speakingId === msg.id ? '⏹️' : '🔊'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ввод */}
      <div className="flex gap-2 items-end pb-safe-4">
        {/* Кнопка микрофона (только на десктопе) */}
        {isSpeechSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`shrink-0 w-[56px] h-[56px] rounded-xl border-2 flex flex-col items-center justify-center text-xl transition-all ${
              isListening
                ? 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-600 dark:text-red-400 animate-pulse'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
            }`}
            title={isListening ? 'Остановить запись' : 'Надиктовать текст'}
          >
            {isListening ? '⏹️' : '🎤'}
            <span className="text-[8px] font-bold leading-none">
              {recognitionLang === 'en-US' ? 'EN' : 'RU'}
            </span>
          </button>
        )}

        {/* Переключатель языка */}
        <button
          onClick={() => setRecognitionLang(prev => prev === 'en-US' ? 'ru-RU' : 'en-US')}
          disabled={isListening}
          className="shrink-0 w-[36px] h-[56px] rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Переключить язык"
        >
          {recognitionLang === 'en-US' ? '🇬🇧' : '🇷🇺'}
        </button>

        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напиши или используй 🎤 на клавиатуре..."
          rows={1}
          inputMode="text"
          enterKeyHint="send"
          className="flex-1 px-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
          disabled={isLoading}
          style={{ minHeight: '56px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`shrink-0 w-[56px] h-[56px] rounded-xl flex items-center justify-center text-xl font-bold transition-all ${
            input.trim() && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? '⏳' : '→'}
        </button>
      </div>

      {/* Навигация */}
      <div className="text-center pt-2">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          ← На главную
        </Link>
      </div>
    </div>
  );
};
