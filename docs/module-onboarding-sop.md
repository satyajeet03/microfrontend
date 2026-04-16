# Module Onboarding SOP


here are the most important files for creating and managing new modules in your setup.

apps/shell/src/assets/module-registry.json
Runtime registry. Add a new module row here (id, route, remoteName, entry, exposedModule, enabled). This is the core for dynamic onboarding.

apps/shell/src/module-registry.ts
Loader/normalizer for registry config. It fetches config, validates structure at runtime, initializes module federation remotes, and controls enabled modules.

apps/shell/src/app/app.tsx
Shell routing + render behavior. It reads enabled modules and maps routes to output. Right now it renders simple module text on route click.

apps/shell/src/app/layout.tsx
Shell-owned Header and Sidebar. Sidebar lists modules dynamically from registry and handles navigation.

apps/*/module-federation.config.ts
Defines host/remotes behavior for each app. For a remote module, this file controls what is exposed (usually ./Module).

apps/*/webpack.config.ts
Webpack + Nx integration for each module/shell build/serve behavior.

apps/*/package.json (inside each app)
Contains Nx target config (build, serve, outputPath, ports). New module build and serve settings live here.

tools/add-remote.mjs
Automation script to generate a new remote quickly and add it to registry.

tools/module-registry.schema.json
Contract/schema for module-registry shape (required fields, formats, enums).

tools/validate-module-registry.mjs
CI gate script. Fails build if registry has invalid values/duplicates/missing fields.

package.json (root scripts)
Important commands:

build:affected
build:all:prod
build:complaints
validate:module-registry
ci:validate
docs/module-onboarding-sop.md
Full team process: naming, dev flow, PR checks, release/rollback.

.github/pull_request_template.md
Standard PR checklist for module teams (contract, security, rollout).

tsconfig.base.json + apps/*/tsconfig.app.json
Shared aliases + per-app TS compile boundaries. Important when importing shared code and avoiding TS6307 issues.

Typical “new module” flow using these files
Run: npm run add:remote -- <module-name>
Verify/update row in apps/shell/src/assets/module-registry.json
Ensure remote exposes ./Module in its module-federation.config.ts
Run:
npm run validate:module-registry
npm run build:affected
Raise PR using .github/pull_request_template.md
Follow release steps from docs/module-onboarding-sop.md




Top 5 files (must-check for every new module)
apps/<module>/module-federation.config.ts
Ensure remote exposes ./Module correctly.

apps/<module>/package.json
Verify Nx targets (build, serve), outputPath, and port.

apps/shell/src/assets/module-registry.json
Add module row (id, displayName, routePath, remoteName, entry, exposedModule, enabled).

tools/module-registry.schema.json
Keep schema aligned if you add new registry fields.

tools/validate-module-registry.mjs
Update validator rules when schema/contract changes.

`Quick command flow`

npm run add:remote -- <module-name>
npm run validate:module-registry
npm run build:affected
npm run ci:validate





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
