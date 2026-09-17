<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck, faCloudDownload, faFileImport, faFileZipper } from '@fortawesome/free-solid-svg-icons';
import type { OpenDialogOptions } from '@podman-desktop/api';
import { Button, Input } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onMount } from 'svelte';

import Dialog from '/@/lib/dialogs/Dialog.svelte';
import FileInput from '/@/lib/ui/FileInput.svelte';

interface Props {
  closeCallback: () => void;
}

type Source = 'image' | 'file';

interface SourceDefinition {
  id: Source;
  label: string;
  icon: IconDefinition;
  fieldLabel: string;
  installIcon: IconDefinition;
}

const SOURCES: SourceDefinition[] = [
  { id: 'image', label: 'OCI image', icon: faCloudDownload, fieldLabel: 'Image name', installIcon: faCloudDownload },
  { id: 'file', label: 'Local file', icon: faFileZipper, fieldLabel: 'Image archive', installIcon: faFileImport },
];

const ARCHIVE_DIALOG_OPTIONS: OpenDialogOptions = {
  title: 'Select an extension image archive',
  selectors: ['openFile'],
  filters: [{ name: 'Image archive', extensions: ['tar'] }],
};

let { closeCallback }: Props = $props();
let source = $state<Source>('image');
let imageName = $state('');
let archivePath = $state('');

let installInProgress = $state(false);
// '' = untouched (Install disabled), undefined = valid, otherwise the error message
let inputfieldError: string | undefined = $state('');
let progressPercent = $state(0);
let logs: string[] = [];

const inputAriaLabel = 'Image name to install custom extension';
const archiveAriaLabel = 'Image archive to install custom extension';

const current = $derived(SOURCES.find(item => item.id === source) ?? SOURCES[0]);
const value = $derived((source === 'image' ? imageName : archivePath)?.trim() ?? '');

onMount(() => {
  focusField();
});

function focusField(): void {
  const ariaLabel = source === 'image' ? inputAriaLabel : archiveAriaLabel;
  const field = document.querySelector(`[aria-label="${ariaLabel}"]`);
  if (field instanceof HTMLInputElement) {
    field.focus();
  }
}

function validate(name: string | undefined): void {
  inputfieldError = name ? undefined : 'Missing name';
}

function validateImageName(event: Event): void {
  if (event.target instanceof HTMLInputElement) {
    validate(event.target.value);
    return;
  }
  inputfieldError = 'Invalid input';
}

function validateArchivePath(path: string): void {
  validate(path);
}

function selectSource(newSource: Source): void {
  if (installInProgress || source === newSource) return;
  source = newSource;
  // the other field keeps its value: it is valid if filled, untouched otherwise
  inputfieldError = value ? undefined : '';
  setTimeout(focusField);
}

async function installExtension(): Promise<void> {
  inputfieldError = undefined;
  logs = [];

  installInProgress = true;

  const target = value;

  const onLog = (data: string): void => {
    logs = [...logs, data];
    console.debug(`Installing ${target}:`, data);

    // try to extract percentage from string like
    // data Downloading sha256:e8d2c9e5c69499c41ba39b7828c00e55087572884cac466b4d1b47243b085c7d.tar - 11% - (55132/521578)
    const percentageMatch = /(\d+)%/.exec(data);
    if (percentageMatch) {
      progressPercent = parseInt(percentageMatch[1]);
    }
  };

  const onError = (error: string): void => {
    console.error(`got an error when installing ${target}`, error);
    installInProgress = false;
    inputfieldError = error;
  };

  try {
    if (source === 'image') {
      await window.extensionInstallFromImage(target, onLog, onError);
    } else {
      await window.extensionInstallFromArchive(target, onLog, onError);
    }
    logs = [...logs, '☑️ installation finished!'];
    progressPercent = 100;
  } catch (error) {
    console.error('error', error);
  }
  installInProgress = false;
}

async function handleKeydown(e: KeyboardEvent): Promise<void> {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (progressPercent === 100) {
      closeCallback();
    } else {
      await installExtension();
    }
  }
}

const showForm = $derived(installInProgress || progressPercent !== 100 || !!inputfieldError);
</script>

<svelte:window onkeydown={handleKeydown} />

<Dialog
  title="Install Custom Extension"
  onclose={closeCallback}>
  {#snippet content()}
    <div class="flex flex-col leading-5 space-y-5">
      {#if showForm}
        <div>
          <span class="block pb-2 text-[var(--pd-modal-text)]">Install from</span>
          <div
            role="radiogroup"
            aria-label="Install from"
            class="inline-flex rounded-md border border-[var(--pd-input-field-stroke)] p-0.5">
            {#each SOURCES as item (item.id)}
              <button
                type="button"
                role="radio"
                aria-checked={source === item.id}
                disabled={installInProgress}
                class={[
                  'flex items-center gap-2 rounded px-3 py-1 transition-colors disabled:cursor-not-allowed',
                  source === item.id
                    ? 'bg-[var(--pd-button-primary-bg)] text-[var(--pd-button-primary-text)]'
                    : 'text-[var(--pd-modal-text)] hover:bg-[var(--pd-button-link-hover-bg)] cursor-pointer',
                ]}
                onclick={selectSource.bind(undefined, item.id)}>
                <Icon icon={item.icon} />
                {item.label}
              </button>
            {/each}
          </div>
        </div>

        <div>
          <label for={source === 'image' ? 'imageName' : 'archivePath'} class="block pb-2 text-[var(--pd-modal-text)]"
            >{current.fieldLabel}</label>
          <div class="min-h-14">
            {#if source === 'image'}
              <Input
                bind:value={imageName}
                name="imageName"
                id="imageName"
                placeholder="quay.io/namespace/my-extension:latest"
                on:input={validateImageName}
                disabled={installInProgress}
                error={inputfieldError}
                aria-invalid={inputfieldError !== ''}
                aria-label={inputAriaLabel}
                required />
            {:else}
              <FileInput
                bind:value={archivePath}
                name="archivePath"
                id="archivePath"
                placeholder="Select a .tar archive…"
                options={ARCHIVE_DIALOG_OPTIONS}
                onChange={validateArchivePath}
                disabled={installInProgress}
                error={inputfieldError}
                aria-invalid={inputfieldError !== ''}
                aria-label={archiveAriaLabel}
                required />
              <p class="pt-1.5 text-sm text-[var(--pd-modal-text)] opacity-70">
                OCI or Docker image archive (.tar), for example exported with <code class="font-mono">podman save</code>
              </p>
            {/if}
          </div>
          <div class="w-full min-h-9 h-9 py-2">
            {#if installInProgress}
              <div class="flex grow">
                <div class="w-full h-4 mb-4 rounded-md bg-[var(--pd-progressBar-bg)] progress-bar overflow-hidden">
                  <div
                    class="h-4 bg-[var(--pd-progressBar-in-progress-bg)] rounded-md"
                    role="progressbar"
                    aria-label="Installation progress"
                    style="width: {progressPercent}%">
                  </div>
                </div>
                <div class="ml-2 w-3 text-sm text-[var(--pd-progressBar-text)]">{progressPercent}%</div>
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="flex items-center gap-3 py-2 text-[var(--pd-modal-text)]" role="status">
          <Icon icon={faCircleCheck} size="lg" class="text-[var(--pd-state-success)]" />
          <div class="min-w-0">
            <div class="font-semibold">Extension successfully installed</div>
            <div class="text-sm break-all opacity-80">{value}</div>
          </div>
        </div>
      {/if}
    </div>
  {/snippet}
  {#snippet buttons()}
    <Button
      type="link"
      on:click={closeCallback}>Cancel</Button>
    {#if showForm}
      <Button
        type="primary"
        icon={current.installIcon}
        disabled={inputfieldError !== undefined}
        on:click={installExtension}
        inProgress={installInProgress}>Install</Button>
    {:else}
      <Button on:click={closeCallback}>Done</Button>
    {/if}
  {/snippet}
</Dialog>
