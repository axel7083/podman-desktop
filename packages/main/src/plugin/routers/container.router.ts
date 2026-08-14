import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import { KubeGeneratorRegistry } from '/@/plugin/kubernetes/kube-generator-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.container, OrpcContext>(contracts.container);

@injectable()
export class ContainerRouter {
  constructor(
    @inject(ContainerProviderRegistry) private containerProviderRegistry: ContainerProviderRegistry,
    @inject(KubeGeneratorRegistry) private kubeGeneratorRegistry: KubeGeneratorRegistry,
  ) {}

  router: ContractedRouter<typeof contracts.container, OrpcContext> = {
    listContainers: os.listContainers.handler(() => {
      return this.containerProviderRegistry.listContainers() as never;
    }),

    listSecrets: os.listSecrets.handler(() => {
      return this.containerProviderRegistry.listSecrets();
    }),
    removeSecret: os.removeSecret.handler(({ input }) => {
      return this.containerProviderRegistry.removeSecret(input.engineId, input.secretId);
    }),
    inspectSecret: os.inspectSecret.handler(({ input }) => {
      return this.containerProviderRegistry.inspectSecret(input.engineId, input.secretId);
    }),
    createSecret: os.createSecret.handler(({ input }) => {
      return this.containerProviderRegistry.createSecret(input.options);
    }),

    listSimpleContainersByLabel: os.listSimpleContainersByLabel.handler(({ input }) => {
      return this.containerProviderRegistry.listSimpleContainersByLabel(input.label, input.key);
    }),
    listSimpleContainers: os.listSimpleContainers.handler(() => {
      return this.containerProviderRegistry.listSimpleContainers();
    }),

    listImages: os.listImages.handler(({ input }) => {
      return this.containerProviderRegistry.listImages(input.options) as never;
    }),

    listPods: os.listPods.handler(() => {
      return this.containerProviderRegistry.listPods() as never;
    }),

    listNetworks: os.listNetworks.handler(() => {
      return this.containerProviderRegistry.listNetworks();
    }),
    removeNetwork: os.removeNetwork.handler(({ input }) => {
      return this.containerProviderRegistry.removeNetwork(input.engine, input.networkId);
    }),
    updateNetwork: os.updateNetwork.handler(({ input }) => {
      return this.containerProviderRegistry.updateNetwork(
        input.engineId,
        input.networkId,
        input.addDNSServers,
        input.removeDNSServers,
      );
    }),
    createNetwork: os.createNetwork.handler(({ input }) => {
      return this.containerProviderRegistry.createNetwork(
        input.providerContainerConnectionInfo,
        input.options,
      ) as never;
    }),
    inspectNetwork: os.inspectNetwork.handler(({ input }) => {
      return this.containerProviderRegistry.inspectNetwork(input.engine, input.networkId);
    }),
    getNetworkDrivers: os.getNetworkDrivers.handler(({ input }) => {
      return this.containerProviderRegistry.getNetworkDrivers(input.providerContainerConnectionInfo);
    }),

    listVolumes: os.listVolumes.handler(({ input }) => {
      return this.containerProviderRegistry.listVolumes(input.fetchUsage) as never;
    }),

    reconnectContainerProviders: os.reconnectContainerProviders.handler(() => {
      return this.containerProviderRegistry.reconnectContainerProviders();
    }),

    pingContainerEngine: os.pingContainerEngine.handler(({ input }) => {
      return this.containerProviderRegistry.pingContainerEngine(input.providerContainerConnectionInfo);
    }),

    listContainersFromEngine: os.listContainersFromEngine.handler(({ input }) => {
      return this.containerProviderRegistry.listContainersFromEngine(input.providerContainerConnectionInfo) as never;
    }),

    pruneVolumes: os.pruneVolumes.handler(({ input }) => {
      return this.containerProviderRegistry.pruneVolumes(input.engine) as never;
    }),
    pruneContainers: os.pruneContainers.handler(({ input }) => {
      return this.containerProviderRegistry.pruneContainers(input.engine) as never;
    }),
    prunePods: os.prunePods.handler(({ input }) => {
      return this.containerProviderRegistry.prunePods(input.engine);
    }),
    pruneImages: os.pruneImages.handler(({ input }) => {
      return this.containerProviderRegistry.pruneImages(input.engine, input.all);
    }),

    getVolumeInspect: os.getVolumeInspect.handler(({ input }) => {
      return this.containerProviderRegistry.getVolumeInspect(input.engine, input.volumeName) as never;
    }),
    removeVolume: os.removeVolume.handler(({ input }) => {
      return this.containerProviderRegistry.removeVolume(input.engine, input.volumeName);
    }),
    createVolume: os.createVolume.handler(({ input }) => {
      return this.containerProviderRegistry.createVolume(input.providerContainerConnectionInfo, input.options) as never;
    }),

    replicatePodmanContainer: os.replicatePodmanContainer.handler(({ input }) => {
      return this.containerProviderRegistry.replicatePodmanContainer(
        input.source,
        input.target,
        input.overrideParameters,
      );
    }),

    createPod: os.createPod.handler(({ input }) => {
      return this.containerProviderRegistry.createPod(input.createOptions) as never;
    }),
    startPod: os.startPod.handler(({ input }) => {
      return this.containerProviderRegistry.startPod(input.engine, input.podId);
    }),
    stopPod: os.stopPod.handler(({ input }) => {
      return this.containerProviderRegistry.stopPod(input.engine, input.podId);
    }),
    removePod: os.removePod.handler(({ input }) => {
      return this.containerProviderRegistry.removePod(input.engine, input.podId);
    }),
    restartPod: os.restartPod.handler(({ input }) => {
      return this.containerProviderRegistry.restartPod(input.engine, input.podId);
    }),
    unpausePod: os.unpausePod.handler(({ input }) => {
      return this.containerProviderRegistry.unpausePod(input.engine, input.podId);
    }),

    createManifest: os.createManifest.handler(({ input }) => {
      return this.containerProviderRegistry.createManifest(input.manifestOptions) as never;
    }),
    pushManifest: os.pushManifest.handler(({ input }) => {
      return this.containerProviderRegistry.pushManifest(input.manifestOptions);
    }),
    inspectManifest: os.inspectManifest.handler(({ input }) => {
      return this.containerProviderRegistry.inspectManifest(input.engine, input.manifestId);
    }),
    removeManifest: os.removeManifest.handler(({ input }) => {
      return this.containerProviderRegistry.removeManifest(input.engine, input.manifestId);
    }),

    generatePodmanKube: os.generatePodmanKube.handler(async ({ input }) => {
      const kubeGenerator = this.kubeGeneratorRegistry.getKubeGenerator();
      if (!kubeGenerator) throw new Error('Cannot find default KubeGenerator.');

      return (
        await kubeGenerator.generate([
          {
            engineId: input.engine,
            containers: input.names,
          },
        ])
      ).yaml;
    }),

    startContainer: os.startContainer.handler(({ input }) => {
      return this.containerProviderRegistry.startContainer(input.engine, input.containerId);
    }),
    stopContainer: os.stopContainer.handler(({ input }) => {
      return this.containerProviderRegistry.stopContainer(input.engine, input.containerId);
    }),
    restartContainer: os.restartContainer.handler(({ input }) => {
      return this.containerProviderRegistry.restartContainer(input.engine, input.containerId);
    }),
    deleteContainer: os.deleteContainer.handler(({ input }) => {
      return this.containerProviderRegistry.deleteContainer(input.engine, input.containerId);
    }),
    unpauseContainer: os.unpauseContainer.handler(({ input }) => {
      return this.containerProviderRegistry.unpauseContainer(input.engine, input.containerId);
    }),
    createAndStartContainer: os.createAndStartContainer.handler(({ input }) => {
      const options = { ...input.options, start: true };
      return this.containerProviderRegistry.createContainer(input.engine, options) as never;
    }),

    deleteImage: os.deleteImage.handler(({ input }) => {
      return this.containerProviderRegistry.deleteImage(input.engine, input.imageId);
    }),
    tagImage: os.tagImage.handler(({ input }) => {
      return this.containerProviderRegistry.tagImage(input.engine, input.imageTag, input.repo, input.tag);
    }),
    getImageInspect: os.getImageInspect.handler(({ input }) => {
      return this.containerProviderRegistry.getImageInspect(input.engine, input.imageId) as never;
    }),
    getImageHistory: os.getImageHistory.handler(({ input }) => {
      return this.containerProviderRegistry.getImageHistory(input.engine, input.imageId) as never;
    }),

    getContainerInspect: os.getContainerInspect.handler(({ input }) => {
      return this.containerProviderRegistry.getContainerInspect(input.engine, input.containerId) as never;
    }),
    getPodInspect: os.getPodInspect.handler(({ input }) => {
      return this.containerProviderRegistry.getPodInspect(input.engine, input.podId) as never;
    }),

    stopContainerStats: os.stopContainerStats.handler(({ input }) => {
      return this.containerProviderRegistry.stopContainerStats(input.containerStatsId);
    }),

    restartContainersByLabel: os.restartContainersByLabel.handler(({ input }) => {
      return this.containerProviderRegistry.restartContainersByLabel(input.engine, input.label, input.key);
    }),
    startContainersByLabel: os.startContainersByLabel.handler(({ input }) => {
      return this.containerProviderRegistry.startContainersByLabel(input.engine, input.label, input.key);
    }),
    stopContainersByLabel: os.stopContainersByLabel.handler(({ input }) => {
      return this.containerProviderRegistry.stopContainersByLabel(input.engine, input.label, input.key);
    }),
    deleteContainersByLabel: os.deleteContainersByLabel.handler(({ input }) => {
      return this.containerProviderRegistry.deleteContainersByLabel(input.engine, input.label, input.key);
    }),

    resolveShortnameImage: os.resolveShortnameImage.handler(({ input }) => {
      return this.containerProviderRegistry.resolveShortnameImage(
        input.providerContainerConnectionInfo,
        input.shortName,
      );
    }),
  };
}
