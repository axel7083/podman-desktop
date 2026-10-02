/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { promises, rmdirSync, rmSync } from 'node:fs';
import * as path from 'node:path';

import type { ExtensionInfo } from '@podman-desktop/core-api';
import type { ApiSenderType } from '@podman-desktop/core-api/api-sender';
import type { CatalogFetchableExtension } from '@podman-desktop/core-api/extension-catalog';
import type { IpcMain, IpcMainEvent } from 'electron';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContributionManager } from '/@/plugin/contribution-manager.js';
import type { Directories } from '/@/plugin/directories.js';
import type { ExtensionsCatalog } from '/@/plugin/extension/catalog/extensions-catalog.js';
import type { AnalyzedExtension } from '/@/plugin/extension/extension-analyzer.js';
import type { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import type { ExtensionsBundle } from '/@/plugin/extension/local/extensions-bundle.js';
import type { ImageRegistry } from '/@/plugin/image-registry.js';
import type { MessageBox } from '/@/plugin/message-box.js';
import type { TaskManager } from '/@/plugin/tasks/task-manager.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';

import { ExtensionInstaller } from './extension-installer.js';

let extensionInstaller: ExtensionInstaller;

const apiSenderSendMock = vi.fn();
const apiSender: ApiSenderType = {
  send: apiSenderSendMock,
} as unknown as ApiSenderType;

const getPluginsDirectoryMock = vi.fn();
getPluginsDirectoryMock.mockReturnValue('/fake/plugins/directory');

const listExtensionsMock = vi.fn();
const loadExtensionMock = vi.fn();
const analyzeExtensionMock = vi.fn();
const loadExtensionsMock = vi.fn();
const ensureExtensionsMock = vi.fn();
const replaceBundledExtensionMock = vi.fn();
const removeExtensionMock = vi.fn();
const setExtensionPinnedMock = vi.fn();
const getPinnedExtensionIdsMock = vi.fn();
const extensionLoader: ExtensionLoader = {
  getPluginsDirectory: getPluginsDirectoryMock,
  listExtensions: listExtensionsMock,
  loadExtension: loadExtensionMock,
  loadExtensions: loadExtensionsMock,
  analyzeExtension: analyzeExtensionMock,
  ensureExtensionIsEnabled: ensureExtensionsMock,
  replaceBundledExtension: replaceBundledExtensionMock,
  removeExtension: removeExtensionMock,
  setExtensionPinned: setExtensionPinnedMock,
  getPinnedExtensionIds: getPinnedExtensionIdsMock,
} as unknown as ExtensionLoader;

const extensionsBundle = {
  all: vi.fn(),
  findOverridden: vi.fn(),
} as unknown as ExtensionsBundle;

const messageBox = {
  showMessageBox: vi.fn(),
} as unknown as MessageBox;

const getImageConfigLabelsMock = vi.fn();
const downloadAndExtractImageMock = vi.fn();
const imageRegistry: ImageRegistry = {
  getImageConfigLabels: getImageConfigLabelsMock,
  downloadAndExtractImage: downloadAndExtractImageMock,
} as unknown as ImageRegistry;

const getFetchableExtensionsMock = vi.fn();
const extensionsCatalog = {
  getFetchableExtensions: getFetchableExtensionsMock,
} as unknown as ExtensionsCatalog;

const telemetryMock = {
  track: vi.fn(),
} as unknown as Telemetry;

const directories = {
  getPluginsDirectory: vi.fn(),
  getContributionStorageDir: vi.fn(),
} as unknown as Directories;

const contributionManager = {} as unknown as ContributionManager;
const ipcMainOnMock = vi.fn();

const createTaskMock = vi.fn();
const taskManager = {
  createTask: createTaskMock,
} as unknown as TaskManager;

vi.mock(import('node:fs'));
vi.mock(import('/@/plugin/docker-extension/docker-desktop-installer.js'));

beforeEach(() => {
  vi.resetAllMocks();

  createTaskMock.mockReturnValue({
    status: 'in-progress',
    progress: undefined,
    error: undefined,
  });

  vi.mocked(rmSync).mockReturnValue(undefined);
  vi.mocked(extensionsBundle.all).mockReturnValue([]);
  getFetchableExtensionsMock.mockResolvedValue([]);
  getPinnedExtensionIdsMock.mockReturnValue([]);
  vi.mocked(directories.getPluginsDirectory).mockReturnValue('/fake/plugins/directory');
  vi.mocked(directories.getContributionStorageDir).mockReturnValue('/fake/dd/directory');
  extensionInstaller = new ExtensionInstaller(
    apiSender,
    extensionLoader,
    imageRegistry,
    extensionsCatalog,
    telemetryMock,
    directories,
    contributionManager,
    ipcMainOnMock,
    taskManager,
    extensionsBundle,
    messageBox,
  );
});

describe('installFromImage task lifecycle', () => {
  const imageToPull = 'fake.io/fake-image:fake-tag';

  test('should create a task with the image name on success', async () => {
    getImageConfigLabelsMock.mockResolvedValueOnce({
      'org.opencontainers.image.title': 'title',
      'org.opencontainers.image.description': 'desc',
      'org.opencontainers.image.vendor': 'vendor',
      'io.podman-desktop.api.version': '1.0.0',
    });
    listExtensionsMock.mockResolvedValueOnce([]);
    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValueOnce();
    analyzeExtensionMock.mockResolvedValueOnce({ manifest: {} } as AnalyzedExtension);

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    expect(createTaskMock).toHaveBeenCalledWith({ title: `Installing extension ${imageToPull}` });
    const task = createTaskMock.mock.results[0]?.value;
    expect(task.status).toBe('success');
  });

  test('should update task.progress during image download', async () => {
    getImageConfigLabelsMock.mockResolvedValueOnce({
      'org.opencontainers.image.title': 'title',
      'org.opencontainers.image.description': 'desc',
      'org.opencontainers.image.vendor': 'vendor',
      'io.podman-desktop.api.version': '1.0.0',
    });
    listExtensionsMock.mockResolvedValueOnce([]);
    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValueOnce();
    analyzeExtensionMock.mockResolvedValueOnce({ manifest: {} } as AnalyzedExtension);

    downloadAndExtractImageMock.mockImplementation(
      async (_image: string, _dest: string, logger: (event: { message: string; progress: number }) => void) => {
        logger({ message: 'Downloading layer 1/2', progress: 50 });
        logger({ message: 'Downloading layer 2/2', progress: 100 });
      },
    );

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    const task = createTaskMock.mock.results[0]?.value;
    expect(task.progress).toBe(100);
  });

  test('should mark task as failed when installation errors', async () => {
    getImageConfigLabelsMock.mockRejectedValueOnce(new Error('network failure'));

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    expect(createTaskMock).toHaveBeenCalledWith({ title: `Installing extension ${imageToPull}` });
    const task = createTaskMock.mock.results[0]?.value;
    expect(task.error).toBe('Error while analyzing image: Error: network failure');
  });
});

test('should install an image if labels are correct', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';

  getImageConfigLabelsMock.mockResolvedValueOnce({
    'org.opencontainers.image.title': 'fake-title',
    'org.opencontainers.image.description': 'fake-description',
    'org.opencontainers.image.vendor': 'fake-vendor',
    'io.podman-desktop.api.version': '1.0.0',
  });

  listExtensionsMock.mockResolvedValueOnce([]);

  const spyExtractExtensionFiles = vi.spyOn(extensionInstaller, 'extractExtensionFiles');
  spyExtractExtensionFiles.mockResolvedValueOnce();

  analyzeExtensionMock.mockResolvedValueOnce({
    manifest: {},
  } as AnalyzedExtension);

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  expect(ensureExtensionsMock).toHaveBeenCalled();

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);
  // expect no error
  expect(sendError).not.toHaveBeenCalled();

  expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');

  // extension started
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started');
});

test('should install an image (dd extensions) if labels are correct', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';

  vi.mocked(imageRegistry.getImageConfigLabels).mockResolvedValueOnce({
    'org.opencontainers.image.title': 'fake-title',
    'org.opencontainers.image.description': 'fake-description',
    'org.opencontainers.image.vendor': 'fake-vendor',
    'com.docker.desktop.extension.api.version': '1.0.0',
  });

  const spyExtractExtensionFiles = vi.spyOn(extensionInstaller, 'extractExtensionFiles');

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);
  // expect no error
  expect(sendError).not.toHaveBeenCalled();

  expect(spyExtractExtensionFiles).not.toHaveBeenCalled();
});

test('should fail if extension with same id is already installed and confirmation is disabled', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();
  const imageToPull = 'fake.io/new-image:tag';

  // Mock valid labels
  vi.mocked(imageRegistry.getImageConfigLabels).mockResolvedValueOnce({
    'org.opencontainers.image.title': 'fake-title',
    'org.opencontainers.image.description': 'fake-description',
    'org.opencontainers.image.vendor': 'fake-vendor',
    'io.podman-desktop.api.version': '1.0.0',
  });

  // Mock existing extension with collision
  const publisher = 'my-publisher';
  const name = 'my-extension';

  const id = `${publisher}.${name}`;
  listExtensionsMock.mockResolvedValue([
    {
      id,
      name: name,
      path: '/some/existing/path',
    },
  ]);

  analyzeExtensionMock.mockResolvedValueOnce({
    id,
  } as AnalyzedExtension);

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull, undefined, undefined, {
    confirm: false,
  });

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);

  // expect error
  expect(sendError).toHaveBeenCalledWith(`Extension ${publisher}.${name} is already installed.`);
  expect(messageBox.showMessageBox).not.toBeCalled();

  expect(sendEnd).not.toBeCalled();
});

describe('replacing an extension having the same id', () => {
  const imageToPull = 'fake.io/new-image:tag';
  const id = 'my-publisher.my-extension';

  beforeEach(() => {
    vi.mocked(imageRegistry.getImageConfigLabels).mockResolvedValueOnce({
      'org.opencontainers.image.title': 'fake-title',
      'org.opencontainers.image.description': 'fake-description',
      'org.opencontainers.image.vendor': 'fake-vendor',
      'io.podman-desktop.api.version': '1.0.0',
    });
    listExtensionsMock.mockResolvedValue([{ id, name: 'my-extension', version: '1.0.0', path: '/some/existing/path' }]);
    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValue();
    analyzeExtensionMock.mockResolvedValueOnce({
      id,
      path: path.join('/fake/plugins/directory', 'fakeionewimage'),
      manifest: { version: '2.0.0' },
    } as AnalyzedExtension);
  });

  test('the user is asked to replace the installed extension', async () => {
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Replace' });

    const sendEnd = vi.fn();
    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), sendEnd, imageToPull);

    expect(messageBox.showMessageBox).toHaveBeenCalledWith({
      title: 'Replace Extension?',
      message: `Are you sure you want to replace extension my-extension v1.0.0 with ${id} v2.0.0?`,
      buttons: ['Replace', 'Cancel'],
      type: 'question',
    });
    expect(removeExtensionMock).toHaveBeenCalledWith(id, { restoreBundled: false });
    expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');
  });

  test('cancelling keeps the installed extension and removes the extracted one', async () => {
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Cancel' });

    const sendError = vi.fn();
    await extensionInstaller.installFromImage(vi.fn(), sendError, vi.fn(), imageToPull);

    expect(sendError).toHaveBeenCalledWith(`Installation of ${id} cancelled.`);
    expect(removeExtensionMock).not.toBeCalled();
    expect(vi.mocked(promises.rm)).toHaveBeenCalledWith(path.join('/fake/plugins/directory', 'fakeionewimage'), {
      recursive: true,
      force: true,
    });
    expect(loadExtensionsMock).not.toBeCalled();
  });
});

test('should fail if extension is already installed and confirmation is disabled', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';

  getImageConfigLabelsMock.mockResolvedValueOnce({
    'org.opencontainers.image.title': 'fake-title',
    'org.opencontainers.image.description': 'fake-description',
    'org.opencontainers.image.vendor': 'fake-vendor',
    'io.podman-desktop.api.version': '1.0.0',
  });

  const extensionName = 'fake extension';
  listExtensionsMock.mockResolvedValueOnce([
    {
      name: 'fake extension',
      path: path.join('/fake/plugins/directory', 'fakeiofakeimage'),
    },
  ]);

  const spyExtractExtensionFiles = vi.spyOn(extensionInstaller, 'extractExtensionFiles');
  spyExtractExtensionFiles.mockResolvedValueOnce();

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull, undefined, undefined, {
    confirm: false,
  });

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);

  // expect error
  expect(sendError).toHaveBeenCalledWith(`Extension ${extensionName} is already installed`);

  expect(sendEnd).not.toBeCalled();

  // extension not started
  expect(apiSenderSendMock).not.toBeCalled();
});

describe('replacing an extension installed from the same image', () => {
  const imageToPull = 'fake.io/fake-image:fake-tag';
  const installedExtension = {
    id: 'fake.extension',
    name: 'fake extension',
    version: '1.0.0',
    path: path.join('/fake/plugins/directory', 'fakeiofakeimage'),
  };

  beforeEach(() => {
    getImageConfigLabelsMock.mockResolvedValueOnce({
      'org.opencontainers.image.title': 'fake-title',
      'org.opencontainers.image.description': 'fake-description',
      'org.opencontainers.image.vendor': 'fake-vendor',
      'io.podman-desktop.api.version': '1.0.0',
    });
    listExtensionsMock.mockResolvedValueOnce([installedExtension]);
    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValue();
  });

  test('the installed extension is removed before extracting the image when the user accepts', async () => {
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Replace' });
    listExtensionsMock.mockResolvedValue([]);
    analyzeExtensionMock.mockResolvedValueOnce({ id: 'fake.extension', path: installedExtension.path, manifest: {} });

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    expect(messageBox.showMessageBox).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Replace Extension?',
        message: `Are you sure you want to replace extension fake extension v1.0.0 with the extension from image ${imageToPull}?`,
      }),
    );
    expect(removeExtensionMock).toHaveBeenCalledWith('fake.extension', { restoreBundled: false });
    expect(downloadAndExtractImageMock).toBeCalled();
  });

  test('nothing is downloaded when the user cancels', async () => {
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Cancel' });

    const sendError = vi.fn();
    await extensionInstaller.installFromImage(vi.fn(), sendError, vi.fn(), imageToPull);

    expect(sendError).toHaveBeenCalledWith(`Installation of ${imageToPull} cancelled.`);
    expect(removeExtensionMock).not.toBeCalled();
    expect(downloadAndExtractImageMock).not.toBeCalled();
  });
});

describe('overriding a bundled extension', () => {
  const imageToPull = 'fake.io/new-image:tag';
  const publisher = 'podman-desktop';
  const name = 'podman';
  const id = `${publisher}.${name}`;
  const extensionPath = path.join('/fake/plugins/directory', 'fakeionewimage');

  /** an analyzed extension having the same id as an already installed, bundled extension */
  function mockBundledCollision(): AnalyzedExtension {
    vi.mocked(imageRegistry.getImageConfigLabels).mockResolvedValueOnce({
      'org.opencontainers.image.title': 'fake-title',
      'org.opencontainers.image.description': 'fake-description',
      'org.opencontainers.image.vendor': 'fake-vendor',
      'io.podman-desktop.api.version': '1.0.0',
    });

    // the extension with the same id is bundled
    listExtensionsMock.mockResolvedValue([
      {
        id,
        name,
        path: '/bundled/podman',
        bundled: true,
      },
    ]);

    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValue();

    const analyzedExtension = {
      id,
      path: extensionPath,
      manifest: { name, displayName: 'Podman' },
    } as unknown as AnalyzedExtension;
    analyzeExtensionMock.mockResolvedValueOnce(analyzedExtension);
    vi.mocked(extensionsBundle.findOverridden).mockReturnValue({
      id,
      manifest: { version: '1.0.0' },
    } as unknown as AnalyzedExtension);
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Replace' });
    return analyzedExtension;
  }

  test('a bundled extension with the same id flags the extension as overriding instead of erroring', async () => {
    const sendError = vi.fn();
    const analyzedExtension = mockBundledCollision();

    await extensionInstaller.installFromImage(vi.fn(), sendError, vi.fn(), imageToPull);

    expect(sendError).not.toBeCalled();
    expect(analyzedExtension.overrides).toEqual({ id, version: '1.0.0' });
  });

  test('the override is reported in the installation logs', async () => {
    const sendLog = vi.fn();
    mockBundledCollision();

    await extensionInstaller.installFromImage(sendLog, vi.fn(), vi.fn(), imageToPull);

    expect(sendLog).toHaveBeenCalledWith(
      `Extension ${id} replaces the bundled extension ${id}, which will be restored if you uninstall it.`,
    );
  });

  test('the bundled extension is deactivated before the new one is loaded', async () => {
    const sendEnd = vi.fn();
    mockBundledCollision();

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), sendEnd, imageToPull);

    expect(replaceBundledExtensionMock).toHaveBeenCalledWith(id);
    expect(loadExtensionsMock).toHaveBeenCalledWith([
      expect.objectContaining({ id, overrides: { id, version: '1.0.0' } }),
    ]);
    // the installation is not cancelled, nothing is cleaned up
    expect(vi.mocked(rmdirSync)).not.toBeCalled();
    expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');
  });

  test('an extension declaring the overrides field replaces the bundled extension having another id', async () => {
    vi.mocked(imageRegistry.getImageConfigLabels).mockResolvedValueOnce({
      'org.opencontainers.image.title': 'fake-title',
      'org.opencontainers.image.description': 'fake-description',
      'org.opencontainers.image.vendor': 'fake-vendor',
      'io.podman-desktop.api.version': '1.0.0',
    });
    listExtensionsMock.mockResolvedValue([{ id, name, path: '/bundled/podman', bundled: true }]);
    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValue();
    const analyzedExtension = {
      id: 'redhat.podman',
      path: extensionPath,
      manifest: { name, overrides: id },
    } as unknown as AnalyzedExtension;
    analyzeExtensionMock.mockResolvedValueOnce(analyzedExtension);
    vi.mocked(extensionsBundle.findOverridden).mockReturnValue({
      id,
      manifest: { version: '1.0.0' },
    } as unknown as AnalyzedExtension);
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Replace' });

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    expect(extensionsBundle.findOverridden).toHaveBeenCalledWith(analyzedExtension);
    expect(replaceBundledExtensionMock).toHaveBeenCalledWith(id);
    expect(loadExtensionsMock).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'redhat.podman', overrides: { id, version: '1.0.0' } }),
    ]);
  });

  test('the user is asked to confirm the override', async () => {
    const analyzedExtension = mockBundledCollision();
    analyzedExtension.manifest.version = '2.0.0';
    vi.mocked(extensionsBundle.all).mockReturnValue([
      { id, manifest: { displayName: 'Podman' } } as unknown as AnalyzedExtension,
    ]);

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    expect(messageBox.showMessageBox).toHaveBeenCalledWith({
      title: 'Replace Extension?',
      message: `This extension is replacing your existing extension named 'Podman'.`,
      detail: 'Auto-update will be disabled for this extension. Uninstalling it restores your existing extension.',
      buttons: ['Replace', 'Cancel'],
      type: 'question',
    });
  });

  test('cancelling the override removes the extracted extension and keeps the bundled one', async () => {
    const sendError = vi.fn();
    const sendEnd = vi.fn();
    mockBundledCollision();
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Cancel' });

    await extensionInstaller.installFromImage(vi.fn(), sendError, sendEnd, imageToPull);

    expect(sendError).toHaveBeenCalledWith(`Installation of ${id} cancelled.`);
    expect(vi.mocked(rmdirSync)).toHaveBeenCalledWith(extensionPath, { recursive: true });
    expect(replaceBundledExtensionMock).not.toBeCalled();
    expect(loadExtensionsMock).not.toBeCalled();
    expect(sendEnd).not.toBeCalled();
  });

  test('the overriding extension is pinned', async () => {
    mockBundledCollision();

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    expect(setExtensionPinnedMock).toHaveBeenCalledWith(id, true);
  });
  test('the overriding extension is not pinned again by an update', async () => {
    mockBundledCollision();

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull, undefined, undefined, {
      confirm: false,
    });

    expect(setExtensionPinnedMock).not.toBeCalled();
  });
  test('overriding with the latest catalog version keeps the extension updated automatically', async () => {
    const analyzedExtension = mockBundledCollision();
    analyzedExtension.manifest.version = '2.0.0';
    getFetchableExtensionsMock.mockResolvedValue([{ extensionId: id, link: imageToPull, version: '2.0.0' }]);

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    expect(messageBox.showMessageBox).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'Uninstalling it restores your existing extension.' }),
    );
    expect(replaceBundledExtensionMock).toHaveBeenCalledWith(id);
    expect(setExtensionPinnedMock).not.toBeCalled();
  });
  test('installing the latest catalog version of a pinned extension enables its auto-update again', async () => {
    const analyzedExtension = mockBundledCollision();
    analyzedExtension.manifest.version = '2.0.0';
    getFetchableExtensionsMock.mockResolvedValue([{ extensionId: id, link: imageToPull, version: '2.0.0' }]);
    getPinnedExtensionIdsMock.mockReturnValue([id]);

    // e.g. the update button, installing without confirmation
    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull, undefined, undefined, {
      confirm: false,
    });

    expect(setExtensionPinnedMock).toHaveBeenCalledWith(id, false);
  });
  test('no confirmation is asked when disabled through the options', async () => {
    mockBundledCollision();

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull, undefined, undefined, {
      confirm: false,
    });

    expect(messageBox.showMessageBox).not.toBeCalled();
    expect(replaceBundledExtensionMock).toHaveBeenCalledWith(id);
  });

  test('an installed extension already overriding the bundled one is replaced without a second confirmation', async () => {
    vi.mocked(imageRegistry.getImageConfigLabels).mockResolvedValueOnce({
      'org.opencontainers.image.title': 'fake-title',
      'org.opencontainers.image.description': 'fake-description',
      'org.opencontainers.image.vendor': 'fake-vendor',
      'io.podman-desktop.api.version': '1.0.0',
    });
    // the bundled extension is not loaded, the overriding one is
    listExtensionsMock.mockResolvedValue([
      { id, name, version: '1.0.0', path: '/fake/plugins/directory/other', bundled: false },
    ]);
    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValue();
    analyzeExtensionMock.mockResolvedValueOnce({ id, path: extensionPath, manifest: { name, version: '2.0.0' } });
    vi.mocked(extensionsBundle.findOverridden).mockReturnValue({
      id,
      manifest: { version: '1.0.0' },
    } as unknown as AnalyzedExtension);
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Replace' });

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    expect(messageBox.showMessageBox).toHaveBeenCalledOnce();
    expect(messageBox.showMessageBox).toHaveBeenCalledWith(expect.objectContaining({ title: 'Replace Extension?' }));
    // the bundled extension is not restored in between
    expect(removeExtensionMock).toHaveBeenCalledWith(id, { restoreBundled: false });
    expect(loadExtensionsMock).toHaveBeenCalledWith([
      expect.objectContaining({ id, overrides: { id, version: '1.0.0' } }),
    ]);
  });
  test('an installed extension already overriding the bundled one blocks the installation when confirmation is disabled', async () => {
    vi.mocked(imageRegistry.getImageConfigLabels).mockResolvedValueOnce({
      'org.opencontainers.image.title': 'fake-title',
      'org.opencontainers.image.description': 'fake-description',
      'org.opencontainers.image.vendor': 'fake-vendor',
      'io.podman-desktop.api.version': '1.0.0',
    });
    listExtensionsMock.mockResolvedValue([{ id, name, path: '/fake/plugins/directory/other', bundled: false }]);
    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValue();
    analyzeExtensionMock.mockResolvedValueOnce({ id, path: extensionPath, manifest: { name } });
    vi.mocked(extensionsBundle.findOverridden).mockReturnValue({
      id,
      manifest: { version: '1.0.0' },
    } as unknown as AnalyzedExtension);

    const sendError = vi.fn();
    await extensionInstaller.installFromImage(vi.fn(), sendError, vi.fn(), imageToPull, undefined, undefined, {
      confirm: false,
    });

    expect(sendError).toHaveBeenCalledWith(`Extension ${id} is already installed.`);
    expect(replaceBundledExtensionMock).not.toBeCalled();
    expect(loadExtensionsMock).not.toBeCalled();
  });

  test('a normal installation does not log any override nor replace or pin anything', async () => {
    vi.mocked(imageRegistry.getImageConfigLabels).mockResolvedValueOnce({
      'org.opencontainers.image.title': 'fake-title',
      'org.opencontainers.image.description': 'fake-description',
      'org.opencontainers.image.vendor': 'fake-vendor',
      'io.podman-desktop.api.version': '1.0.0',
    });
    listExtensionsMock.mockResolvedValue([]);
    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValue();
    analyzeExtensionMock.mockResolvedValueOnce({
      id,
      path: extensionPath,
      manifest: { name },
    } as unknown as AnalyzedExtension);

    const sendLog = vi.fn();
    await extensionInstaller.installFromImage(sendLog, vi.fn(), vi.fn(), imageToPull);

    expect(sendLog).not.toHaveBeenCalledWith(expect.stringContaining('replaces the bundled extension'));
    expect(replaceBundledExtensionMock).not.toBeCalled();
    expect(setExtensionPinnedMock).not.toBeCalled();
    expect(loadExtensionsMock).toBeCalled();
  });

  test('only the install channel is registered, the override needs no extra IPC', async () => {
    const channels: string[] = [];
    vi.mocked(ipcMainOnMock).mockImplementation((channel: string) => {
      channels.push(channel);
      return {} as IpcMain;
    });

    await extensionInstaller.init();

    expect(channels).toEqual(['extension-installer:install-from-image']);
  });
});

test('should fail if an image have incorrect labels', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';

  // no labels to make invalid image
  getImageConfigLabelsMock.mockResolvedValueOnce({});

  listExtensionsMock.mockResolvedValueOnce([]);

  const spyExtractExtensionFiles = vi.spyOn(extensionInstaller, 'extractExtensionFiles');
  spyExtractExtensionFiles.mockResolvedValueOnce();

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);
  // expect error
  expect(sendError).toHaveBeenCalledWith(`Image ${imageToPull} is not a Podman Desktop Extension`);

  expect(sendEnd).not.toBeCalled();

  // extension not started
  expect(apiSenderSendMock).not.toBeCalled();
});

test('should report error', async () => {
  const imageToPull = 'fake.io/fake-image:fake-tag';

  const spyExtractExtensionFiles = vi.spyOn(extensionInstaller, 'extractExtensionFiles');
  spyExtractExtensionFiles.mockResolvedValueOnce();

  const replyMethodMock = vi.fn();

  const spyInstaller = vi.spyOn(extensionInstaller, 'installFromImage');
  spyInstaller.mockRejectedValueOnce(new Error('fake error'));

  vi.mocked(ipcMainOnMock).mockImplementation(
    (_channel: string, listener: (event: IpcMainEvent, ...args: unknown[]) => void) => {
      // let's call the callback
      listener({ reply: replyMethodMock } as unknown as IpcMainEvent, imageToPull, 0);
      return {} as IpcMain;
    },
  );

  // call init method
  await extensionInstaller.init();

  // wait calls on reply mock with a loop
  while (replyMethodMock.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // expect to have the sendError method called
  expect(replyMethodMock).toHaveBeenCalledWith('extension-installer:install-from-image-error', 0, 'Error: fake error');
});

test('should install an image with extension pack', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';
  const analyzeFromImageSpy = vi.spyOn(extensionInstaller, 'analyzeFromImage');

  const extensionWithPack = {
    manifest: {
      name: 'extension-with-pack',
      extensionPack: ['my.other-extension', 'my.another-extension'],
    },
  } as AnalyzedExtension;

  const extensionOther = {
    manifest: {
      name: 'other-extension',
    },
  } as AnalyzedExtension;

  const extensionAnother = {
    manifest: {
      name: 'another-extension',
    },
  } as AnalyzedExtension;

  analyzeFromImageSpy.mockImplementation(
    (_sendLog: (message: string) => void, _sendError: (message: string) => void, imageName: string) => {
      if (imageName === 'fake.io/fake-image:fake-tag') {
        return Promise.resolve(extensionWithPack);
      } else if (imageName === 'my-other-extension-link') {
        return Promise.resolve(extensionOther);
      } else {
        return Promise.resolve(extensionAnother);
      }
    },
  );

  // no installed extension
  listExtensionsMock.mockResolvedValue([]);

  const fetchableExtension1: CatalogFetchableExtension = {
    extensionId: 'my.other-extension',
    link: 'my-other-extension-link',
    version: 'latest',
  };
  const fetchableExtension2: CatalogFetchableExtension = {
    extensionId: 'my.another-extension',
    link: 'my-another-extension-link',
    version: 'latest',
  };

  getFetchableExtensionsMock.mockResolvedValue([fetchableExtension1, fetchableExtension2]);

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  // expect no error
  expect(sendError).not.toHaveBeenCalled();

  expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');

  // extension started
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started');

  // should have been called to load two extensions (current + extension pack)
  // expect to have 2 arguments in array
  expect(loadExtensionsMock).toHaveBeenCalledWith(
    expect.arrayContaining([extensionWithPack, extensionOther, extensionAnother]),
  );
});

test('should install an image with transitive dependencies', async () => {
  // extension A depends on extension B
  // extension B depends on extension C
  // extension C depends on nothing

  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/extensionA';
  const analyzeFromImageSpy = vi.spyOn(extensionInstaller, 'analyzeFromImage');

  const extensionA = {
    manifest: {
      name: 'extension-a',
      extensionDependencies: ['my.extension-b'],
    },
  } as AnalyzedExtension;

  const extensionB = {
    manifest: {
      name: 'extension-b',
      extensionDependencies: ['my.extension-c'],
    },
  } as AnalyzedExtension;

  const extensionC = {
    manifest: {
      name: 'extension-c',
    },
  } as AnalyzedExtension;

  analyzeFromImageSpy.mockImplementation(
    (_sendLog: (message: string) => void, _sendError: (message: string) => void, imageName: string) => {
      if (imageName === 'fake.io/extensionA') {
        return Promise.resolve(extensionA);
      } else if (imageName === 'fake.io/extensionB') {
        return Promise.resolve(extensionB);
      } else if (imageName === 'fake.io/extensionC') {
        return Promise.resolve(extensionC);
      }
      return Promise.reject(new Error(`Unknown image name ${imageName}`));
    },
  );

  // no installed extension
  listExtensionsMock.mockResolvedValue([]);

  const fetchableExtensionB: CatalogFetchableExtension = {
    extensionId: 'my.extension-b',
    link: 'fake.io/extensionB',
    version: 'latest',
  };
  const fetchableExtensionC: CatalogFetchableExtension = {
    extensionId: 'my.extension-c',
    link: 'fake.io/extensionC',
    version: 'latest',
  };

  getFetchableExtensionsMock.mockResolvedValue([fetchableExtensionB, fetchableExtensionC]);

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  // expect no error
  expect(sendError).not.toHaveBeenCalled();

  expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');

  // extension started
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started');

  // should have been called to load two extensions (current + extension pack)
  // expect to have 2 arguments in array
  expect(loadExtensionsMock).toHaveBeenCalledWith(expect.arrayContaining([extensionA, extensionB, extensionC]));
});

test('should install an image with extension pack with an existing dependency already installed', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';
  const analyzeFromImageSpy = vi.spyOn(extensionInstaller, 'analyzeFromImage');

  const extensionWithPack = {
    manifest: {
      name: 'extension-with-pack',
      extensionPack: ['my.another-extension', 'my.other-extension'],
    },
  } as AnalyzedExtension;

  const extensionOther = {
    manifest: {
      name: 'other-extension',
    },
  } as AnalyzedExtension;

  const extensionAnother = {
    manifest: {
      name: 'another-extension',
    },
  } as AnalyzedExtension;

  analyzeFromImageSpy.mockImplementation(
    (_sendLog: (message: string) => void, _sendError: (message: string) => void, imageName: string) => {
      if (imageName === 'fake.io/fake-image:fake-tag') {
        return Promise.resolve(extensionWithPack);
      } else if (imageName === 'my-other-extension-link') {
        return Promise.resolve(extensionOther);
      } else {
        return Promise.resolve(extensionAnother);
      }
    },
  );

  // my.another-extension is already installed
  const extensionInfo = {
    id: 'my.another-extension',
  } as unknown as ExtensionInfo;
  listExtensionsMock.mockResolvedValue([extensionInfo]);

  const fetchableExtension1: CatalogFetchableExtension = {
    extensionId: 'my.other-extension',
    link: 'my-other-extension-link',
    version: 'latest',
  };
  const fetchableExtension2: CatalogFetchableExtension = {
    extensionId: 'my.another-extension',
    link: 'my-another-extension-link',
    version: 'latest',
  };

  getFetchableExtensionsMock.mockResolvedValue([fetchableExtension1, fetchableExtension2]);

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  // expect no error
  expect(sendError).not.toHaveBeenCalled();

  expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');

  // extension started
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started');

  // should have been called to load two extensions (current + extension pack)
  // expect to have 2 arguments in array
  expect(loadExtensionsMock).toHaveBeenCalledWith(expect.arrayContaining([extensionWithPack, extensionOther]));

  expect(analyzeFromImageSpy).toHaveBeenCalledWith(
    expect.any(Function),
    expect.any(Function),
    'my-other-extension-link',
  );

  // this extension is already installed, so we should not analyze it
  expect(analyzeFromImageSpy).not.toHaveBeenCalledWith(
    expect.any(Function),
    expect.any(Function),
    'my-another-extension-link',
  );
});
