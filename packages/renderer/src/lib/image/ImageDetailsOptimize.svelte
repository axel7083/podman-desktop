<script lang="ts">
import { faArrowRight, faBoxOpen, faLeaf, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import type { ImageInfo } from '@podman-desktop/api';
import { Button, EmptyScreen } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa';
import { router } from 'tinro';

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

function handleInstallExtension(): void {
  window
    .telemetryTrack('imageOptimize.installExtension')
    .catch((err: unknown) => console.error('Error tracking telemetry', err));
  router.goto('/extensions?screen=catalog&searchTerm=' + encodeURIComponent('Hummingbird'));
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
    <div class="flex flex-col items-center justify-center h-full gap-6 p-8">
      <!-- Custom SVG placeholder: Container with Security Shield -->
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="opacity-70">
        <!-- Container Box -->
        <rect x="20" y="50" width="80" height="70" rx="6" fill="var(--pd-content-card-bg)" stroke="var(--pd-content-text)" stroke-width="2" opacity="0.6"/>
        <rect x="28" y="58" width="64" height="8" rx="2" fill="var(--pd-content-text)" opacity="0.3"/>
        <rect x="28" y="72" width="64" height="8" rx="2" fill="var(--pd-content-text)" opacity="0.3"/>
        <rect x="28" y="86" width="64" height="8" rx="2" fill="var(--pd-content-text)" opacity="0.3"/>
        <rect x="28" y="100" width="40" height="8" rx="2" fill="var(--pd-content-text)" opacity="0.3"/>
        
        <!-- Security Shield -->
        <path d="M115 35C115 35 95 42 95 42C95 42 95 70 95 80C95 95 105 105 115 110C125 105 135 95 135 80C135 70 135 42 135 42C135 42 115 35 115 35Z" 
              fill="var(--pd-content-card-bg)" stroke="#22c55e" stroke-width="3"/>
        <!-- Checkmark inside shield -->
        <path d="M107 72L113 78L125 62" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        
        <!-- Zero badge -->
        <circle cx="130" cy="100" r="16" fill="#22c55e"/>
        <text x="130" y="106" text-anchor="middle" fill="white" font-size="14" font-weight="bold">0</text>
      </svg>
      
      <div class="flex flex-col items-center gap-3 max-w-lg text-center">
        <h2 class="text-xl font-semibold text-[var(--pd-content-header)]">Install an Image Optimizer Extension</h2>
        <p class="text-[var(--pd-content-text)] leading-relaxed">
          Get recommendations for optimized container images that are more secure and efficient. 
          Image optimizer extensions analyze your images and suggest <span class="text-green-500 font-medium">zero-CVE</span> and 
          <span class="text-green-500 font-medium">distroless</span> alternatives that reduce your attack surface, 
          minimize image size, and improve container security posture.
        </p>
      </div>
      
      <Button onclick={handleInstallExtension}>Install Extension</Button>
    </div>
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
                <span class="text-sm text-[var(--pd-content-text)]">{optimizeResult.currentImage.size}</span>
              </div>
              {#if optimizeResult.currentImage.cveCount !== undefined}
                <div class="flex items-center gap-1">
                  <Fa icon={faShieldHalved} class="text-red-500" />
                  <span class="text-sm text-red-500">{optimizeResult.currentImage.cveCount} CVEs</span>
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
                  <span class="text-sm text-green-500">{optimizeResult.alternative.size}</span>
                </div>
              {/if}
              {#if optimizeResult.alternative.cveCount !== undefined}
                <div class="flex items-center gap-1">
                  <Fa icon={faShieldHalved} class="text-green-500" />
                  <span class="text-sm text-green-500">{optimizeResult.alternative.cveCount} CVEs</span>
                </div>
              {/if}
              {#if optimizeResult.alternative.isSigned}
                <span class="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Signed</span>
              {/if}
            </div>
          </div>
        </div>

        <!-- Savings Summary -->
        {#if optimizeResult.currentImage.cveCount > 0 && optimizeResult.alternative.cveCount < optimizeResult.currentImage.cveCount}
          <div class="mt-4 pt-4 border-t border-[var(--pd-content-divider)] flex gap-6">
            <div class="text-sm text-[var(--pd-content-text)]">
              <span class="text-green-500 font-semibold">{Math.round((1 - optimizeResult.alternative.cveCount / optimizeResult.currentImage.cveCount) * 100)}%</span> fewer CVEs
            </div>
          </div>
        {/if}

        <!-- Action Button -->
        <div class="mt-6">
          <Button onclick={handlePullAlternative}>Pull Hummingbird Image</Button>
        </div>
      </div>

      <!-- Learn More Link -->
      <div class="text-sm text-[var(--pd-content-text)]">
        <button class="text-[var(--pd-link)] hover:underline cursor-pointer" onclick={handleLearnMore}>
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
      <Button onclick={handleLearnMore}>Learn More About Hummingbird</Button>
    </EmptyScreen>
  {/if}
</div>
