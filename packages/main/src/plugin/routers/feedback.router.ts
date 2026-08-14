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

import { FeedbackHandler } from '/@/plugin/feedback-handler.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';
import { Telemetry } from '/@/plugin/telemetry/telemetry.js';

const os = implement<typeof contracts.feedback, OrpcContext>(contracts.feedback);

@injectable()
export class FeedbackRouter {
  constructor(
    @inject(FeedbackHandler) private feedbackHandler: FeedbackHandler,
    @inject(Telemetry) private telemetry: Telemetry,
  ) {}

  router: ContractedRouter<typeof contracts.feedback, OrpcContext> = {
    send: os.send.handler(({ input }) => {
      return this.telemetry.sendFeedback(input.properties);
    }),
    githubPreview: os.githubPreview.handler(({ input }) => {
      return this.feedbackHandler.openGitHubIssue(input.properties);
    }),
    getGitHubFeedbackLinks: os.getGitHubFeedbackLinks.handler(() => {
      return this.feedbackHandler.getGitHubFeedbackLinks();
    }),
    getFeedbackLinks: os.getFeedbackLinks.handler(() => {
      return this.feedbackHandler.getFeedbackLinks();
    }),
    getFeedbackMessages: os.getFeedbackMessages.handler(() => {
      return this.feedbackHandler.getFeedbackMessages();
    }),
  };
}
