# Руководство по развертыванию English Master

## Этап 12: Деплой

### 12.1: Деплой Frontend на Vercel

#### Автоматический деплой (рекомендуется)

1. **Подключите репозиторий к Vercel:**
   - Зайдите на https://vercel.com
   - Нажмите "New Project"
   - Импортируйте ваш GitHub репозиторий
   - Vercel автоматически обнаружит Vite проект

2. **Настройте переменные окружения:**
   - В dashboard Vercel перейдите в Settings → Environment Variables
   - Добавьте:
     ```
     VITE_API_URL=https://your-backend-url.render/api
     ```

3. **Деплой:**
   - Vercel автоматически соберет и задеплоит проект
   - Сайт будет доступен по URL: `https://your-app.vercel.app`

#### Ручной деплой через CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Задеплойте frontend
cd frontend
vercel --prod
```

---

### 12.2: Деплой Backend на Render

#### Подготовка базы данных

1. **Создайте PostgreSQL на Render:**
   - Зайдите на https://render.com
   - New → PostgreSQL
   - Выберите план (Free для тестирования)
   - Скопируйте connection string

2. **Настройте переменные окружения:**
   - В dashboard Render перейдите в ваш сервис
   - Environment → Add Environment Variable
   - Добавьте:
     ```
     NODE_ENV=production
     DATABASE_URL=postgresql://user:password@host:5432/dbname
     JWT_SECRET=your-production-secret-key
     JWT_EXPIRES_IN=7d
     FRONTEND_URL=https://your-app.vercel.app
     PORT=10000
     ```

#### Деплой backend

1. **Подключите репозиторий:**
   - New → Web Service
   - Connect your GitHub repository
   - Root Directory: `backend`

2. **Настройте сборку:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Запустите seed скрипт после деплоя:**
   - Подключитесь к серверу через SSH или консоль
   - Или создайте отдельный endpoint для seeding

4. **Backend будет доступен по URL:**
   - `https://your-api.onrender.com`

---

### 12.3: Финальная проверка

#### Checklist для тестирования

**Аутентификация:**
- [ ] Регистрация нового пользователя
- [ ] Вход существующего пользователя
- [ ] Выход из системы
- [ ] Токен сохраняется в localStorage
- [ ] Незалогиненный пользователь перенаправляется на /login

**Обучение:**
- [ ] Выбор уровня работает
- [ ] Выбор темы работает
- [ ] Вопросы загружаются из БД
- [ ] Multiple Choice работает корректно
- [ ] Sentence Builder работает корректно
- [ ] Обратная связь сохраняется
- [ ] Прогресс синхронизируется с сервером

**Статистика:**
- [ ] Статистика загружается из БД
- [ ] Проценты рассчитываются корректно
- [ ] Список ошибок отображается
- [ ] Сброс статистики работает

**UI/UX:**
- [ ] Анимации работают плавно
- [ ] Dark mode работает
- [ ] Адаптивная верстка на мобильных
- [ ] Loading states отображаются
- [ ] Error messages отображаются

**API:**
- [ ] Health check endpoint работает
- [ ] Вопросы фильтруются по уровню и теме
- [ ] Прогресс сохраняется
- [ ] Статистика обновляется

---

### Тестирование полного цикла

1. **Зарегистрируйтесь:**
   ```
   Email: test@example.com
   Password: test123456
   ```

2. **Выберите уровень:** Beginner

3. **Пройдите 5-10 вопросов**

4. **Проверьте статистику:**
   - Correct/Incorrect должны обновиться
   - Accuracy должен пересчитаться

5. **Выйдите и войдите снова:**
   - Статистика должна сохраниться

6. **Проверьте на другом устройстве:**
   - Войдите с тем же credentials
   - Статистика должна синхронизироваться

---

### Устранение проблем

#### Frontend не подключается к Backend

**Проблема:** CORS ошибки в консоли

**Решение:**
- Проверьте `FRONTEND_URL` в .env backend
- Убедитесь, что CORS настроен правильно в `backend/src/index.ts`

#### База данных не подключается

**Проблема:** `ECONNREFUSED` или `authentication failed`

**Решение:**
- Проверьте `DATABASE_URL` 
- Убедитесь, что PostgreSQL запущен
- Проверьте credentials

#### JWT токен не работает

**Проблема:** 401 Unauthorized

**Решение:**
- Проверьте `JWT_SECRET` на frontend и backend
- Убедитесь, что токен сохраняется в localStorage
- Проверьте expiration токена

---

### Оптимизация для production

1. **Frontend:**
   - Code splitting уже настроен через Vite
   - Минификация включена по умолчанию
   - Используйте `npm run build` для production

2. **Backend:**
   - Включите production mode: `NODE_ENV=production`
   - Используйте connection pooling для БД
   - Настройте rate limiting (опционально)
   - Добавьте logging (Winston/Morgan)

3. **База данных:**
   - Создайте индексы (уже включены в schema.sql)
   - Настройте backups
   - Мониторьте размер БД

---

### Мониторинг

**Vercel:**
- Analytics в dashboard
- Проверка логов деплоя

**Render:**
- Metrics в dashboard
- Logs в реальном времени
- Автоматические деплои при push в main

**PostgreSQL:**
- Используйте pgAdmin или Datagrip
- Мониторьте медленные запросы

---

### Безопасность

- [ ] Смените `JWT_SECRET` на сложный случайный ключ
- [ ] Не коммитьте `.env` файлы в git
- [ ] Используйте HTTPS для всех endpoint'ов
- [ ] Настройте rate limiting для API
- [ ] Валидируйте все входные данные (Zod уже настроен)
- [ ] Регулярно обновляйте зависимости

---

### Масштабирование

Когда приложение вырастет:

1. **Добавьте кэширование:** Redis для сессий и частых запросов
2. **CDN:** Cloudflare для статики
3. **Load Balancer:** Если один сервер не справляется
4. **Миграции:** Используйте node-pg-migrate для управления схемой БД
5. **Тесты:** Jest + Supertest для backend, Vitest для frontend
