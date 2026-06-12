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
import type { ContainerInteractiveParams } from '/@/model/core/types';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { handleConfirmationDialog } from '/@/utility/operations';

const NGINX_IMAGE: string = 'ghcr.io/podmandesktop-ci/nginx:latest';
const NGINX_IMAGE_NAME: string = 'ghcr.io/podmandesktop-ci/nginx';
const NGINX_CONTAINER_NAME: string = 'nginx-container';
const POD_NAME: string = 'nginx-pod';
const CONTAINER_START_PARAMS: ContainerInteractiveParams = { attachTerminal: false };

test.beforeAll(async ({ runner, welcomePage }) => {
  runner.setVideoAndTraceName('screenshots');
  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ runner, navigationBar }) => {
  test.setTimeout(180_000);

  // Go to containers page
  const containersPage = await navigationBar.openContainers();
  await playExpect(containersPage.heading).toBeVisible();

  // Select all containers through the checkbox
  const toggleAll = containersPage.page.getByRole('checkbox', { name: 'Toggle all' });
  await playExpect(toggleAll).toBeVisible();
  await toggleAll.click();

  // Get the bulk delete button
  const bulkDelete = containersPage.page.getByRole('button', { name: 'Delete selected containers and pods' });
  await playExpect(bulkDelete).toBeVisible();
  await bulkDelete.click();

  await handleConfirmationDialog(containersPage.page, 'Delete Containers?', true, 'Delete');

  // Wait until none are remaining
  await playExpect.poll(async () => await containersPage.getAllTableRows()).toHaveLength(0);

  await runner.close(45_000);
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

      await runImagePage.startContainer(NGINX_CONTAINER_NAME, CONTAINER_START_PARAMS);
      await playExpect
        .poll(async () => await containersPage.containerExists(NGINX_CONTAINER_NAME), { timeout: 10_000 })
        .toBeTruthy();

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
        name: 'pods-empty',
      });

      const containersPage = await navigationBar.openContainers();
      await playExpect(containersPage.heading).toBeVisible();

      const createPodPage = await containersPage.openCreatePodPage([NGINX_CONTAINER_NAME]);
      const pods = await createPodPage.createPod(POD_NAME);
      await playExpect(pods.heading).toBeVisible({ timeout: 60_000 });
      await playExpect.poll(async () => await pods.podExists(POD_NAME), { timeout: 15_000 }).toBeTruthy();

      await podsPage.screenshot({
        name: 'pods-nginx',
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
