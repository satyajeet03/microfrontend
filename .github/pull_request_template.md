## Module PR Checklist

### Module Details

- Module ID:
- Route Path:
- Remote Name:
- Entry URL (staging/prod):

### Change Type

- [ ] New module
- [ ] Existing module enhancement
- [ ] Bug fix
- [ ] Refactor

### Validation

- [ ] `npm run validate:module-registry` passes
- [ ] `npm run build:affected` passes
- [ ] Tests added/updated
- [ ] Manual route smoke test done in shell

### Contract + Security

- [ ] Exposes `./Module` (or `Module`) as agreed
- [ ] Shared deps aligned (`react`, `react-dom`, router)
- [ ] Remote URL is trusted and reachable

### Release Plan

- [ ] Remote artifact deployed before registry enablement
- [ ] Registry entry merged with correct route and `entry`
- [ ] Rollback plan documented (`enabled: false`)

### Notes for Reviewers

Provide anything reviewers must verify (feature flags, test users, known limitations).
