<script lang="ts">
import type { CatalogExtension } from '@podman-desktop/core-api/extension-catalog';
import { Button, Dropdown, ErrorMessage } from '@podman-desktop/ui-svelte';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

interface Props {
  extensionId: string;
  versions: CatalogExtension['versions'];
  installedExtension?: CombinedExtensionInfoUI;
}

let { extensionId, versions, installedExtension }: Props = $props();

// the latest version is the first non preview one, installing any other one disables auto-update
let latestVersion = $derived(versions.find(version => !version.preview)?.version);

// version shipped with Podman Desktop: the installed one if not overridden, or else the one overridden
let bundledVersion = $derived(
  installedExtension?.bundled ? installedExtension.version : installedExtension?.overrides?.version,
);

function getLabel(version: string, preview?: boolean): string {
  const tags = [
    preview ? 'preview' : undefined,
    // an installed bundled extension is only flagged as bundled, the badge telling it is installed
    version === bundledVersion ? 'bundled' : undefined,
    version === installedExtension?.version && version !== bundledVersion ? 'installed' : undefined,
  ].filter(tag => tag !== undefined);
  return tags.length > 0 ? `v${version} (${tags.join(', ')})` : `v${version}`;
}

let options = $derived.by(() => {
  const catalogOptions = versions.map(version => ({
    value: version.version,
    label: getLabel(version.version, version.preview),
  }));
  // the bundled version is usually not published in the catalog
  if (bundledVersion && !versions.some(version => version.version === bundledVersion)) {
    catalogOptions.push({ value: bundledVersion, label: getLabel(bundledVersion) });
  }
  return catalogOptions;
});

let selectedVersion = $state<string>();
let inProgress = $state(false);
let error = $state('');

// the installed version is selected by default, or else the latest one
let defaultVersion = $derived(
  options.some(option => option.value === installedExtension?.version) ? installedExtension?.version : latestVersion,
);
let selectedValue = $derived(selectedVersion ?? defaultVersion);
let selected = $derived(versions.find(version => version.version === selectedValue));
// selecting the bundled version of an overriding extension restores the bundled extension
let restoreBundled = $derived(
  !!installedExtension?.overrides && selectedValue === bundledVersion && selectedValue !== installedExtension.version,
);

function selectVersion(version: string): void {
  selectedVersion = version;
}

async function installFromCatalog(ociUri: string): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  window
    .extensionInstallFromImage(
      ociUri,
      () => {},
      (installError: string) => reject(new Error(installError)),
      extensionId,
    )
    .then(resolve)
    .catch(reject);
  return promise;
}

async function restoreBundledVersion(): Promise<void> {
  inProgress = true;
  error = '';
  try {
    // removing the overriding extension loads back the bundled one
    await window.removeExtension(extensionId);
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : String(err);
  } finally {
    inProgress = false;
  }
}

async function installSelectedVersion(): Promise<void> {
  if (!selected) {
    return;
  }
  inProgress = true;
  error = '';
  try {
    // an extension installed by the user is replaced, a bundled one is overridden
    if (installedExtension?.removable) {
      await window.updateExtension(extensionId, selected.ociUri);
    } else {
      await installFromCatalog(selected.ociUri);
    }
    if (selected.version !== latestVersion) {
      await window.setExtensionPinned(extensionId, true);
    }
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : String(err);
  } finally {
    inProgress = false;
  }
}
</script>

{#if versions.length > 0}
  <div class="flex flex-col items-start gap-2 w-full" role="region" aria-label="Version picker">
    <Dropdown class="w-full" ariaLabel="Version" value={selectedValue} options={options} onChange={selectVersion} />
    {#if restoreBundled}
      <Button type="secondary" {inProgress} onclick={restoreBundledVersion}>Restore bundled v{bundledVersion}</Button>
    {:else if selected && selected.version !== installedExtension?.version}
      <Button type="secondary" {inProgress} onclick={installSelectedVersion}>Install v{selected.version}</Button>
    {/if}
    <!-- ErrorMessage keeps its space even without error -->
    {#if error}
      <ErrorMessage error={error} />
    {/if}
  </div>
{/if}
