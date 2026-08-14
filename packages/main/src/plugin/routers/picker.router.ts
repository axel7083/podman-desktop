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

import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { CustomPickRegistry } from '/@/plugin/custompick/custompick-registry.js';
import { InputQuickPickRegistry } from '/@/plugin/input-quickpick/input-quickpick-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.picker, OrpcContext>(contracts.picker);

@injectable()
export class PickerRouter {
  constructor(
    @inject(InputQuickPickRegistry) private inputQuickPickRegistry: InputQuickPickRegistry,
    @inject(CustomPickRegistry) private customPickRegistry: CustomPickRegistry,
  ) {}

  router: ContractedRouter<typeof contracts.picker, OrpcContext> = {
    inputBoxValue: os.inputBoxValue.handler(({ input }) => {
      return this.inputQuickPickRegistry.onInputBoxValueEntered(input.id, input.value, input.error);
    }),
    inputBoxValidate: os.inputBoxValidate.handler(({ input }) => {
      return this.inputQuickPickRegistry.validate(input.id, input.value);
    }),
    quickPickValues: os.quickPickValues.handler(({ input }) => {
      return this.inputQuickPickRegistry.onQuickPickValuesSelected(input.id, input.indexes);
    }),
    quickPickOnSelect: os.quickPickOnSelect.handler(({ input }) => {
      return this.inputQuickPickRegistry.onDidSelectQuickPickItem(input.id, input.selectedId);
    }),
    customPickValues: os.customPickValues.handler(({ input }) => {
      return this.customPickRegistry.onConfirmSelection(input.id, input.indexes);
    }),
    customPickClose: os.customPickClose.handler(({ input }) => {
      return this.customPickRegistry.onClose(input.id);
    }),
  };
}
