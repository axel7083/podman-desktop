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
import type { Disposable, Event, Task, TaskAction, TaskState } from '@podman-desktop/api';

import { Emitter } from '/@/plugin/events/emitter.js';

export class TaskImpl implements Disposable, Task {
  public readonly started: number;

  private emitter: Emitter<Task> | undefined;
  private mProgress: number | undefined;
  private mAction: TaskAction | undefined;
  private mError: string | undefined;
  private mState: TaskState;

  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {
    this.mState = 'loading';
    this.started = new Date().getTime();
  }

  get action(): TaskAction | undefined {
    return this.mAction;
  }

  get state(): TaskState {
    return this.mState;
  }

  set state(state: TaskState) {
    this.mState = state;
    this.notify();
  }

  set action(action: TaskAction | undefined) {
    this.mAction = action;
    this.notify();
  }

  set error(error: string | undefined) {
    this.mError = error;
  }

  get error(): string | undefined {
    return this.mError;
  }

  get progress(): number | undefined {
    return this.mProgress;
  }

  set progress(progress: number | undefined) {
    this.mProgress = progress;
    this.notify();
  }

  private notify(): void {
    this.emitter?.fire(this);
  }

  dispose(): void {
    this.emitter?.dispose();
  }

  get onUpdate(): Event<Task> {
    if (!this.emitter) {
      this.emitter = new Emitter<Task>();
    }
    return this.emitter.event;
  }
}
