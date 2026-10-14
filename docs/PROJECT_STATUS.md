# Project Status — Mardakhay Labs

> **Назначение документа:** единый handoff-контекст для будущих чатов и следующих итераций разработки. Здесь собраны текущее состояние проекта, архитектура, результаты статического аудита, риски, план исправлений и правила обновления документа.
>
> **Язык:** русский.  
> **Последний обзор исходников:** 14 октября 2026.  
> **Последняя проверенная версия приложения:** production deploy с исправленным precache/activation Service Worker v6 на commit `80db9d1320c27d794142662e455aa174a93bebea` (14 октября 2026; CI test/lint/build passed; Vercel READY; браузерный Offline + Reload ещё требует проверки).  
> **Статус:** базовый статический аудит выполнен; предложенный roadmap ещё не означает, что исправления сделаны.

## 1. Краткий контекст

Mardakhay Labs — SPA/PWA для хранения, организации и повторного использования AI-промптов. Поддерживает регистрацию и вход, Google OAuth, CRUD промптов, категории, AI target, хештеги, избранное, поиск и фильтры, массовые операции, JSON/Markdown import/export, шаблоны, сохранение черновиков, командную палитру и историю активности.

- Репозиторий: https://github.com/Mardakhay/mardakhay-labs
- Production/demo URL из метаданных репозитория: https://mardakhay-labs.xyz
- Основная документация: README.md и docs/BACKUP_AND_RESTORE.md
- Последний проверенный source commit приложения: `80db9d1320c27d794142662e455aa174a93bebea` (`test(pwa): align cache test with worker v6`). CI test/lint/build passed: https://github.com/Mardakhay/mardakhay-labs/actions/runs/38546100293. Vercel production deploy READY: https://vercel.com/mardakhay/mardakhay-labs/DGUnkS51VPo6U6CaiggWoMgJaQa1. Исправлен SPA fallback, прямые запросы `/prompts`, `/favorites`, `/settings` и `/login` отвечают HTTP 200. Service Worker v5 precache всех bundle assets и auto-activates после успешной загрузки ресурсов; в live production `/` ссылается на `/assets/index-D_8ttvBx.js` и `/assets/index-C56v1fy9.css`, `/sw.js` указывает `mardakhay-labs-v5`, а `/asset-manifest.json` содержит 19 assets (18 JS и 1 CSS), все файлы проверены с HTTP 200. Визуальная проверка настоящего offline reload всё ещё открыта.

### Текущая общая оценка

Это содержательный solo-проект для портфолио: кроме UI, в нём есть аутентификация, PostgreSQL/Supabase, RLS, кеширование серверного состояния, optimistic updates, миграции, тесты и CI. Основные найденные риски P0/P1 закрыты; следующие приоритеты — реальный PWA offline/update QA в одном origin, ручная проверка мобильного layout Prompts и безопасное решение оставшегося schema drift по `created_at`.

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

#### P1-3. PWA cache / update strategy — IMPLEMENTED (v6 bundle precache + activation deployed; CI passed; browser QA pending)
Файлы: public/sw.js, src/lib/__tests__/serviceWorker.test.ts.

Service worker использует network-first для навигации и кеширует /index.html только при успешном ответе. При офлайне навигация получает сохранённую app shell. Runtime-кеш ограничен app shell, статическими публичными ресурсами и Vite /assets/ hashed assets; произвольные same-origin GET/API и cross-origin запросы не перехватываются. Кеширующие записи выполняются в event.waitUntil, поэтому worker дожидается сохранения ответа. Ответы 4xx/5xx не подменяют хорошие кешированные данные.

При активации удаляются только устаревшие кеши с собственным префиксом `mardakhay-labs-`, а не все кеши на origin. Ранний worker не форсировал `skipWaiting()`/`clients.claim()`, чтобы не перехватывать вкладки со старым кодом. После подтверждённого белого экрана при Offline лог показал запросы к старым bundle hashes `index-CZ_t4BuF.js` и `index-gZ6DVxhW.css`, отсутствующим в актуальном build manifest: зарегистрированный новый кеш сам по себе не гарантировал, что навигацией уже управляет новый worker и актуальный app shell.

Service Worker поднят до `mardakhay-labs-v6`: install сначала успешно precache-ит app shell, manifest и все собранные JS/CSS/assets, включая lazy chunks; только после этого вызывает `skipWaiting()`. Activate удаляет принадлежащие приложению старые кеши, затем вызывает `clients.claim()`, выравнивая worker и кеш после обновления. В первом варианте install handler ошибочно вызывал результат `.then(...)` как функцию (`})()`), из-за чего возникал `TypeError: caches.open(...).then(...) is not a function` и worker не мог установиться. Исправлено на обычное завершение callback без лишнего вызова. После правки имени кеша на v6 CI сначала упал из-за оставшегося ожидания v5 в unit-тесте; тестовый `CACHE_NAME` синхронизирован с production worker, после чего test/lint/build прошли. Production offline reload всё ещё нужно проверить вручную.

Vitest проверяет network-first/offline fallback, отказ от кеширования серверных ошибок, precache JS/CSS/static assets/dynamic route chunks, обход dynamic/API и cross-origin запросов, POST и безопасное удаление старых кешей. Для исправленного install flow CI прошёл полностью на commit `80db9d1320c27d794142662e455aa174a93bebea`: Test, Lint, Build success — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38546100293.

Сверены доступные production build artifacts через Vercel: deploy на commit `02fadb757fbcba29af704ab89b6285f2b00a9b00` отдаёт Service Worker `mardakhay-labs-v2` и JS/CSS `index-DUJJj--l.js` / `index-DIdzy30v.css`; deploy на `586dc5b20bfd0565ab88419451e3e173a55d5ea3` отдаёт `mardakhay-labs-v3` и `index-DAH9byiE.js` / `index-gZ6DVxhW.css`; deploy на `829d8d846fb2f7b4d92a8dfc55054de039fb1dcd` отдавал `v3` и `index-BGEm4IeJ.js` / `index-BtE6VKe8.css`. Эти deploy-specific URLs имеют разные origins и сами по себе не доказывают update/offline flow в одном браузере.

После пользовательского воспроизведения белого экрана в Chrome Offline повторный разбор `public/sw.js` выявил слабое место: install precache содержал HTML, manifest PWA и иконки, но не compiled JS/CSS; runtime cache заполнялся только после запросов, управляемых SW. При fallback HTML без закешированного entry bundle либо lazy route chunk приложение может остаться пустым.

Первое исправление отправлено в `main`: Vite генерирует корневой `asset-manifest.json`; SW v4 читает manifest и precache-ит все bundle-файлы, включая lazy-loaded chunks. После того как пользователь увидел запросы к старым hashes (`index-CZ_t4BuF.js`, `index-gZ6DVxhW.css`), включили v5 auto-activation. Ошибка `caches.open(...).then(...) is not a function` возникла из-за случайного `()` после `.then(async ...)`, пытавшегося вызвать Promise как функцию. В commit `7a3a4ee8e3012f3bf49f76809ccc71974f2975be` это исправили и подняли кеш до v6; его CI всё ещё упал, потому что unit-тест ожидал `mardakhay-labs-v5`. Commit `80db9d1320c27d794142662e455aa174a93bebea` синхронизировал константу теста с v6; CI Test/Lint/Build прошёл: https://github.com/Mardakhay/mardakhay-labs/actions/runs/38546100293. Production deploy READY: https://vercel.com/mardakhay/mardakhay-labs/DGUnkS51VPo6U6CaiggWoMgJaQa1. Live root использует актуальные `/assets/index-D_8ttvBx.js` и `/assets/index-C56v1fy9.css`; manifest содержит 19 assets и все 19 URL отвечают HTTP 200; live `/sw.js` отдаёт v6. Реальный Offline + Reload в браузере ещё не подтверждён.

#### P1-4. RLS, привилегии и server-side metadata — FIXED (live checks passed; two follow-ups remain)
Файлы: supabase/schema.sql, migrations 20260927185548_harden_prompts_rls.sql, 20261014074235_harden_prompts_grants_and_owner_integrity.sql, 20261014074431_enforce_prompt_metadata_values.sql, supabase/tests/prompts_security.test.sql.

Фактическая проверка подключённого Supabase-проекта подтвердила: RLS включён, существует ровно четыре политики SELECT/INSERT/UPDATE/DELETE, каждая только для authenticated; SELECT/DELETE проверяют владение через auth.uid() = user_id, INSERT применяет тот же критерий в WITH CHECK, UPDATE — одновременно в USING и WITH CHECK. Функция set_updated_at() не SECURITY DEFINER и имеет фиксированный search_path.

До hardening роль anon имела прямые права на все основные операции таблицы, включая TRUNCATE/trigger/sequence privileges. RLS-политики ограничивали строки, но grants нарушали принцип наименьших привилегий. Исправление применено в live БД: anon лишена прав на prompts и identity sequence; authenticated оставлены только CRUD и USAGE identity sequence.

У production prompts было семь строк, ноль строк с NULL user_id, orphaned user_id или NULL в обязательных title/content/is_favorite. При этом user_id фактически допускал NULL и не имел FK на auth.users; id был GENERATED BY DEFAULT. Добавлены NOT NULL, GENERATED ALWAYS и FK ON DELETE CASCADE. Текущие metadata значения не содержали невалидных вариантов; добавлены DB CHECK constraints для допустимых ai_target/category.

Runtime-проверка с JWT-контекстом владельца увидела только принадлежащие ему семь записей; произвольный другой UUID не увидел ни одной. Catalog security checks добавлены в supabase/tests/prompts_security.test.sql и выполнены на подключённой БД без изменения пользовательских данных.

Сверена история миграций: два локальных filename не совпадали с version IDs в production history. Файлы выровнены по remote versions; новые migrations 20261014074235 и 20261014074431 совпадают с версиями, уже зарегистрированными в live БД.

Оставшийся schema drift: created_at в production имеет тип timestamp without time zone, тогда как schema.sql задаёт timestamptz. Тип не менялся автоматически, так как это может переинтерпретировать исторические timestamps без подтверждённой исходной timezone. Supabase Auth сообщил, что Leaked Password Protection через HaveIBeenPwned.org доступна только на Pro и выше; попытка включить настройку на текущем плане завершилась отказом. Это plan limitation, а не ошибка конфигурации. Если не планируем апгрейд, оставить пункт как optional hardening и проверить доступные настройки минимальной длины и сложности пароля.

#### P1-5. Переиспользуемый draft key в PromptDetailPanel — FIXED (CI passed)
Файлы: src/components/PromptDetailPanel.tsx, src/components/CreatePromptModal.tsx, src/lib/storageKeys.ts, src/lib/__tests__/storageKeys.test.ts.

Редактор режима edit теперь использует ключ `draft:edit:promptId:userId`, основанный на ID записи и user_id владельца. Это устраняет коллизии промптов с одинаковым заголовком и разделяет данные между пользователями. Ключ черновика включён в React key компонента PromptEditorModal, поэтому при смене записи или draft key редактор перемонтируется и не переносит старое состояние на другую запись.

Добавлены три unit-теста: ключ включает ID записи/владельца, разные prompt IDs не совпадают, один prompt ID у разных пользователей даёт разные ключи. GitHub Actions CI passed: 9 test files, 62 tests, lint и production build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38531669226.

#### P1-6. Проверка уязвимостей зависимостей — FIXED (npm audit = 0; CI validation passed)

Первичный npm audit нашёл 12 уязвимых package groups: 1 low, 4 moderate, 7 high, 0 critical. Из direct production dependencies были затронуты `react-router` / `react-router-dom`; прочие затронутые пакеты были dev/tooling или транзитивными: Babel, Vitest/@vitest/mocker, Vite, PostCSS, brace-expansion, Browserslist, nanoid, source-map-js и browser mapping metadata.

Исправление выполнено через `npm audit fix` без `--force`, без изменения `package.json` и без перехода на major-версии. Обновлён только `package-lock.json` (71 package entry изменён/добавлен/удалён). Основные версии: react-router/react-router-dom 7.15.1 → 7.18.4, Vite 8.0.13 → 8.3.4, Vitest 4.1.8 → 4.1.11; также обновлены уязвимые транзитивные зависимости.

После обновления `npm audit` вернул 0 low/moderate/high/critical vulnerabilities. На обновлённом lockfile прошли test, lint и production build в GitHub Actions run https://github.com/Mardakhay/mardakhay-labs/actions/runs/38536000606. Отдельный PR CI на основной конфигурации репозитория должен подтвердить установку lockfile и build.

Добавлен постоянный workflow `.github/workflows/dependency-audit.yml`: он выполняет npm audit при изменениях manifest/lockfile, раз в неделю и по ручному запуску; полный JSON отчёт прикладывается artifact на 14 дней.

### P2 — зрелость кода, UX, производительность

#### P2-1. Крупные компоненты — IMPROVEMENT
На момент обзора PromptsPage.tsx около 24 KB, CreatePromptModal.tsx около 16.8 KB, LoginPage.tsx около 15.6 KB. PromptsPage совмещает фильтры, selection, import/export, bulk actions и переименование тегов.

Рекомендация: выносить независимую логику в custom hooks и модули только там, где это упрощает тестирование/поддержку. Не делать большой рефакторинг ради уменьшения файла любой ценой.

Возможные части: usePromptFilters, usePromptSelection, import/export handlers, bulk actions, URL-driven prompt detail state.

#### P2-2. Доступность модальных окон — IN PROGRESS (code fixes + CI passed)
PromptDetailPanel удерживает Tab/Shift+Tab внутри detail-диалога и возвращает фокус инициатору после закрытия; вложенный editor сохраняет собственный focus trap и обработку Escape. В CreatePromptModal исправлены связи label/input для заголовка и содержимого. Пустой/пробельный prompt content теперь даёт объявляемую ошибку, textarea получает `aria-invalid` и `aria-describedby`, а фокус перемещается к полю с ошибкой. Уведомления стали atomic, копирование email объявляет статус, favorite control сообщает `aria-pressed`, dropdown trigger имеет контекстное доступное имя и при открытии фокусирует выбранный пункт. Escape в dropdown закрывает сначала меню, не весь родительский диалог. ID у ConfirmModal теперь уникальны между экземплярами.

Добавлены 3 unit-теста в `src/lib/__tests__/promptValidation.test.ts`. CI для source commit `31639b2ce7b629f947455a6a490a2d409b894a6c` прошёл: 11 test files, 70 tests, lint и production build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38534253393.

Ручная проверка пользователя подтвердила корректную работу Tab/Shift+Tab. Реальная проверка screen reader ещё открыта: необходимо проверить озвучивание имени диалога/полей, ошибку при пустом содержимом, успех копирования email и сообщения об операциях. Автоматический CI и code review не заменяют эту проверку.

#### P2-3. Немедленный revokeObjectURL — IMPROVEMENT / VERIFY
Файл: src/lib/promptExport.ts, downloadTextFile.

URL.revokeObjectURL(url) вызывается сразу после link.click(). Лучше проверить кроссбраузерное поведение и при необходимости отложить очистку до завершения запуска загрузки. Считать это низкоприоритетным до подтверждения проблемой в реальном браузере.

#### P2-4. Performance не измерялась — TODO
Нет измерений bundle size, Lighthouse, Core Web Vitals, React Profiler или списка из тысяч промптов. Не делать утверждений о реальной производительности до измерения.

#### P2-5. Репозиторий содержит пустые файлы git и npm — VERIFY / cleanup
В дереве на проверенном commit присутствуют пустые файлы в корне с именами git и npm. Уточнить, не являются ли они намеренными; если нет — удалить.

#### P2-6. README / портфолио — IMPROVEMENT
Добавить screenshots, короткую демонстрацию workflow, архитектурные решения и ограничения. Объяснить, почему TanStack Query используется для серверных данных, Zustand — для auth/notifications, а localStorage — только для локальных не критичных данных.

#### P2-7. Mobile UI: карточки Prompts не помещаются в viewport — MITIGATION IMPLEMENTED / DEVICE QA PENDING
Пользователь сообщил о проблеме на мобильном экране, ориентир — iPhone 17 Pro Max: карточки на Dashboard выглядят нормально, но в разделе Prompts визуально выглядят некорректно и не помещаются в ширину экрана. Точная причина пока не воспроизведена на устройстве.

Source-level safeguards добавлены: grid карточек теперь явно использует одну колонку с `min-w-0` на узких экранах, `PromptCard` ограничен `w-full min-w-0 max-w-full`, а заголовок и preview могут переносить длинные неразрывные слова. Это устраняет распространённую причину intrinsic-width overflow, но статус не считается окончательно FIXED до проверки narrow viewport и Safari на реальном iPhone. Проверить также фильтры, теги, toolbar и action buttons, сравнив Dashboard и Prompts при одинаковой ширине viewport.

#### P2-8. Прямые запросы SPA-маршрутов на Vercel — FIXED (production smoke test passed)
До исправления главная страница (`/`) возвращала HTTP 200, но прямые GET-запросы к `/prompts`, `/favorites`, `/settings` и `/login` возвращали Vercel `404 NOT_FOUND`. Причина — отсутствие SPA rewrite: при открытии маршрута или обновлении вкладки запрос сначала обрабатывает сервер Vercel, до того как сработает React Router.

Добавлен корневой `vercel.json` с rewrite `/(.*)` → `/index.html`. Production deploy на commit `f019569071ac05c3858feb73bd7a76ffd4fb7d84` имеет статус READY. После деплоя прямые запросы к `/prompts`, `/favorites`, `/settings` и `/login` проверены повторно: все возвращают HTTP 200 и app shell `index.html`. Это проверка HTTP rewrite; переход на фактическую страницу и состояние auth проверяются уже в браузере. Изменение устраняет 404 при прямом открытии/обновлении известных SPA-маршрутов.

## 6. Тесты и CI: текущее состояние

Подтверждённые unit-test файлы:
- src/lib/__tests__/activityLog.test.ts
- src/lib/__tests__/authSession.test.ts
- src/lib/__tests__/authUtils.test.ts
- src/lib/__tests__/focusTrap.test.ts
- src/lib/__tests__/promptValidation.test.ts
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
- [~] Leaked Password Protection заблокирована текущим планом: Supabase требует Pro или выше. Не апгрейдить только ради этого пункта; пересмотреть при смене плана. При текущем плане проверить доступные minimum length/password complexity settings.
- [ ] Согласовать timezone created_at и безопасно мигрировать тип к timestamptz.

### Milestone 4 — PWA and UI quality (P1/P2)
- [x] Добавлены unit-тесты network-first/offline fallback, runtime asset cache, API bypass и безопасной очистки кешей.
- [x] GitHub Actions CI passed: 8 test files, 59 tests, lint/build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38528975884.
- [x] Сверены production artifacts старого deploy (`v2`, старые JS/CSS hashes), PWA update deploy (`v3`, другие hashes) и текущего `main` (`v3`, новые hashes); `/` и `/sw.js` ответили HTTP 200. Это ещё не заменяет браузерную проверку на одном origin.
- [x] Добавлен Vite `asset-manifest.json` и precache всех собранных JS/CSS/static assets и lazy chunks в SW cache v4; live manifest и worker отвечают HTTP 200.
- [x] На основании Console ошибок с устаревшими asset hashes добавлен Vite manifest и precache всех ресурсов; worker обновлён до v6, install Promise исправлен, автоактивация/`clients.claim` выполняются только после precache. Последний CI test/lint/build passed: https://github.com/Mardakhay/mardakhay-labs/actions/runs/38546100293. Production READY и все 19 manifest asset URLs возвращают HTTP 200; ручной Offline + Reload после установки v6 ещё не подтверждён.
- [x] Добавлен Vercel SPA rewrite `/(.*)` → `/index.html`; production smoke-test подтвердил HTTP 200 для прямых запросов `/prompts`, `/favorites`, `/settings` и `/login` после того, как до исправления они отвечали 404 (commit `f019569071ac05c3858feb73bd7a76ffd4fb7d84`).
- [ ] Проверить в реальном браузере update/offline в одном origin между двумя production deploys.
- [x] Добавлены responsive safeguards для Prompts card grid и переноса длинного текста (`grid-cols-1 min-w-0`, card width constraints, `break-words`).
- [ ] Проверить mobile layout в Safari на iPhone 17 Pro Max: сравнить с Dashboard и проверить horizontal overflow, grid, ширину текста, теги и фильтры.
- [x] Добавлен общий focus-trap helper для detail/editor modal; ручная проверка Tab/Shift+Tab подтвердила корректное поведение.
- [x] Связаны подписи editor fields, добавлены announceable validation errors, status для copy email, aria-pressed favorite, доступное имя/начальный фокус dropdown; добавлены validation tests. CI passed: 11 test files, 70 tests, lint/build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38534253393.
- [ ] Выполнить ручную проверку screen reader: названия диалогов/полей, ошибка пустого prompt, уведомления и подтверждение копирования.
- [ ] Подтвердить, нужен ли рефакторинг крупных компонентов.

### Milestone 5 — Portfolio polish (P2)
- [ ] Скриншоты ключевых страниц.
- [ ] Архитектурный раздел в README.
- [ ] Измерить bundle size и Lighthouse.
- [ ] E2E-тест основного workflow.
- [ ] Удалить пустые артефакты git/npm, если они не нужны.

### Milestone 6 — Dependency hygiene (P1)
- [x] Изучить все 12 affected package groups, выявить advisory summaries и отделить production dependencies от dev/tooling.
- [x] Применить совместимые non-major обновления через npm audit fix без --force; package.json ranges не менялись.
- [x] Повторный npm audit: 0 vulnerabilities; test/lint/build прошли на обновлённом lockfile — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38536000606.
- [x] Добавлен scheduled/manual dependency audit workflow с JSON report artifact.

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
- 2026-10-14 — попытка включить Leaked Password Protection в Supabase Auth вернула сообщение о необходимости Pro plan или выше. Документация roadmap обновлена: это ограничение тарифа; апгрейд не требуется для продолжения аудита, проверить доступные парольные требования на текущем плане.
- 2026-10-14 — пользователь вручную подтвердил, что клавиатурная навигация Tab/Shift+Tab в модальном окне работает ожидаемо.
- 2026-10-14 — исправлены связи label/input редактора, пустой prompt content выдаёт доступную ошибку и переводит фокус к textarea, добавлен live status для копирования email, состояние избранного озвучивается через aria-pressed; dropdown получил более понятное имя и управляемый начальный фокус/Escape. Добавлены три unit-теста в promptValidation.test.ts. CI passed для source commit `31639b2ce7b629f947455a6a490a2d409b894a6c`: 11 test files, 70 tests, lint/build — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38534253393. Ручная проверка screen reader остаётся открытой.
- 2026-10-14 — npm audit triage и совместимые non-major lockfile updates: React Router 7.18.4, Vite 8.3.4, Vitest 4.1.11 и уязвимые transitive deps. package.json не изменён; post-fix npm audit показал 0 уязвимостей. test/lint/build прошли в https://github.com/Mardakhay/mardakhay-labs/actions/runs/38536000606. Добавлен weekly/manual dependency audit workflow с отчётом-артефактом.
- 2026-10-14 — PWA production artifact check: подтверждены HTTP 200 для `/` и `/sw.js`; найден переход `mardakhay-labs-v2` → `v3` и изменение asset hashes на разных production deployments. Офлайн/update flow в одном origin не проверен, поэтому browser QA остаётся открытым.
- 2026-10-14 — для P2-7 добавлены responsive safeguards в Prompts grid и `PromptCard`: явная single-column grid на mobile, intrinsic width constraints и перенос длинных заголовков/preview. Source commit `09a2ab71343b2f035821f181ce114f625f69d5df`; CI test/lint/build passed — https://github.com/Mardakhay/mardakhay-labs/actions/runs/38538817802. Vercel production deploy READY и отдаёт обновлённый bundle, compiled CSS содержит нужные responsive utilities. Реальное воспроизведение и Safari QA на iPhone 17 Pro Max всё ещё нужны.
- 2026-10-14 — подтверждена причина случайных 404 на прямых SPA-маршрутах: до фикса Vercel отдавал 404 для `/prompts`, `/favorites`, `/settings` и `/login`, при том что `/` отвечал 200. Добавлен `vercel.json` с rewrite на `/index.html` (source commit `f019569071ac05c3858feb73bd7a76ffd4fb7d84`); production deploy READY и повторный smoke-test всех четырёх маршрутов вернул HTTP 200. Проверка offline/update в браузере на одном origin всё ещё открыта.
- 2026-10-14 — после воспроизведения белого экрана в Chrome Offline добавлен Vite `asset-manifest.json` и SW v4 precache для всех JS/CSS/assets/lazy chunks. Console показала запросы к старым hashes `index-CZ_t4BuF.js` / `index-gZ6DVxhW.css`. Ошибка `TypeError: caches.open(...).then(...) is not a function` вызвана лишними `()` после `.then(async ...)`; исправление убрало вызов Promise как функции и подняло cache до v6. Отдельный CI failure на промежуточном commit вызван несовпадением имени кеша (worker v6, test v5). На commit `80db9d1320c27d794142662e455aa174a93bebea` CI Test/Lint/Build passed: https://github.com/Mardakhay/mardakhay-labs/actions/runs/38546100293. Production deploy READY; live root uses актуальные bundles, 19/19 manifest assets отвечают 200, `/sw.js` отдаёт v6. Ручной Offline + Reload после v6 остаётся открытым.
- При каждой следующей итерации добавлять дату, commit SHA, выполненные изменения, результаты тестов и оставшиеся риски.

## 10. Инструкция для нового чата

Перед началом работы прочитать этот документ и актуальный код соответствующих файлов. Учитывать, что статусы и commit SHA в документе могут устареть. Проверять текущую ветку и последний commit, не предполагать, что roadmap уже выполнен.

Следующая задача: screen-reader проверку временно отложить по решению пользователя. Ближайшие пункты: завершить PWA offline/update browser QA в одном origin; проверить responsive fix для карточек Prompts на узком viewport и реальном iPhone; затем исследовать безопасный способ согласовать timezone для `created_at` (не менять тип до подтверждения исторического часового пояса). В Supabase Dashboard при случае проверить minimum password length/password strength. Leaked Password Protection остаётся ограниченной тарифом Pro+.

При продолжении аудита:
- Отделять подтверждённые баги от непроверенных рисков.
- Не утверждать, что production Supabase/PWA/UX проверены без отдельной проверки.
- После исправлений обновлять checklist и журнал изменений.
- Не помещать реальные секреты, токены, service-role keys или приватные backup данные в документацию.
