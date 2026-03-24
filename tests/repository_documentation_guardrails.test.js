import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('repository documentation guardrails', () => {
  it('keeps root markdown limited to the canonical repository docs', () => {
    const rootMarkdown = fs.readdirSync(process.cwd(), { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => entry.name)
      .sort();

    expect(rootMarkdown).toEqual(['AGENTS.md', 'README.md']);
  });

  it('keeps superpowers plan and spec docs in the allowed non-canonical workspace', () => {
    const docsRoot = path.join(process.cwd(), 'docs', 'superpowers');
    const plansDir = path.join(docsRoot, 'plans');
    const specsDir = path.join(docsRoot, 'specs');

    expect(fs.existsSync(plansDir)).toBe(true);
    expect(fs.existsSync(specsDir)).toBe(true);
    expect(fs.readdirSync(plansDir).some((name) => name.endsWith('.md'))).toBe(true);
    expect(fs.readdirSync(specsDir).some((name) => name.endsWith('.md'))).toBe(true);
  });

  it('documents the split between canonical docs and superpowers working artifacts', () => {
    const readme = fs.readFileSync(path.join(process.cwd(), 'README.md'), 'utf8');
    const agents = fs.readFileSync(path.join(process.cwd(), 'AGENTS.md'), 'utf8');

    expect(readme).toContain('canonical docs는 `README.md`와 `AGENTS.md`입니다.');
    expect(readme).toContain('`docs/superpowers/*`에는 에이전트 실행 과정에서 생성된 plan/spec 문서');
    expect(agents).toContain('Canonical human-maintained docs are `README.md` and `AGENTS.md`.');
    expect(agents).toContain('Agent-generated planning/spec artifacts may exist under `docs/superpowers/*`');
  });
});
