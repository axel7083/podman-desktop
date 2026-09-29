<script lang="ts">
import { faCloudDownload } from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import Dialog from '/@/lib/dialogs/Dialog.svelte';

interface Props {
  closeCallback: () => void;
}

let { closeCallback }: Props = $props();
let imageName = $state('');

let installInProgress = $state(false);
let inputfieldError: string | undefined = $state('');
let installed = $state(false);

const inputAriaLabel = 'Image name to install custom extension';

onMount(async () => {
  // search input field and make focus by aria-label Image name to install custom extension
  const imageNameInputField = document.querySelector(`[aria-label="${inputAriaLabel}"]`);
  if (imageNameInputField && imageNameInputField instanceof HTMLInputElement) {
    imageNameInputField.focus();
  }
});

function validateImageName(event: Event): void {
  if (event.target instanceof HTMLInputElement) {
    let name = event.target.value;
    if (!name) {
      inputfieldError = 'Missing name';
      return;
    } else {
      inputfieldError = undefined;
      return;
    }
  }
  inputfieldError = 'Invalid input';
}

async function installExtension(): Promise<void> {
  inputfieldError = undefined;

  // the dialog is hidden while installing: the installer may ask for a confirmation through a message box,
  // which must not be covered by the dialog. The progress is reported by the installation task.
  installInProgress = true;

  // do a trim on the image name
  const ociImage = imageName?.trim();

  try {
    // download image
    await window.extensionInstallFromImage(
      ociImage,
      (data: string) => {
        console.debug(`Installing ${ociImage}:`, data);
      },
      (error: string) => {
        console.error(`got an error when installing ${ociImage}`, error);
        installInProgress = false;
        inputfieldError = error;
      },
    );
    installed = true;
  } catch (error) {
    console.error('error', error);
  }
  installInProgress = false;
}

async function handleKeydown(e: KeyboardEvent): Promise<void> {
  // the Enter key may be pressed on a message box displayed during the installation
  if (e.key !== 'Enter' || installInProgress) {
    return;
  }
  e.preventDefault();
  if (installed) {
    closeCallback();
  } else {
    await installExtension();
  }
}

const showForm = $derived(!installed || !!inputfieldError);
</script>

<svelte:window onkeydown={handleKeydown} />

{#if !installInProgress}
  <Dialog
    title="Install Custom Extension"
    onclose={closeCallback}>
    {#snippet content()}
      <div  class="flex flex-col leading-5 space-y-5">
        <div>
          <label for="imageName" class="block pb-2 text-[var(--pd-modal-text)]">OCI Image:</label>
          <div class="min-h-14">
            {#if showForm}
              <Input
                bind:value={imageName}
                name="imageName"
                id="imageName"
                placeholder="Enter OCI image name of the extension (e.g. quay.io/namespace/my-image)"
                on:input={validateImageName}
                error={inputfieldError}
                aria-invalid={inputfieldError !== ''}
                aria-label={inputAriaLabel}
                required />
            {:else}
              <div class="text-[var(--pd-modal-text)]">{imageName} successfully installed.</div>
            {/if}
          </div>
        </div>
      </div>
    {/snippet}
    {#snippet buttons()}
  
        <Button
          type="link"
          on:click={closeCallback}>Cancel</Button>
        {#if showForm}
          <Button
            type="primary"
            icon={faCloudDownload}
            disabled={inputfieldError !== undefined}
            on:click={installExtension}>Install</Button>
        {:else}
          <Button on:click={closeCallback}>Done</Button>
        {/if}
    
    {/snippet}
  </Dialog>
{/if}
