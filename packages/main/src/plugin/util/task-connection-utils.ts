import type containerDesktopAPI from '@podman-desktop/api';

import type { CancellationTokenRegistry } from '/@/plugin/cancellation-token-registry.js';
import type { LoggerWithEnd } from '/@/plugin/index.js';
import type { TaskManager } from '/@/plugin/tasks/task-manager.js';

interface Dependencies {
  getLogHandler(channel: string, loggerId: string): LoggerWithEnd;
  cancellationTokenRegistry: CancellationTokenRegistry;
  taskManager: TaskManager;
}

export class TaskConnectionUtils {
  constructor(protected dependencies: Dependencies) {}

  public withTask(options: {
    loggerId: string;
    tokenId: number | undefined;
    title: string;
    navigateToTask: () => Promise<void>;
    execute: (logger: LoggerWithEnd, token: containerDesktopAPI.CancellationToken | undefined) => Promise<void>;
    executeErrorMsg: (err: unknown) => string;
  }): Promise<void> {
    const logger = this.dependencies.getLogHandler('provider-registry:taskConnection-onData', options.loggerId);
    let token;
    if (options.tokenId) {
      const tokenSource = this.dependencies.cancellationTokenRegistry.getCancellationTokenSource(options.tokenId);
      token = tokenSource?.token;
    }

    const task = this.dependencies.taskManager.createTask({
      title: options.title,
      action: {
        name: 'Open task',
        execute: () => {
          options.navigateToTask().catch((err: unknown) => console.error(err));
        },
      },
    });

    return options
      .execute(logger, token)
      .then(result => {
        task.status = 'success';
        return result;
      })
      .catch((err: unknown) => {
        task.error = options.executeErrorMsg(err);
        logger.error(err);
        throw err;
      })
      .finally(() => {
        logger.onEnd();
      });
  }
}
