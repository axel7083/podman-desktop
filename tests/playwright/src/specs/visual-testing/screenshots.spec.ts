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

    test('simple screenshot', async ({ navigationBar }) => {
      const dashboard = await navigationBar.openDashboard();
      await playExpect(dashboard.heading).toBeVisible();

      await dashboard.screenshot({
        name: 'dashboard',
      });
    });
  });
