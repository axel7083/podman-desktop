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

export const systemContract = {
  getPlatform: oc.output(type<string>()),
  getArch: oc.output(type<string>()),
  getHostname: oc.output(type<string>()),
  getHostFreeDiskSize: oc.output(type<number>()),
  getHostMemory: oc.output(type<number>()),
  getHostCpu: oc.output(type<number>()),
  getFreePort: oc.input(type<{ port: number }>()).output(type<number>()),
  getFreePortRange: oc.input(type<{ rangeSize: number }>()).output(type<string>()),
  isPortFree: oc.input(type<{ port: number }>()).output(type<boolean>()),
  windowMinimize: oc.output(type<void>()),
  windowMaximize: oc.output(type<void>()),
  windowClose: oc.output(type<void>()),
  clipboardWriteText: oc.input(type<{ text: string; type?: 'selection' | 'clipboard' }>()).output(type<void>()),
  openExternal: oc.input(type<{ link: string }>()).output(type<void>()),
  pathRelative: oc.input(type<{ from: string; to: string }>()).output(type<string>()),
  createHash: oc.input(type<{ input: string; algorithm?: string }>()).output(type<string>()),
  getUrlProtocol: oc.output(type<string>()),
};
