import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('combat card css regression', () => {
  it('keeps rarity tags styled for both real cards and hover clones', () => {
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toContain('.card.rarity-common .card-rarity-tag');
    expect(source).toContain('.card.rarity-uncommon .card-rarity-tag');
    expect(source).toContain('.card.rarity-rare .card-rarity-tag');
    expect(source).toContain('.card.rarity-legendary .card-rarity-tag');
    expect(source).toContain('.card-clone.clone-rarity-common .card-rarity-tag-hover');
    expect(source).toContain('.card-clone.clone-rarity-uncommon .card-rarity-tag-hover');
    expect(source).toContain('.card-clone.clone-rarity-rare .card-rarity-tag-hover');
    expect(source).toContain('.card-clone.clone-rarity-legendary .card-rarity-tag-hover');
  });

  it('keeps insufficient-energy and recent-combat-feed responsive selectors in place', () => {
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toContain('.card-cost-insufficient-energy');
    expect(source).toContain('.recent-combat-feed {');
    expect(source).toContain('.recent-combat-feed[data-layout="tight"]');
    expect(source).toContain('.recent-combat-feed[data-layout="stacked"]');
    expect(source).toContain('@media (max-width: 1400px)');
    expect(source).toContain('@media (max-width: 1180px)');
    expect(source).toContain('@media (max-width: 700px)');
  });
});
