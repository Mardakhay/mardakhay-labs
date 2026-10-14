# Project Status — Mardakhay Labs

> **Назначение документа:** единый handoff-контекст для будущих чатов и следующих итераций разработки. Здесь собраны текущее состояние проекта, архитектура, результаты статического аудита, риски, план исправлений и правила обновления документа.
>
> **Язык:** русский.  
> **Последний обзор исходников:** 14 октября 2026.  
> **Проверенная версия репозитория:** ветка `main`, commit `23da25415481c51dd7b0c5491f4266b504b54076` (12 октября 2026).  
> **Статус:** базовый статический аудит выполнен; предложенный roadmap ещё не означает, что исправления сделаны.

## 1. Краткий контекст

Mardakhay Labs — SPA/PWA для хранения, организации и повторного использования AI-промптов. Поддерживает регистрацию и вход, Google OAuth, CRUD промптов, категории, AI target, хештеги, избранное, поиск и фильтры, массовые операции, JSON/Markdown import/export, шаблоны, сохранение черновиков, командную палитру и историю активности.

- Репозиторий: https://github.com/Mardakhay/mardakhay-labs
- Production/demo URL из метаданных репозитория: https://mardakhay-labs.xyz
- Основная документация: README.md и docs/BACKUP_AND_RESTORE.md
- Последний просмотренный commit: 23da25415481c51dd7b0c5491f4266b504b54076
- Последний проверенный CI для main: https://github.com/Mardakhay/mardakhay-labs/actions/runs/38237975159 — conclusion: success на момент проверки 12 октября 2026.

### Текущая общая оценка

Это содержательный solo-проект для портфолио: кроме UI, в нём есть аутентификация, PostgreSQL/Supabase, RLS, кеширование серверного состояния, optimistic updates, миграции, тесты и CI. Архитектура разумна для текущего масштаба, но наиболее важные следующие шаги — валидация импортируемых данных, надёжность асинхронных изменений, тесты интеграционных сценариев и проверка поведения PWA при обновлениях.

Оценки из первого обзора были экспертными, а не метриками автоматического аудита. В частности, performance, Lighthouse, bundle size, браузерный QA и состояние production-настроек Supabase не измерялись напрямую.

## 2. Стек

### Frontend
- React 19, TypeScript 6, Vite 8
- Tailwind CSS 4
- React Router 7
- TanStack Query 5 для серверного состояния и кеша
- Zustand 5 для состояния пользователя и уведомлений
- lucide-react для иконок

### Backend / данные
- Supabase Auth
- PostgreSQL
- Row Level Security (RLS)
- Таблица public.prompts, миграции в supabase/migrations/

### Качество и поставка
- Vitest
- ESLint с правилами TypeScript и React Hooks
- GitHub Actions CI: npm ci, npm test, npm run lint, npm run build
- PWA: public/manifest.webmanifest, public/sw.js, src/registerServiceWorker.ts

## 3. Карта архитектуры

- src/main.tsx — React root, BrowserRouter, QueryClientProvider, регистрация service worker.
- src/App.tsx — восстановление Supabase-сессии, подписка на auth state changes, lazy-loaded routes.
- src/api/auth.ts — sign in/up, подтверждение email, Google OAuth, sign out.
- src/api/prompts.ts — CRUD и массовые операции в Supabase; нормализация и mapping записей.
- src/hooks/usePromptsQuery.ts — запрос списка промптов через TanStack Query; ключ включает user id.
- src/hooks/usePromptMutations.ts — мутации, обновление кеша, optimistic updates, rollback, уведомления.
- src/hooks/useActivityLog.ts и src/lib/activityLog.ts — пользовательская история активности в localStorage.
- src/stores/authStore.ts — Zustand auth store.
- src/stores/notificationStore.ts — Zustand notifications.
- src/pages/ — Dashboard, Prompts, Favorites, Login, Settings.
- src/components/ — layout, карточки, редактор-модалка, detail panel, command palette, меню и уведомления.
- src/lib/ — форматирование, metadata/hashtags, экспорт/импорт, кеш-хелперы, storage keys, Supabase client.
- src/lib/__tests__/ — unit-тесты утилит.
- supabase/schema.sql и supabase/migrations/ — таблица prompts, триггер updated_at, RLS-политики и исправления извлечения hashtag.
- .github/workflows/ci.yml — CI.
- .github/workflows/supabase-keepalive.yml — периодический запрос к Supabase REST API.

### Основной поток данных

React page → custom hook → TanStack Query → API-функция → Supabase client → PostgreSQL/RLS. Zustand используется отдельно для состояния авторизации и уведомлений. Черновики и activity log хранятся в localStorage с ключами, включающими user id.

### Основные пользовательские маршруты

- /login
- /
- /prompts
- /favorites
- /settings

Приватные маршруты защищаются компонентом ProtectedRoute.

## 4. Подтверждённые положительные стороны

1. Запрос промптов отключён до появления user id через enabled в usePromptsQuery.
2. Ключ кеша промптов включает user id; при logout удаляются запросы семейства prompts.
3. API-слой явно проверяет текущего пользователя и ограничивает запросы через user_id; окончательная изоляция должна обеспечиваться RLS на стороне базы.
4. В supabase/schema.sql включён RLS, определены отдельные политики select/insert/update/delete для authenticated, а триггер управляет updated_at.
5. Для update/delete/favorite предусмотрены optimistic updates и rollback при ошибке.
6. Страницы загружаются через React.lazy и Suspense.
7. Есть unit-тесты для prompt formatting, metadata/hashtags, import/export, cache helpers, нормализации email и activity log.
8. CI запускает тесты, lint и production build; последний проверенный запуск для main успешен.
9. README описывает запуск и настройки окружения, а docs/BACKUP_AND_RESTORE.md честно объясняет ограничения content-level backup.
10. Редактор промпта имеет восстановление черновика, а модальные окна частично учитывают управление фокусом и ARIA.

## 5. Найденные замечания и риски

Статусы:
- **CONFIRMED** — непосредственно видно из проверенного кода/конфигурации.
- **VERIFY** — риск или сценарий, который нужно воспроизвести/проверить в работе приложения или production.
- **IMPROVEMENT** — улучшение зрелости, не обязательно дефект.

### P0 — импорт JSON: исправления внесены

#### P0-1. Runtime-валидация полей импорта — IMPLEMENTED
Файл: src/lib/promptExport.ts.

Импорт теперь проверяет aiTarget/category по допустимым значениям, проверяет типы title/isFavorite, отклоняет некорректные JSON, пустые массивы и элементы без content. TypeScript assertions больше не используются как замена runtime-валидации. Добавлены unit-тесты на эти границы.

#### P0-2. Контракт JSON export/import — IMPLEMENTED
Файлы: src/lib/promptExport.ts, src/api/prompts.ts, docs/BACKUP_AND_RESTORE.md.

Импорт восстанавливает isFavorite (при отсутствии поля устанавливает false). Hashtags пересчитываются из content — поле hashtags из JSON не считается независимым источником истины. createdAt экспортируется как справочная информация, но не применяется при импорте; ID и timestamps не переносятся. Ограничения задокументированы.

#### P0-3. Ограничение размера и количества импортируемых промптов — IMPLEMENTED
Файлы: src/lib/promptImportLimits.ts, src/pages/PromptsPage.tsx, src/api/prompts.ts.

Файл больше 5 MiB отклоняется до вызова file.text(). Лимит в 500 промптов централизован, проверяется при парсинге и повторно на API-уровне перед bulk insert.

## P0 validation status

Проверено: GitHub Actions CI прошёл на revision 8e77d0d8c683da5b52573efa443d6904a84396f8 — npm test, npm run lint и npm run build завершились успешно. Последующее amend-обновление этого единственного коммита затрагивает только PROJECT_STATUS.md; исходный код и тесты совпадают с проверенной revision.

### P1 — надёжность и защита

#### P1-1. Возможный конфликт optimistic rollback — VERIFY
Файл: src/hooks/usePromptMutations.ts.

Несколько мутаций сохраняют целиком предыдущий список промптов и восстанавливают его при ошибке. При конкурирующих мутациях rollback одной операции потенциально может затереть результат другой операции, если они обновляют один и тот же кеш.

План проверки:
- Написать тест на две почти одновременные мутации над разными или одной записью.
- Смоделировать success одной операции и error второй.
- Убедиться, что успешное изменение не потерялось.
- Если проблема воспроизводится, применять более точечный rollback, учитывать порядок операций или сериализовать конфликтующие изменения.

Не объявлять это воспроизводимым багом, пока тест не подтвердит сценарий.

#### P1-2. Инициализация сессии и auth state listener — VERIFY
Файл: src/App.tsx.

getSession() и onAuthStateChange() запускаются при инициализации. Оба обновляют auth store. Нужно проверить порядок результатов при входе/выходе в момент восстановления сессии и убедиться, что устаревший результат не перезаписывает актуальный.

План проверки:
- Тесты холодного запуска, существующей сессии, logout, быстрого повторного login и OAuth callback.
- Проверить отсутствие кратковременного показа приватных данных другого пользователя.
- Сохранять очистку кеша при смене/утрате пользователя.

#### P1-3. PWA cache / update strategy — VERIFY
Файл: public/sw.js.

Service worker делает network-first для навигации, сохраняет страницу как /index.html, кэширует успешные same-origin GET responses и при активации удаляет старые cache entries. Это требует проверки сценариев смены версии, отсутствия сети и несоответствия HTML с hashed assets. Статический просмотр не доказывает, что проблема воспроизводится.

План проверки:
- Развернуть две версии приложения с разными asset hashes.
- Проверить обновление открытой вкладки и offline после обновления.
- Проверить, что запросы к Supabase/API не перехватываются service worker.
- Обеспечить понятную политику обновления и очистки кеша.

#### P1-4. Проверка RLS в реальной базе — VERIFY
Файлы: supabase/schema.sql, supabase/migrations/20260927190000_harden_prompts_rls.sql.

SQL в репозитории содержит политики по auth.uid() = user_id, но состояние production-проекта не подтверждено только исходниками. Также необходимо исключить лишние permissive policies и сверить применённые миграции.

План проверки:
- Создать тесты для двух пользователей A и B.
- Убедиться, что A не может select/update/delete строки B и не может insert строку с user_id = B.
- Проверить фактические политики и права ролей в Supabase.
- Проверить ограничения ai_target/category на серверной стороне, если поля должны быть enum-like.

#### P1-5. Переиспользуемый draft key в PromptDetailPanel — VERIFY / вероятный дефект
Файл: src/components/PromptDetailPanel.tsx.

Редактор из PromptDetailPanel открывается без явного draftKey, поэтому используется резервный ключ CreatePromptModal, формируемый по initialTitle. Две записи с одинаковым исходным заголовком могут разделить ключ черновика, потенциально приводя к восстановлению черновика не той записи.

Предлагаемое исправление:
- Передавать draftKey, основанный на ID промпта, например draft:edit-<promptId>.
- Добавить тест/ручной сценарий с двумя промптами с одинаковым заголовком.
- Проверить, что черновики новых и редактируемых записей изолированы между собой и пользователями.

#### P1-6. Проверка уязвимостей зависимостей — TODO (CI warning)

Источник: npm ci в GitHub Actions run https://github.com/Mardakhay/mardakhay-labs/actions/runs/38526201734 от 14 октября 2026.

Установка зависимостей сообщила о 12 уязвимостях по результатам аудита 213 пакетов: 1 low, 4 moderate, 7 high. Пока проверена только сводка из лога; конкретные advisories, затронутые пакеты и применимость к production отдельно не исследовались. Не запускать npm audit fix вслепую.

План:
- Получить подробности через npm audit и определить затронутые прямые/транзитивные зависимости.
- Разделить production и dev dependency impact, изучить доступные безопасные версии.
- Вносить только понятные обновления и повторно запустить test/lint/build.

### P2 — зрелость кода, UX, производительность

#### P2-1. Крупные компоненты — IMPROVEMENT
На момент обзора PromptsPage.tsx около 24 KB, CreatePromptModal.tsx около 16.8 KB, LoginPage.tsx около 15.6 KB. PromptsPage совмещает фильтры, selection, import/export, bulk actions и переименование тегов.

Рекомендация: выносить независимую логику в custom hooks и модули только там, где это упрощает тестирование/поддержку. Не делать большой рефакторинг ради уменьшения файла любой ценой.

Возможные части: usePromptFilters, usePromptSelection, import/export handlers, bulk actions, URL-driven prompt detail state.

#### P2-2. Доступность модальных окон — VERIFY
CreatePromptModal имеет focus trap и возврат фокуса; PromptDetailPanel ставит фокус на кнопку закрытия, но не имеет эквивалентной полноценной обработки Tab/Shift+Tab в просмотренном коде.

Проверить keyboard-only сценарии, поведение screen reader, aria-live для статусов операций и связь ошибок формы с полями.

#### P2-3. Немедленный revokeObjectURL — IMPROVEMENT / VERIFY
Файл: src/lib/promptExport.ts, downloadTextFile.

URL.revokeObjectURL(url) вызывается сразу после link.click(). Лучше проверить кроссбраузерное поведение и при необходимости отложить очистку до завершения запуска загрузки. Считать это низкоприоритетным до подтверждения проблемой в реальном браузере.

#### P2-4. Performance не измерялась — TODO
Нет измерений bundle size, Lighthouse, Core Web Vitals, React Profiler или списка из тысяч промптов. Не делать утверждений о реальной производительности до измерения.

#### P2-5. Репозиторий содержит пустые файлы git и npm — VERIFY / cleanup
В дереве на проверенном commit присутствуют пустые файлы в корне с именами git и npm. Уточнить, не являются ли они намеренными; если нет — удалить.

#### P2-6. README / портфолио — IMPROVEMENT
Добавить screenshots, короткую демонстрацию workflow, архитектурные решения и ограничения. Объяснить, почему TanStack Query используется для серверных данных, Zustand — для auth/notifications, а localStorage — только для локальных не критичных данных.

## 6. Тесты и CI: текущее состояние

Подтверждённые unit-test файлы:
- src/lib/__tests__/activityLog.test.ts
- src/lib/__tests__/authUtils.test.ts
- src/lib/__tests__/promptCache.test.ts
- src/lib/__tests__/promptExport.test.ts
- src/lib/__tests__/promptFormatting.test.ts
- src/lib/__tests__/promptMetadata.test.ts

CI из .github/workflows/ci.yml запускает:
1. npm ci
2. npm test
3. npm run lint
4. npm run build

Последний просмотренный CI run для main был успешен 12 октября 2026: https://github.com/Mardakhay/mardakhay-labs/actions/runs/38237975159. Это подтверждает прохождение существующего pipeline на том commit, но не полное покрытие сценариев.

Недостающие тесты с высокой ценностью:
- import validation и export/import round-trip;
- размер файла и лимит 500 импортируемых записей;
- мутации: success/error/rollback/race;
- auth initialization, logout и смена аккаунта;
- RLS изоляция двух тестовых пользователей;
- E2E workflow create → search → edit → favorite → delete;
- обновление service worker/offline;
- keyboard navigation и доступность.

## 7. Roadmap

### Milestone 1 — Data import correctness (P0)
- [x] Runtime validation для aiTarget/category и типов полей.
- [x] Определён контракт для hashtags/isFavorite/createdAt при импорте.
- [x] Лимит размера файла 5 MiB до чтения и лимит 500 записей.
- [x] Unit-тесты ошибок, метаданных, round-trip и лимитов; обновлены backup docs.
- [x] GitHub Actions CI прошёл: npm test, npm run lint, npm run build (проверенная revision 8e77d0d8c683da5b52573efa443d6904a84396f8).

### Milestone 2 — State and auth reliability (P1)
- [ ] Тесты optimistic rollback при конкурирующих мутациях.
- [ ] Тесты восстановления сессии, logout и смены пользователя.
- [ ] Исправить обнаруженные проблемы, если тесты воспроизводят их.
- [ ] Убедиться, что query cache не раскрывает данные между аккаунтами.

### Milestone 3 — Backend security verification (P1)
- [ ] Проверить фактические production RLS policies и роли.
- [ ] Протестировать A/B изоляцию.
- [ ] Сверить production schema и migrations.
- [ ] Проверить валидацию metadata на сервере.

### Milestone 4 — PWA and UI quality (P1/P2)
- [ ] Проверить update/offline поведение Service Worker.
- [ ] Пройти пользовательские сценарии клавиатурой.
- [ ] Проверить модальные окна, focus return, live announcements.
- [ ] Подтвердить, нужен ли рефакторинг крупных компонентов.

### Milestone 5 — Portfolio polish (P2)
- [ ] Скриншоты ключевых страниц.
- [ ] Архитектурный раздел в README.
- [ ] Измерить bundle size и Lighthouse.
- [ ] E2E-тест основного workflow.
- [ ] Удалить пустые артефакты git/npm, если они не нужны.

### Milestone 6 — Dependency hygiene (P1)
- [ ] Изучить детали 12 предупреждений npm audit (1 low, 4 moderate, 7 high).
- [ ] Определить безопасные обновления без blind npm audit fix.
- [ ] Повторно пройти test/lint/build после выбранных обновлений.

## 8. Definition of Done для исправлений

Каждую исправленную проблему сопровождать:
1. Тестом, который воспроизводит исходную проблему или фиксирует контракт.
2. Изменением кода с минимальным необходимым объёмом.
3. Успешным npm test, npm run lint и npm run build (или отметить, что команды не запускались).
4. Отметкой в разделе roadmap и краткой записью в журнале изменений ниже.
5. Проверкой связанных сценариев, чтобы не создавать регрессию.

Не менять статус замечания на «исправлено» только на основании изменения кода — подтвердить проверкой.

## 9. Журнал изменений документа

- 2026-10-14 — добавлен первичный handoff-контекст на основании статического обзора репозитория на commit 23da25415481c51dd7b0c5491f4266b504b54076.
- 2026-10-14 — реализованы runtime-валидация JSON import, восстановление favorite state, limits (500 prompts / 5 MiB), unit-тесты и обновлена backup-документация. CI: success для проверенной revision 8e77d0d8c683da5b52573efa443d6904a84396f8 — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38526090535.
- 2026-10-14 — последний CI успешно прошёл тесты, lint и build; npm ci сообщил о 12 уязвимостях зависимостей (1 low, 4 moderate, 7 high). Подробный triage добавлен в P1-6 / Milestone 6.
- При каждой следующей итерации добавлять дату, commit SHA, выполненные изменения, результаты тестов и оставшиеся риски.

## 10. Инструкция для нового чата

Перед началом работы прочитать этот документ и актуальный код соответствующих файлов. Учитывать, что статусы и commit SHA в документе могут устареть. Проверять текущую ветку и последний commit, не предполагать, что roadmap уже выполнен.

Рекомендуемый следующий конкретный шаг после подтверждения Milestone 1: перейти к P1-1 — написать тест на конкурирующие optimistic mutations, проверить rollback и исправить только если сценарий воспроизводится.

При продолжении аудита:
- Отделять подтверждённые баги от непроверенных рисков.
- Не утверждать, что production Supabase/PWA/UX проверены без отдельной проверки.
- После исправлений обновлять checklist и журнал изменений.
- Не помещать реальные секреты, токены, service-role keys или приватные backup данные в документацию.
