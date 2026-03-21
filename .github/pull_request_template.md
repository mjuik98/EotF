## Summary

- What changed:
- Why:

## Architecture Checklist

- [ ] Layer/import boundary changes were reviewed (`npm run lint` passed).
- [ ] If dependency flow changed, `npm run deps:map` output was updated.
- [ ] Baselines were updated only when growth was intentional:
  - `window_usage_baseline.json`
  - `state_mutation_baseline.json`
  - `import_coupling_baseline.json`
  - `content_data_baseline.json`
  - under `config/quality/`
- [ ] New/changed events are covered by `event_contracts` rules.
- [ ] Content data changes keep `id` consistency and do not grow unresolved asset refs unintentionally.

## Validation

- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
