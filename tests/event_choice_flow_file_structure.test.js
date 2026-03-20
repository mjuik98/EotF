import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('event_choice_flow file structure', () => {
  it('keeps workflow orchestration thin by delegating services and error handling', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/event/application/workflows/event_choice_flow.js'),
      'utf8',
    );

    expect(source).toContain("./event_choice_flow_services.js");
    expect(source).toContain("./event_choice_flow_error_handler.js");
  });
});
