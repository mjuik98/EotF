import { describe, expect, it } from 'vitest';

import {
  getMapNodeTypeOrder as getPureMapNodeTypeOrder,
  getMapNodeVisualFallback as getPureMapNodeVisualFallback,
} from '../game/features/run/domain/map_node_content_queries.js';
import {
  MAP_NODE_TYPE_VISUAL_FALLBACK,
  getMapNodeTypeOrder,
  getMapNodeVisualFallback,
} from '../game/features/run/application/map_node_content_queries.js';

describe('map_node_content_queries', () => {
  it('reads map node ordering and fallbacks from injected data without runtime ports', () => {
    const order = getPureMapNodeTypeOrder(['event', 'boss', 'combat']);
    const fallback = getPureMapNodeVisualFallback('boss', {
      boss: { icon: 'B', color: '#fff' },
    });

    expect(order).toEqual(['event', 'boss', 'combat']);
    expect(fallback).toEqual({ icon: 'B', color: '#fff' });
    expect(getPureMapNodeVisualFallback('shop', {})).toBeNull();
  });

  it('keeps the application query surface aligned with the runtime map node dataset', () => {
    expect(getMapNodeTypeOrder()).toEqual(expect.arrayContaining(['combat', 'event']));
    expect(MAP_NODE_TYPE_VISUAL_FALLBACK).toEqual(expect.any(Object));
    expect(getMapNodeVisualFallback('combat')).toEqual(expect.objectContaining({
      icon: expect.any(String),
    }));
  });
});
