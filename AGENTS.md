# Humpback Hydro Repository Rules

## Source and Deployment Authority

- This GitHub repository is the master editable source.
- Cloudflare Workers is the production host.
- The former ChatGPT Sites project is an archived design reference only. Do not create or deploy a competing Sites version.
- Preserve `.openai/hosting.json` until an approved migration removes the remaining Sites build dependency.
- Never deploy to Cloudflare, publish through Sites, or change production state without explicit approval.

## Product and Content Constraints

- Preserve the launched visual design unless a proposed change is explicitly approved.
- Maintain the premium dark infrastructure aesthetic, strong desktop/mobile readability, formal Title Case headings, and restrained motion.
- Do not publish invented or unsupported validation, prototype, partnership, customer, project, standards, performance, commercial-readiness, or endorsement claims.
- Check `EVIDENCE_REGISTER.md` before changing factual claims. Keep provisional and internal-placeholder material clearly identified.

## Required Validation

- Use Node.js `>=22.13.0` and the locked `package-lock.json`.
- Preferred Linux workflow: `npm run install:ci`, `npm run build`, `npm test`, and `npm run lint`.
- The shell wrappers require Linux tooling. On Windows, use the locked install, run the underlying Vinext build, validate `dist/server/index.js` and `dist/.openai/hosting.json`, then run `node --test tests/rendered-html.test.mjs`.
- Before committing: review the scoped diff, build/test results, and `git status`; stage only intended files.
- Never commit secrets, `.env*`, credentials, `node_modules`, `dist`, `.next`, `.wrangler`, `.sites-runtime`, or other generated output.

## Design Rules

- Keep the interface simple, cinematic, polished, and uncluttered.
- Use animation only when it improves understanding or perceived quality; preserve reduced-motion behavior.
- Avoid excessive glow, overwhelming color, generic templates, fake metrics, and unnecessary sections.
- Keep Phase 2 work lean and prioritized by launch risk and conversion value.
