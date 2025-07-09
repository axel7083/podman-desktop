import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.spyOn(window, 'listImages').mockResolvedValue([]);
});
