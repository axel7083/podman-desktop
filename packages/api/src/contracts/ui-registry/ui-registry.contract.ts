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

import { oc, type } from '@orpc/contract';
import type { ColorInfo } from '@podman-desktop/core-api/color-info';
import type { ContributionInfo } from '@podman-desktop/core-api/contribution-info';
import type { IconInfo } from '@podman-desktop/core-api/icon-info';
import type { ThemeInfo } from '@podman-desktop/core-api/theme-info';
import type { ViewInfoUI } from '@podman-desktop/core-api/view-info';

export const uiRegistryContract = {
  listContributions: oc.output(type<ContributionInfo[]>()),
  listIcons: oc.output(type<IconInfo[]>()),
  listColors: oc.input(type<{ themeId: string }>()).output(type<ColorInfo[]>()),
  getThemeInfo: oc.input(type<{ themeId: string }>()).output(type<ThemeInfo>()),
  listViews: oc.output(type<ViewInfoUI[]>()),
  fetchViews: oc.input(type<{ id: string }>()).output(type<ViewInfoUI[]>()),
  collectAllContextValues: oc.output(type<Record<string, unknown>>()),
  getRegisteredFeatures: oc.output(type<string[]>()),
};
