import { oc, type } from '@orpc/contract';
import type {
  ContainerCreateOptions,
  ContainerInfo,
  ContainerInspectInfo,
  HistoryInfo,
  ImageInfo,
  ImageInspectInfo,
  ListImagesOptions,
  ManifestCreateOptions,
  ManifestInspectInfo,
  ManifestPushOptions,
  NetworkCreateOptions,
  NetworkCreateResult,
  NetworkInspectInfo,
  PodCreateOptions,
  PodInfo,
  PodInspectInfo,
  ProviderContainerConnectionInfo,
  SecretCreateOptions,
  SecretCreateResult,
  SecretInfo,
  SimpleContainerInfo,
  VolumeCreateOptions,
  VolumeCreateResponseInfo,
  VolumeInspectInfo,
  VolumeListInfo,
} from '@podman-desktop/core-api';
import type { ContainerCreateOptions as PodmanContainerCreateOptions } from '@podman-desktop/core-api/libpod';

export const containerContract = {
  listContainers: oc.output(type<ContainerInfo[]>()),

  listSecrets: oc.output(type<SecretInfo[]>()),
  removeSecret: oc.input(type<{ engineId: string; secretId: string }>()).output(type<void>()),
  inspectSecret: oc.input(type<{ engineId: string; secretId: string }>()).output(type<SecretInfo>()),
  createSecret: oc.input(type<{ options: SecretCreateOptions }>()).output(type<SecretCreateResult>()),

  listSimpleContainersByLabel: oc.input(type<{ label: string; key: string }>()).output(type<SimpleContainerInfo[]>()),
  listSimpleContainers: oc.output(type<SimpleContainerInfo[]>()),

  listImages: oc.input(type<{ options?: ListImagesOptions }>()).output(type<ImageInfo[]>()),

  listPods: oc.output(type<PodInfo[]>()),

  listNetworks: oc.output(type<NetworkInspectInfo[]>()),
  removeNetwork: oc.input(type<{ engine: string; networkId: string }>()).output(type<void>()),
  updateNetwork: oc
    .input(type<{ engineId: string; networkId: string; addDNSServers: string[]; removeDNSServers: string[] }>())
    .output(type<void>()),
  createNetwork: oc
    .input(type<{ providerContainerConnectionInfo: ProviderContainerConnectionInfo; options: NetworkCreateOptions }>())
    .output(type<NetworkCreateResult>()),
  inspectNetwork: oc.input(type<{ engine: string; networkId: string }>()).output(type<NetworkInspectInfo>()),
  getNetworkDrivers: oc
    .input(type<{ providerContainerConnectionInfo: ProviderContainerConnectionInfo }>())
    .output(type<string[]>()),

  listVolumes: oc.input(type<{ fetchUsage: boolean }>()).output(type<VolumeListInfo[]>()),

  reconnectContainerProviders: oc.output(type<void>()),

  pingContainerEngine: oc
    .input(type<{ providerContainerConnectionInfo: ProviderContainerConnectionInfo }>())
    .output(type<unknown>()),

  listContainersFromEngine: oc
    .input(type<{ providerContainerConnectionInfo: ProviderContainerConnectionInfo }>())
    .output(type<{ Id: string; Names: string[] }[]>()),

  pruneVolumes: oc
    .input(type<{ engine: string }>())
    .output(type<{ VolumesDeleted: string[]; SpaceReclaimed: number }>()),
  pruneContainers: oc
    .input(type<{ engine: string }>())
    .output(type<{ ContainersDeleted: string[]; SpaceReclaimed: number }>()),
  prunePods: oc.input(type<{ engine: string }>()).output(type<void>()),
  pruneImages: oc.input(type<{ engine: string; all: boolean }>()).output(type<void>()),

  getVolumeInspect: oc.input(type<{ engine: string; volumeName: string }>()).output(type<VolumeInspectInfo>()),
  removeVolume: oc.input(type<{ engine: string; volumeName: string }>()).output(type<void>()),
  createVolume: oc
    .input(type<{ providerContainerConnectionInfo: ProviderContainerConnectionInfo; options: VolumeCreateOptions }>())
    .output(type<VolumeCreateResponseInfo>()),

  replicatePodmanContainer: oc
    .input(
      type<{
        source: { engineId: string; id: string };
        target: { engineId: string };
        overrideParameters: PodmanContainerCreateOptions;
      }>(),
    )
    .output(type<{ Id: string; Warnings: string[] }>()),

  createPod: oc.input(type<{ createOptions: PodCreateOptions }>()).output(type<{ engineId: string; Id: string }>()),
  startPod: oc.input(type<{ engine: string; podId: string }>()).output(type<void>()),
  stopPod: oc.input(type<{ engine: string; podId: string }>()).output(type<void>()),
  removePod: oc.input(type<{ engine: string; podId: string }>()).output(type<void>()),
  restartPod: oc.input(type<{ engine: string; podId: string }>()).output(type<void>()),
  unpausePod: oc.input(type<{ engine: string; podId: string }>()).output(type<void>()),

  createManifest: oc
    .input(type<{ manifestOptions: ManifestCreateOptions }>())
    .output(type<{ engineId: string; Id: string }>()),
  pushManifest: oc.input(type<{ manifestOptions: ManifestPushOptions }>()).output(type<void>()),
  inspectManifest: oc.input(type<{ engine: string; manifestId: string }>()).output(type<ManifestInspectInfo>()),
  removeManifest: oc.input(type<{ engine: string; manifestId: string }>()).output(type<void>()),

  generatePodmanKube: oc.input(type<{ engine: string; names: string[] }>()).output(type<string>()),

  startContainer: oc.input(type<{ engine: string; containerId: string }>()).output(type<void>()),
  stopContainer: oc.input(type<{ engine: string; containerId: string }>()).output(type<void>()),
  restartContainer: oc.input(type<{ engine: string; containerId: string }>()).output(type<void>()),
  deleteContainer: oc.input(type<{ engine: string; containerId: string }>()).output(type<void>()),
  unpauseContainer: oc.input(type<{ engine: string; containerId: string }>()).output(type<void>()),
  createAndStartContainer: oc
    .input(type<{ engine: string; options: ContainerCreateOptions }>())
    .output(type<{ id: string }>()),

  deleteImage: oc.input(type<{ engine: string; imageId: string }>()).output(type<void>()),
  tagImage: oc.input(type<{ engine: string; imageTag: string; repo: string; tag?: string }>()).output(type<void>()),
  getImageInspect: oc.input(type<{ engine: string; imageId: string }>()).output(type<ImageInspectInfo>()),
  getImageHistory: oc.input(type<{ engine: string; imageId: string }>()).output(type<HistoryInfo[]>()),

  getContainerInspect: oc.input(type<{ engine: string; containerId: string }>()).output(type<ContainerInspectInfo>()),
  getPodInspect: oc.input(type<{ engine: string; podId: string }>()).output(type<PodInspectInfo>()),

  stopContainerStats: oc.input(type<{ containerStatsId: number }>()).output(type<void>()),

  restartContainersByLabel: oc.input(type<{ engine: string; label: string; key: string }>()).output(type<void>()),
  startContainersByLabel: oc.input(type<{ engine: string; label: string; key: string }>()).output(type<void>()),
  stopContainersByLabel: oc.input(type<{ engine: string; label: string; key: string }>()).output(type<void>()),
  deleteContainersByLabel: oc.input(type<{ engine: string; label: string; key: string }>()).output(type<void>()),

  resolveShortnameImage: oc
    .input(type<{ providerContainerConnectionInfo: ProviderContainerConnectionInfo; shortName: string }>())
    .output(type<string[]>()),
};
