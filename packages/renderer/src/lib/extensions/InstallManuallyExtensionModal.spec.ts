/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import InstallManuallyExtensionModal from './InstallManuallyExtensionModal.svelte';

const closeCallback = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'extensionInstallFromImage', { value: vi.fn() });
  Object.defineProperty(window, 'extensionInstallFromArchive', { value: vi.fn() });
  Object.defineProperty(window, 'openDialog', { value: vi.fn() });
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('expect invalid field', async () => {
  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();

  const button = screen.getByRole('button', { name: 'Install' });
  expect(button).toBeInTheDocument();

  // disabled due to error
  expect(button).toBeDisabled();
});

test('expect able to download an extension', async () => {
  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();
  // now enter the text 'my-custom-image.io/foo'
  await userEvent.type(input, 'my-custom-image.io/foo');

  // click on the button
  const button = screen.getByRole('button', { name: 'Install' });
  expect(button).toBeInTheDocument();

  await userEvent.click(button);

  expect(window.extensionInstallFromImage).toBeCalledWith(
    'my-custom-image.io/foo',
    expect.anything(),
    expect.anything(),
  );

  // expect button done is there now
  const buttonDone = screen.getByRole('button', { name: 'Done' });
  expect(buttonDone).toBeInTheDocument();

  // click on the button
  await userEvent.click(buttonDone);

  // expect close callback to be called
  expect(closeCallback).toBeCalled();
});

function mockExtensionInstallFromImage(): {
  resolve: () => void;
  reject: (error: unknown) => void;
  logCallback: (data: string) => void;
  errorCallback: (data: string) => void;
} {
  const { promise, resolve, reject } = Promise.withResolvers<void>();

  const logCallback = vi.fn<(data: string) => void>();
  const errorCallback = vi.fn<(data: string) => void>();
  vi.mocked(window.extensionInstallFromImage).mockImplementation((_image, mLogCallback, mErrorCallback) => {
    logCallback.mockImplementation((content: string) => mLogCallback(content));
    errorCallback.mockImplementation((content: string) => mErrorCallback(content));
    return promise;
  });
  return { resolve, reject, logCallback, errorCallback };
}

test('install button should always be disable when extensionInstallFromImage is pending', async () => {
  const { logCallback } = mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();
  // now enter the text 'my-custom-image.io/foo'
  await userEvent.type(input, 'my-custom-image.io/foo');

  // click on the button
  const installButton = screen.getByRole('button', { name: 'Install' });
  expect(installButton).toBeInTheDocument();
  expect(installButton).toBeEnabled();

  await userEvent.click(installButton);

  logCallback('Downloading sha256:random-sha256.tar - 100% - (521578/521578)');

  const progressBar = screen.getByRole('progressbar', { name: 'Installation progress' });
  await vi.waitFor(() => {
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  // expect button done to be disabled
  expect(installButton).toBeDisabled();
});

test('rejected installation should make the button visible', async () => {
  const { reject } = mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();
  // now enter the text 'my-custom-image.io/foo'
  await userEvent.type(input, 'my-custom-image.io/foo');

  // click on the button
  const installButton = screen.getByRole('button', { name: 'Install' });
  await userEvent.click(installButton);

  await vi.waitFor(() => {
    expect(installButton).toBeDisabled();
  });

  reject(new Error('random error'));

  await vi.waitFor(() => {
    expect(installButton).toBeEnabled();
  });
});

test('progressbar should match latest log', async () => {
  const { logCallback } = mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();
  // now enter the text 'my-custom-image.io/foo'
  await userEvent.type(input, 'my-custom-image.io/foo');

  // click on the button
  const installButton = screen.getByRole('button', { name: 'Install' });
  expect(installButton).toBeInTheDocument();
  expect(installButton).toBeEnabled();

  await userEvent.click(installButton);

  const progressBar = screen.getByRole('progressbar', { name: 'Installation progress' });
  for (let i = 0; i < 64; i += 8) {
    logCallback(`Downloading sha256:random-sha256.tar - ${i}% - (${i}/64)`);

    await vi.waitFor(() => {
      expect(progressBar).toHaveStyle({
        width: `${i}%`,
      });
    });
  }
});

test('install button should be enable while extensionInstallFromImage is resolved', async () => {
  const { resolve, logCallback } = mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();
  // now enter the text 'my-custom-image.io/foo'
  await userEvent.type(input, 'my-custom-image.io/foo');

  // click on the button
  const installButton = screen.getByRole('button', { name: 'Install' });
  expect(installButton).toBeInTheDocument();
  expect(installButton).toBeEnabled();

  await userEvent.click(installButton);

  // log 100%
  logCallback('Downloading sha256:random-sha256.tar - 100% - (521578/521578)');
  const progressBar = screen.getByRole('progressbar', { name: 'Installation progress' });
  await vi.waitFor(() => {
    expect(progressBar).toHaveStyle({
      width: `100%`,
    });
  });

  // resolve extensionInstallFromImage
  resolve();

  // done button should be visible after resolution
  await vi.waitFor(() => {
    const doneButton = screen.getByRole('button', { name: 'Done' });
    expect(doneButton).toBeInTheDocument();
  });

  // install button should not be visible after resolution
  expect(screen.queryByRole('button', { name: 'Install' })).toBeNull();
});

test('form should be in error even if log reached 100%', async () => {
  const { logCallback, errorCallback } = mockExtensionInstallFromImage();

  const { getByRole, queryByRole, getByText } = render(InstallManuallyExtensionModal, { closeCallback });

  const input = getByRole('textbox', { name: 'Image name to install custom extension' });
  await userEvent.type(input, 'my-custom-image.io/foo');

  const installButton = getByRole('button', { name: 'Install' });
  await userEvent.click(installButton);

  // Simulate 100% log
  logCallback('Downloading sha256:random-sha256.tar - 100% - (521578/521578)');
  const progressBar = getByRole('progressbar', { name: 'Installation progress' });
  await vi.waitFor(() => {
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  // Now simulate error callback
  errorCallback('Extension is already installed');

  // Expect install button to be visible but disabled due to error
  await vi.waitFor(() => {
    expect(installButton).toBeVisible();
    expect(installButton).toBeDisabled();
  });

  // Expect progress bar to be gone
  expect(queryByRole('progressbar')).not.toBeInTheDocument();

  getByText('Extension is already installed');

  // Expect Done button not to be there
  expect(queryByRole('button', { name: 'Done' })).toBeNull();

  // Expect input error
  expect(input).toHaveAttribute('aria-invalid', 'true');
});

describe('install from a local file', () => {
  const archivePath = '/home/user/my-extension.tar';

  function mockExtensionInstallFromArchive(): {
    resolve: () => void;
    reject: (error: unknown) => void;
    logCallback: (data: string) => void;
    errorCallback: (data: string) => void;
  } {
    const { promise, resolve, reject } = Promise.withResolvers<void>();

    const logCallback = vi.fn<(data: string) => void>();
    const errorCallback = vi.fn<(data: string) => void>();
    vi.mocked(window.extensionInstallFromArchive).mockImplementation((_path, mLogCallback, mErrorCallback) => {
      logCallback.mockImplementation((content: string) => mLogCallback(content));
      errorCallback.mockImplementation((content: string) => mErrorCallback(content));
      return promise;
    });
    return { resolve, reject, logCallback, errorCallback };
  }

  async function selectLocalFile(): Promise<void> {
    await userEvent.click(screen.getByRole('radio', { name: 'Local file' }));
  }

  test('OCI image is the default source and the image field is visible on open', () => {
    render(InstallManuallyExtensionModal, { closeCallback });

    expect(screen.getByRole('radiogroup', { name: 'Install from' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'OCI image' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Local file' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('textbox', { name: 'Image name to install custom extension' })).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'Image archive to install custom extension' }),
    ).not.toBeInTheDocument();
  });

  test('selecting Local file swaps the field and keeps Install disabled until a path is set', async () => {
    render(InstallManuallyExtensionModal, { closeCallback });

    await selectLocalFile();

    expect(screen.getByRole('radio', { name: 'Local file' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByRole('textbox', { name: 'Image name to install custom extension' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Image archive to install custom extension' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Install' })).toBeDisabled();
  });

  test('browse opens a dialog filtered on tar archives and fills the field', async () => {
    vi.mocked(window.openDialog).mockResolvedValue([archivePath]);
    render(InstallManuallyExtensionModal, { closeCallback });
    await selectLocalFile();

    await userEvent.click(screen.getByRole('button', { name: 'browse' }));

    expect(window.openDialog).toHaveBeenCalledWith(
      expect.objectContaining({ selectors: ['openFile'], filters: [{ name: 'Image archive', extensions: ['tar'] }] }),
    );
    expect(screen.getByRole('textbox', { name: 'Image archive to install custom extension' })).toHaveValue(archivePath);
    expect(screen.getByRole('button', { name: 'Install' })).toBeEnabled();
  });

  test('Install calls extensionInstallFromArchive with the path, then shows Done', async () => {
    const { resolve, logCallback } = mockExtensionInstallFromArchive();
    render(InstallManuallyExtensionModal, { closeCallback });
    await selectLocalFile();
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Image archive to install custom extension' }),
      archivePath,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Install' }));

    expect(window.extensionInstallFromArchive).toHaveBeenCalledWith(archivePath, expect.anything(), expect.anything());
    expect(window.extensionInstallFromImage).not.toHaveBeenCalled();

    logCallback('Extracting layer 1/1 (layer.tar) - 50%');
    const progressBar = screen.getByRole('progressbar', { name: 'Installation progress' });
    await vi.waitFor(() => expect(progressBar).toHaveStyle({ width: '50%' }));

    resolve();
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument());
    expect(screen.getByText('Extension successfully installed')).toBeInTheDocument();
    expect(screen.getByText(archivePath)).toBeInTheDocument();
  });

  test('an install error is shown on the archive field and Install stays visible', async () => {
    const { errorCallback } = mockExtensionInstallFromArchive();
    render(InstallManuallyExtensionModal, { closeCallback });
    await selectLocalFile();
    const input = screen.getByRole('textbox', { name: 'Image archive to install custom extension' });
    await userEvent.type(input, archivePath);
    const installButton = screen.getByRole('button', { name: 'Install' });
    await userEvent.click(installButton);

    errorCallback('Unable to read image archive');

    await vi.waitFor(() => expect(installButton).toBeDisabled());
    expect(screen.getByText('Unable to read image archive')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Done' })).not.toBeInTheDocument();
  });

  test('switching source clears the error and keeps the other value', async () => {
    const { errorCallback } = mockExtensionInstallFromArchive();
    render(InstallManuallyExtensionModal, { closeCallback });
    await selectLocalFile();
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Image archive to install custom extension' }),
      archivePath,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Install' }));
    errorCallback('Unable to read image archive');
    await vi.waitFor(() => expect(screen.getByText('Unable to read image archive')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('radio', { name: 'OCI image' }));

    expect(screen.queryByText('Unable to read image archive')).not.toBeInTheDocument();
    // image field untouched: Install disabled again
    expect(screen.getByRole('button', { name: 'Install' })).toBeDisabled();

    await selectLocalFile();
    expect(screen.getByRole('textbox', { name: 'Image archive to install custom extension' })).toHaveValue(archivePath);
    expect(screen.getByRole('button', { name: 'Install' })).toBeEnabled();
  });

  test('the source cannot be changed while installing', async () => {
    mockExtensionInstallFromArchive();
    render(InstallManuallyExtensionModal, { closeCallback });
    await selectLocalFile();
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Image archive to install custom extension' }),
      archivePath,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Install' }));

    expect(screen.getByRole('radio', { name: 'OCI image' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Local file' })).toBeDisabled();
  });
});
