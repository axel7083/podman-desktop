import { expect as playExpect, test } from '/@/utility/fixtures';

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

      // focus on the content
      await containersPage.content.focus();

      await containersPage.screenshot({
        name: 'containers-empty',
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
        name: 'images-empty',
      });
    });

    /**
     * Volumes
     */
    test('images screenshot', async ({ navigationBar }) => {
      const volumesPage = await navigationBar.openVolumes();
      await playExpect(volumesPage.heading).toBeVisible();

      // focus on the content
      await volumesPage.content.focus();

      await volumesPage.screenshot({
        name: 'volumes-empty',
      });
    });

    /**
     * Networks
     */
    test('images screenshot', async ({ navigationBar }) => {
      const networksPage = await navigationBar.openNetworks();
      await playExpect(networksPage.heading).toBeVisible();

      // focus on the content
      await networksPage.content.focus();

      await networksPage.screenshot({
        name: 'networks-empty',
      });
    });
  });
