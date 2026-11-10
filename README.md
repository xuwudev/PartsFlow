# PartsFlow CRM

A React and TypeScript demo for automotive B2B sales. The app uses a minimalist lavender interface, English content, US customer profiles and USD amounts. Demo data runs locally in the browser; no backend or database is required.

## Run locally

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

## Check release branches

```sh
npm run verify:releases
```

This checks branch ancestry and installed tabs, then type-checks and builds each release in an isolated directory under `.release-validation/`. It does not switch your current branch or publish anything. Install dependencies first and retain the local release branches. Results are saved to `.release-validation/report.json`.

The customer map uses HERE Maps and needs network access to display map tiles. All sales figures and customer records are fictional demo data.
