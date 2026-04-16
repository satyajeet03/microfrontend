# Module Onboarding SOP

This SOP defines how teams create, integrate, validate, and release a new portal module.

## 1) Ownership Model

- Module team owns module code, tests, and remote deployment.
- Shell/platform team owns shell app, registry policy, and production enablement.
- Registry controls runtime module visibility (`enabled` toggle).

## 2) Module Naming Contract

- `id`: kebab-case (example: `general-diary`)
- `routePath`: starts with `/` (example: `/general-diary`)
- `remoteName`: alphanumeric/camel-case (example: `generalDiary`)
- `exposedModule`: `Module` or `./Module`

## 3) Create a New Module

Use generator:

```bash
npm run add:remote -- general-diary
```

Manual requirements:

- Remote exposes `./Module` from `remote-entry.ts`
- Build produces `remoteEntry.js`
- Route is owned by module config in registry

## 4) Local Development

1. Start shell host.
2. Start module remote.
3. Add or update a row in `apps/shell/src/assets/module-registry.json`.
4. Validate registry:

```bash
npm run validate:module-registry
```

5. Verify route loads in shell.

## 5) Pull Request Requirements (Module Team)

- Feature implementation complete.
- Unit/integration tests added or updated.
- Registry entry prepared (for integration PR).
- `npm run validate:module-registry` passes.
- `npm run build:affected` passes.
- Any user-visible changes documented.

## 6) Integration + Release Flow

1. Deploy remote artifact first (hosting `remoteEntry.js`).
2. Merge registry update with module `entry` URL and `enabled: false`.
3. Smoke test route in staging.
4. Enable module via registry (`enabled: true`).
5. Observe logs/error metrics.
6. Rollback by setting `enabled: false` (no shell redeploy).

## 7) Production Guardrails

- Allowlist remote domains.
- Enforce HTTPS in production entries.
- Keep shared dependency versions aligned (`react`, `react-dom`, router).
- Add monitoring alerts per module route.
- Use canary enablement where possible.

## 8) CI Commands

- Validate registry schema and rules:

```bash
npm run validate:module-registry
```

- Validate lint/typecheck for all apps:

```bash
npm run ci:validate
```

- Production build:

```bash
npm run build:all:prod
```
