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
import { ContainerDetailsPage } from '/@/model/pages/container-details-page';
import { ImageDetailsPage } from '/@/model/pages/image-details-page';
import { NetworkDetailsPage } from '/@/model/pages/network-details-page';
import { PodDetailsPage } from '/@/model/pages/pods-details-page';
import { VolumeDetailsPage } from '/@/model/pages/volume-details-page';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { handleConfirmationDialog } from '/@/utility/operations';

const NGINX_IMAGE: string = 'ghcr.io/podmandesktop-ci/nginx:latest';
const NGINX_IMAGE_NAME: string = 'ghcr.io/podmandesktop-ci/nginx';
const NGINX_CONTAINER_NAME: string = 'nginx-container';
const VOLUME_NAME: string = 'foo-volume';
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
    test.describe
      .serial('containers', () => {
        test('containers empty', async ({ navigationBar }) => {
          const containersPage = await navigationBar.openContainers();
          await playExpect(containersPage.heading).toBeVisible();

          // Screenshot empty containers list
          await containersPage.screenshot({
            name: 'containers-empty',
          });
        });

        test('containers nginx', async ({ navigationBar }) => {
          // Start one container
          const imagesPage = await navigationBar.openImages();
          await imagesPage.pullImage(NGINX_IMAGE);

          await playExpect(imagesPage.heading).toBeVisible();
          await playExpect
            .poll(async () => await imagesPage.waitForImageExists(NGINX_IMAGE_NAME, 5_000), { timeout: 0 })
            .toBeTruthy();

          const imageDetailsPage = await imagesPage.openImageDetails(NGINX_IMAGE_NAME);
          const runImagePage = await imageDetailsPage.openRunImage();

          const containersPage = await runImagePage.startContainer(NGINX_CONTAINER_NAME, CONTAINER_START_PARAMS);
          await playExpect
            .poll(async () => await containersPage.containerExists(NGINX_CONTAINER_NAME), { timeout: 10_000 })
            .toBeTruthy();

          await containersPage.screenshot({
            name: 'containers-nginx-running',
          });
        });

        test('containers nginx details', async ({ navigationBar }) => {
          const containersPage = await navigationBar.openContainers();
          const containerDetailsPage = await containersPage.openContainersDetails(NGINX_CONTAINER_NAME);

          await containerDetailsPage.activateTab(ContainerDetailsPage.SUMMARY_TAB);
          await playExpect(containerDetailsPage.tabContent.getByRole('table')).toBeVisible();

          await containerDetailsPage.screenshot({
            name: 'container-nginx-summary',
          });
        });
      });

    /**
     * Pods
     */
    test.describe
      .serial('pods', () => {
        test('pods empty', async ({ navigationBar }) => {
          const podsPage = await navigationBar.openPods();
          await playExpect(podsPage.heading).toBeVisible();

          await podsPage.screenshot({
            name: 'pods-empty',
          });
        });

        test('pods nginx', async ({ navigationBar }) => {
          const containersPage = await navigationBar.openContainers();
          await playExpect(containersPage.heading).toBeVisible();

          const createPodPage = await containersPage.openCreatePodPage([NGINX_CONTAINER_NAME]);
          const podsPage = await createPodPage.createPod(POD_NAME);
          await playExpect(podsPage.heading).toBeVisible({ timeout: 60_000 });
          await playExpect.poll(async () => await podsPage.podExists(POD_NAME), { timeout: 15_000 }).toBeTruthy();

          await podsPage.screenshot({
            name: 'pods-nginx',
          });
        });

        test('pods details', async ({ navigationBar }) => {
          const podsPage = await navigationBar.openPods();
          await playExpect(podsPage.heading).toBeVisible();

          const podDetails = await podsPage.openPodDetails(POD_NAME);
          await podDetails.activateTab(PodDetailsPage.SUMMARY_TAB);
          await playExpect(podDetails.tabContent.getByRole('table')).toBeVisible();

          await podDetails.screenshot({
            name: 'pod-nginx-summary',
          });
        });
      });

    /**
     * Images
     */
    test.describe
      .serial('images', () => {
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

        test('image details summary', async ({ navigationBar }) => {
          const imagesPage = await navigationBar.openImages();
          const imageDetailsPage = await imagesPage.openImageDetails(NGINX_IMAGE_NAME);

          await imageDetailsPage.activateTab(ImageDetailsPage.SUMMARY_TAB);
          await playExpect(imageDetailsPage.tabContent.getByRole('table')).toBeVisible();

          await imageDetailsPage.screenshot({
            name: 'image-nginx-summary',
          });
        });
      });

    /**
     * Volumes
     */
    test.describe
      .serial('volumes', () => {
        test('volumes screenshot', async ({ navigationBar }) => {
          let volumesPage = await navigationBar.openVolumes();
          await playExpect(volumesPage.heading).toBeVisible();

          await volumesPage.screenshot({
            name: 'volumes',
          });

          const createVolumePage = await volumesPage.openCreateVolumePage(VOLUME_NAME);
          await playExpect(createVolumePage.heading).toBeVisible();

          await createVolumePage.screenshot({
            name: 'volume-create',
          });

          volumesPage = await createVolumePage.createVolume(VOLUME_NAME);
          await playExpect
            .poll(async () => await volumesPage.waitForVolumeExists(VOLUME_NAME), {
              timeout: 25_000,
            })
            .toBeTruthy();

          await volumesPage.screenshot({
            name: 'volume-foo',
          });
        });

        test('volume details summary', async ({ navigationBar }) => {
          const volumesPage = await navigationBar.openVolumes();
          await playExpect(volumesPage.heading).toBeVisible();

          const volumeRow = await volumesPage.getVolumeRowByName(VOLUME_NAME);
          playExpect(volumeRow).not.toBeUndefined();

          const volumeDetailsPage = await volumesPage.openVolumeDetails(VOLUME_NAME);
          await playExpect(volumeDetailsPage.heading).toBeVisible();

          await volumeDetailsPage.activateTab(VolumeDetailsPage.SUMMARY_TAB);
          await playExpect(volumeDetailsPage.tabContent.getByRole('table')).toBeVisible();

          await volumeDetailsPage.screenshot({
            name: 'volume-foo-summary',
          });
        });
      });

    /**
     * Networks
     */
    test.describe
      .serial('networks', () => {
        test('networks screenshot', async ({ navigationBar }) => {
          const networksPage = await navigationBar.openNetworks();
          await playExpect(networksPage.heading).toBeVisible();

          // focus on the content
          await networksPage.content.focus();

          await networksPage.screenshot({
            name: 'networks',
          });
        });

        test('network details summary', async ({ navigationBar }) => {
          const networksPage = await navigationBar.openNetworks();
          // Get the first network from the list
          const networkRows = await networksPage.getAllTableRows();
          if (networkRows.length === 0) {
            throw new Error('No networks found to open details');
          }

          const firstNetworkName = await networkRows[0].getByRole('cell').first().innerText();
          const networkDetailsPage = await networksPage.openNetworkDetails(firstNetworkName);

          await networkDetailsPage.activateTab(NetworkDetailsPage.SUMMARY_TAB);
          await playExpect(networkDetailsPage.tabContent.getByRole('table')).toBeVisible();

          await networkDetailsPage.screenshot({
            name: 'network-details-summary',
          });
        });
      });
  });
