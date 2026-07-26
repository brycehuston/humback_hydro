# Deployment

## Ownership

- Master editable source: `https://github.com/brycehuston/humback_hydro`
- Production host: Cloudflare Workers
- Production URL: `https://humback-hydro.bryce-huston.workers.dev/`
- Archived design reference: the existing ChatGPT Sites project

Do not deploy through ChatGPT Sites or create another Sites project. Do not deploy to Cloudflare without explicit approval.

## Application Architecture

- Framework: Vinext `0.0.50` with Vite `8.0.13`
- UI: React `19.2.6`, Next.js-compatible App Router, Tailwind CSS PostCSS
- Edge runtime: Cloudflare Vite plugin and Worker entry `worker/index.ts`
- Optional data tooling: Drizzle ORM/D1 scaffolding; no active production D1 binding is declared in the tracked hosting manifest
- Required Node.js: `>=22.13.0`

Public routes:

- `/`
- `/technology`
- `/applications`
- `/evidence`
- `/company`
- `/partners`

## Build

Preferred Linux workflow:

```text
npm run install:ci
npm run build
npm test
npm run lint
```

The scripts create a project-local tool environment, perform a locked `npm ci`, run `vinext build`, and validate:

- `dist/server/index.js`
- `dist/.openai/hosting.json`

The current shell wrappers require Linux `bash`, `flock`, GNU `timeout`, `curl`, and `sha256sum`. On Windows, install from `package-lock.json`, invoke the local Vinext binary directly, validate the two artifacts above, and run `node --test tests/rendered-html.test.mjs`.

## Cloudflare Configuration

`vite.config.ts` configures the Cloudflare Vite plugin with:

- Worker entry: `worker/index.ts`
- Compatibility flag: `nodejs_compat`
- Image optimization through Cloudflare Images bindings
- Project-local Wrangler/Miniflare state

No tracked `wrangler.toml`, `wrangler.jsonc`, GitHub Actions workflow, or other Cloudflare release manifest was found. The exact production deploy command, Worker/account identifier, environment ownership, and rollback procedure are therefore not reconstructable from the repository and must be documented before wider promotion.

## Archived Sites Configuration

`.openai/hosting.json` contains the archived Sites project identifier and null D1/R2 bindings. It is imported by `vite.config.ts` and packaged into `dist` by `build/sites-vite-plugin.ts`.

The file does **not** deploy anything by itself and does not automatically compete with Cloudflare. It could direct an operator or compatible OpenAI Sites deployment workflow back to the archived Sites project if that tooling were intentionally invoked. Removing or modifying it now could break the current build contract, so it is preserved unchanged pending an approved Cloudflare-only migration.

## Release Procedure

1. Confirm the milestone ZIP, repository source, and live deployment correspond.
2. Run the locked install, production build, artifact validation, tests, lint, route checks, and responsive smoke test.
3. Review the evidence register and confirm no provisional claim was promoted.
4. Review the scoped Git diff and status; stage only authorized files.
5. Create the approved release commit and tag.
6. Push the commit and tag.
7. Create the next working branch.
8. Deploy to Cloudflare only under a separate explicit production approval.

## Rollback

Repository rollback is possible through the verified release tag. Production rollback is not yet documented because the Cloudflare deployment command and versioning setup are absent from the repository. Treat this as a Phase 2 launch-hardening requirement.
