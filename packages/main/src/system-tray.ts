/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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

import { IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { app, Tray } from 'electron';
import { inject, injectable } from 'inversify';

import { AnimatedDevTray } from './tray-animate-dev-icon.js';
import { AnimatedTray } from './tray-animate-icon.js';
import { isMac } from './util.js';

/**
 * Owns the system tray icon, created from the preferences once the configuration registry is available.
 */
@injectable()
export class SystemTray {
  #tray: Tray | undefined;
  #animatedTray: AnimatedTray | undefined;

  constructor(@inject(IConfigurationRegistry) private readonly configurationRegistry: IConfigurationRegistry) {}

  /** The tray icon, undefined when the user disabled it. */
  get tray(): Tray | undefined {
    return this.#tray;
  }

  /** The animated image of the tray icon, undefined when the user disabled it. */
  get animatedTray(): AnimatedTray | undefined {
    return this.#animatedTray;
  }

  /**
   * Creates the tray icon unless preferences.ShowTrayIcon is false, applies preferences.TrayIconColor,
   * and releases them when the application quits.
   */
  init(): void {
    const preferences = this.configurationRegistry.getConfiguration('preferences');
    if (preferences.get<boolean>('ShowTrayIcon') === false) {
      return;
    }

    this.#animatedTray = import.meta.env.DEV ? new AnimatedDevTray() : new AnimatedTray();
    this.#tray = new Tray(this.#animatedTray.getDefaultImage());
    this.#animatedTray.setTray(this.#tray);

    // Windows or Linux support only for icon color change
    const color = preferences.get('TrayIconColor');
    if (!isMac() && typeof color === 'string') {
      this.#animatedTray.setColor(color);
    }

    app.on('will-quit', () => {
      this.#animatedTray?.dispose();
      this.#tray?.destroy();
    });
  }
}
