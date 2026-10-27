/**********************************************************************
 * Copyright (C) 2025-2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/
import { NavigationPage } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { isWindows } from '/@/util.js';
import product from '/@product.json' with { type: 'json' };

import { ProtocolLauncher } from './protocol-launcher.js';

// mock modules
vi.mock(import('/@/util.js'));

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

function getProtocolLauncher(): ProtocolLauncher {
  return new ProtocolLauncher(apiSender);
}

beforeEach(() => {
  vi.resetAllMocks();
});

const PROTOCOL = product.urlProtocol;

test('should ask the UI to install the extension', () => {
  const protocol = getProtocolLauncher();
  protocol.handleOpenUrl(`${PROTOCOL}:extension/my.extension`);

  expect(apiSender.send).toHaveBeenCalledWith('install-extension:from-id', 'my.extension');
});

test('should ask the UI to install the extension with :// format', () => {
  const protocol = getProtocolLauncher();
  protocol.handleOpenUrl(`${PROTOCOL}://extension/my.extension`);

  expect(apiSender.send).toHaveBeenCalledWith('install-extension:from-id', 'my.extension');
});

test('should ask the UI to open the experimental features', () => {
  const protocol = getProtocolLauncher();
  protocol.handleOpenUrl(`${PROTOCOL}:experimental`);

  expect(apiSender.send).toHaveBeenCalledWith('navigate', { page: NavigationPage.EXPERIMENTAL_FEATURES });
});

test('should not send the URL for invalid URLs', async () => {
  const protocol = getProtocolLauncher();
  protocol.handleOpenUrl(`${PROTOCOL}:foobar`);

  expect(apiSender.send).not.toHaveBeenCalled();
});

test.each([
  {
    url: `${PROTOCOL}:extension/my.extension`,
    apiSenderSend: ['install-extension:from-id', 'my.extension'],
  },
  { url: `${PROTOCOL}:experimental`, apiSenderSend: ['navigate', { page: NavigationPage.EXPERIMENTAL_FEATURES }] },
])('should handle valid URL on Windows', ({ url, apiSenderSend }) => {
  vi.mocked(isWindows).mockReturnValue(true);

  const protocol = getProtocolLauncher();
  protocol.handleAdditionalProtocolLauncherArgs([url]);

  expect(apiSender.send).toHaveBeenCalledWith(...apiSenderSend);
});

test.each([`${PROTOCOL}:extension/my.extension`, `${PROTOCOL}:experimental`])(
  'should not do anything with valid URL on OS different than Windows',
  async url => {
    vi.mocked(isWindows).mockReturnValue(false);

    const protocol = getProtocolLauncher();

    protocol.handleAdditionalProtocolLauncherArgs([url]);

    // no called on it
    expect(apiSender.send).not.toHaveBeenCalled();
  },
);

describe('sanitizeProtocolForExtension', () => {
  test('handle sanitizeProtocolForExtension', () => {
    const protocol = getProtocolLauncher();

    const fakeLink = `${PROTOCOL}://extension/my.extension`;
    const sanitizedLink = `${PROTOCOL}:extension/my.extension`;
    expect(protocol.sanitizeProtocolForExtension(fakeLink)).toEqual(sanitizedLink);
  });

  test('handle sanitizeProtocolForExtension noop', () => {
    const protocol = getProtocolLauncher();

    const sanitizedLink = `${PROTOCOL}:extension/my.extension`;
    expect(protocol.sanitizeProtocolForExtension(sanitizedLink)).toEqual(sanitizedLink);
  });
});
