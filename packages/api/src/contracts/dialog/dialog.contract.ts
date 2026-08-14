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

import type { MessageBoxOptions, MessageBoxReturnValue } from '/@/dialog.js';

export interface UriComponents {
  scheme: string;
  authority?: string;
  path: string;
  query?: string;
  fragment?: string;
  fsPath?: string;
}

export interface OpenDialogOptions {
  defaultUri?: UriComponents;
  openLabel?: string;
  selectors?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'>;
  filters?: { extensions: string[]; name: string }[];
  title?: string;
}

export interface SaveDialogOptions {
  defaultUri?: UriComponents;
  saveLabel?: string;
  filters?: { extensions: string[]; name: string }[];
  title?: string;
}

export const dialogContract = {
  showMessageBox: oc.input(type<MessageBoxOptions>()).output(type<MessageBoxReturnValue>()),
  sendShowMessageBoxOnSelect: oc
    .input(type<{ id: number; selectedIndex?: number; dropdownIndex?: number }>())
    .output(type<void>()),
  openDialog: oc.input(type<OpenDialogOptions>()).output(type<string[] | undefined>()),
  saveDialog: oc.input(type<SaveDialogOptions>()).output(type<UriComponents | undefined>()),
};
