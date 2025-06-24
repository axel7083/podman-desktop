/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
import type containerDesktopAPI from '@podman-desktop/api';

import {
  InputBoxValidationSeverity,
  ProgressLocation,
  QuickPickItemKind,
  StatusBarAlignLeft,
  StatusBarAlignRight,
  StatusBarItemDefaultPriority,
} from '/@/utils/constants';
import { DisposableImpl } from '/@/utils/disposable-impl';
import { Emitter } from '/@/utils/emitter-impl';
import { TelemetryTrustedValue } from '/@/utils/telemetry';
import { UriImpl } from '/@/utils/uri-impl';

export class ApiService implements containerDesktopAPI.Disposable {
  constructor(protected version: string) {}

  dispose(): void {
    console.log('[ApiService] disposing api service');
  }

  build(): typeof containerDesktopAPI {
    return {
      // constants
      version: this.version,
      StatusBarAlignLeft,
      StatusBarAlignRight,
      StatusBarItemDefaultPriority,
      // namespaces
      extensions: {} as unknown as typeof containerDesktopAPI.extensions,
      commands: {} as unknown as typeof containerDesktopAPI.commands,
      provider: {} as unknown as typeof containerDesktopAPI.provider,
      proxy: {} as unknown as typeof containerDesktopAPI.proxy,
      registry: {} as unknown as typeof containerDesktopAPI.registry,
      tray: {} as unknown as typeof containerDesktopAPI.tray,
      configuration: {} as unknown as typeof containerDesktopAPI.configuration,
      fs: {} as unknown as typeof containerDesktopAPI.fs,
      window: {} as unknown as typeof containerDesktopAPI.window,
      kubernetes: {} as unknown as typeof containerDesktopAPI.kubernetes,
      containerEngine: {} as unknown as typeof containerDesktopAPI.containerEngine,
      authentication: {} as unknown as typeof containerDesktopAPI.authentication,
      env: {} as unknown as typeof containerDesktopAPI.env,
      process: {} as unknown as typeof containerDesktopAPI.process,
      context: {} as unknown as typeof containerDesktopAPI.context,
      cli: {} as unknown as typeof containerDesktopAPI.cli,
      imageChecker: {} as unknown as typeof containerDesktopAPI.imageChecker,
      navigation: {} as unknown as typeof containerDesktopAPI.navigation,
      // classes
      Disposable: DisposableImpl,
      Uri: UriImpl,
      EventEmitter: Emitter,
      CancellationTokenSource: {} as unknown as typeof containerDesktopAPI.CancellationTokenSource,
      // enum
      ProgressLocation,
      InputBoxValidationSeverity,
      QuickPickItemKind,
      TelemetryTrustedValue,
    };
  }
}
