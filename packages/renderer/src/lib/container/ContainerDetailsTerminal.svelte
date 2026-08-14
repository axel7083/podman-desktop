<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import { TerminalSettings } from '@podman-desktop/core-api/terminal';
import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';
import type { IDisposable } from '@xterm/xterm';
import { Terminal } from '@xterm/xterm';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';

import { client } from '/@/client';
import { getTerminalTheme } from '/@/lib/terminal/terminal-theme';
import NoLogIcon from '/@/lib/ui/NoLogIcon.svelte';
import { getExistingTerminal, registerTerminal } from '/@/stores/container-terminal-store';

import type { ContainerInfoUI } from './ContainerInfoUI';
import { Shell } from '/@/lib/shell/shell';

interface ContainerDetailsTerminalProps {
  container: ContainerInfoUI;
  screenReaderMode?: boolean;
}

let { container, screenReaderMode = false }: ContainerDetailsTerminalProps = $props();
let terminalXtermDiv: HTMLDivElement;
let shellTerminal: Terminal;
let currentRouterPath: string;
let sendCallbackId: number | undefined;
let terminalContent: string = '';
let serializeAddon: SerializeAddon;
let shell: Shell;
let lastState = $state('');
let containerState = $derived(container.state);
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let onDataDisposable: IDisposable | undefined;
let reconnecting = false;

function registerInputHandler(shell: Shell): void {
  onDataDisposable?.dispose();
  onDataDisposable = shellTerminal?.onData(data => {
    console.log('write data', data);
    shell.write(data).catch((error: unknown) => console.log(String(error)));
  });
}

$effect(() => {
  if (lastState !== '' && lastState !== 'RUNNING' && containerState === 'RUNNING') {
    restartTerminal().catch((err: unknown) => {
      console.error('Error restarting terminal', err);
      scheduleReconnect();
    });
  }
  lastState = container.state;
});

async function restartTerminal(): Promise<void> {
  if (reconnecting) return;
  reconnecting = true;
  try {
    clearReconnectTimer();
    ignoreFirstData = true;
    await executeShellIntoContainer();
    window.dispatchEvent(new Event('resize'));
  } finally {
    reconnecting = false;
  }
}

function clearReconnectTimer(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  }
}

function scheduleReconnect(): void {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = undefined;
    if (container.state === 'RUNNING') {
      restartTerminal().catch((err: unknown) => {
        console.error('Error restarting terminal', err);
        scheduleReconnect();
      });
    }
  }, 2000);
}

// update current route scheme
router.subscribe(route => {
  currentRouterPath = route.path;
});

let ignoreFirstData = false;

function createDataCallback(): (data: Buffer) => void {
  let ignorePrompt = ignoreFirstData;
  ignoreFirstData = false;
  return (data: Buffer) => {
    if (ignorePrompt) {
      ignorePrompt = false;
      return;
    }
    shellTerminal.write(data.toString());
  };
}

function receiveEndCallback(): void {
  if (!sendCallbackId) return;

  if (reconnecting) {
    scheduleReconnect();
    return;
  }

  if (containerState === 'RUNNING') {
    restartTerminal().catch((err: unknown) => {
      console.error(`Error opening terminal for container ${container.id}`, err);
      scheduleReconnect();
    });
  } else {
    scheduleReconnect();
  }
}

// call exec command
async function executeShellIntoContainer(): Promise<void> {
  if (container.state !== 'RUNNING') {
    return;
  }

  console.log('executeShellIntoContainer creating shell client')
  shell = new Shell(container.engineId, container.id);
  shell.subscribe((data) => {
    shellTerminal.write(data);
  });

  console.log('open shell');
  await shell.open();

  console.log('resizing shell', shellTerminal.cols, shellTerminal.rows);
  await shell.resize(shellTerminal.cols, shellTerminal.rows);

  console.log('registerInputHandler');
  registerInputHandler(shell);
}

// refresh
async function refreshTerminal(): Promise<void> {
  // missing element, return
  if (!terminalXtermDiv) {
    return;
  }

  // grab font size
  const fontSize = (await client.configuration.getValue({
    key: TerminalSettings.SectionName + '.' + TerminalSettings.FontSize,
  })) as number | undefined;
  const lineHeight = (await client.configuration.getValue({
    key: TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  })) as number | undefined;

  const scrollback = (await client.configuration.getValue({
    key: TerminalSettings.SectionName + '.' + TerminalSettings.Scrollback,
  })) as number | undefined;

  // get terminal if any
  const existingTerminal = getExistingTerminal(container.engineId, container.id);

  shellTerminal = new Terminal({
    fontSize,
    lineHeight,
    screenReaderMode,
    theme: getTerminalTheme(),
    scrollback,
  });
  if (existingTerminal) {
    ignoreFirstData = true;
    shellTerminal.options = {
      fontSize,
      lineHeight,
    };
    shellTerminal.write(existingTerminal.terminal);
  }

  const fitAddon = new FitAddon();
  serializeAddon = new SerializeAddon();
  shellTerminal.loadAddon(fitAddon);
  shellTerminal.loadAddon(serializeAddon);

  shellTerminal.open(terminalXtermDiv);

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    if (currentRouterPath === `/containers/${container.id}/terminal`) {
      fitAddon.fit();
      shell.resize(shellTerminal.cols, shellTerminal.rows).catch(console.error);
    }
  });
  fitAddon.fit();
}
onMount(async () => {
  await refreshTerminal();
  await executeShellIntoContainer();
});

onDestroy(() => {
  clearReconnectTimer();
  onDataDisposable?.dispose();
  terminalContent = serializeAddon.serialize();
  registerTerminal({
    engineId: container.engineId,
    containerId: container.id,
    terminal: terminalContent,
    callbackId: sendCallbackId,
  });
  serializeAddon?.dispose();
  shellTerminal?.dispose();
  sendCallbackId = undefined;
});
</script>

<div
  class="h-full p-[5px] pr-0 bg-[var(--pd-terminal-background)]"
  bind:this={terminalXtermDiv}
  class:hidden={container.state !== 'RUNNING'}>
</div>

<EmptyScreen
  hidden={container.state === 'RUNNING'}
  icon={NoLogIcon}
  title="No Terminal"
  message="Container is not running" />
