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

import { oc } from '@orpc/contract';
import { z } from 'zod';

import { PlanetSchema } from './planet.schema.js';

export const ListPlanetInputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.number().int().min(0),
});
export type ListPlanetInput = z.output<typeof ListPlanetInputSchema>;

export const listPlanetContract = oc.input(ListPlanetInputSchema).output(z.array(PlanetSchema));

export const findPlanetContract = oc.input(PlanetSchema.pick({ id: true })).output(PlanetSchema);

export const createPlanetContract = oc.input(PlanetSchema.omit({ id: true })).output(PlanetSchema);

export const planetContract = {
  list: listPlanetContract,
  find: findPlanetContract,
  create: createPlanetContract,
};
