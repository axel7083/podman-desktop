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
import { expect as playExpect, test } from '/@/utility/fixtures';

const NGINX_IMAGE: string = 'ghcr.io/podmandesktop-ci/nginx:latest';
const NGINX_IMAGE_NAME: string = 'ghcr.io/podmandesktop-ci/nginx';
const NGINX_CONTAINER_NAME: string = 'nginx-container';

test.beforeAll(async ({ runner, welcomePage }) => {
  runner.setVideoAndTraceName('screenshots');
  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe
  .serial('Podman Desktop visual testing', { tag: [] }, () => {
    test.skip(
      !process.env.PLAYWRIGHT_SCREENSHOTS_PATH,
      'Skipping screenshots if PLAYWRIGHT_SCREENSHOTS_PATH is not set.',
    );

    test('dashboard screenshot', async ({ navigationBar }) => {
      const dashboardPage = await navigationBar.openDashboard();
      await playExpect(dashboardPage.heading).toBeVisible();

      // focus on the content
      await dashboardPage.content.focus();

      await dashboardPage.screenshot({
        name: 'dashboard',
      });
    });

    /**
     * Containers
     */
    test('containers screenshot', async ({ navigationBar }) => {
      const containersPage = await navigationBar.openContainers();
      await playExpect(containersPage.heading).toBeVisible();

      // Screenshot empty containers list
      await containersPage.screenshot({
        name: 'containers-empty',
      });

      // Start one container
      const imagesPage = await navigationBar.openImages();
      await imagesPage.pullImage(NGINX_IMAGE);

      await playExpect(imagesPage.heading).toBeVisible();
      await playExpect
        .poll(async () => await imagesPage.waitForImageExists(NGINX_IMAGE_NAME, 5_000), { timeout: 0 })
        .toBeTruthy();

      const imageDetailsPage = await imagesPage.openImageDetails(NGINX_IMAGE_NAME);
      const runImagePage = await imageDetailsPage.openRunImage();

      await runImagePage.startContainer(NGINX_CONTAINER_NAME);

      await playExpect(containersPage.heading).toBeVisible();
      await containersPage.screenshot({
        name: 'containers-nginx-running',
      });
    });

    /**
     * Pods
     */
    test('pods screenshot', async ({ navigationBar }) => {
      const podsPage = await navigationBar.openPods();
      await playExpect(podsPage.heading).toBeVisible();

      // focus on the content
      await podsPage.content.focus();

      await podsPage.screenshot({
        name: 'pods',
      });
    });

    /**
     * Images
     */
    test('images screenshot', async ({ navigationBar }) => {
      const imagesPage = await navigationBar.openImages();
      await playExpect(imagesPage.heading).toBeVisible();

      // focus on the content
      await imagesPage.content.focus();

      await imagesPage.screenshot({
        name: 'images',
      });

      const pullImagePage = await imagesPage.openPullImage();
      await playExpect(pullImagePage.heading).toBeVisible();

      await pullImagePage.screenshot({
        name: 'image-pull',
      });
    });

    /**
     * Volumes
     */
    test('volumes screenshot', async ({ navigationBar }) => {
      const volumesPage = await navigationBar.openVolumes();
      await playExpect(volumesPage.heading).toBeVisible();

      // focus on the content
      await volumesPage.content.focus();

      await volumesPage.screenshot({
        name: 'volumes',
      });
    });

    /**
     * Networks
     */
    test('networks screenshot', async ({ navigationBar }) => {
      const networksPage = await navigationBar.openNetworks();
      await playExpect(networksPage.heading).toBeVisible();

      // focus on the content
      await networksPage.content.focus();

      await networksPage.screenshot({
        name: 'networks',
      });
    });
  });
