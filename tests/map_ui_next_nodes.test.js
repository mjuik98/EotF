import { describe, expect, it } from 'vitest';

import { getAccessibleNextNodes } from '../game/ui/map/map_ui_next_nodes.js';

describe('map_ui_next_nodes', () => {
  it('returns only unvisited accessible nodes on the next floor', () => {
    const nodes = getAccessibleNextNodes({
      currentFloor: 2,
      mapNodes: [
        { id: '2-a', floor: 2, accessible: true, visited: true },
        { id: '3-a', floor: 3, accessible: true, visited: false },
        { id: '3-b', floor: 3, accessible: false, visited: false },
        { id: '3-c', floor: 3, accessible: true, visited: true },
        { id: '4-a', floor: 4, accessible: true, visited: false },
      ],
    });

    expect(nodes.map((node) => node.id)).toEqual(['3-a']);
  });
});
