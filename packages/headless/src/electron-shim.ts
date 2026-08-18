/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import { tmpdir } from 'node:os';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const noop = (): void => {};
const noopAsync = async (): Promise<void> => {};

function getVersion(): string {
  try {
    const pkgPath = join(dirname(fileURLToPath(import.meta.url)), '../../main/package.json');
    return JSON.parse(readFileSync(pkgPath, 'utf-8')).version;
  } catch {
    return '0.0.0-headless';
  }
}

const version = getVersion();

export const app = {
  getVersion: () => version,
  getName: () => 'podman-desktop',
  getPath: (name: string) => {
    switch (name) {
      case 'userData':
      case 'appData':
        return join(tmpdir(), 'podman-desktop-headless');
      case 'temp':
        return tmpdir();
      case 'home':
        return process.env.HOME ?? tmpdir();
      default:
        return join(tmpdir(), 'podman-desktop-headless', name);
    }
  },
  getAppPath: () => process.cwd(),
  on: () => app,
  once: () => app,
  removeListener: () => app,
  removeAllListeners: () => app,
  requestSingleInstanceLock: () => true,
  whenReady: () => Promise.resolve(),
  isReady: () => true,
  quit: () => process.exit(0),
  isPackaged: false,
  commandLine: { appendSwitch: noop },
  dock: { setIcon: noop, setBadge: noop },
  setPath: noop,
  setAsDefaultProtocolClient: noop,
  disableHardwareAcceleration: noop,
};

export const ipcMain = {
  handle: noop,
  on: () => ipcMain,
  once: () => ipcMain,
  removeHandler: noop,
  removeListener: () => ipcMain,
  removeAllListeners: () => ipcMain,
};

export class BrowserWindow {
  webContents = {
    send: noop,
    on: noop,
    isDestroyed: () => true,
    session: { webRequest: { onHeadersReceived: noop } },
    openDevTools: noop,
  };
  isDestroyed(): boolean { return true; }
  loadURL(): Promise<void> { return Promise.resolve(); }
  show(): void {}
  hide(): void {}
  close(): void {}
  minimize(): void {}
  maximize(): void {}
  unmaximize(): void {}
  isMaximized(): boolean { return false; }
  setTitle(): void {}
  setBounds(): void {}
  getBounds(): { x: number; y: number; width: number; height: number } { return { x: 0, y: 0, width: 800, height: 600 }; }

  static getAllWindows(): BrowserWindow[] { return []; }
  static fromWebContents(): BrowserWindow | null { return null; }
}

export const clipboard = {
  writeText: noop,
  readText: () => '',
};

export const shell = {
  openExternal: async (url: string): Promise<void> => {
    console.log(`[headless] openExternal: ${url}`);
  },
  openPath: async (path: string): Promise<string> => {
    console.log(`[headless] openPath: ${path}`);
    return '';
  },
};

export const dialog = {
  showOpenDialog: async () => ({ canceled: true, filePaths: [] as string[] }),
  showSaveDialog: async () => ({ canceled: true, filePath: undefined }),
  showMessageBox: async () => ({ response: 0, checkboxChecked: false }),
  showErrorBox: (title: string, content: string): void => {
    console.error(`[headless] Error: ${title}: ${content}`);
  },
};

export const nativeTheme = {
  shouldUseDarkColors: true,
  themeSource: 'dark' as string,
  on: noop,
  removeListener: noop,
  removeAllListeners: noop,
};

export const safeStorage = {
  isEncryptionAvailable: () => false,
  encryptString: (text: string): Buffer => Buffer.from(text),
  decryptString: (buffer: Buffer): string => buffer.toString(),
};

export class Notification {
  title = '';
  body = '';
  show(): void {}
  on(): this { return this; }
  close(): void {}
}

export const screen = {
  getPrimaryDisplay: () => ({
    workAreaSize: { width: 1920, height: 1080 },
    scaleFactor: 1,
  }),
  getAllDisplays: () => [],
  on: noop,
};

export const nativeImage = {
  createFromPath: () => nativeImage,
  createFromDataURL: () => nativeImage,
  createEmpty: () => nativeImage,
  resize: () => nativeImage,
  toDataURL: () => '',
  toPNG: () => Buffer.alloc(0),
  isEmpty: () => true,
  getSize: () => ({ width: 0, height: 0 }),
};

export const Menu = {
  buildFromTemplate: () => Menu,
  setApplicationMenu: noop,
  getApplicationMenu: () => null,
  popup: noop,
};

export class Tray {
  constructor(_icon: unknown) {}
  setImage(): void {}
  setToolTip(): void {}
  setContextMenu(): void {}
  on(): this { return this; }
  destroy(): void {}
}

export const autoUpdater = {
  on: () => autoUpdater,
  once: () => autoUpdater,
  removeListener: () => autoUpdater,
  removeAllListeners: () => autoUpdater,
  checkForUpdates: noopAsync,
  downloadUpdate: noopAsync,
  quitAndInstall: noop,
  setFeedURL: noop,
  getFeedURL: () => '',
  channel: '',
  allowPrerelease: false,
  autoDownload: false,
  autoInstallOnAppQuit: false,
};

export const webContents = {
  getAllWebContents: () => [],
  fromId: () => null,
};

export default {
  app,
  ipcMain,
  BrowserWindow,
  clipboard,
  shell,
  dialog,
  nativeTheme,
  safeStorage,
  Notification,
  screen,
  nativeImage,
  Menu,
  Tray,
  autoUpdater,
  webContents,
};
