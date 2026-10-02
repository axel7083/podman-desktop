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
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import InstallManuallyExtensionModal from './InstallManuallyExtensionModal.svelte';

const closeCallback = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'extensionInstallFromImage', { value: vi.fn() });
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
  errorCallback: (data: string) => void;
} {
  const { promise, resolve, reject } = Promise.withResolvers<void>();

  const errorCallback = vi.fn<(data: string) => void>();
  vi.mocked(window.extensionInstallFromImage).mockImplementation((_image, _logCallback, mErrorCallback) => {
    errorCallback.mockImplementation((content: string) => mErrorCallback(content));
    return promise;
  });
  return { resolve, reject, errorCallback };
}

test('the dialog should be hidden while extensionInstallFromImage is pending', async () => {
  mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  await userEvent.type(input, 'my-custom-image.io/foo');
  await userEvent.click(screen.getByRole('button', { name: 'Install' }));

  // the installer may display a message box, which must not be covered by the dialog
  await vi.waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

test('rejected installation should make the button visible', async () => {
  const { reject } = mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  await userEvent.type(input, 'my-custom-image.io/foo');
  await userEvent.click(screen.getByRole('button', { name: 'Install' }));

  await vi.waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  reject(new Error('random error'));

  const installButton = await screen.findByRole('button', { name: 'Install' });
  expect(installButton).toBeEnabled();
});

test('the dialog should be back with the done button once extensionInstallFromImage is resolved', async () => {
  const { resolve } = mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  await userEvent.type(input, 'my-custom-image.io/foo');
  await userEvent.click(screen.getByRole('button', { name: 'Install' }));

  resolve();

  // done button should be visible after resolution
  await screen.findByRole('button', { name: 'Done' });
  screen.getByText('my-custom-image.io/foo successfully installed.');

  // install button should not be visible after resolution
  expect(screen.queryByRole('button', { name: 'Install' })).toBeNull();
});

test('the dialog should be back in error when the installation is cancelled', async () => {
  const { errorCallback } = mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  await userEvent.type(input, 'my-custom-image.io/foo');
  await userEvent.click(screen.getByRole('button', { name: 'Install' }));

  errorCallback('Installation of my.extension cancelled.');

  // install button visible but disabled due to the error
  const installButton = await screen.findByRole('button', { name: 'Install' });
  expect(installButton).toBeDisabled();
  screen.getByText('Installation of my.extension cancelled.');

  // the image name is kept
  expect(screen.getByRole('textbox', { name: 'Image name to install custom extension' })).toHaveValue(
    'my-custom-image.io/foo',
  );

  // Expect Done button not to be there
  expect(screen.queryByRole('button', { name: 'Done' })).toBeNull();
});

test('pressing Enter while installing should not start another installation', async () => {
  mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  await userEvent.type(input, 'my-custom-image.io/foo');
  await userEvent.click(screen.getByRole('button', { name: 'Install' }));

  // e.g. to validate a message box displayed during the installation
  await userEvent.keyboard('{Enter}');

  expect(window.extensionInstallFromImage).toHaveBeenCalledOnce();
  expect(closeCallback).not.toHaveBeenCalled();
});
