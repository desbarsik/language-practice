import React, { useState } from 'react';
import type { CustomCard, CustomCardType } from '../../types';
import { userCardsService } from '../../services/userCardsService';

interface CardEditorProps {
  card?: CustomCard;
  onSave: () => void;
  onCancel: () => void;
}

const TYPE_ICONS: Record<CustomCardType, { icon: string; label: string; desc: string }> = {
  translation: {
    icon: '🔄',
    label: 'Перевод слова',
    desc: 'Английское слово → русский перевод',
  },
  sentence: {
    icon: '💬',
    label: 'Фраза / Предложение',
    desc: 'Английская фраза → перевод + пояснение',
  },
};

const TYPE_COLORS: Record<CustomCardType, string> = {
  translation: 'bg-blue-500',
  sentence: 'bg-purple-500',
};

export const CardEditor: React.FC<CardEditorProps> = ({ card, onSave, onCancel }) => {
  const [type, setType] = useState<CustomCardType>(card?.type || 'translation');
  const [frontText, setFrontText] = useState(card?.front_text || '');
  const [backText, setBackText] = useState(card?.back_text || '');
  const [hint, setHint] = useState(card?.hint || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!card;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!frontText.trim()) newErrors.front = 'Введите английское слово или фразу';
    if (!backText.trim()) newErrors.back = 'Введите перевод или пояснение';
    if (frontText.trim().length > 200) newErrors.front = 'Слишком длинный текст (макс. 200 символов)';
    if (backText.trim().length > 500) newErrors.back = 'Слишком длинный текст (макс. 500 символов)';
    if (hint.length > 300) newErrors.hint = 'Подсказка слишком длинная (макс. 300 символов)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && card) {
      await userCardsService.updateCard(card.id, { type, front_text: frontText.trim(), back_text: backText.trim(), hint: hint.trim() || undefined });
    } else {
      await userCardsService.addCard({ type, front_text: frontText.trim(), back_text: backText.trim(), hint: hint.trim() || undefined });
    }

    onSave();
  };

  const selectedTypeInfo = TYPE_ICONS[type];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Тип карточки */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          📝 Тип карточки
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(TYPE_ICONS) as CustomCardType[]).map((key) => {
            const info = TYPE_ICONS[key];
            const isSelected = type === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{info.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{info.desc}</p>
                </div>
                {isSelected && (
                  <span className="ml-auto text-blue-500 font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Английский текст */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          🇬🇧 Английское слово / фраза
        </label>
        <input
          type="text"
          value={frontText}
          onChange={(e) => {
            setFrontText(e.target.value);
            if (errors.front) setErrors(prev => ({ ...prev, front: '' }));
          }}
          placeholder={type === 'translation' ? 'Например: Hello' : 'Например: I am a student'}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.front
              ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          maxLength={200}
        />
        {errors.front && <p className="mt-1 text-sm text-red-500">{errors.front}</p>}
        <p className="mt-1 text-xs text-gray-400">{frontText.length}/200</p>
      </div>

      {/* Перевод */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          🇷🇺 Перевод / пояснение
        </label>
        <textarea
          value={backText}
          onChange={(e) => {
            setBackText(e.target.value);
            if (errors.back) setErrors(prev => ({ ...prev, back: '' }));
          }}
          placeholder={type === 'translation' ? 'Например: Привет' : 'Например: Я студент (простое описание)'}
          rows={3}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.back
              ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
          maxLength={500}
        />
        {errors.back && <p className="mt-1 text-sm text-red-500">{errors.back}</p>}
        <p className="mt-1 text-xs text-gray-400">{backText.length}/500</p>
      </div>

      {/* Подсказка */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          💡 Подсказка <span className="text-gray-400 font-normal">(необязательно)</span>
        </label>
        <input
          type="text"
          value={hint}
          onChange={(e) => {
            setHint(e.target.value);
            if (errors.hint) setErrors(prev => ({ ...prev, hint: '' }));
          }}
          placeholder="Например: произносится как «хэлоу»"
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.hint
              ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          maxLength={300}
        />
        {errors.hint && <p className="mt-1 text-sm text-red-500">{errors.hint}</p>}
        <p className="mt-1 text-xs text-gray-400">{hint.length}/300</p>
      </div>

      {/* Предпросмотр */}
      {frontText && backText && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            👀 Предпросмотр карточки
          </p>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{selectedTypeInfo.icon}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs text-white ${TYPE_COLORS[type]}`}>
                {selectedTypeInfo.label}
              </span>
            </div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {frontText}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              → {backText}
            </p>
            {hint && (
              <p className="mt-2 text-sm text-gray-400 italic">💡 {hint}</p>
            )}
          </div>
        </div>
      )}

      {/* Кнопки */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors shadow-sm"
        >
          {isEditing ? '💾 Сохранить' : '➕ Создать карточку'}
        </button>
      </div>
    </form>
  );
};
