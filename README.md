# PartsFlow CRM

A React and TypeScript demo for automotive B2B sales. The app uses a minimalist lavender interface, English content, US customer profiles and USD amounts. Demo data runs locally in the browser; no backend or database is required.

## Run locally

Use `codex/00-foundation` or any later release branch. The initial `main` commit contains publishing documentation only.

```sh
npm ci
npm run dev
```

Open http://localhost:5000. Use the demo buttons to fill in an administrator or sales representative account. The demo password is `demo1234`.

```sh
npm run typecheck
npm test
npm run build
```

## Publish one tab at a time

The project is split into **15 cumulative release branches**: an application foundation followed by 14 tabs. Each branch adds its own UI module and registers it in navigation. Later tabs are absent from earlier branches; dashboard links to unreleased tabs display a short notice.

The shared mock engine and sample catalog live in the foundation because several tabs consume the same customers, tasks and financial data. Charts, calendars and other feature-specific UI arrive with the first tab that needs them.

See [the publishing guide](docs/PUBLISHING.md) for the exact order, Git commands and merge instructions. [The release plan](docs/release-plan.json) lists each branch and its feature files. Suggested PR descriptions are in `docs/pull-requests/` on the corresponding branch.

The working checkout is the final branch, `codex/14-activity-log`, so all tabs remain available locally. `codex/backup-complete-app` preserves the original complete app before the split and is not part of the publishing sequence.

## Check release branches

```sh
npm run verify:releases
```

This checks branch ancestry and installed tabs, then type-checks and builds each release in an isolated directory under `.release-validation/`. It does not switch your current branch or publish anything. Install dependencies first and retain the local release branches. Results are saved to `.release-validation/report.json`.

The customer map uses HERE Maps and needs network access to display map tiles. All sales figures and customer records are fictional demo data.
