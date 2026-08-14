/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import { CONFIGURATION_DEFAULT_SCOPE } from '@podman-desktop/core-api/configuration';
import { TelemetrySettings } from '@podman-desktop/core-api/telemetry';
import { WelcomeSettings } from '@podman-desktop/core-api/welcome';

import { client } from '/@/client';

export class WelcomeUtils {
  async getVersion(): Promise<string | undefined> {
    return (await client.configuration.getValue({
      key: WelcomeSettings.SectionName + '.' + WelcomeSettings.Version,
    })) as string | undefined;
  }

  async updateVersion(val: string): Promise<void> {
    await client.configuration.updateValue({
      key: WelcomeSettings.SectionName + '.' + WelcomeSettings.Version,
      value: val,
      scope: CONFIGURATION_DEFAULT_SCOPE,
    });
  }

  async havePromptedForTelemetry(): Promise<boolean | undefined> {
    return (await client.configuration.getValue({
      key: TelemetrySettings.SectionName + '.' + TelemetrySettings.Check,
    })) as boolean | undefined;
  }

  async setTelemetry(telemetry: boolean): Promise<void> {
    console.log('Telemetry enablement: ' + telemetry);

    // store if the user said yes or no to telemetry
    await client.configuration.updateValue({
      key: TelemetrySettings.SectionName + '.' + TelemetrySettings.Enabled,
      value: telemetry,
      scope: CONFIGURATION_DEFAULT_SCOPE,
    });

    // trigger telemetry system initialization
    if (telemetry) {
      await window.telemetryConfigure();
    }

    // save the fact that we've prompted
    await client.configuration.updateValue({
      key: TelemetrySettings.SectionName + '.' + TelemetrySettings.Check,
      value: true,
      scope: CONFIGURATION_DEFAULT_SCOPE,
    });
  }
}
