/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
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

/**
 * @module preload
 */
import { EventEmitter } from 'node:events';
import * as path from 'node:path';

import type {
  Cluster,
  Context as KubernetesContext,
  KubernetesObject,
  User,
  V1ConfigMap,
  V1CronJob,
  V1Deployment,
  V1Ingress,
  V1Job,
  V1NamespaceList,
  V1Node,
  V1PersistentVolumeClaim,
  V1Pod,
  V1PodList,
  V1Secret,
  V1Service,
} from '@kubernetes/client-node';
import type * as containerDesktopAPI from '@podman-desktop/api';
import type {
  ContainerCreateOptions,
  ContainerExportOptions,
  ContainerImportOptions,
  ContainerInfo,
  ContainerInspectInfo,
  ContainerStatsInfo,
  ContextGeneralState,
  ContextHealth,
  ContextPermission,
  ExtensionInfo,
  ForwardConfig,
  ForwardOptions,
  HistoryInfo,
  IDisposable,
  ImageInfo,
  ImageInspectInfo,
  ImageLoadOptions,
  ImagesSaveOptions,
  ImageUpdateStatus,
  KubeContext,
  KubernetesContextResources,
  KubernetesTroubleshootingInformation,
  ListImagesOptions,
  ListOrganizerItem,
  LogType,
  ManifestCreateOptions,
  ManifestInspectInfo,
  ManifestPushOptions,
  NetworkCreateOptions,
  NetworkCreateResult,
  NetworkInspectInfo,
  NotificationCardOptions,
  PodInfo,
  PodInspectInfo,
  PreflightCheckEvent,
  PreflightChecksCallback,
  ProviderConnectionInfo,
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
  PullEvent,
  ResourceCount,
  ResourceName,
  SecretCreateOptions,
  SecretCreateResult,
  SecretInfo,
  SimpleContainerInfo,
  V1Route,
  VolumeCreateOptions,
  VolumeCreateResponseInfo,
  VolumeInspectInfo,
  VolumeListInfo,
  WebviewInfo,
} from '@podman-desktop/core-api';
import type { ApiSenderChannelMap } from '@podman-desktop/core-api/api-sender';
import { ApiSenderType } from '@podman-desktop/core-api/api-sender';
import { IConfigurationRegistry } from '@podman-desktop/core-api/configuration';
import type {
  GenerateKubeResult,
  KubernetesGeneratorArgument,
  KubernetesGeneratorInfo,
  KubernetesGeneratorSelector,
} from '@podman-desktop/core-api/kubernetes';
import type {
  ContainerCreateOptions as PodmanContainerCreateOptions,
  PlayKubeInfo,
} from '@podman-desktop/core-api/libpod';
import type Dockerode from 'dockerode';
import type { IpcMainEvent, WebContents } from 'electron';
import { app, BrowserWindow, clipboard, ipcMain, shell } from 'electron';
import type { IpcMainInvokeEvent } from 'electron/main';
import { Container } from 'inversify';

import { IPCHandle, IPCMainOn, MainWindowDeferred } from '/@/plugin/api.js';
import { ContainerfileParser } from '/@/plugin/containerfile-parser.js';
import { ExtensionApiVersion } from '/@/plugin/extension/extension-api-version.js';
import { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import { ExtensionWatcher } from '/@/plugin/extension/extension-watcher.js';
import { ExtensionsBundle } from '/@/plugin/extension/local/extensions-bundle.js';
import { FeatureRegistry } from '/@/plugin/feature-registry.js';
import { KubeGeneratorRegistry } from '/@/plugin/kubernetes/kube-generator-registry.js';
import { LockedConfiguration } from '/@/plugin/locked-configuration.js';
import { MenuRegistry } from '/@/plugin/menu-registry.js';
import { NavigationManager } from '/@/plugin/navigation/navigation-manager.js';
import { routersModule } from '/@/plugin/routers/$module.js';
import { RpcHandler } from '/@/plugin/routers/rpc-handler.js';
import { TaskManager } from '/@/plugin/tasks/task-manager.js';
import { Uri } from '/@/plugin/types/uri.js';
import { Updater } from '/@/plugin/updater.js';
import { Welcome } from '/@/plugin/welcome.js';
import { securityRestrictionCurrentHandler } from '/@/security-restrictions-handler.js';
import { TrayMenu } from '/@/tray-menu.js';
import { isMac } from '/@/util.js';

// eslint-disable-next-line no-restricted-imports
import { AppearanceInit } from './appearance-init.js';
import { AuthenticationImpl } from './authentication.js';
import { AutostartEngine } from './autostart-engine.js';
import { CancellationTokenRegistry } from './cancellation-token-registry.js';
import { Certificates } from './certificates.js';
import { CliToolRegistry } from './cli-tool-registry.js';
import { CloseBehavior } from './close-behavior.js';
import { ColorRegistry } from './color-registry.js';
import { InjectableColorRegistry } from './color-registry-inject.js';
import { CommandRegistry } from './command-registry.js';
import { CommandsInit } from './commands-init.js';
import { ConfigurationRegistry } from './configuration-registry.js';
import { ConfirmationInit } from './confirmation-init.js';
import { ContainerProviderRegistry } from './container-registry.js';
import { Context } from './context/context.js';
import { ContributionManager } from './contribution-manager.js';
import { CustomPickRegistry } from './custompick/custompick-registry.js';
import { DashboardService } from './dashboard/dashboard-service.js';
import { DefaultConfiguration } from './default-configuration.js';
import { DialogRegistry } from './dialog-registry.js';
import { Directories } from './directories.js';
import { LegacyDirectories } from './directories-legacy.js';
import { LinuxXDGDirectories } from './directories-linux-xdg.js';
import { DockerCompatibility } from './docker/docker-compatibility.js';
import { DockerDesktopInstallation } from './docker-extension/docker-desktop-installation.js';
import { DockerPluginAdapter } from './docker-extension/docker-plugin-adapter.js';
import { DocumentationService } from './documentation/documentation-service.js';
import { EditorInit } from './editor-init.js';
import type { Emitter } from './events/emitter.js';
import { ExperimentalConfigurationManager } from './experimental-configuration-manager.js';
import { ExperimentalFeatureFeedbackHandler } from './experimental-feature-feedback-handler.js';
import { ExploreFeatures } from './explore-features/explore-features.js';
import { ExtensionsCatalog } from './extension/catalog/extensions-catalog.js';
import { ExtensionAnalyzer } from './extension/extension-analyzer.js';
import { ExtensionDevelopmentFolders } from './extension/extension-development-folders.js';
import { ExtensionsUpdater } from './extension/updater/extensions-updater.js';
import { Featured } from './featured/featured.js';
import { FeedbackHandler } from './feedback-handler.js';
import { FilesystemMonitoring } from './filesystem-monitoring.js';
import { HelpMenu } from './help-menu/help-menu.js';
import { IconRegistry } from './icon-registry.js';
import { ImageCheckerImpl } from './image-checker.js';
import { ImageFilesRegistry } from './image-files-registry.js';
import { ImageRegistry } from './image-registry.js';
import { InputQuickPickRegistry } from './input-quickpick/input-quickpick-registry.js';
import { ExtensionInstaller } from './install/extension-installer.js';
import { KubernetesClient } from './kubernetes/kubernetes-client.js';
import { LearningCenterInit } from './learning-center-init.js';
import { LibpodApiInit } from './libpod-api-enable/libpod-api-init.js';
import { ListOrganizerRegistry } from './list-organizer.js';
import { MessageBox } from './message-box.js';
import { NavigationItemsInit } from './navigation-items-init.js';
import { OnboardingRegistry } from './onboarding-registry.js';
import { OpenDevToolsInit } from './open-devtools-init.js';
import { ProviderRegistry } from './provider-registry.js';
import { Proxy } from './proxy.js';
import { RecommendationsRegistry } from './recommendations/recommendations-registry.js';
import { RegistryInit } from './registry-init.js';
import { ReleaseNotesBannerInit } from './release-notes-banner-init.js';
import { SafeStorageRegistry } from './safe-storage/safe-storage-registry.js';
import { PinRegistry } from './statusbar/pin-registry.js';
import { StatusbarProvidersInit } from './statusbar/statusbar-providers-init.js';
import { StatusBarRegistry } from './statusbar/statusbar-registry.js';
import { NotificationRegistry } from './tasks/notification-registry.js';
import { ProgressImpl } from './tasks/progress-impl.js';
import { Telemetry } from './telemetry/telemetry.js';
import { TempFileService } from './temp-file-service.js';
import { TerminalInit } from './terminal-init.js';
import { TrayIconColor } from './tray-icon-color.js';
import { TrayMenuRegistry } from './tray-menu-registry.js';
import { TrayVisibility } from './tray-visibility.js';
import { Troubleshooting } from './troubleshooting.js';
import { DirectoryStrategy } from './util/directory-strategy.js';
import { Exec } from './util/exec.js';
import { TaskConnectionUtils } from './util/task-connection-utils.js';
import { ViewRegistry } from './view-registry.js';
import { DevToolsManager } from './webview/devtools-manager.js';
import { WebviewRegistry } from './webview/webview-registry.js';
import { WelcomeInit } from './welcome/welcome-init.js';

export const UPDATER_UPDATE_AVAILABLE_ICON = 'fa fa-exclamation-triangle';

export interface LoggerWithEnd extends containerDesktopAPI.Logger {
  // when task is finished, this function is called
  onEnd: () => void;
}

export class PluginSystem {
  // ready is when we've finished to initialize extension system
  private isReady = false;

  // ready when all extensions have been started
  private isExtensionsStarted = false;

  // notified when UI is dom-ready
  private uiReady = false;

  // true if the application is quitting
  protected isQuitting = false;

  // The yet to be init ExtensionLoader
  private extensionLoader!: ExtensionLoader;
  private validExtList!: ExtensionInfo[];

  constructor(
    private trayMenu: TrayMenu,
    private mainWindowDeferred: PromiseWithResolvers<BrowserWindow>,
  ) {
    app.on('before-quit', () => {
      this.isQuitting = true;
    });
  }

  getWebContentsSender(): WebContents {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
    if (!window) {
      throw new Error('Unable to find the main window');
    }
    return window.webContents;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcHandle(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<void> | any): void {
    ipcMain.handle(channel, async (...args) => {
      try {
        return { result: await Promise.resolve(listener(...args)) };
      } catch (error) {
        // From error instance only message property will get through.
        // Sending non error instance as a message property of an object triggers
        // coercion of message property to String.
        return error instanceof Error ? { error } : { error: { message: error } };
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcMainOn(channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void): void {
    ipcMain.on(channel, listener);
  }

  // Create an Error to access stack trace
  // Match a regex for the file name and return it
  // return nothing if file name not found
  async getExtName(): Promise<string | undefined> {
    //Create an error for its stack property
    const stack = new Error().stack;
    //Create a map for extension path => extension name
    const extensions: Map<string, string> = new Map();

    //Check if index.ts private member extensionLoader initialized
    //If it is grab listExtensions()
    if (!this.extensionLoader) return;

    const currentExtList = await this.extensionLoader.listExtensions();

    //Only loop through if list of extensions is different than last time
    if (this.validExtList !== currentExtList) {
      this.validExtList = currentExtList;
      //start setting path => name
      this.validExtList.forEach((extInfo: ExtensionInfo) => {
        extensions.set(extInfo.path, extInfo.name);
      });
    }

    if (extensions.size > 0 && stack) {
      let toAppend = '';
      extensions.forEach((name, extPath) => {
        extPath = path.normalize(extPath);

        if (stack.includes(extPath)) toAppend = name;
      });

      if (toAppend !== '') return `[${toAppend}]`;
    }
    return undefined;
  }

  // log locally and also send it to the renderer process
  // so client can see logs in the developer console
  redirectConsole(logType: LogType): void {
    // keep original method
    const originalConsoleMethod = console[logType];
    console[logType] = (...args): void => {
      this.getExtName()
        .then(extName => {
          if (extName) args.unshift(extName);

          // but also send the content remotely
          if (!this.isQuitting) {
            // still display as before by invoking original method
            originalConsoleMethod(...args);

            try {
              this.getWebContentsSender().send('console:output', logType, ...args);
            } catch (err) {
              originalConsoleMethod(err);
            }
          }
        })
        .catch((err: unknown) => {
          console.error('Error in redirectConsole', err);
        });
    };
  }

  // setup pipe/redirect for console.log, console.warn, console.trace, console.debug, console.error
  redirectLogging(): void {
    const logTypes: LogType[] = ['log', 'warn', 'trace', 'debug', 'error'];
    logTypes.forEach(logType => this.redirectConsole(logType));
  }

  getApiSender(webContents: WebContents): ApiSenderType {
    const queuedEvents: { channel: string; data: unknown[] }[] = [];

    const flushQueuedEvents = (): void => {
      // flush queued events ?
      if (this.uiReady && this.isReady && queuedEvents.length > 0) {
        console.log(`Delayed startup, flushing ${queuedEvents.length} events`);
        queuedEvents.forEach(({ channel, data }) => {
          webContents.send('api-sender', channel, ...data);
        });
        queuedEvents.length = 0;
      }
    };

    webContents.on('dom-ready', () => {
      console.log('PluginSystem: received dom-ready event from the UI');
      this.uiReady = true;
      flushQueuedEvents();
    });

    const eventEmitter = new EventEmitter();
    return {
      send: <K extends keyof ApiSenderChannelMap>(
        channel: K,
        ...data: ApiSenderChannelMap[K] extends never ? [] : [data: ApiSenderChannelMap[K]]
      ): void => {
        // send only when the UI is ready
        if (this.uiReady && this.isReady) {
          flushQueuedEvents();
          if (!webContents.isDestroyed()) {
            webContents.send('api-sender', channel, ...data);
          }
        } else {
          // add to the queue
          queuedEvents.push({ channel, data });
        }
        eventEmitter.emit(channel, ...data);
      },
      receive: <K extends keyof ApiSenderChannelMap>(
        channel: K,
        func: ApiSenderChannelMap[K] extends never ? () => void : (data: ApiSenderChannelMap[K]) => void,
      ): IDisposable => {
        eventEmitter.on(channel, func);
        return {
          dispose: (): void => {
            eventEmitter.removeListener(channel, func);
          },
        };
      },
    };
  }

  async setupSecurityRestrictionsOnLinks(messageBox: MessageBox): Promise<void> {
    // external URLs should be validated by the user
    securityRestrictionCurrentHandler.handler = async (url: string): Promise<boolean> => {
      if (!url) {
        return false;
      }

      // if url is a known domain, open it directly
      const urlObject = new URL(url);
      const validDomains = ['podman-desktop.io', 'podman.io', 'localhost', '127.0.0.1'];
      const skipConfirmationUrl = validDomains.some(
        domain => urlObject.hostname.endsWith(domain) || urlObject.hostname === domain,
      );

      if (skipConfirmationUrl || urlObject.protocol === 'file:') {
        await shell.openExternal(url);
        return true;
      }

      const result = await messageBox.showMessageBox({
        title: 'Open External Link?',
        message: 'Are you sure you want to open the external website?',
        detail: url,
        type: 'question',
        buttons: ['Open', 'Copy Link', 'Cancel'],
        cancelId: 2,
      });

      if (result.response === 'Open') {
        await shell.openExternal(url);
        return true;
      } else if (result.response === 'Copy Link') {
        clipboard.writeText(url);
      }
      return false;
    };
  }

  protected async initConfigurationRegistry(
    container: Container,
    notifications: NotificationCardOptions[],
    configurationRegistryEmitter: Emitter<ConfigurationRegistry>,
  ): Promise<ConfigurationRegistry> {
    const configurationRegistry = container.get<ConfigurationRegistry>(ConfigurationRegistry);
    notifications.push(...(await configurationRegistry.init()));
    configurationRegistryEmitter.fire(configurationRegistry);
    return configurationRegistry;
  }

  // initialize extension loader mechanism
  async initExtensions(configurationRegistryEmitter: Emitter<ConfigurationRegistry>): Promise<ExtensionLoader> {
    const notifications: NotificationCardOptions[] = [];

    this.isReady = false;
    this.uiReady = false;
    this.ipcHandle('extension-system:isReady', async (): Promise<boolean> => {
      return this.isReady;
    });

    this.ipcHandle('extension-system:isExtensionsStarted', async (): Promise<boolean> => {
      return this.isExtensionsStarted;
    });

    // redirect main process logs to the extension loader
    this.redirectLogging();

    // init api sender
    const apiSender = this.getApiSender(this.getWebContentsSender());
    const container = new Container();
    container.bind<ApiSenderType>(ApiSenderType).toConstantValue(apiSender);
    container.bind<IPCHandle>(IPCHandle).toConstantValue(this.ipcHandle.bind(this));
    container.bind<IPCMainOn>(IPCMainOn).toConstantValue(this.ipcMainOn.bind(this));
    container.bind<TrayMenu>(TrayMenu).toConstantValue(this.trayMenu);
    container.bind<IconRegistry>(IconRegistry).toSelf().inSingletonScope();
    const directoryStrategy = new DirectoryStrategy();
    if (directoryStrategy.shouldUseXDGDirectories()) {
      container.bind<Directories>(Directories).to(LinuxXDGDirectories).inSingletonScope();
    } else {
      container.bind<Directories>(Directories).to(LegacyDirectories).inSingletonScope();
    }
    container.bind<StatusBarRegistry>(StatusBarRegistry).toSelf().inSingletonScope();
    container.bind<SafeStorageRegistry>(SafeStorageRegistry).toSelf().inSingletonScope();

    const safeStorageRegistry = container.get<SafeStorageRegistry>(SafeStorageRegistry);
    notifications.push(...(await safeStorageRegistry.init()));

    container.bind<DefaultConfiguration>(DefaultConfiguration).toSelf().inSingletonScope();
    container.bind<ConfigurationRegistry>(ConfigurationRegistry).toSelf().inSingletonScope();
    container.bind<LockedConfiguration>(LockedConfiguration).toSelf().inSingletonScope();
    container.bind<IConfigurationRegistry>(IConfigurationRegistry).toService(ConfigurationRegistry);
    await this.initConfigurationRegistry(container, notifications, configurationRegistryEmitter);

    container.bind<ColorRegistry>(ColorRegistry).to(InjectableColorRegistry).inSingletonScope();
    const colorRegistry = container.get<ColorRegistry>(ColorRegistry);
    colorRegistry.init();

    container.bind<Certificates>(Certificates).toSelf().inSingletonScope();
    const certificates = container.get<Certificates>(Certificates);
    await certificates.init();

    container.bind<Proxy>(Proxy).toSelf().inSingletonScope();
    const proxy = container.get<Proxy>(Proxy);
    await proxy.init();

    const exec = new Exec(proxy);
    container.bind<Exec>(Exec).toConstantValue(exec);

    container.bind<Telemetry>(Telemetry).toSelf().inSingletonScope();
    const telemetry = container.get<Telemetry>(Telemetry);
    await telemetry.init();

    container.bind<ExperimentalConfigurationManager>(ExperimentalConfigurationManager).toSelf().inSingletonScope();

    container.bind<CommandRegistry>(CommandRegistry).toSelf().inSingletonScope();
    const commandRegistry = container.get<CommandRegistry>(CommandRegistry);

    container.bind<TaskManager>(TaskManager).toSelf().inSingletonScope();
    const taskManager = container.get<TaskManager>(TaskManager);
    taskManager.init();

    container.bind<NotificationRegistry>(NotificationRegistry).toSelf().inSingletonScope();
    container.bind<MenuRegistry>(MenuRegistry).toSelf().inSingletonScope();
    container.bind<KubeGeneratorRegistry>(KubeGeneratorRegistry).toSelf().inSingletonScope();
    container.bind<ImageRegistry>(ImageRegistry).toSelf().inSingletonScope();
    container.bind<ViewRegistry>(ViewRegistry).toSelf().inSingletonScope();
    container.bind<Context>(Context).toSelf().inSingletonScope();
    container.bind<ContainerProviderRegistry>(ContainerProviderRegistry).toSelf().inSingletonScope();
    container.bind<CancellationTokenRegistry>(CancellationTokenRegistry).toSelf().inSingletonScope();

    container.bind<ProviderRegistry>(ProviderRegistry).toSelf().inSingletonScope();
    container.bind<TrayMenuRegistry>(TrayMenuRegistry).toSelf().inSingletonScope();
    container.bind<InputQuickPickRegistry>(InputQuickPickRegistry).toSelf().inSingletonScope();
    container.bind<FilesystemMonitoring>(FilesystemMonitoring).toSelf().inSingletonScope();
    container.bind<CustomPickRegistry>(CustomPickRegistry).toSelf().inSingletonScope();
    container.bind<OnboardingRegistry>(OnboardingRegistry).toSelf().inSingletonScope();
    container.bind<FeatureRegistry>(FeatureRegistry).toSelf().inSingletonScope();
    const featureRegistry = container.get<FeatureRegistry>(FeatureRegistry);
    featureRegistry.init();

    container.bind<KubernetesClient>(KubernetesClient).toSelf().inSingletonScope();
    const kubernetesClient = container.get<KubernetesClient>(KubernetesClient);
    await kubernetesClient.init();

    container.bind<CloseBehavior>(CloseBehavior).toSelf().inSingletonScope();
    const closeBehaviorConfiguration = container.get<CloseBehavior>(CloseBehavior);
    await closeBehaviorConfiguration.init();

    container.bind<TrayVisibility>(TrayVisibility).toSelf().inSingletonScope();
    const trayVisibilityConfiguration = container.get<TrayVisibility>(TrayVisibility);
    await trayVisibilityConfiguration.init();

    container.bind<DockerCompatibility>(DockerCompatibility).toSelf().inSingletonScope();
    const dockerCompatibility = container.get<DockerCompatibility>(DockerCompatibility);
    dockerCompatibility.init();

    container.bind<StatusbarProvidersInit>(StatusbarProvidersInit).toSelf().inSingletonScope();
    const statusbarProviders = container.get<StatusbarProvidersInit>(StatusbarProvidersInit);
    statusbarProviders.init();

    container.bind<DashboardService>(DashboardService).toSelf().inSingletonScope();
    container.get<DashboardService>(DashboardService);

    container.bind<HelpMenu>(HelpMenu).toSelf().inSingletonScope();
    const helpMenu = container.get<HelpMenu>(HelpMenu);
    helpMenu.init();

    container.bind<MessageBox>(MessageBox).toSelf().inSingletonScope();

    // Don't show the tray icon options on Mac
    if (!isMac()) {
      container.bind<TrayIconColor>(TrayIconColor).toSelf().inSingletonScope();
      const trayIconColor = container.get<TrayIconColor>(TrayIconColor);
      await trayIconColor.init();
    }

    // Add all notifications to notification registry
    const notificationRegistry = container.get<NotificationRegistry>(NotificationRegistry);
    notifications.forEach(notification => notificationRegistry.addNotification(notification));
    notifications.length = 0;
    Object.freeze(notifications);
    const kubeGeneratorRegistry = container.get<KubeGeneratorRegistry>(KubeGeneratorRegistry);
    const containerProviderRegistry = container.get<ContainerProviderRegistry>(ContainerProviderRegistry);
    containerProviderRegistry.init();
    kubeGeneratorRegistry.registerDefaultKubeGenerator({
      name: 'PodmanKube',
      types: ['Compose', 'Container', 'Pod'],
      generate: async (kubernetesGeneratorArguments: KubernetesGeneratorArgument[]) => {
        const results: string[] = await Promise.all(
          kubernetesGeneratorArguments.map(argument => {
            if (argument.containers)
              return containerProviderRegistry.generatePodmanKube(argument.engineId, argument.containers);
            else if (argument.compose)
              return containerProviderRegistry.generatePodmanKube(argument.engineId, argument.compose);
            else if (argument.pods)
              return containerProviderRegistry.generatePodmanKube(argument.engineId, argument.pods);
            else throw new Error('Either containers, compose or pods property must be defined.');
          }),
        );

        return {
          yaml: results.join('\n---\n'),
        };
      },
    });

    container.bind<AutostartEngine>(AutostartEngine).toSelf().inSingletonScope();
    const autoStartEngine = container.get<AutostartEngine>(AutostartEngine);

    container.bind<ContainerfileParser>(ContainerfileParser).toSelf().inSingletonScope();
    const containerfileParser = container.get(ContainerfileParser);
    containerfileParser.init();

    const providerRegistry = container.get<ProviderRegistry>(ProviderRegistry);
    providerRegistry.registerAutostartEngine(autoStartEngine);

    providerRegistry.addProviderListener((name: string, providerInfo: ProviderInfo) => {
      if (name === 'provider:update-status') {
        apiSender.send('provider:update-status', providerInfo.name);
      }
    });

    const statusBarRegistry = container.get<StatusBarRegistry>(StatusBarRegistry);
    statusBarRegistry.setEntry('help', false, -1, undefined, 'Help', 'fa fa-question-circle', true, 'help');

    statusBarRegistry.setEntry(
      'troubleshooting',
      false,
      0,
      undefined,
      'Troubleshooting',
      'fa fa-crosshairs',
      true,
      'troubleshooting',
    );

    statusBarRegistry.setEntry(
      'feedback',
      false,
      0,
      undefined,
      'Share your feedback',
      'fa fa-comment',
      true,
      'feedback',
    );

    // Init update logic
    container.bind<Updater>(Updater).toSelf().inSingletonScope();
    const podmanDesktopUpdater = container.get<Updater>(Updater);
    podmanDesktopUpdater.init();

    // register appearance (light, dark, auto being system)
    container.bind<AppearanceInit>(AppearanceInit).toSelf().inSingletonScope();
    const appearanceConfiguration = container.get<AppearanceInit>(AppearanceInit);
    appearanceConfiguration.init();

    container.bind<ConfirmationInit>(ConfirmationInit).toSelf().inSingletonScope();
    const confirmationConfiguration = container.get<ConfirmationInit>(ConfirmationInit);
    confirmationConfiguration.init();

    container.bind<ReleaseNotesBannerInit>(ReleaseNotesBannerInit).toSelf().inSingletonScope();
    const releaseNotesBannerConfiguration = container.get<ReleaseNotesBannerInit>(ReleaseNotesBannerInit);
    releaseNotesBannerConfiguration.init();

    container.bind<LearningCenterInit>(LearningCenterInit).toSelf().inSingletonScope();
    const learningCenterConfiguration = container.get<LearningCenterInit>(LearningCenterInit);
    learningCenterConfiguration.init();

    container.bind<TerminalInit>(TerminalInit).toSelf().inSingletonScope();
    const terminalInit = container.get<TerminalInit>(TerminalInit);
    terminalInit.init();

    container.bind<Welcome>(Welcome).toSelf().inSingletonScope();

    container.bind<NavigationItemsInit>(NavigationItemsInit).toSelf().inSingletonScope();
    const navigationItems = container.get<NavigationItemsInit>(NavigationItemsInit);
    navigationItems.init();

    // only in development mode
    if (import.meta.env.DEV) {
      container.bind<OpenDevToolsInit>(OpenDevToolsInit).toSelf().inSingletonScope();
      const openDevToolsInit = container.get<OpenDevToolsInit>(OpenDevToolsInit);
      openDevToolsInit.init();
    }

    // init editor configuration
    container.bind<EditorInit>(EditorInit).toSelf().inSingletonScope();
    const editorInit = container.get<EditorInit>(EditorInit);
    editorInit.init();

    // init registry configuration
    container.bind<RegistryInit>(RegistryInit).toSelf().inSingletonScope();
    const registryInit = container.get<RegistryInit>(RegistryInit);
    registryInit.init();

    // init welcome configuration
    container.bind<WelcomeInit>(WelcomeInit).toSelf().inSingletonScope();
    const welcomeInit = container.get<WelcomeInit>(WelcomeInit);
    welcomeInit.init();

    // init libpod API configuration
    container.bind<LibpodApiInit>(LibpodApiInit).toSelf().inSingletonScope();
    const libpodApiInit = container.get<LibpodApiInit>(LibpodApiInit);
    libpodApiInit.init();

    container.bind<AuthenticationImpl>(AuthenticationImpl).toSelf().inSingletonScope();
    container.bind<CliToolRegistry>(CliToolRegistry).toSelf().inSingletonScope();
    container.bind<ImageCheckerImpl>(ImageCheckerImpl).toSelf().inSingletonScope();
    container.bind<ImageFilesRegistry>(ImageFilesRegistry).toSelf().inSingletonScope();
    container.bind<Troubleshooting>(Troubleshooting).toSelf().inSingletonScope();
    container.bind<ContributionManager>(ContributionManager).toSelf().inSingletonScope();
    container.bind<DevToolsManager>(DevToolsManager).toSelf().inSingletonScope();
    container.bind<WebviewRegistry>(WebviewRegistry).toSelf().inSingletonScope();

    const webviewRegistry = container.get<WebviewRegistry>(WebviewRegistry);
    await webviewRegistry.start();

    container.bind<PromiseWithResolvers<BrowserWindow>>(MainWindowDeferred).toConstantValue(this.mainWindowDeferred);
    container.bind<DialogRegistry>(DialogRegistry).toSelf().inSingletonScope();

    const dialogRegistry = container.get<DialogRegistry>(DialogRegistry);
    dialogRegistry.init();

    container.bind<NavigationManager>(NavigationManager).toSelf().inSingletonScope();
    container.bind<CommandsInit>(CommandsInit).toSelf().inSingletonScope();
    const commandsInit = container.get<CommandsInit>(CommandsInit);
    commandsInit.init();

    const navigationManager = container.get<NavigationManager>(NavigationManager);
    navigationManager.registerRoute({ routeId: 'kubernetes', commandId: 'kubernetes-navigation' });

    container.bind<ExtensionAnalyzer>(ExtensionAnalyzer).toSelf().inSingletonScope();
    container.bind<ExtensionWatcher>(ExtensionWatcher).toSelf().inSingletonScope();
    container.bind<ExtensionDevelopmentFolders>(ExtensionDevelopmentFolders).toSelf().inSingletonScope();
    const extensionDevelopmentFolders = container.get<ExtensionDevelopmentFolders>(ExtensionDevelopmentFolders);
    extensionDevelopmentFolders.init();

    container.bind<ListOrganizerRegistry>(ListOrganizerRegistry).toSelf().inSingletonScope();
    const listOrganizerRegistry = container.get<ListOrganizerRegistry>(ListOrganizerRegistry);

    container.bind<PinRegistry>(PinRegistry).toSelf().inSingletonScope();
    const pinRegistry = container.get<PinRegistry>(PinRegistry);
    pinRegistry.init();

    container.bind<ProgressImpl>(ProgressImpl).toSelf().inSingletonScope();

    container.bind<ExtensionApiVersion>(ExtensionApiVersion).toSelf().inSingletonScope();
    container.bind<ExtensionsBundle>(ExtensionsBundle).toSelf().inSingletonScope();

    container.bind<ExtensionLoader>(ExtensionLoader).toSelf().inSingletonScope();
    this.extensionLoader = await container.getAsync<ExtensionLoader>(ExtensionLoader);
    await this.extensionLoader.init();

    container.bind<FeedbackHandler>(FeedbackHandler).toSelf().inSingletonScope();

    container.bind<ExtensionsCatalog>(ExtensionsCatalog).toSelf().inSingletonScope();
    const extensionsCatalog = container.get<ExtensionsCatalog>(ExtensionsCatalog);
    extensionsCatalog.init();

    container.bind<DocumentationService>(DocumentationService).toSelf().inSingletonScope();

    container.bind<Featured>(Featured).toSelf().inSingletonScope();
    const featured = container.get<Featured>(Featured);

    container.bind<RecommendationsRegistry>(RecommendationsRegistry).toSelf().inSingletonScope();
    const recommendationsRegistry = container.get<RecommendationsRegistry>(RecommendationsRegistry);
    recommendationsRegistry.init();

    container.bind<TempFileService>(TempFileService).toSelf().inSingletonScope();

    container.bind<ExploreFeatures>(ExploreFeatures).toSelf().inSingletonScope();
    const exploreFeatures = container.get<ExploreFeatures>(ExploreFeatures);

    // do not wait
    featured.init().catch((e: unknown) => {
      console.error('Unable to initialized the featured extensions', e);
    });

    // setup security restrictions on links
    const messageBox = container.get<MessageBox>(MessageBox);
    const cancellationTokenRegistry = container.get<CancellationTokenRegistry>(CancellationTokenRegistry);
    const cliToolRegistry = container.get<CliToolRegistry>(CliToolRegistry);
    const troubleshooting = container.get<Troubleshooting>(Troubleshooting);
    troubleshooting.init();
    const contributionManager = container.get<ContributionManager>(ContributionManager);
    const directories = container.get<Directories>(Directories);
    const imageRegistry = container.get<ImageRegistry>(ImageRegistry);
    container.bind<ExperimentalFeatureFeedbackHandler>(ExperimentalFeatureFeedbackHandler).toSelf().inSingletonScope();
    const experimentalFeatureFeedbackHandler = container.get<ExperimentalFeatureFeedbackHandler>(
      ExperimentalFeatureFeedbackHandler,
    );
    await experimentalFeatureFeedbackHandler.init();

    container.load(routersModule);
    const rpcHandler = container.get<RpcHandler>(RpcHandler);
    rpcHandler.init(container);

    await this.setupSecurityRestrictionsOnLinks(messageBox);

    this.ipcHandle('container-provider-registry:listContainers', async (): Promise<ContainerInfo[]> => {
      return containerProviderRegistry.listContainers();
    });

    this.ipcHandle('container-provider-registry:listSecrets', async (): Promise<Array<SecretInfo>> => {
      return containerProviderRegistry.listSecrets();
    });

    this.ipcHandle(
      'container-provider-registry:removeSecret',
      async (_listener, engineId: string, secretId: string): Promise<void> => {
        return containerProviderRegistry.removeSecret(engineId, secretId);
      },
    );

    this.ipcHandle(
      'container-provider-registry:inspectSecret',
      async (_listener, engineId: string, secretId: string): Promise<SecretInfo> => {
        return containerProviderRegistry.inspectSecret(engineId, secretId);
      },
    );

    this.ipcHandle(
      'container-provider-registry:createSecret',
      async (_listener, options: SecretCreateOptions): Promise<SecretCreateResult> => {
        return containerProviderRegistry.createSecret(options);
      },
    );

    this.ipcHandle(
      'container-provider-registry:listSimpleContainersByLabel',
      async (_listener, label: string, key: string): Promise<SimpleContainerInfo[]> => {
        return containerProviderRegistry.listSimpleContainersByLabel(label, key);
      },
    );

    this.ipcHandle('container-provider-registry:listSimpleContainers', async (): Promise<SimpleContainerInfo[]> => {
      return containerProviderRegistry.listSimpleContainers();
    });
    this.ipcHandle(
      'container-provider-registry:listImages',
      async (_listener, options?: ListImagesOptions): Promise<ImageInfo[]> => {
        return containerProviderRegistry.listImages(options);
      },
    );
    this.ipcHandle('container-provider-registry:listPods', async (): Promise<PodInfo[]> => {
      return containerProviderRegistry.listPods();
    });
    this.ipcHandle('container-provider-registry:listNetworks', async (): Promise<NetworkInspectInfo[]> => {
      return containerProviderRegistry.listNetworks();
    });
    this.ipcHandle(
      'container-provider-registry:removeNetwork',
      async (_listener, engine: string, networkId: string): Promise<void> => {
        return containerProviderRegistry.removeNetwork(engine, networkId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:updateNetwork',
      async (
        _listener,
        engineId: string,
        networkId: string,
        addDNSServers: string[],
        removeDNSServers: string[],
      ): Promise<void> => {
        return containerProviderRegistry.updateNetwork(engineId, networkId, addDNSServers, removeDNSServers);
      },
    );
    this.ipcHandle(
      'container-provider-registry:createNetwork',
      async (
        _listener,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
        options: NetworkCreateOptions,
      ): Promise<NetworkCreateResult> => {
        return containerProviderRegistry.createNetwork(providerContainerConnectionInfo, options);
      },
    );
    this.ipcHandle(
      'container-provider-registry:inspectNetwork',
      async (_listener, engine: string, networkId: string): Promise<NetworkInspectInfo> => {
        return containerProviderRegistry.inspectNetwork(engine, networkId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:getNetworkDrivers',
      async (_listener, providerContainerConnectionInfo: ProviderContainerConnectionInfo): Promise<string[]> => {
        return containerProviderRegistry.getNetworkDrivers(providerContainerConnectionInfo);
      },
    );
    this.ipcHandle(
      'container-provider-registry:listVolumes',
      async (_listener, fetchUsage: boolean): Promise<VolumeListInfo[]> => {
        return containerProviderRegistry.listVolumes(fetchUsage);
      },
    );

    this.ipcHandle('container-provider-registry:reconnectContainerProviders', async (): Promise<void> => {
      return containerProviderRegistry.reconnectContainerProviders();
    });

    this.ipcHandle(
      'container-provider-registry:pingContainerEngine',
      async (_listener, providerContainerConnectionInfo: ProviderContainerConnectionInfo): Promise<unknown> => {
        return containerProviderRegistry.pingContainerEngine(providerContainerConnectionInfo);
      },
    );

    this.ipcHandle(
      'container-provider-registry:listContainersFromEngine',
      async (
        _listener,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
      ): Promise<{ Id: string; Names: string[] }[]> => {
        return containerProviderRegistry.listContainersFromEngine(providerContainerConnectionInfo);
      },
    );

    this.ipcHandle(
      'container-provider-registry:pruneVolumes',
      async (_listener, engine: string): Promise<Dockerode.PruneVolumesInfo> => {
        return containerProviderRegistry.pruneVolumes(engine);
      },
    );

    this.ipcHandle(
      'container-provider-registry:getVolumeInspect',
      async (_listener, engine: string, volumeName: string): Promise<VolumeInspectInfo> => {
        return containerProviderRegistry.getVolumeInspect(engine, volumeName);
      },
    );
    this.ipcHandle(
      'container-provider-registry:removeVolume',
      async (_listener, engine: string, volumeName: string): Promise<void> => {
        return containerProviderRegistry.removeVolume(engine, volumeName);
      },
    );

    this.ipcHandle(
      'container-provider-registry:replicatePodmanContainer',
      async (
        _listener,
        source: { engineId: string; id: string },
        target: { engineId: string },
        overrideParameters: PodmanContainerCreateOptions,
      ): Promise<{ Id: string; Warnings: string[] }> => {
        return containerProviderRegistry.replicatePodmanContainer(source, target, overrideParameters);
      },
    );

    this.ipcHandle(
      'container-provider-registry:createPod',
      async (
        _listener,
        createOptions: containerDesktopAPI.PodCreateOptions,
      ): Promise<{ engineId: string; Id: string }> => {
        return containerProviderRegistry.createPod(createOptions);
      },
    );
    this.ipcHandle(
      'container-provider-registry:startPod',
      async (_listener, engine: string, podId: string): Promise<void> => {
        return containerProviderRegistry.startPod(engine, podId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:unpausePod',
      async (_listener, engine: string, podId: string): Promise<void> => {
        return containerProviderRegistry.unpausePod(engine, podId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:restartPod',
      async (_listener, engine: string, podId: string): Promise<void> => {
        return containerProviderRegistry.restartPod(engine, podId);
      },
    );
    this.ipcHandle('kubernetes-client:restartPod', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.restartPod(name);
    });
    this.ipcHandle(
      'container-provider-registry:stopPod',
      async (_listener, engine: string, podId: string): Promise<void> => {
        return containerProviderRegistry.stopPod(engine, podId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:removePod',
      async (_listener, engine: string, podId: string): Promise<void> => {
        return containerProviderRegistry.removePod(engine, podId);
      },
    );

    // manifest
    this.ipcHandle(
      'container-provider-registry:createManifest',
      async (_listener, manifestOptions: ManifestCreateOptions): Promise<{ engineId: string; Id: string }> => {
        return containerProviderRegistry.createManifest(manifestOptions);
      },
    );

    this.ipcHandle(
      'container-provider-registry:pushManifest',
      async (_listener, manifestOptions: ManifestPushOptions): Promise<void> => {
        return containerProviderRegistry.pushManifest(manifestOptions);
      },
    );

    this.ipcHandle(
      'container-provider-registry:inspectManifest',
      async (_listener, engine: string, manifestId: string): Promise<ManifestInspectInfo> => {
        return containerProviderRegistry.inspectManifest(engine, manifestId);
      },
    );

    this.ipcHandle(
      'container-provider-registry:removeManifest',
      async (_listener, engine: string, manifestId: string): Promise<void> => {
        return containerProviderRegistry.removeManifest(engine, manifestId);
      },
    );

    this.ipcHandle(
      'container-provider-registry:generatePodmanKube',
      async (_listener, engine: string, names: string[]): Promise<string> => {
        const kubeGenerator = kubeGeneratorRegistry.getKubeGenerator();
        if (!kubeGenerator) throw new Error(`Cannot find default KubeGenerator.`);

        return (
          await kubeGenerator.generate([
            {
              engineId: engine,
              containers: names,
            },
          ])
        ).yaml;
      },
    );

    this.ipcHandle(
      'kubernetes-generator-registry:generateKube',
      async (
        _listener,
        kubernetesGeneratorArguments: KubernetesGeneratorArgument[],
        kubeGeneratorId?: string,
      ): Promise<GenerateKubeResult> => {
        const kubeGenerator = kubeGeneratorRegistry.getKubeGenerator(kubeGeneratorId);
        if (!kubeGenerator) throw new Error(`kubeGenerator with id ${kubeGeneratorId} cannot be found.`);

        return kubeGenerator.generate(kubernetesGeneratorArguments);
      },
    );

    this.ipcHandle(
      'container-provider-registry:playKube',
      async (
        _listener,
        yamlFilePath: string,
        selectedProvider: ProviderContainerConnectionInfo,
        options?: {
          build?: boolean;
          replace?: boolean;
          cancellableTokenId?: number;
        },
      ): Promise<PlayKubeInfo> => {
        const abortController = this.createAbortControllerOnCancellationToken(
          cancellationTokenRegistry,
          options?.cancellableTokenId,
        );

        const task = taskManager.createTask({
          title: `Podman Play Kube`,
          cancellable: options?.cancellableTokenId !== undefined,
          cancellationTokenSourceId: options?.cancellableTokenId,
        });

        try {
          const result = await containerProviderRegistry.playKube(yamlFilePath, selectedProvider, {
            ...options,
            abortSignal: abortController?.signal,
          });
          task.status = 'success';
          return result;
        } catch (error: unknown) {
          task.error = String(error);
          task.status = 'failure';
          throw error;
        }
      },
    );

    this.ipcHandle(
      'container-provider-registry:startContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.startContainer(engine, containerId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:unpauseContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.unpauseContainer(engine, containerId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:stopContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.stopContainer(engine, containerId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:deleteContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.deleteContainer(engine, containerId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:deleteImage',
      async (_listener, engine: string, imageId: string): Promise<void> => {
        return containerProviderRegistry.deleteImage(engine, imageId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:tagImage',
      async (_listener, engine: string, imageTag: string, repo: string, tag?: string): Promise<void> => {
        return containerProviderRegistry.tagImage(engine, imageTag, repo, tag);
      },
    );
    this.ipcHandle(
      'container-provider-registry:getImageInspect',
      async (_listener, engine: string, imageId: string): Promise<ImageInspectInfo> => {
        return containerProviderRegistry.getImageInspect(engine, imageId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:getImageHistory',
      async (_listener, engine: string, imageId: string): Promise<HistoryInfo[]> => {
        return containerProviderRegistry.getImageHistory(engine, imageId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:getContainerInspect',
      async (_listener, engine: string, containerId: string): Promise<ContainerInspectInfo> => {
        return containerProviderRegistry.getContainerInspect(engine, containerId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:getPodInspect',
      async (_listener, engine: string, podId: string): Promise<PodInspectInfo> => {
        return containerProviderRegistry.getPodInspect(engine, podId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:getContainerStats',
      async (_listener, engine: string, containerId: string, onDataId: number): Promise<number> => {
        return containerProviderRegistry.getContainerStats(engine, containerId, (stats: ContainerStatsInfo) => {
          this.getWebContentsSender().send('container-provider-registry:getContainerStats-onData', onDataId, stats);
        });
      },
    );

    this.ipcHandle(
      'container-provider-registry:stopContainerStats',
      async (_listener, containerStatsId: number): Promise<void> => {
        return containerProviderRegistry.stopContainerStats(containerStatsId);
      },
    );

    this.ipcHandle(
      'container-provider-registry:pruneContainers',
      async (_listener, engine: string): Promise<Dockerode.PruneContainersInfo> => {
        return containerProviderRegistry.pruneContainers(engine);
      },
    );

    this.ipcHandle('container-provider-registry:prunePods', async (_listener, engine: string): Promise<void> => {
      return containerProviderRegistry.prunePods(engine);
    });

    this.ipcHandle(
      'container-provider-registry:pruneImages',
      async (_listener, engine: string, all: boolean): Promise<void> => {
        return containerProviderRegistry.pruneImages(engine, all);
      },
    );

    this.ipcHandle(
      'container-provider-registry:restartContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.restartContainer(engine, containerId);
      },
    );

    this.ipcHandle(
      'container-provider-registry:restartContainersByLabel',
      async (_listener, engine: string, label: string, key: string): Promise<void> => {
        return containerProviderRegistry.restartContainersByLabel(engine, label, key);
      },
    );

    this.ipcHandle(
      'container-provider-registry:startContainersByLabel',
      async (_listener, engine: string, label: string, key: string): Promise<void> => {
        return containerProviderRegistry.startContainersByLabel(engine, label, key);
      },
    );

    this.ipcHandle(
      'container-provider-registry:stopContainersByLabel',
      async (_listener, engine: string, label: string, key: string): Promise<void> => {
        return containerProviderRegistry.stopContainersByLabel(engine, label, key);
      },
    );

    this.ipcHandle(
      'container-provider-registry:deleteContainersByLabel',
      async (_listener, engine: string, label: string, key: string): Promise<void> => {
        return containerProviderRegistry.deleteContainersByLabel(engine, label, key);
      },
    );

    this.ipcHandle(
      'container-provider-registry:createAndStartContainer',
      async (_listener, engine: string, options: ContainerCreateOptions): Promise<{ id: string }> => {
        options.start = true;
        return containerProviderRegistry.createContainer(engine, options);
      },
    );

    this.ipcHandle(
      'container-provider-registry:createVolume',
      async (
        _listener,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
        options: VolumeCreateOptions,
      ): Promise<VolumeCreateResponseInfo> => {
        return containerProviderRegistry.createVolume(providerContainerConnectionInfo, options);
      },
    );

    this.ipcHandle(
      'container-provider-registry:resolveShortnameImage',
      async (
        _listener,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
        shortName: string,
      ): Promise<string[]> => {
        return containerProviderRegistry.resolveShortnameImage(providerContainerConnectionInfo, shortName);
      },
    );

    this.ipcHandle(
      'container-provider-registry:pullImage',
      async (
        _listener,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
        imageName: string,
        callbackId: number,
        platform?: string,
        cancellableTokenId?: number,
      ): Promise<void> => {
        const abortController = this.createAbortControllerOnCancellationToken(
          cancellationTokenRegistry,
          cancellableTokenId,
        );
        const task = taskManager.createTask({
          title: `Pulling ${imageName}`,
          cancellable: cancellableTokenId !== undefined,
          cancellationTokenSourceId: cancellableTokenId,
        });

        try {
          await containerProviderRegistry.pullImage(
            providerContainerConnectionInfo,
            imageName,
            (event: PullEvent) => {
              this.getWebContentsSender().send('container-provider-registry:pullImage-onData', callbackId, event);
            },
            platform,
            abortController,
          );
          task.status = 'success';
        } catch (error: unknown) {
          const cancellationToken = cancellableTokenId
            ? cancellationTokenRegistry.getCancellationTokenSource(cancellableTokenId)?.token
            : undefined;
          if (cancellationToken?.isCancellationRequested) {
            task.status = 'canceled';
          } else {
            task.error = `Something went wrong while trying to pull ${imageName}: ${String(error)};`;
          }
          throw error;
        }
      },
    );

    this.ipcHandle(
      'image-registry:checkImageUpdateStatus',
      async (
        _listener,
        imageReference: string,
        imageTag: string,
        localDigests: string[],
      ): Promise<ImageUpdateStatus> => {
        return imageRegistry.checkImageUpdateStatus(imageReference, imageTag, localDigests);
      },
    );

    this.ipcHandle(
      'container-provider-registry:pushImage',
      async (_listener, engine: string, imageId: string, callbackId: number): Promise<void> => {
        const msgName = 'container-provider-registry:pushImage-onData';
        const task = taskManager.createTask({
          title: `Push image '${imageId}'`,
        });
        return containerProviderRegistry
          .pushImage(engine, imageId, (name: string, data: string) => {
            this.getWebContentsSender().send(msgName, callbackId, name, data);
          })
          .then(() => {
            task.status = 'success';
          })
          .catch((error: unknown) => {
            task.error = String(error);
            this.getWebContentsSender().send(msgName, callbackId, 'error', String(error));
            this.getWebContentsSender().send(msgName, callbackId, 'end');
          });
      },
    );
    this.ipcHandle(
      'container-provider-registry:logsContainer',
      async (
        _listener,
        logsParams: {
          engineId: string;
          containerId: string;
          onDataId: number;
          cancellableTokenId?: number;
          timestamps?: boolean;
          tail?: number;
          since?: string;
        },
      ): Promise<void> => {
        const abortController = this.createAbortControllerOnCancellationToken(
          cancellationTokenRegistry,
          logsParams.cancellableTokenId,
        );

        return containerProviderRegistry.logsContainer({
          engineId: logsParams.engineId,
          id: logsParams.containerId,
          callback: (name: string, data: string) => {
            this.getWebContentsSender().send(
              'container-provider-registry:logsContainer-onData',
              logsParams.onDataId,
              name,
              data,
            );
          },
          abortController,
          timestamps: logsParams.timestamps,
          tail: logsParams.tail,
          since: logsParams.since,
        });
      },
    );

    const containerProviderRegistryShellInContainerSendCallback = new Map<
      number,
      { write: (param: string) => void; resize: (w: number, h: number) => void }
    >();
    this.ipcHandle(
      'container-provider-registry:shellInContainer',
      async (_listener, engine: string, containerId: string, onDataId: number): Promise<number> => {
        // provide the data content to the remote side
        const shellInContainerInvocation = await containerProviderRegistry.shellInContainer(
          engine,
          containerId,
          (content: Buffer) => {
            this.getWebContentsSender().send('container-provider-registry:shellInContainer-onData', onDataId, content);
          },
          (error: string) => {
            this.getWebContentsSender().send('container-provider-registry:shellInContainer-onError', onDataId, error);
          },
          () => {
            this.getWebContentsSender().send('container-provider-registry:shellInContainer-onEnd', onDataId);
            // delete the callback
            containerProviderRegistryShellInContainerSendCallback.delete(onDataId);
          },
        );
        // store the callback
        containerProviderRegistryShellInContainerSendCallback.set(onDataId, shellInContainerInvocation);
        return onDataId;
      },
    );

    this.ipcHandle(
      'container-provider-registry:shellInContainerSend',
      async (_listener, onDataId: number, content: string): Promise<void> => {
        const callback = containerProviderRegistryShellInContainerSendCallback.get(onDataId);
        if (callback) {
          callback.write(content);
        }
      },
    );

    this.ipcHandle(
      'container-provider-registry:shellInContainerResize',
      async (_listener, onDataId: number, width: number, height: number): Promise<void> => {
        const callback = containerProviderRegistryShellInContainerSendCallback.get(onDataId);
        if (callback) {
          callback.resize(width, height);
        }
      },
    );

    const providerRegistryShellInProviderConnectionSendCallback = new Map<
      number,
      {
        write: (param: string) => void;
        resize: (dimensions: containerDesktopAPI.ProviderConnectionShellDimensions) => void;
        close: () => void;
      }
    >();
    this.ipcHandle(
      'provider-registry:shellInProviderConnection',
      async (
        _listener,
        internalProviderId: string,
        connectionInfo: ProviderConnectionInfo,
        onDataId: number,
      ): Promise<number> => {
        // provide the data content to the remote side
        const shellInProviderConnectionInvocation = await providerRegistry.shellInProviderConnection(
          internalProviderId,
          connectionInfo,
          (content: string) => {
            this.getWebContentsSender().send('provider-registry:shellInProviderConnection-onData', onDataId, content);
          },
          (error: string) => {
            this.getWebContentsSender().send('provider-registry:shellInProviderConnection-onError', onDataId, error);
          },
          () => {
            this.getWebContentsSender().send('provider-registry:shellInProviderConnection-onEnd', onDataId);
            // delete the callback
            providerRegistryShellInProviderConnectionSendCallback.delete(onDataId);
          },
        );
        // store the callback
        providerRegistryShellInProviderConnectionSendCallback.set(onDataId, shellInProviderConnectionInvocation);
        return onDataId;
      },
    );

    this.ipcHandle(
      'provider-registry:shellInProviderConnectionSend',
      async (_listener, onDataId: number, content: string): Promise<void> => {
        const callback = providerRegistryShellInProviderConnectionSendCallback.get(onDataId);
        if (callback) {
          callback.write(content);
        }
      },
    );

    this.ipcHandle(
      'provider-registry:shellInProviderConnectionResize',
      async (
        _listener,
        onDataId: number,
        dimensions: containerDesktopAPI.ProviderConnectionShellDimensions,
      ): Promise<void> => {
        const callback = providerRegistryShellInProviderConnectionSendCallback.get(onDataId);
        if (callback) {
          callback.resize(dimensions);
        }
      },
    );

    this.ipcHandle(
      'provider-registry:shellInProviderConnectionClose',
      async (_listener, onDataId: number): Promise<void> => {
        const callback = providerRegistryShellInProviderConnectionSendCallback.get(onDataId);
        callback?.close();
      },
    );

    const containerProviderRegistryAttachContainerSendCallback = new Map<number, (param: string) => void>();
    this.ipcHandle(
      'container-provider-registry:attachContainer',
      async (_listener, engine: string, containerId: string, onDataId: number): Promise<number> => {
        // provide the data content to the remote side
        const attachContainerInvocation = await containerProviderRegistry.attachContainer(
          engine,
          containerId,
          (content: string) => {
            this.getWebContentsSender().send('container-provider-registry:attachContainer-onData', onDataId, content);
          },
          (error: string) => {
            this.getWebContentsSender().send('container-provider-registry:attachContainer-onError', onDataId, error);
          },
          () => {
            this.getWebContentsSender().send('container-provider-registry:attachContainer-onEnd', onDataId);
            // delete the callback
            containerProviderRegistryAttachContainerSendCallback.delete(onDataId);
          },
        );
        // store the callback
        containerProviderRegistryAttachContainerSendCallback.set(onDataId, attachContainerInvocation);
        return onDataId;
      },
    );

    this.ipcHandle(
      'container-provider-registry:attachContainerSend',
      async (_listener, onDataId: number, content: string): Promise<void> => {
        const callback = containerProviderRegistryAttachContainerSendCallback.get(onDataId);
        if (callback) {
          callback(content);
        }
      },
    );

    this.ipcHandle(
      'container-provider-registry:buildImage',
      async (
        _listener,
        containerBuildContextDirectory: string,
        relativeContainerfilePath: string,
        imageName: string | undefined,
        platform: string,
        selectedProvider: ProviderContainerConnectionInfo,
        onDataCallbacksBuildImageId: number,
        cancellableTokenId?: number,
        buildargs?: { [key: string]: string },
        taskId?: number,
        target?: string,
        validateRegistries?: boolean,
      ): Promise<unknown> => {
        const titleArgs = ['Building image'];
        if (imageName) {
          titleArgs.push(imageName);
        }
        if (target) {
          titleArgs.push(`(${target})`);
          telemetry.track('build-image-intermediate-target');
        }

        // create task
        const task = taskManager.createTask({
          title: titleArgs.join(' '),
          action: {
            name: 'Go to task >',
            execute: () => {
              navigationManager.navigateToImageBuild(taskId).catch((err: unknown) => {
                console.error(`Something went wrong while trying to navigate to image build: ${String(err)}`);
              });
            },
          },
        });

        task.onUpdate(e => apiSender.send(`build-image-task-${e.action}`, taskId));

        const abortController = this.createAbortControllerOnCancellationToken(
          cancellationTokenRegistry,
          cancellableTokenId,
        );

        return containerProviderRegistry
          .buildImage(
            containerBuildContextDirectory,
            (eventName: string, data: string) => {
              this.getWebContentsSender().send(
                'container-provider-registry:buildImage-onData',
                onDataCallbacksBuildImageId,
                eventName,
                data,
              );
            },
            {
              containerFile: relativeContainerfilePath,
              tag: imageName,
              platform,
              provider: selectedProvider,
              abortController,
              buildargs,
              target,
              validateRegistries,
            },
          )
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((err: unknown) => {
            task.error = `Something went wrong while trying to build image: ${String(err)}`;
            throw err;
          });
      },
    );

    this.ipcHandle(
      'container-provider-registry:exportContainer',
      async (_listener, engine: string, options: ContainerExportOptions): Promise<void> => {
        // create task
        const containerId = options.id.startsWith('sha256:') ? options.id.substring('sha256:'.length) : options.id;
        const task = taskManager.createTask({
          title: `Exporting ${containerId.substring(0, 12) ?? 'container'}`,
          action: {
            name: 'Open folder',
            execute: (): void => {
              dialogRegistry.openDialog({ defaultUri: Uri.file(options.outputTarget) }).catch((error: unknown) => {
                console.error('Error opening dialog', error);
              });
            },
          },
        });
        // wrap the logic to handle potential error
        return containerProviderRegistry
          .exportContainer(engine, options)
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((err: unknown) => {
            task.error = `Something went wrong while trying to export container: ${String(err)}`;
            throw err;
          });
      },
    );

    this.ipcHandle(
      'container-provider-registry:importContainer',
      async (_listener, options: ContainerImportOptions): Promise<void> => {
        // create task
        const task = taskManager.createTask({
          title: `Importing ${options.imageTag ?? 'container'}`,
        });
        // wrap the logic to handle potential error
        return containerProviderRegistry
          .importContainer(options)
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((err: unknown) => {
            task.error = `Something went wrong while trying to import container: ${String(err)}`;
            throw err;
          });
      },
    );

    this.ipcHandle(
      'container-provider-registry:saveImages',
      async (_listener, options: ImagesSaveOptions): Promise<void> => {
        // create task
        const task = taskManager.createTask({
          title: `Saving image${options.images.length > 1 ? 's' : ''}`,
        });
        // wrap the logic to handle potential error
        return containerProviderRegistry
          .saveImages(options)
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((err: unknown) => {
            task.error = `Something went wrong while trying to save images: ${String(err)}`;
            throw err;
          });
      },
    );

    this.ipcHandle(
      'container-provider-registry:loadImages',
      async (_listener, options: ImageLoadOptions): Promise<void> => {
        // create task
        const task = taskManager.createTask({
          title: `Loading image${options.archives.length > 1 ? 's' : ''}`,
        });
        // wrap the logic to handle potential error
        return containerProviderRegistry
          .loadImages(options)
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((err: unknown) => {
            task.error = `Something went wrong while trying to load images: ${String(err)}`;
            throw err;
          });
      },
    );

    this.ipcHandle('provider-registry:getProviderInfos', async (): Promise<ProviderInfo[]> => {
      return providerRegistry.getProviderInfos();
    });

    this.ipcHandle(
      'provider-registry:cleanup',
      async (_listener, providerIds: string[], loggerId: string, tokenId: number): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:cleanup-onData', loggerId);

        const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(tokenId);
        const token = tokenSource?.token;

        return providerRegistry.executeCleanupActions(logger, providerIds, token);
      },
    );

    this.ipcHandle(
      'troubleshooting:saveLogs',
      async (_listener, consoleLogs: { logType: LogType; message: string }[]): Promise<string[]> => {
        return troubleshooting.saveLogs(consoleLogs);
      },
    );

    this.ipcHandle(
      'cli-tool-registry:updateCliTool',
      async (_listener, id: string, version: string, loggerId: string): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:updateCliTool-onData', loggerId);
        const tool = cliToolRegistry.getCliToolInfos().find(tool => tool.id === id);
        if (!tool) throw new Error(`cannot find cli tool with id ${id}`);

        // create task
        const task = taskManager.createTask({
          title: `Updating ${tool.name} to v${version}`,
          action: {
            name: 'goto task >',
            execute: (): void => {
              navigationManager.navigateToCliTools().catch((err: unknown) => console.error(err));
            },
          },
        });

        return cliToolRegistry
          .updateCliTool(id, logger)
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((error: unknown) => {
            task.error = `Something went wrong while trying to update ${tool.name}: ${error}`;
            logger.error(error);
            throw error;
          })
          .finally(() => {
            logger.onEnd();
          });
      },
    );

    this.ipcHandle(
      'cli-tool-registry:installCliTool',
      async (_listener, id: string, versionToInstall: string, loggerId: string): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:installCliTool-onData', loggerId);
        const tool = cliToolRegistry.getCliToolInfos().find(tool => tool.id === id);
        if (!tool) throw new Error(`cannot find cli tool with id ${id}`);

        // create task
        const task = taskManager.createTask({
          title: `Installing ${tool.name} ${versionToInstall ? 'v' + versionToInstall : 'latest'}`,
          action: {
            name: 'goto task >',
            execute: (): void => {
              navigationManager.navigateToCliTools().catch((err: unknown) => console.error(err));
            },
          },
        });

        return cliToolRegistry
          .installCliTool(id, logger)
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((error: unknown) => {
            task.error = `Something went wrong while trying to install ${tool.name}: ${error}`;
            logger.error(error);
            throw error;
          })
          .finally(() => {
            logger.onEnd();
          });
      },
    );

    this.ipcHandle(
      'cli-tool-registry:uninstallCliTool',
      async (_listener, id: string, loggerId: string): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:installCliTool-onData', loggerId);
        const tool = cliToolRegistry.getCliToolInfos().find(tool => tool.id === id);
        if (!tool) throw new Error(`cannot find cli tool with id ${id}`);

        // create task
        const task = taskManager.createTask({
          title: `Uninstalling ${tool.name} v${tool.version}`,
          action: {
            name: 'goto task >',
            execute: (): void => {
              navigationManager.navigateToCliTools().catch((err: unknown) => console.error(err));
            },
          },
        });

        return cliToolRegistry
          .uninstallCliTool(id, logger)
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((error: unknown) => {
            task.error = `Something went wrong while trying to uninstall ${tool.name}: ${error}`;
            logger.error(error);
            throw error;
          })
          .finally(() => {
            logger.onEnd();
          });
      },
    );

    this.ipcHandle(
      'kube-generator-registry:getKubeGeneratorsInfos',
      async (_, selector?: KubernetesGeneratorSelector): Promise<KubernetesGeneratorInfo[]> => {
        return kubeGeneratorRegistry.getKubeGeneratorsInfos(selector);
      },
    );

    this.ipcHandle(
      'command-registry:executeCommand',
      async (_, command: string, ...args: unknown[]): Promise<unknown> => {
        return commandRegistry.executeCommand(command, ...args);
      },
    );

    this.ipcHandle(
      'provider-registry:onDidUpdateProviderStatus',
      async (_, providerInternalId: string, onDidUpdateProviderStatusCallbackIdnumber: number): Promise<void> => {
        return providerRegistry.onDidUpdateProviderStatus(providerInternalId, (providerInfo: ProviderInfo) => {
          this.getWebContentsSender().send(
            'provider-registry:onDidUpdateProviderStatus-onData',
            onDidUpdateProviderStatusCallbackIdnumber,
            providerInfo,
          );
        });
      },
    );

    this.ipcHandle(
      'provider-registry:getProviderDetectionChecks',
      async (_, providerInternalId: string): Promise<containerDesktopAPI.ProviderDetectionCheck[]> => {
        return providerRegistry.getProviderDetectionChecks(providerInternalId);
      },
    );

    this.ipcHandle('provider-registry:updateProvider', async (_, providerInternalId: string): Promise<void> => {
      return providerRegistry.updateProvider(providerInternalId);
    });

    this.ipcHandle('provider-registry:installProvider', async (_, providerInternalId: string): Promise<void> => {
      return providerRegistry.installProvider(providerInternalId);
    });

    this.ipcHandle(
      'provider-registry:runInstallPreflightChecks',
      async (_, providerInternalId: string, callbackId: number): Promise<boolean> => {
        const callback: PreflightChecksCallback = {
          startCheck: status => {
            this.getWebContentsSender().send('provider-registry:installPreflightChecksUpdate', callbackId, {
              type: 'start',
              status,
            } as PreflightCheckEvent);
          },
          endCheck: status => {
            this.getWebContentsSender().send('provider-registry:installPreflightChecksUpdate', callbackId, {
              type: 'stop',
              status,
            } as PreflightCheckEvent);
          },
        };
        return providerRegistry.runPreflightChecks(providerInternalId, callback, false);
      },
    );

    this.ipcHandle(
      'provider-registry:runUpdatePreflightChecks',
      async (_, providerInternalId: string, callbackId: number): Promise<boolean> => {
        const callback: PreflightChecksCallback = {
          startCheck: status => {
            this.getWebContentsSender().send('provider-registry:updatePreflightChecksUpdate', callbackId, {
              type: 'start',
              status,
            } as PreflightCheckEvent);
          },
          endCheck: status => {
            this.getWebContentsSender().send('provider-registry:updatePreflightChecksUpdate', callbackId, {
              type: 'stop',
              status,
            } as PreflightCheckEvent);
          },
        };
        return providerRegistry.runPreflightChecks(providerInternalId, callback, true);
      },
    );

    this.ipcHandle('provider-registry:startProvider', async (_, providerInternalId: string): Promise<void> => {
      return providerRegistry.startProvider(providerInternalId);
    });

    this.ipcHandle('provider-registry:initializeProvider', async (_, providerInternalId: string): Promise<void> => {
      return providerRegistry.initializeProvider(providerInternalId);
    });

    this.ipcHandle(
      'provider-registry:startReceiveLogs',
      async (
        _listener,
        providerId: string,
        callbackId: number,
        connectionInfo?: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
      ): Promise<void> => {
        let context;
        if (connectionInfo) {
          context = providerRegistry.getMatchingConnectionLifecycleContext(providerId, connectionInfo);
        } else {
          context = providerRegistry.getMatchingLifecycleContext(providerId);
        }
        context.log.setLogHandler({
          log: (...data: unknown[]) => {
            this.getWebContentsSender().send('provider-registry:startReceiveLogs-onData', callbackId, 'log', data);
          },
          warn: (...data: unknown[]) => {
            this.getWebContentsSender().send('provider-registry:startReceiveLogs-onData', callbackId, 'warn', data);
          },
          error: (...data: unknown[]) => {
            this.getWebContentsSender().send('provider-registry:startReceiveLogs-onData', callbackId, 'error', data);
          },
        });
      },
    );

    this.ipcHandle(
      'provider-registry:stopReceiveLogs',
      async (
        _listener,
        providerId: string,
        connectionInfo?: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
      ): Promise<void> => {
        let context;
        if (connectionInfo) {
          context = providerRegistry.getMatchingConnectionLifecycleContext(providerId, connectionInfo);
        } else {
          context = providerRegistry.getMatchingLifecycleContext(providerId);
        }
        context.log.removeLogHandler();
      },
    );

    this.ipcHandle(
      'list-organizer-registry:loadListConfig',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        key: string,
        availableColumns: string[],
      ): Promise<ListOrganizerItem[]> => {
        return listOrganizerRegistry.loadListConfig(key, availableColumns);
      },
    );

    this.ipcHandle(
      'list-organizer-registry:saveListConfig',
      async (_listener: Electron.IpcMainInvokeEvent, key: string, items: ListOrganizerItem[]): Promise<void> => {
        return listOrganizerRegistry.saveListConfig(key, items);
      },
    );

    this.ipcHandle(
      'list-organizer-registry:resetListConfig',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        key: string,
        availableColumns: string[],
      ): Promise<ListOrganizerItem[]> => {
        return listOrganizerRegistry.resetListConfig(key, availableColumns);
      },
    );

    this.ipcHandle(
      'provider-registry:startProviderLifecycle',
      async (_listener: Electron.IpcMainInvokeEvent, providerId: string): Promise<void> => {
        return providerRegistry.startProviderLifecycle(providerId);
      },
    );

    this.ipcHandle(
      'provider-registry:stopProviderLifecycle',
      async (_listener: Electron.IpcMainInvokeEvent, providerId: string): Promise<void> => {
        return providerRegistry.stopProviderLifecycle(providerId);
      },
    );

    this.ipcHandle(
      'provider-registry:startProviderConnectionLifecycle',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        providerConnectionInfo: ProviderConnectionInfo,
        loggerId: string,
      ): Promise<void> => {
        const task = taskManager.createTask({
          title: `Starting ${providerConnectionInfo.name}`,
          action: {
            name: 'Go to task >',
            execute: () => {
              navigationManager.navigateToResources().catch((err: unknown) => console.error(err));
            },
          },
        });

        const logger = this.getLogHandler('provider-registry:taskConnection-onData', loggerId);
        return providerRegistry
          .startProviderConnection(providerId, providerConnectionInfo, logger)
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((err: unknown) => {
            task.error = `Something went wrong while starting container provider: ${err}`;
            logger.error(err);
            throw err;
          })
          .finally(() => {
            logger.onEnd();
          });
      },
    );

    this.ipcHandle(
      'provider-registry:stopProviderConnectionLifecycle',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        providerConnectionInfo: ProviderConnectionInfo,
        loggerId: string,
      ): Promise<void> => {
        const task = taskManager.createTask({
          title: `Stopping ${providerConnectionInfo.name}`,
          action: {
            name: 'Go to task >',
            execute: () => {
              navigationManager.navigateToResources().catch((err: unknown) => console.error(err));
            },
          },
        });

        const logger = this.getLogHandler('provider-registry:taskConnection-onData', loggerId);
        await providerRegistry
          .stopProviderConnection(providerId, providerConnectionInfo, logger)
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((err: unknown) => {
            task.error = `Something went wrong while stopping container provider: ${err}`;
            logger.error(err);
            throw err;
          })
          .finally(() => {
            logger.onEnd();
          });
      },
    );

    this.ipcHandle(
      'provider-registry:editProviderConnectionLifecycle',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        providerConnectionInfo: ProviderConnectionInfo,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params: { [key: string]: any },
        loggerId: string,
        tokenId: number | undefined,
        taskId: number | undefined,
      ): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:taskConnection-onData', loggerId);
        let token;
        if (tokenId) {
          const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(tokenId);
          token = tokenSource?.token;
        }

        const task = taskManager.createTask({
          title: `Creating ${providerConnectionInfo.name} provider`,
          action: {
            name: 'Open task',
            execute: () => {
              navigationManager.navigateToProviderTask(providerId, taskId).catch((err: unknown) => console.error(err));
            },
          },
        });

        return providerRegistry
          .editProviderConnection(providerId, providerConnectionInfo, params, logger, token)
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((err: unknown) => {
            task.error = `Something went wrong while creating container provider: ${err}`;
            logger.error(err);
            throw err;
          })
          .finally(() => {
            logger.onEnd();
          });
      },
    );

    this.ipcHandle(
      'provider-registry:deleteProviderConnectionLifecycle',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        providerConnectionInfo: ProviderConnectionInfo,
        loggerId: string,
      ): Promise<void> => {
        const task = taskManager.createTask({
          title: `Deleting ${providerConnectionInfo.name}`,
          action: {
            name: 'Go to resources',
            execute: () => {
              navigationManager.navigateToResources().catch((err: unknown) => console.error(err));
            },
          },
        });

        const logger = this.getLogHandler('provider-registry:taskConnection-onData', loggerId);
        return providerRegistry
          .deleteProviderConnection(providerId, providerConnectionInfo, logger)
          .then(result => {
            task.status = 'success';
            return result;
          })
          .catch((err: unknown) => {
            task.error = `Something went wrong while trying to delete ${providerConnectionInfo.name}`;
            logger.error(err);
            throw err;
          })
          .finally(() => {
            logger.onEnd();
          });
      },
    );

    const taskConnectionUtils = new TaskConnectionUtils({
      getLogHandler: this.getLogHandler.bind(this),
      cancellationTokenRegistry,
      taskManager,
    });

    this.ipcHandle(
      'provider-registry:createContainerProviderConnection',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        internalProviderId: string,
        params: { [key: string]: unknown },
        loggerId: string,
        tokenId: number | undefined,
        taskId: number | undefined,
      ): Promise<void> => {
        const providerName = providerRegistry.getProviderInfo(internalProviderId)?.name;
        return taskConnectionUtils.withTask({
          loggerId,
          tokenId,
          title: `Creating ${providerName ?? 'Container'} provider`,
          navigateToTask: () => navigationManager.navigateToProviderTask(internalProviderId, taskId),
          execute: (logger: LoggerWithEnd, token?: containerDesktopAPI.CancellationToken) =>
            providerRegistry.createContainerProviderConnection(internalProviderId, params, logger, token),
          executeErrorMsg: (err: unknown) => `Something went wrong while trying to create provider: ${err}`,
        });
      },
    );

    this.ipcHandle(
      'provider-registry:auditConnectionParameters',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        internalProviderId: string,
        params: containerDesktopAPI.AuditRequestItems,
      ): Promise<containerDesktopAPI.AuditResult> => {
        return await providerRegistry.auditConnectionParameters(internalProviderId, params);
      },
    );

    this.ipcHandle(
      'provider-registry:createKubernetesProviderConnection',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        internalProviderId: string,
        params: { [key: string]: unknown },
        loggerId: string,
        tokenId: number | undefined,
        taskId: number | undefined,
      ): Promise<void> => {
        const providerName = providerRegistry.getProviderInfo(internalProviderId)?.name;
        return taskConnectionUtils.withTask({
          loggerId,
          tokenId,
          title: `Creating ${providerName ?? 'Kubernetes'} provider`,
          navigateToTask: () => navigationManager.navigateToProviderTask(internalProviderId, taskId),
          execute: (logger: LoggerWithEnd, token?: containerDesktopAPI.CancellationToken) =>
            providerRegistry.createKubernetesProviderConnection(internalProviderId, params, logger, token),
          executeErrorMsg: (err: unknown) => `Something went wrong while trying to create provider: ${err}`,
        });
      },
    );

    this.ipcHandle(
      'provider-registry:createVmProviderConnection',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        internalProviderId: string,
        params: { [key: string]: unknown },
        loggerId: string,
        tokenId: number | undefined,
        taskId: number | undefined,
      ): Promise<void> => {
        const providerName = providerRegistry.getProviderInfo(internalProviderId)?.name;
        return taskConnectionUtils.withTask({
          loggerId,
          tokenId,
          title: `Creating ${providerName ?? 'VM'} provider`,
          navigateToTask: () => navigationManager.navigateToProviderTask(internalProviderId, taskId),
          execute: (logger: LoggerWithEnd, token?: containerDesktopAPI.CancellationToken) =>
            providerRegistry.createVmProviderConnection(internalProviderId, params, logger, token),
          executeErrorMsg: (err: unknown) => `Something went wrong while trying to create provider: ${err}`,
        });
      },
    );

    this.ipcHandle('kubernetes-client:createPod', async (_listener, namespace: string, pod: V1Pod): Promise<V1Pod> => {
      return kubernetesClient.createPod(namespace, pod);
    });

    this.ipcHandle(
      'kubernetes-client:createService',
      async (_listener, namespace: string, service: V1Service): Promise<V1Service> => {
        return kubernetesClient.createService(namespace, service);
      },
    );

    this.ipcHandle(
      'kubernetes-client:createIngress',
      async (_listener, namespace: string, ingress: V1Ingress): Promise<V1Ingress> => {
        return kubernetesClient.createIngress(namespace, ingress);
      },
    );

    this.ipcHandle('kubernetes-client:listRoutes', async (): Promise<V1Route[]> => {
      return kubernetesClient.listRoutes();
    });

    this.ipcHandle(
      'kubernetes-client:readPodLog',
      async (_listener, name: string, container: string, onDataId: number): Promise<void> => {
        return kubernetesClient.readPodLog(name, container, (name: string, data: string) => {
          this.getWebContentsSender().send('kubernetes-client:readPodLog-onData', onDataId, name, data);
        });
      },
    );

    this.ipcHandle('kubernetes-client:deletePod', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deletePod(name);
    });

    this.ipcHandle('kubernetes-client:deleteDeployment', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteDeployment(name);
    });

    this.ipcHandle('kubernetes-client:deleteConfigMap', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteConfigMap(name);
    });

    this.ipcHandle('kubernetes-client:deleteCronJob', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteCronJob(name);
    });

    this.ipcHandle('kubernetes-client:deleteJob', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteJob(name);
    });

    this.ipcHandle('kubernetes-client:deleteSecret', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteSecret(name);
    });

    this.ipcHandle('kubernetes-client:deletePersistentVolumeClaim', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deletePersistentVolumeClaim(name);
    });

    this.ipcHandle('kubernetes-client:deleteIngress', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteIngress(name);
    });

    this.ipcHandle('kubernetes-client:deleteRoute', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteRoute(name);
    });

    this.ipcHandle('kubernetes-client:deleteService', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteService(name);
    });

    this.ipcHandle(
      'kubernetes-client:readNamespacedSecret',
      async (_listener, name: string, namespace: string): Promise<V1Secret | undefined> => {
        return kubernetesClient.readNamespacedSecret(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedCronJob',
      async (_listener, name: string, namespace: string): Promise<V1CronJob | undefined> => {
        return kubernetesClient.readNamespacedCronJob(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedJob',
      async (_listener, name: string, namespace: string): Promise<V1Job | undefined> => {
        return kubernetesClient.readNamespacedJob(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedPersistentVolumeClaim',
      async (_listener, name: string, namespace: string): Promise<V1PersistentVolumeClaim | undefined> => {
        return kubernetesClient.readNamespacedPersistentVolumeClaim(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedDeployment',
      async (_listener, name: string, namespace: string): Promise<V1Deployment | undefined> => {
        return kubernetesClient.readNamespacedDeployment(name, namespace);
      },
    );

    this.ipcHandle('kubernetes-client:readNode', async (_listener, name: string): Promise<V1Node | undefined> => {
      return kubernetesClient.readNode(name);
    });

    this.ipcHandle(
      'kubernetes-client:readNamespacedIngress',
      async (_listener, name: string, namespace: string): Promise<V1Ingress | undefined> => {
        return kubernetesClient.readNamespacedIngress(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedRoute',
      async (_listener, name: string, namespace: string): Promise<V1Route | undefined> => {
        return kubernetesClient.readNamespacedRoute(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedService',
      async (_listener, name: string, namespace: string): Promise<V1Service | undefined> => {
        return kubernetesClient.readNamespacedService(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:createResourcesFromFile',
      async (_listener, context: string, file: string, namespace: string): Promise<void> => {
        return kubernetesClient.createResourcesFromFile(context, file, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:applyResourcesFromFile',
      async (_listener, context: string, file: string, namespace?: string): Promise<KubernetesObject[]> => {
        return kubernetesClient.applyResourcesFromFile(context, file, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:applyResourcesFromYAML',
      async (_listener, context: string, yaml: string): Promise<KubernetesObject[]> => {
        return kubernetesClient.applyResourcesFromYAML(context, yaml);
      },
    );

    this.ipcHandle('kubernetes-client:getPortForwards', async (_listener): Promise<ForwardConfig[]> => {
      return kubernetesClient.getPortForwards();
    });

    this.ipcHandle(
      'kubernetes-client:createPortForward',
      async (_listener, options: ForwardOptions): Promise<ForwardConfig> => {
        return kubernetesClient.createPortForward(options);
      },
    );

    this.ipcHandle('kubernetes-client:deletePortForward', async (_listener, config: ForwardConfig): Promise<void> => {
      return kubernetesClient.deletePortForward(config);
    });

    this.ipcHandle(
      'openshift-client:createRoute',
      async (_listener, namespace: string, route: V1Route): Promise<V1Route> => {
        return kubernetesClient.createOpenShiftRoute(namespace, route);
      },
    );

    this.ipcHandle(
      'kubernetes-client:listNamespacedPod',
      async (_listener, namespace: string, fieldSelector?: string, labelSelector?: string): Promise<V1PodList> => {
        return kubernetesClient.listNamespacedPod(namespace, fieldSelector, labelSelector);
      },
    );

    this.ipcHandle('kubernetes-client:listNamespaces', async (): Promise<V1NamespaceList> => {
      return kubernetesClient.listNamespaces();
    });

    this.ipcHandle(
      'kubernetes-client:readNamespacedPod',
      async (_listener, name: string, namespace: string): Promise<V1Pod | undefined> => {
        return kubernetesClient.readNamespacedPod(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedConfigMap',
      async (_listener, name: string, namespace: string): Promise<V1ConfigMap | undefined> => {
        return kubernetesClient.readNamespacedConfigMap(name, namespace);
      },
    );

    this.ipcHandle('kubernetes-client:isAPIGroupSupported', async (_listener, group): Promise<boolean> => {
      return kubernetesClient.isAPIGroupSupported(group);
    });

    this.ipcHandle('kubernetes-client:getCurrentContextName', async (): Promise<string | undefined> => {
      return kubernetesClient.getCurrentContextName();
    });

    this.ipcHandle('kubernetes-client:getContexts', async (): Promise<KubernetesContext[]> => {
      return kubernetesClient.getContexts();
    });

    this.ipcHandle('kubernetes-client:getDetailedContexts', async (): Promise<KubeContext[]> => {
      return kubernetesClient.getDetailedContexts();
    });

    this.ipcHandle('kubernetes-client:getClusters', async (): Promise<Cluster[]> => {
      return kubernetesClient.getClusters();
    });

    this.ipcHandle('kubernetes-client:getUsers', async (): Promise<User[]> => {
      return kubernetesClient.getUsers();
    });

    this.ipcHandle('kubernetes-client:getCurrentNamespace', async (): Promise<string | undefined> => {
      return kubernetesClient.getCurrentNamespace();
    });

    this.ipcHandle('kubernetes-client:setCurrentNamespace', async (_listener, namespace: string): Promise<void> => {
      return kubernetesClient.setCurrentNamespace(namespace);
    });

    this.ipcHandle(
      'kubernetes-client:deleteContext',
      async (_listener, contextName: string): Promise<KubernetesContext[]> => {
        return kubernetesClient.deleteContext(contextName);
      },
    );

    this.ipcHandle('kubernetes-client:duplicateContext', async (_listener, contextName: string): Promise<void> => {
      return kubernetesClient.duplicateContext(contextName);
    });
    this.ipcHandle(
      'kubernetes-client:updateContext',
      async (
        _listener,
        contextName: string,
        newContextName: string,
        newContextNamespace: string,
        newContextCluster: string,
        newContextUser: string,
      ): Promise<void> => {
        return kubernetesClient.updateContext(
          contextName,
          newContextName,
          newContextNamespace,
          newContextCluster,
          newContextUser,
        );
      },
    );

    this.ipcHandle('kubernetes-client:setContext', async (_listener, contextName: string): Promise<void> => {
      return kubernetesClient.setContext(contextName);
    });

    this.ipcHandle('kubernetes-client:getContextsGeneralState', async (): Promise<Map<string, ContextGeneralState>> => {
      return kubernetesClient.getContextsGeneralState();
    });

    this.ipcHandle('kubernetes-client:getCurrentContextGeneralState', async (): Promise<ContextGeneralState> => {
      return kubernetesClient.getCurrentContextGeneralState();
    });

    this.ipcHandle(
      'kubernetes-client:registerGetCurrentContextResources',
      async (_listener, resourceName: ResourceName): Promise<KubernetesObject[]> => {
        return kubernetesClient.registerGetCurrentContextResources(resourceName);
      },
    );

    this.ipcHandle(
      'kubernetes-client:unregisterGetCurrentContextResources',
      async (_listener, resourceName: ResourceName): Promise<KubernetesObject[]> => {
        return kubernetesClient.unregisterGetCurrentContextResources(resourceName);
      },
    );

    this.ipcHandle('kubernetes:getContextsHealths', async (_listener): Promise<ContextHealth[]> => {
      return kubernetesClient.getContextsHealths();
    });

    this.ipcHandle('kubernetes:getContextsPermissions', async (_listener): Promise<ContextPermission[]> => {
      return kubernetesClient.getContextsPermissions();
    });

    this.ipcHandle('kubernetes:getResourcesCount', async (_listener): Promise<ResourceCount[]> => {
      return kubernetesClient.getResourcesCount();
    });

    this.ipcHandle('kubernetes:getActiveResourcesCount', async (_listener): Promise<ResourceCount[]> => {
      return kubernetesClient.getActiveResourcesCount();
    });

    this.ipcHandle(
      'kubernetes:getResources',
      async (_listener, contextNames: string[], resourceName: string): Promise<KubernetesContextResources[]> => {
        return kubernetesClient.getResources(contextNames, resourceName);
      },
    );

    const kubernetesExecCallbackMap = new Map<
      number,
      { onStdIn: (data: string) => void; onResize: (columns: number, rows: number) => void }
    >();
    this.ipcHandle(
      'kubernetes-client:execIntoContainer',
      async (_listener, podName: string, containerName: string, onDataId: number): Promise<number> => {
        const execInvocation = await kubernetesClient.execIntoContainer(
          podName,
          containerName,
          (stdOut: Buffer) => {
            this.getWebContentsSender().send('kubernetes-client:execIntoContainer-onData', onDataId, stdOut);
          },
          (stdErr: Buffer) => {
            this.getWebContentsSender().send('kubernetes-client:execIntoContainer-onError', onDataId, stdErr);
          },
          () => {
            this.getWebContentsSender().send('kubernetes-client:execIntoContainer-onClose', onDataId);
            kubernetesExecCallbackMap.delete(onDataId);
          },
        );
        kubernetesExecCallbackMap.set(onDataId, execInvocation);

        return onDataId;
      },
    );

    this.ipcHandle(
      'kubernetes-client:execIntoContainerSend',
      async (_listener, onDataId: number, content: string): Promise<void> => {
        const callback = kubernetesExecCallbackMap.get(onDataId);
        if (callback) {
          callback.onStdIn(content);
        }
      },
    );

    this.ipcHandle(
      'kubernetes-client:execIntoContainerResize',
      async (_listener, onDataId: number, width: number, height: number): Promise<void> => {
        const callback = kubernetesExecCallbackMap.get(onDataId);
        if (callback) {
          callback.onResize(width, height);
        }
      },
    );

    this.ipcHandle('kubernetes-client:refreshContextState', async (_listener, context: string): Promise<void> => {
      return kubernetesClient.refreshContextState(context);
    });

    this.ipcHandle('webview:devtools:register', async (_listener, webcontentId: number): Promise<void> => {
      return webviewRegistry.registerWebviewDevTools(webcontentId);
    });

    this.ipcHandle('webview:devtools:cleanup', async (_listener, webcontentId: number): Promise<void> => {
      return webviewRegistry.cleanupWebviewDevTools(webcontentId);
    });

    this.ipcHandle('webviewRegistry:listWebviews', async (_listener): Promise<WebviewInfo[]> => {
      return webviewRegistry.listWebviews();
    });
    this.ipcHandle(
      'webviewRegistry:post-message',
      async (_listener, id: string, message: { data: unknown }): Promise<void> => {
        return webviewRegistry.postMessageToWebview(id, message);
      },
    );
    this.ipcHandle('webviewRegistry:update-state', async (_listener, id: string, state: unknown): Promise<void> => {
      return webviewRegistry.updateWebviewState(id, state);
    });

    this.ipcHandle('webviewRegistry:makeDefaultWebviewVisible', async (_listener, webviewId: string): Promise<void> => {
      return webviewRegistry.makeDefaultWebviewVisible(webviewId);
    });

    this.ipcHandle(
      'navigation:navigateToRoute',
      async (_listener, routeId: string, ...args: unknown[]): Promise<void> => {
        return navigationManager.navigateToRoute(routeId, ...args);
      },
    );

    this.ipcHandle(
      'navigation:navigateToHistoryEntry',
      async (_listener, extensionId: string, entryId: string): Promise<void> => {
        navigationManager.navigateToHistoryEntry(extensionId, entryId);
      },
    );

    this.ipcHandle('webview:get-preload-script', async (): Promise<string> => {
      const preloadScriptPath = path.join(__dirname, '../../preload-webview/dist/index.cjs');
      return `file://${preloadScriptPath}`;
    });

    this.ipcHandle('webview:get-registry-http-port', async (): Promise<number> => {
      return webviewRegistry.getRegistryHttpPort();
    });

    this.ipcHandle(
      'kubernetes:getTroubleshootingInformation',
      async (_listener: unknown): Promise<KubernetesTroubleshootingInformation> => {
        return kubernetesClient.getTroubleshootingInformation();
      },
    );

    const dockerDesktopInstallation = new DockerDesktopInstallation(
      apiSender,
      containerProviderRegistry,
      contributionManager,
      directories,
    );
    await dockerDesktopInstallation.init();

    const dockerExtensionAdapter = new DockerPluginAdapter(contributionManager, containerProviderRegistry);
    dockerExtensionAdapter.init();

    container.bind<ExtensionInstaller>(ExtensionInstaller).toSelf().inSingletonScope();
    const extensionInstaller = container.get(ExtensionInstaller);
    await extensionInstaller.init();

    container.bind<ExtensionsUpdater>(ExtensionsUpdater).toSelf().inSingletonScope();
    const extensionsUpdater = container.get(ExtensionsUpdater);

    await contributionManager.init();

    this.markAsReady();

    apiSender.send('starting-extensions', `${this.isReady}`);
    console.log('System ready. Loading extensions...');
    try {
      await this.extensionLoader.start();
      console.log('PluginSystem: initialization done.');
    } finally {
      apiSender.send('extensions-started');
      this.markAsExtensionsStarted();
    }
    extensionsUpdater.init().catch((err: unknown) => console.error('Unable to perform extension updates', err));
    autoStartEngine.start().catch((err: unknown) => console.error('Unable to perform autostart', err));
    await exploreFeatures.init();
    apiSender.send('explore-features-loaded');
    return this.extensionLoader;
  }

  markAsExtensionsStarted(): void {
    this.isExtensionsStarted = true;
  }

  markAsReady(): void {
    this.isReady = true;
  }

  getLogHandler(channel: string, loggerId: string): LoggerWithEnd {
    const safeSend = (messageType: string, data?: unknown): void => {
      try {
        this.getWebContentsSender().send(channel, loggerId, messageType, data);
      } catch (err) {
        console.error('Failed to send log message to renderer:', err);
      }
    };

    return {
      log: (...data: unknown[]): void => safeSend('log', data),
      warn: (...data: unknown[]): void => safeSend('warn', data),
      error: (...data: unknown[]): void => safeSend('error', data),
      onEnd: (): void => safeSend('finish'),
    };
  }

  createAbortControllerOnCancellationToken(
    cancellationTokenRegistry: CancellationTokenRegistry,
    cancellableTokenId?: number,
  ): AbortController | undefined {
    if (!cancellableTokenId) {
      return undefined;
    }
    const abortController = new AbortController();
    const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(cancellableTokenId);
    const token = tokenSource?.token;
    token?.onCancellationRequested(() => {
      // if the token is cancelled, we trigger the abort on the AbortController
      abortController.abort();
    });
    return abortController;
  }
}
