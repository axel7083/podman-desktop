/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import path from 'node:path';
import { readFileSync } from 'node:fs';
import 'vitest-canvas-mock';
import typescript from 'typescript';
import { EventStore } from './src/stores/event-store';
import { vi } from 'vitest';

vi.mock('/@/client', () => ({
  client: {
    authentication: { getProvidersInfo: vi.fn(), signOut: vi.fn(), signIn: vi.fn() },
    cliTool: { getInfos: vi.fn(), selectVersionToUpdate: vi.fn(), selectVersionToInstall: vi.fn() },
    dialog: {
      showMessageBox: vi.fn(),
      sendShowMessageBoxOnSelect: vi.fn(),
      openDialog: vi.fn(),
      saveDialog: vi.fn(),
    },
    configuration: {
      getProperties: vi.fn(),
      getValue: vi.fn(),
      updateValue: vi.fn(),
      isExperimentalEnabled: vi.fn(),
      enableExperimental: vi.fn(),
      disableExperimental: vi.fn(),
      updateExperimentalValue: vi.fn(),
    },
    imageRegistry: {
      getRegistries: vi.fn(),
      getSuggestedRegistries: vi.fn(),
      hasAuthconfigForImage: vi.fn(),
      getProviderNames: vi.fn(),
      unregisterRegistry: vi.fn(),
      checkCredentials: vi.fn(),
      createRegistry: vi.fn(),
      updateRegistry: vi.fn(),
      searchImages: vi.fn(),
      listImageTags: vi.fn(),
      getCheckerProviders: vi.fn(),
      check: vi.fn(),
      getFilesProviders: vi.fn(),
      getFilesystemLayers: vi.fn(),
    },
    extension: {
      list: vi.fn(),
      stop: vi.fn(),
      start: vi.fn(),
      remove: vi.fn(),
      ensureEnabled: vi.fn(),
      update: vi.fn(),
      getFeatured: vi.fn(),
      getBanners: vi.fn(),
      getRecommendedRegistries: vi.fn(),
      getCatalog: vi.fn(),
      refreshCatalog: vi.fn(),
      getDevelopmentFolders: vi.fn(),
      addDevelopmentFolder: vi.fn(),
      removeDevelopmentFolder: vi.fn(),
      getDevelopmentDocsLink: vi.fn(),
    },
    menu: { getContributedMenus: vi.fn() },
    notification: { list: vi.fn(), add: vi.fn(), remove: vi.fn(), clearAll: vi.fn() },
    proxy: { updateSettings: vi.fn(), getSettings: vi.fn(), getState: vi.fn(), setState: vi.fn() },
    system: {
      getPlatform: vi.fn(),
      getArch: vi.fn(),
      getHostname: vi.fn(),
      getHostFreeDiskSize: vi.fn(),
      getHostMemory: vi.fn(),
      getHostCpu: vi.fn(),
      getFreePort: vi.fn(),
      getFreePortRange: vi.fn(),
      isPortFree: vi.fn(),
      windowMinimize: vi.fn(),
      windowMaximize: vi.fn(),
      windowClose: vi.fn(),
      clipboardWriteText: vi.fn(),
      openExternal: vi.fn(),
      pathRelative: vi.fn(),
      createHash: vi.fn(),
      getUrlProtocol: vi.fn(),
    },
    tasks: { clearAll: vi.fn(), clear: vi.fn(), execute: vi.fn() },
    tempFile: { create: vi.fn(), remove: vi.fn() },
    statusBar: {
      getEntries: vi.fn(),
      executeCommand: vi.fn(),
      getPinOptions: vi.fn(),
      pin: vi.fn(),
      unpin: vi.fn(),
    },
    picker: {
      inputBoxValue: vi.fn(),
      inputBoxValidate: vi.fn(),
      quickPickValues: vi.fn(),
      quickPickOnSelect: vi.fn(),
      customPickValues: vi.fn(),
      customPickClose: vi.fn(),
    },
    feedback: {
      send: vi.fn(),
      githubPreview: vi.fn(),
      getGitHubFeedbackLinks: vi.fn(),
      getFeedbackLinks: vi.fn(),
      getFeedbackMessages: vi.fn(),
    },
    telemetry: {
      getTelemetryMessages: vi.fn(),
      track: vi.fn(),
      page: vi.fn(),
      configure: vi.fn(),
    },
    app: {
      update: vi.fn(),
      updateAvailable: vi.fn(),
      getReleaseNotes: vi.fn(),
      getTitleBarText: vi.fn(),
      getAppRepository: vi.fn(),
      getVersion: vi.fn(),
    },
    cancellation: {
      createTokenSource: vi.fn(),
      cancelToken: vi.fn(),
    },
    commands: {
      getCommandPaletteCommands: vi.fn(),
      getCommandPaletteSearchOptions: vi.fn(),
    },
    documentation: {
      getItems: vi.fn(),
      refresh: vi.fn(),
    },
    exploreFeatures: {
      listFeatures: vi.fn(),
      closeFeatureCard: vi.fn(),
    },
    learningCenter: {
      listGuides: vi.fn(),
    },
    listOrganizer: {
      loadListConfig: vi.fn(),
      saveListConfig: vi.fn(),
      resetListConfig: vi.fn(),
    },
    onboarding: {
      listOnboarding: vi.fn(),
      getOnboarding: vi.fn(),
      updateStepState: vi.fn(),
      resetOnboarding: vi.fn(),
    },
    dashboard: {
      getSystemOverviewStatus: vi.fn(),
    },
    helpMenu: {
      getItems: vi.fn(),
    },
    navigation: {
      sendItems: vi.fn(),
    },
    provider: {
      getInfos: vi.fn(),
    },
    container: {
      listContainers: vi.fn(),
      listSecrets: vi.fn(),
      removeSecret: vi.fn(),
      inspectSecret: vi.fn(),
      createSecret: vi.fn(),
      listSimpleContainersByLabel: vi.fn(),
      listSimpleContainers: vi.fn(),
      listImages: vi.fn(),
      listPods: vi.fn(),
      listNetworks: vi.fn(),
      removeNetwork: vi.fn(),
      updateNetwork: vi.fn(),
      createNetwork: vi.fn(),
      inspectNetwork: vi.fn(),
      getNetworkDrivers: vi.fn(),
      listVolumes: vi.fn(),
      reconnectContainerProviders: vi.fn(),
      pingContainerEngine: vi.fn(),
      listContainersFromEngine: vi.fn(),
      pruneVolumes: vi.fn(),
      pruneContainers: vi.fn(),
      prunePods: vi.fn(),
      pruneImages: vi.fn(),
      getVolumeInspect: vi.fn(),
      removeVolume: vi.fn(),
      createVolume: vi.fn(),
      replicatePodmanContainer: vi.fn(),
      createPod: vi.fn(),
      startPod: vi.fn(),
      stopPod: vi.fn(),
      removePod: vi.fn(),
      restartPod: vi.fn(),
      unpausePod: vi.fn(),
      createManifest: vi.fn(),
      pushManifest: vi.fn(),
      inspectManifest: vi.fn(),
      removeManifest: vi.fn(),
      generatePodmanKube: vi.fn(),
      startContainer: vi.fn(),
      stopContainer: vi.fn(),
      restartContainer: vi.fn(),
      deleteContainer: vi.fn(),
      unpauseContainer: vi.fn(),
      createAndStartContainer: vi.fn(),
      deleteImage: vi.fn(),
      tagImage: vi.fn(),
      getImageInspect: vi.fn(),
      getImageHistory: vi.fn(),
      getContainerInspect: vi.fn(),
      getPodInspect: vi.fn(),
      stopContainerStats: vi.fn(),
      restartContainersByLabel: vi.fn(),
      startContainersByLabel: vi.fn(),
      stopContainersByLabel: vi.fn(),
      deleteContainersByLabel: vi.fn(),
      resolveShortnameImage: vi.fn(),
    },
    troubleshooting: { getDockerSocketMappingStatus: vi.fn() },
    webview: {
      getPreloadScript: vi.fn(),
      getRegistryHttpPort: vi.fn(),
      listWebviews: vi.fn(),
      postMessage: vi.fn(),
      updateState: vi.fn(),
      makeDefaultWebviewVisible: vi.fn(),
      registerDevTools: vi.fn(),
      cleanupDevTools: vi.fn(),
    },
    welcome: { getWelcomeMessages: vi.fn() },
    uiRegistry: {
      listContributions: vi.fn(),
      listIcons: vi.fn(),
      listColors: vi.fn(),
      getThemeInfo: vi.fn(),
      listViews: vi.fn(),
      fetchViews: vi.fn(),
      collectAllContextValues: vi.fn(),
      getRegisteredFeatures: vi.fn(),
    },
  },
}));

/**
 * Mock matchMedia
 * @param query {string} the media query to match
 * @returns {MediaQueryList} the media query list
 */
global.window.matchMedia = query => ({
  matches: false,
  media: query,
  onchange: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

// Mock window.events (ApiSenderType) once globally instead of in every spec file.
// Tests needing custom behavior can call vi.mocked(window.events.receive).mockImplementation(...)
// or redefine window.events entirely if they need to intercept `send` as well.
Object.defineProperty(window, 'events', {
  value: {
    send: vi.fn(),
    receive: vi.fn(),
  },
  configurable: true,
  writable: true,
});

// read the given path and extract the method names from the Window interface
function extractWindowMethods(filePath) {
  // Read the content of the .d.ts file
  const fileContent = readFileSync(filePath, 'utf-8');

  // Create a TypeScript SourceFile
  const sourceFile = typescript.createSourceFile(filePath, fileContent, typescript.ScriptTarget.Latest, true);

  const methodNames = [];

  // Visit each node in the AST
  const visit = node => {
    // Look for the Window interface
    if (
      typescript.isInterfaceDeclaration(node) &&
      node.name.text === 'Window' // Target the "Window" interface
    ) {
      for (const member of node.members) {
        if (typescript.isPropertySignature(member) && member.type && typescript.isFunctionTypeNode(member.type)) {
          const name = member.name.text;
          methodNames.push(name);
        }
      }
    }

    typescript.forEachChild(node, visit);
  };

  visit(sourceFile);

  return methodNames;
}

// methods being exposed
const declarationsPath = path.resolve(__dirname, '../preload/exposedInMainWorld.d.ts');

// Extract method names from the Window interface
const methodNames = extractWindowMethods(declarationsPath);

// assert that we have more than 50 methods
expect(methodNames.length).toBeGreaterThan(50);

// Dynamically create vi mocks for all the given methods
for (const methodName of methodNames) {
  Object.defineProperty(window, methodName, {
    value: vi.fn(),
    configurable: true,
    writable: true,
  });
}

// Mock ResizeObserver for @floating-ui/dom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;
global.window.ResizeObserver = ResizeObserverMock;

// Override the prototype of setupWithDebounce to ensure default values are 10ms
const originalSetupWithDebounce = EventStore.prototype.setupWithDebounce;
EventStore.prototype.setupWithDebounce = function (debounceTimeoutDelay = 10, debounceThrottleTimeoutDelay = 10) {
  return originalSetupWithDebounce.call(this, debounceTimeoutDelay, debounceThrottleTimeoutDelay);
};
