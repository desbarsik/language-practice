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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Speech synthesis (built-in browser API)
  const speak = (text: string, messageId: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;

    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(messageId);
    window.speechSynthesis.speak(utterance);
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

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full">
      {/* Заголовок */}
      <div className="flex items-center justify-between shrink-0 pb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            🤖 AI Тьютор
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Практикуй английский с AI
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
              🔄
            </Button>
          )}
        </div>
      </div>

      {/* Настройки */}
      {showSettings && (
        <Card className="bg-gray-50 dark:bg-gray-800 shrink-0 mb-3">
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
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-200 dark:border-indigo-800 shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💬 Выбери тему</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'free', icon: '🗣️', label: 'Свободная' },
              { id: 'restaurant', icon: '🍽️', label: 'Ресторан' },
              { id: 'airport', icon: '✈️', label: 'Аэропорт' },
              { id: 'shopping', icon: '🛍️', label: 'Покупки' },
              { id: 'doctor', icon: '🏥', label: 'Врач' },
              { id: 'interview', icon: '💼', label: 'Собеседование' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => handleStartWithTopic(t.id)}
                className="p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors text-center"
              >
                <span className="text-2xl block mb-1">{t.icon}</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{t.label}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto space-y-3 py-3">
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
                    onClick={() => speakingId === msg.id ? stopSpeaking() : speak(msg.content, msg.id)}
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
      <div className="shrink-0 pt-2 border-t border-gray-200 dark:border-gray-700 pb-2">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напиши сообщение..."
            rows={1}
            className="flex-1 px-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
            style={{ minHeight: '48px', maxHeight: '100px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`shrink-0 w-[48px] h-[48px] rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
              input.trim() && !isLoading
                ? 'bg-blue-600 text-white active:scale-95'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }`}
          >
            {isLoading ? '⏳' : '→'}
          </button>
        </div>
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
