# English Master

Веб-приложение для изучения английского языка с использованием интерактивных карточек.

## 🚀 Быстрый старт

### Frontend (локально)

```bash
cd frontend
npm install
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

### Backend (локально)

```bash
cd backend
npm install
cp .env.example .env  # отредактируйте DATABASE_URL и JWT_SECRET
npm run dev
```

API будет доступно по адресу: http://localhost:3000

### Заполнение базы данных

```bash
cd backend
npm run seed
```

### Одновременный запуск

```bash
npm install  # в корне проекта
npm run dev
```

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
├── backend/           # Node.js/Express сервер
│   ├── src/
│   │   ├── config/      # Конфигурация БД
│   │   ├── middleware/  # Auth, обработка ошибок
│   │   ├── models/      # Модели данных и запросы
│   │   ├── routes/      # API endpoints
│   │   └── scripts/     # Seed скрипты
│   └── ...
├── specification.md   # Спецификация проекта
├── TODO.md           # Список задач
├── DEPLOYMENT.md     # Руководство по деплою
└── README.md         # Этот файл
```

## 🛠 Технологический стек

- **Frontend:** React 18, TypeScript, Tailwind CSS, React Router, Framer Motion, Zustand
- **Backend:** Node.js, Express, TypeScript, PostgreSQL
- **Build:** Vite (frontend), TypeScript (backend)
- **Storage:** localStorage + PostgreSQL (для авторизованных пользователей)
- **Auth:** JWT токены, bcrypt

## 📋 Функциональность

### ✅ Реализовано (Этапы 1-12)

- **Аутентификация:** Регистрация, вход/выход, JWT токены
- **Защищенные маршруты:** Доступ только для авторизованных пользователей
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
- **Синхронизация:** Прогресс сохраняется в БД и синхронизируется между устройствами
- **Адаптивный дизайн:** Корректное отображение на мобильных устройствах
- **Анимации:** Плавные переходы и визуальная обратная связь

### 🚀 Деплой

См. [DEPLOYMENT.md](./DEPLOYMENT.md) для инструкций по развертыванию:
- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL (облачный)

## 📄 Лицензия

MIT
