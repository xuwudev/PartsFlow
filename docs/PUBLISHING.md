# Публикация PartsFlow CRM по вкладкам

Все ветки созданы **локально**. Remote пока не настроен; ничего не отправлено на GitHub.

## Как устроена история

```text
main (начальный README и инструкция)
└─ codex/00-foundation
   └─ codex/01-dashboard
      └─ codex/02-customers
         └─ ...
            └─ codex/14-activity-log (полное приложение)
```

Это последовательная цепочка. Каждая следующая ветка содержит предыдущие изменения и добавляет одну вкладку. Не открывай PR последней ветки первым — тогда в него попадёт всё приложение.

`codex/backup-complete-app` — резервная копия до разделения. Она не участвует в цепочке и не нужна для публикации.

## 1. Создай пустой репозиторий на GitHub

Не добавляй README, лицензию или `.gitignore` через GitHub: они уже подготовлены локально. Заменяй `YOUR_USERNAME` и `YOUR_REPOSITORY` своими значениями:

```sh
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Если remote `origin` уже существует, сначала проверь его через `git remote -v`; повторять `remote add` не нужно.

## 2. Загружай и сливай ветки в этом порядке

| № | Ветка | Что добавляет |
|---|---|---|
| 00 | `codex/00-foundation` | Сборка, маршруты, вход, навбар, стили, общие UI-компоненты и американский mock engine |
| 01 | `codex/01-dashboard` | Dashboard |
| 02 | `codex/02-customers` | Customers |
| 03 | `codex/03-monthly-revenue` | Monthly revenue |
| 04 | `codex/04-daily-revenue` | Daily revenue |
| 05 | `codex/05-revenue-by-category` | Revenue by category |
| 06 | `codex/06-revenue-decline` | Revenue decline |
| 07 | `codex/07-returns` | Returns |
| 08 | `codex/08-payments` | Payments |
| 09 | `codex/09-customer-map` | Customer map |
| 10 | `codex/10-sales-targets` | Sales targets |
| 11 | `codex/11-contracts` | Contracts |
| 12 | `codex/12-my-tasks` | My tasks и календарь |
| 13 | `codex/13-team-tasks` | Team tasks |
| 14 | `codex/14-activity-log` | Activity log |

Например, сначала:

```sh
git push -u origin codex/00-foundation
```

На GitHub создай PR: **base `main` ← compare `codex/00-foundation`**. Текст описания есть в `docs/pull-requests/00-foundation.md` этой ветки.

Слей его через **Create a merge commit**. Сохраняй этот способ для всей цепочки: **Squash and merge** и **Rebase and merge** меняют историю и мешают следующему PR показывать только новую вкладку.

После слияния переходи к следующей ветке:

```sh
git push -u origin codex/01-dashboard
```

Открой PR в `main`, проверь, что в diff только Dashboard, слей через **Create a merge commit**, затем загружай `codex/02-customers`. Повторяй по таблице.

Для push не нужно переключать локальную рабочую ветку. Можно оставаться на полной версии `codex/14-activity-log`.

## Если хочешь открыть все PR заранее

Используй предыдущую ветку как base: `01-dashboard` → `00-foundation`, `02-customers` → `01-dashboard` и так далее. После слияния предыдущего PR переназначай base следующего на `main` и проверяй diff. Для простого последовательного процесса удобнее открывать по одному PR.

## Проверки

```sh
npm run typecheck
npm test
npm run build
npm run verify:releases
```

Последняя команда проверяет все 15 релизных веток в отдельных папках, не переключая текущую ветку. На Windows сборке нужен доступ к своему локальному серверу для prerender.

Чтобы посмотреть состояние конкретного шага вручную, сначала убедись, что `git status --short` пустой, затем используй `git switch codex/03-monthly-revenue`. Для возврата к полному приложению — `git switch codex/14-activity-log`.
