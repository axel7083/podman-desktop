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

import type { AnyContractRouter, ContractProcedure } from '@orpc/contract';
import type { Context, Procedure } from '@orpc/server';

export type ServiceFromContract<T extends AnyContractRouter, TContext extends Context = Record<never, never>> =
  T extends ContractProcedure<infer UInputSchema, infer UOutputSchema, infer UErrorMap, infer UMeta>
    ? Procedure<TContext, TContext, UInputSchema, UOutputSchema, UErrorMap, UMeta>
    : {
        [K in keyof T]: T[K] extends AnyContractRouter ? ServiceFromContract<T[K], TContext> : never;
      };
