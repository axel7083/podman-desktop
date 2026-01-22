<script lang="ts">
import { faArrowRight, faBoxOpen, faLeaf, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import type { ImageInfo } from '@podman-desktop/api';
import { Button, EmptyScreen } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa';

import { imageOptimizerProviders } from '/@/stores/image-optimizer-providers';
import type { ImageOptimizerInfo, OptimizeResult } from '/@api/image-optimizer-info';

interface Props {
  imageInfo?: ImageInfo;
}

const { imageInfo }: Props = $props();

let providers: ImageOptimizerInfo[] = $state([]);
let optimizeResult: OptimizeResult | undefined = $state(undefined);
let loading = $state(true);
let error: string | undefined = $state(undefined);
let cancellableTokenId: number = $state(0);

let providersUnsubscribe: Unsubscriber;

onMount(() => {
  providersUnsubscribe = imageOptimizerProviders.subscribe(_providers => {
    providers = [..._providers];
    if (providers.length > 0 && imageInfo) {
      checkForAlternative().catch((err: unknown) => console.error('Error checking for alternative', err));
    } else {
      loading = false;
    }
  });
});

onDestroy(() => {
  providersUnsubscribe?.();
  if (cancellableTokenId !== 0) {
    window.cancelToken(cancellableTokenId).catch((err: unknown) => console.error('Error cancelling token', err));
  }
});

async function checkForAlternative(): Promise<void> {
  if (!imageInfo || providers.length === 0) {
    loading = false;
    return;
  }

  loading = true;
  error = undefined;

  try {
    // Get a cancellable token
    cancellableTokenId = await window.getCancellableTokenSource();

    // Extract image name from the RepoTags
    const imageName = extractImageName(imageInfo);
    if (!imageName) {
      loading = false;
      return;
    }

    // Call the first provider (we can extend this to support multiple providers)
    const provider = providers[0];
    if (provider) {
      optimizeResult = await window.getImageOptimizerAlternative(provider.id, imageName, cancellableTokenId);
    }
  } catch (err) {
    if (err instanceof Error) {
      error = err.message;
    }
  } finally {
    loading = false;
    // Track telemetry
    await window.telemetryTrack('imageOptimize.view', {
      hasAlternative: !!optimizeResult?.alternative,
    });
  }
}

function extractImageName(image: ImageInfo): string | undefined {
  if (image.RepoTags && image.RepoTags.length > 0) {
    const repoTag = image.RepoTags[0];
    if (repoTag) {
      // Extract the base name (e.g., "node" from "node:18" or "docker.io/library/node:18")
      const parts = repoTag.split('/');
      const nameTag = parts[parts.length - 1];
      if (nameTag) {
        const [name] = nameTag.split(':');
        return name;
      }
    }
  }
  return undefined;
}

function formatSize(bytes: number | undefined): string {
  if (bytes === undefined) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

function handlePullAlternative(): void {
  if (!optimizeResult?.alternative) return;

  window
    .telemetryTrack('imageOptimize.pullAlternative', {
      originalImage: extractImageName(imageInfo!) ?? '',
      alternativeImage: optimizeResult.alternative.registry,
    })
    .catch((err: unknown) => console.error('Error tracking telemetry', err));

  // Navigate to pull image with the alternative pre-filled
  // This will be implemented when the pull dialog is enhanced
}

function handleLearnMore(): void {
  window
    .openExternal('https://developers.redhat.com/hummingbird')
    .then(() => window.telemetryTrack('imageOptimize.learnMore'))
    .catch((err: unknown) => console.error('Error opening external link', err));
}
</script>

<div class="flex flex-col w-full h-full p-4">
  {#if loading}
    <div class="flex items-center justify-center h-full">
      <div class="text-[var(--pd-content-text)]">Checking for optimized alternatives...</div>
    </div>
  {:else if error}
    <div class="flex items-center justify-center h-full">
      <EmptyScreen
        icon={faShieldHalved}
        title="Error checking for alternatives"
        message={error}
      />
    </div>
  {:else if providers.length === 0}
    <EmptyScreen
      icon={faLeaf}
      title="No Optimizer Providers"
      message="No image optimizer providers are currently installed. Install the Hummingbird extension to see optimized image alternatives."
    >
      <Button on:click={handleLearnMore}>Learn More</Button>
    </EmptyScreen>
  {:else if optimizeResult?.alternative}
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center gap-2">
        <Fa icon={faLeaf} class="text-green-500" size="1.5x" />
        <h2 class="text-lg font-semibold text-[var(--pd-content-header)]">Hardened Alternative Available</h2>
      </div>

      <!-- Comparison Card -->
      <div class="bg-[var(--pd-content-card-bg)] rounded-lg p-6">
        <div class="grid grid-cols-3 gap-4 items-center">
          <!-- Current Image -->
          <div class="flex flex-col gap-2">
            <div class="text-sm text-[var(--pd-content-text)] opacity-70">Current Image</div>
            <div class="text-[var(--pd-content-text)] font-medium">
              {imageInfo?.RepoTags?.[0] ?? 'Unknown'}
            </div>
            <div class="flex items-center gap-4 mt-2">
              <div class="flex items-center gap-1">
                <Fa icon={faBoxOpen} class="text-[var(--pd-content-text)] opacity-70" />
                <span class="text-sm text-[var(--pd-content-text)]">{formatSize(imageInfo?.Size)}</span>
              </div>
              {#if optimizeResult.currentCVECount !== undefined}
                <div class="flex items-center gap-1">
                  <Fa icon={faShieldHalved} class="text-red-500" />
                  <span class="text-sm text-red-500">{optimizeResult.currentCVECount} CVEs</span>
                </div>
              {/if}
            </div>
          </div>

          <!-- Arrow -->
          <div class="flex justify-center">
            <Fa icon={faArrowRight} class="text-[var(--pd-content-text)] opacity-50" size="2x" />
          </div>

          <!-- Alternative Image -->
          <div class="flex flex-col gap-2">
            <div class="text-sm text-green-500 opacity-70">Hummingbird Alternative</div>
            <div class="text-green-500 font-medium">
              {optimizeResult.alternative.registry}
            </div>
            <div class="flex items-center gap-4 mt-2">
              {#if optimizeResult.alternative.size !== undefined}
                <div class="flex items-center gap-1">
                  <Fa icon={faBoxOpen} class="text-green-500" />
                  <span class="text-sm text-green-500">{formatSize(optimizeResult.alternative.size)}</span>
                </div>
              {/if}
              {#if optimizeResult.alternative.cveCount !== undefined}
                <div class="flex items-center gap-1">
                  <Fa icon={faShieldHalved} class="text-green-500" />
                  <span class="text-sm text-green-500">{optimizeResult.alternative.cveCount} CVEs</span>
                </div>
              {/if}
              {#if optimizeResult.alternative.signed}
                <span class="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Signed</span>
              {/if}
            </div>
          </div>
        </div>

        <!-- Savings Summary -->
        {#if optimizeResult.sizeSavingsPercent !== undefined || optimizeResult.cveSavingsPercent !== undefined}
          <div class="mt-4 pt-4 border-t border-[var(--pd-content-divider)] flex gap-6">
            {#if optimizeResult.sizeSavingsPercent !== undefined}
              <div class="text-sm text-[var(--pd-content-text)]">
                <span class="text-green-500 font-semibold">{optimizeResult.sizeSavingsPercent}%</span> smaller
              </div>
            {/if}
            {#if optimizeResult.cveSavingsPercent !== undefined}
              <div class="text-sm text-[var(--pd-content-text)]">
                <span class="text-green-500 font-semibold">{optimizeResult.cveSavingsPercent}%</span> fewer CVEs
              </div>
            {/if}
          </div>
        {/if}

        <!-- Action Button -->
        <div class="mt-6">
          <Button on:click={handlePullAlternative}>Pull Hummingbird Image</Button>
        </div>
      </div>

      <!-- Learn More Link -->
      <div class="text-sm text-[var(--pd-content-text)]">
        <button class="text-[var(--pd-link)] hover:underline cursor-pointer" on:click={handleLearnMore}>
          Learn more about Hummingbird hardened images
        </button>
      </div>
    </div>
  {:else}
    <EmptyScreen
      icon={faLeaf}
      title="No Optimized Alternative"
      message="No Hummingbird alternative is available for this image at this time."
    >
      <Button on:click={handleLearnMore}>Learn More About Hummingbird</Button>
    </EmptyScreen>
  {/if}
</div>
