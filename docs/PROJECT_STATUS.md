# Project Status — Mardakhay Labs

> **Назначение документа:** единый handoff-контекст для будущих чатов и следующих итераций разработки. Здесь собраны текущее состояние проекта, архитектура, результаты статического аудита, риски, план исправлений и правила обновления документа.
>
> **Язык:** русский.  
> **Последний обзор исходников:** 14 октября 2026.  
> **Последняя проверенная версия исходников:** ветка `main`, commit `60d8cd9fa64bc843b8c7cd96162d9c2bd72c4358` (14 октября 2026; CI для этой ревизии прошёл успешно).  
> **Статус:** базовый статический аудит выполнен; предложенный roadmap ещё не означает, что исправления сделаны.

## 1. Краткий контекст

Mardakhay Labs — SPA/PWA для хранения, организации и повторного использования AI-промптов. Поддерживает регистрацию и вход, Google OAuth, CRUD промптов, категории, AI target, хештеги, избранное, поиск и фильтры, массовые операции, JSON/Markdown import/export, шаблоны, сохранение черновиков, командную палитру и историю активности.

- Репозиторий: https://github.com/Mardakhay/mardakhay-labs
- Production/demo URL из метаданных репозитория: https://mardakhay-labs.xyz
- Основная документация: README.md и docs/BACKUP_AND_RESTORE.md
- Последний просмотренный source commit: 60d8cd9fa64bc843b8c7cd96162d9c2bd72c4358.
- Последний проверенный CI для изменённых исходников: https://github.com/Mardakhay/mardakhay-labs/actions/runs/38532531349 — 10 test files, 67 tests, lint и production build прошли 14 октября 2026.

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

#### P1-1. Конкурирующий optimistic rollback — FIXED (CI passed)
Файлы: src/hooks/usePromptMutations.ts, src/lib/promptCache.ts, src/lib/__tests__/promptCache.test.ts.

Update/favorite теперь откатывают только конкретную запись и только если текущая запись всё ещё совпадает по ссылке с оптимистичной версией этой мутации. Позднее завершившееся изменение той же записи не будет перезаписано rollback старой мутации, а изменения других промптов сохраняются.

Delete откатывает весь snapshot только если кеш не был изменён после операции удаления. При более поздней записи snapshot пропускается, а серверное состояние должно быть сверено существующей invalidation в onSettled.

Добавлены регрессионные unit-тесты:
- rollback одной записи сохраняет успешное изменение другой;
- rollback не затирает более новую версию той же записи;
- вложенные неуспешные optimistic updates могут откатываться в обратном порядке;
- snapshot удаления восстанавливается только если в кеш не записали более новое состояние.

GitHub Actions CI passed: test, lint and build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38527372012.

#### P1-2. Инициализация сессии и auth state listener — FIXED (CI passed)
Файлы: src/App.tsx, src/lib/authSession.ts, src/lib/__tests__/authSession.test.ts.

Auth listener теперь подключается до восстановления сессии. Результат getSession применяется только если с момента начала восстановления не пришло более новое auth-событие; поздний результат или ошибка не могут перезаписать logout, быстрый login или переключение аккаунта. Событие auth state снимает loading сразу, а cleanup эффекта блокирует обновления после unsubscribe.

При logout и смене user id удаляется кеш промптов. Повторные события того же пользователя не очищают его кеш, а ключи запросов промптов по-прежнему включают user id.

Добавлены unit-тесты восстановления сессии, logout, быстрого login, смены аккаунта, подавления устаревшей ошибки, cleanup и правил очистки кеша.

GitHub Actions CI passed на implementation revision `02fadb757fbcba29af704ab89b6285f2b00a9b00`: test, lint и production build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38528032073. Последующее amend-обновление касается только этого документа; auth-код и тесты не изменены.

#### P1-3. PWA cache / update strategy — IMPLEMENTED (unit tests passed; browser QA pending)
Файлы: public/sw.js, src/lib/__tests__/serviceWorker.test.ts.

Service worker использует network-first для навигации и кеширует /index.html только при успешном ответе. При офлайне навигация получает сохранённую app shell. Runtime-кеш ограничен app shell, статическими публичными ресурсами и Vite /assets/ hashed assets; произвольные same-origin GET/API и cross-origin запросы не перехватываются. Кеширующие записи выполняются в event.waitUntil, поэтому worker дожидается сохранения ответа. Ответы 4xx/5xx не подменяют хорошие кешированные данные.

При активации удаляются только устаревшие кеши с собственным префиксом mardakhay-labs-, а не все кеши на origin. Версия кеша поднята до v3. Убраны немедленные skipWaiting()/clients.claim(): новая версия не перехватывает работающие вкладки с кодом предыдущей версии, а ждёт завершения старых clients.

Vitest проверяет network-first/offline fallback, отказ от кеширования серверных ошибок, static asset fallback, обход dynamic/API и cross-origin запросов, POST и безопасное удаление старых кешей. GitHub Actions CI passed: 8 test files, 59 tests, lint и production build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38528975884. Реальная проверка двух production deploys/браузерного offline ещё не выполнялась; это остаётся отдельным QA-пунктом.

#### P1-4. RLS, привилегии и server-side metadata — FIXED (live checks passed; two follow-ups remain)
Файлы: supabase/schema.sql, migrations 20260927185548_harden_prompts_rls.sql, 20261014074235_harden_prompts_grants_and_owner_integrity.sql, 20261014074431_enforce_prompt_metadata_values.sql, supabase/tests/prompts_security.test.sql.

Фактическая проверка подключённого Supabase-проекта подтвердила: RLS включён, существует ровно четыре политики SELECT/INSERT/UPDATE/DELETE, каждая только для authenticated; SELECT/DELETE проверяют владение через auth.uid() = user_id, INSERT применяет тот же критерий в WITH CHECK, UPDATE — одновременно в USING и WITH CHECK. Функция set_updated_at() не SECURITY DEFINER и имеет фиксированный search_path.

До hardening роль anon имела прямые права на все основные операции таблицы, включая TRUNCATE/trigger/sequence privileges. RLS-политики ограничивали строки, но grants нарушали принцип наименьших привилегий. Исправление применено в live БД: anon лишена прав на prompts и identity sequence; authenticated оставлены только CRUD и USAGE identity sequence.

У production prompts было семь строк, ноль строк с NULL user_id, orphaned user_id или NULL в обязательных title/content/is_favorite. При этом user_id фактически допускал NULL и не имел FK на auth.users; id был GENERATED BY DEFAULT. Добавлены NOT NULL, GENERATED ALWAYS и FK ON DELETE CASCADE. Текущие metadata значения не содержали невалидных вариантов; добавлены DB CHECK constraints для допустимых ai_target/category.

Runtime-проверка с JWT-контекстом владельца увидела только принадлежащие ему семь записей; произвольный другой UUID не увидел ни одной. Catalog security checks добавлены в supabase/tests/prompts_security.test.sql и выполнены на подключённой БД без изменения пользовательских данных.

Сверена история миграций: два локальных filename не совпадали с version IDs в production history. Файлы выровнены по remote versions; новые migrations 20261014074235 и 20261014074431 совпадают с версиями, уже зарегистрированными в live БД.

Оставшийся schema drift: created_at в production имеет тип timestamp without time zone, тогда как schema.sql задаёт timestamptz. Тип не менялся автоматически, так как это может переинтерпретировать исторические timestamps без подтверждённой исходной timezone. Supabase Security Advisor также сообщает Leaked Password Protection Disabled; эту Auth-настройку необходимо включить в Dashboard отдельно.

#### P1-5. Переиспользуемый draft key в PromptDetailPanel — FIXED (CI passed)
Файлы: src/components/PromptDetailPanel.tsx, src/components/CreatePromptModal.tsx, src/lib/storageKeys.ts, src/lib/__tests__/storageKeys.test.ts.

Редактор режима edit теперь использует ключ `draft:edit:promptId:userId`, основанный на ID записи и user_id владельца. Это устраняет коллизии промптов с одинаковым заголовком и разделяет данные между пользователями. Ключ черновика включён в React key компонента PromptEditorModal, поэтому при смене записи или draft key редактор перемонтируется и не переносит старое состояние на другую запись.

Добавлены три unit-теста: ключ включает ID записи/владельца, разные prompt IDs не совпадают, один prompt ID у разных пользователей даёт разные ключи. GitHub Actions CI passed: 9 test files, 62 tests, lint и production build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38531669226.

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

#### P2-2. Доступность модальных окон — IN PROGRESS (unit tests + CI passed)
PromptDetailPanel теперь ограничивает Tab/Shift+Tab внутри detail-диалога, ставит начальный фокус на кнопку закрытия и возвращает фокус инициатору после закрытия. Для вложенного edit-диалога внешний обработчик не перехватывает фокус и Escape; редактор продолжает владеть собственным focus trap. Логика границ фокуса общая для двух модалок и покрыта пятью unit-тестами.

CI для source commit `60d8cd9fa64bc843b8c7cd96162d9c2bd72c4358` прошёл: 10 test files, 67 tests, lint и production build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38532531349.

Остаётся ручной keyboard-only QA в браузере, проверка screen reader/live announcements и проверка связей label/error для полей формы. Эти сценарии не считаются закрытыми только по результатам unit-тестов.

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
- src/lib/__tests__/authSession.test.ts
- src/lib/__tests__/authUtils.test.ts
- src/lib/__tests__/focusTrap.test.ts
- src/lib/__tests__/promptCache.test.ts
- src/lib/__tests__/promptExport.test.ts
- src/lib/__tests__/promptFormatting.test.ts
- src/lib/__tests__/promptMetadata.test.ts
- src/lib/__tests__/serviceWorker.test.ts
- src/lib/__tests__/storageKeys.test.ts
- supabase/tests/prompts_security.test.sql (read-only catalog/security assertions; separate from npm test)

CI из .github/workflows/ci.yml запускает:
1. npm ci
2. npm test
3. npm run lint
4. npm run build

Последний проверенный CI run для изменённых исходников: https://github.com/Mardakhay/mardakhay-labs/actions/runs/38530663519 — 8 test files, 59 tests, lint и production build прошли успешно. Это подтверждает прохождение существующего pipeline на этой ревизии, но не заменяет полный browser/E2E QA.

Недостающие тесты с высокой ценностью:
- import validation и export/import round-trip;
- размер файла и лимит 500 импортируемых записей;
- мутации: success/error/rollback/race;
- auth initialization, logout и смена аккаунта;
- RLS изоляция двух тестовых пользователей;
- E2E workflow create → search → edit → favorite → delete;
- проверка update service worker/offline в реальном браузере между deploys;
- keyboard navigation и доступность.

## 7. Roadmap

### Milestone 1 — Data import correctness (P0)
- [x] Runtime validation для aiTarget/category и типов полей.
- [x] Определён контракт для hashtags/isFavorite/createdAt при импорте.
- [x] Лимит размера файла 5 MiB до чтения и лимит 500 записей.
- [x] Unit-тесты ошибок, метаданных, round-trip и лимитов; обновлены backup docs.
- [x] GitHub Actions CI прошёл: npm test, npm run lint, npm run build (проверенная revision 8e77d0d8c683da5b52573efa443d6904a84396f8).

### Milestone 2 — State and auth reliability (P1)
- [x] Добавлены регрессионные тесты optimistic rollback при конкурирующих мутациях.
- [x] Исправлен конфликт rollback для update/favorite/delete.
- [x] GitHub Actions CI passed: test/lint/build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38527372012.
- [x] Тесты восстановления сессии, logout, быстрого login и переключения аккаунта.
- [x] Кеш промптов очищается при logout/смене user id; query keys включают user id.
- [x] GitHub Actions CI passed: test/lint/build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38528032073.
- [x] Edit draft key изолирован по prompt ID и user ID; редактор перемонтируется при смене ключа.

### Milestone 3 — Backend security verification (P1)
- [x] Проверить фактические production RLS policies и роли; убрать лишние anon grants и сузить права authenticated до CRUD.
- [x] Проверить A/B read isolation: владелец видит свои строки, произвольный другой UUID — 0 строк.
- [x] Сверить production schema и migrations, выровнять file versions с remote migration history; добавить FK и NOT NULL.
- [x] Включить серверную проверку metadata через DB CHECK constraints.
- [ ] Включить Leaked Password Protection в Supabase Auth Dashboard (Security Advisor warning).
- [ ] Согласовать timezone created_at и безопасно мигрировать тип к timestamptz.

### Milestone 4 — PWA and UI quality (P1/P2)
- [x] Добавлены unit-тесты network-first/offline fallback, runtime asset cache, API bypass и безопасной очистки кешей.
- [x] GitHub Actions CI passed: 8 test files, 59 tests, lint/build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38528975884.
- [ ] Проверить в реальном браузере update/offline между двумя production deploys с разными asset hashes.
- [x] Добавлен общий focus-trap helper для detail/editor modal: Tab/Shift+Tab boundary handling и 5 unit-тестов; CI passed (10 test files, 67 tests, lint/build) — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38532531349.
- [ ] Ручной keyboard-only QA пользовательских сценариев в реальном браузере.
- [ ] Проверить screen reader/live announcements и связи label/error для полей.
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
- 2026-10-14 — реализован точечный rollback для optimistic update/favorite и безопасный snapshot rollback для delete; добавлены регрессионные тесты. CI passed для implementation commit 38a6b72990f80f1f26a8471ace49cda80875149d: 6 test files passed, lint passed, production build passed — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38527372012.
- 2026-10-14 — инициализация auth переведена на version-guard для защиты от устаревшего getSession(), кеш промптов очищается при смене пользователя; добавлены 9 регрессионных тестов. CI passed для implementation revision `02fadb757fbcba29af704ab89b6285f2b00a9b00` (test/lint/build) — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38528032073.
- 2026-10-14 — обновлена cache/update policy Service Worker: runtime cache только для shell/assets, обработка cache writes через waitUntil, cleanup scoped по cache prefix, обновления не перехватывают вкладки принудительно; добавлены regression tests. CI passed для implementation revision `770cb35088c9625436f618995e8d9dbe4a31ad14` (8 test files, 59 tests, lint/build) — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38528975884. Реальный браузерный QA остаётся открытым.
- 2026-10-14 — проверен live Supabase backend: RLS owner/A-vs-B read isolation подтверждена; отозваны лишние grants anon/authenticated, добавлены owner NOT NULL/FK/cascade, GENERATED ALWAYS и metadata CHECK constraints. Добавлен SQL catalog security test, migration filenames выровнены по production versions. Supabase advisor: leaked-password protection отключена; created_at timezone/type drift оставлен для отдельного решения.
- 2026-10-14 — edit draft key изолирован по prompt ID и owner user ID; добавлены три storage key unit-теста. GitHub Actions CI passed (9 test files, 62 tests, lint/build) — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38531669226.
- 2026-10-14 — в PromptDetailPanel добавлен focus trap для Tab/Shift+Tab, возврат фокуса на инициатор и защита вложенного edit-диалога от внешнего Escape handler; общий helper покрыт пятью unit-тестами. CI passed для source commit `60d8cd9fa64bc843b8c7cd96162d9c2bd72c4358`: 10 test files, 67 tests, lint/build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38532531349. Ручная keyboard-only и screen-reader проверка остаётся открытой.
- При каждой следующей итерации добавлять дату, commit SHA, выполненные изменения, результаты тестов и оставшиеся риски.

## 10. Инструкция для нового чата

Перед началом работы прочитать этот документ и актуальный код соответствующих файлов. Учитывать, что статусы и commit SHA в документе могут устареть. Проверять текущую ветку и последний commit, не предполагать, что roadmap уже выполнен.

Следующая задача: пройти ручной keyboard-only QA и проверить screen reader/live announcements для модальных окон. Параллельно не забыть ручные Supabase follow-ups Milestone 3: включить Leaked Password Protection в Auth Dashboard и согласовать исходную timezone для created_at; тип не менять без этого решения.

При продолжении аудита:
- Отделять подтверждённые баги от непроверенных рисков.
- Не утверждать, что production Supabase/PWA/UX проверены без отдельной проверки.
- После исправлений обновлять checklist и журнал изменений.
- Не помещать реальные секреты, токены, service-role keys или приватные backup данные в документацию.
