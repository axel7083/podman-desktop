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

import type { PinOption } from '/@/status-bar/pin-option.js';
import type { StatusBarEntryDescriptor } from '/@/status-bar-info.js';

export const statusBarContract = {
  getEntries: oc.output(type<StatusBarEntryDescriptor[]>()),
  executeCommand: oc.input(type<{ command: string; args: unknown[] }>()).output(type<void>()),
  getPinOptions: oc.output(type<PinOption[]>()),
  pin: oc.input(type<{ optionId: string }>()).output(type<void>()),
  unpin: oc.input(type<{ optionId: string }>()).output(type<void>()),
};
