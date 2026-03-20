# English Master

Веб-приложение для изучения английского языка с использованием интерактивных карточек.

## 🚀 Быстрый старт

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## 📁 Структура проекта

```
language-practice/
├── frontend/          # React приложение
│   ├── src/
│   │   ├── components/  # UI компоненты
│   │   │   ├── common/  # Базовые компоненты (Button, Card, Layout)
│   │   │   ├── learning/# Компоненты обучения (Flashcard, MultipleChoice...)
│   │   │   ├── stats/   # Компоненты статистики
│   │   │   └── auth/    # Компоненты аутентификации
│   │   ├── pages/       # Страницы приложения
│   │   ├── data/        # Моковые данные
│   │   ├── services/    # API и localStorage сервисы
│   │   ├── store/       # Zustand store
│   │   └── types/       # TypeScript типы
│   └── ...
├── specification.md   # Спецификация проекта
├── TODO.md           # Список задач
└── README.md         # Этот файл
```

## 🛠 Технологический стек

- **Frontend:** React 18, TypeScript, Tailwind CSS, React Router, Framer Motion, Zustand
- **Build:** Vite
- **Storage:** localStorage (для MVP)

## 📋 Функциональность MVP

### ✅ Реализовано (Этапы 1-7)

- **Навигация:** Роутинг между страницами (Home, Learning, Statistics)
- **Выбор уровня:** Beginner (A1-A2), Intermediate (B1-B2), Advanced (C1-C2)
- **Выбор тем:** Путешествия, Еда, Бизнес, Грамматика
- **Карточки с переворотом:** Анимация flip с помощью Framer Motion
- **Типы вопросов:**
  - Multiple Choice (выбор из 4 вариантов)
  - Sentence Builder (составление предложения из слов)
- **Обратная связь:** Кнопки "Правильно"/"Ошибка" после ответа
- **Статистика:** Подсчет правильных/неправильных ответов, процент успеха
- **Трекинг ошибок:** Сохранение вопросов с ошибками
- **Local Storage:** Сохранение прогресса между сессиями
- **Адаптивный дизайн:** Корректное отображение на мобильных устройствах

### ⏸️ В планах (Этапы 8-12)

- Backend API (Node.js/Express)
- База данных (PostgreSQL/MongoDB)
- Аутентификация (JWT)
- Синхронизация между устройствами
- Деплой на Vercel/Render

## 📄 Лицензия

MIT
