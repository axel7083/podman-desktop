<script lang="ts">
  import { faCloud, faHouse, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa';
  import KubeIcon from '/@/lib/images/KubeIcon.svelte';
  import PodmanIcon from '/@/lib/images/PodmanIcon.svelte';
  interface HotBarItem {
    id: string;
    title: string;
    type?: 'docker' | 'kubernetes' | 'podman',
    bg?: string;
    icon?: IconDefinition,
    href: string,
    status?: 'running' | 'stopped' | 'error',
  }
  import { router } from 'tinro';

  const items: HotBarItem[] = [{
    id: 'dashboard',
    title: 'Dashboard',
    bg: 'var(--pd-button-primary-bg)',
    icon: faHouse,
    href: '/',
  }, {
    id: 'podman',
    title: 'Podman Machine',
    bg: '#2e3136',
    type: 'podman',
    href: '/container-engine',
    status: 'running',
  },{
    id: 'podman-remote',
    title: 'Podman VPS',
    bg: '#2e3136',
    type: 'podman',
    href: '/container-engine',
    status: 'stopped',
  }, {
    id: 'kind-cluster',
    title: 'Kind Cluster',
    bg: '#2e3136',
    type: 'kubernetes',
    href: '/kubernetes',
    status: 'running',
  }, {
    id: 'openshift-cluster-error',
    title: 'Openshift Cluster',
    bg: '#2e3136',
    type: 'kubernetes',
    href: '/kubernetes',
    status: 'error',
  }];

  let selected: string = $state('podman');


  function onSelect(item: HotBarItem): void {
    selected = item.id;
    router.goto(item.href)
  }
</script>

<nav class="group w-[75px] min-w-fit flex flex-col gap-y-4 items-center my-4" aria-label="HotBar">
  {#each items as item (item.id)}
    <!-- hot bar cell -->
    <div class="flex flex-col items-center">
      <button
        onclick={onSelect.bind(undefined, item)}
        class:border-solid={selected === item.id}
        class:border-2={selected === item.id}
        class:border-white={selected === item.id}
        class="relative flex rounded-lg">
        <!-- rounded square -->
        <div class="w-[40px] h-[40px] flex rounded items-center justify-center m-0.5" style="background-color: {item.bg ?? 'transparent'}">
          <div>
            {#if item.icon}
              <Fa size="1.4x" icon={item.icon} />
            {:else}
              {#if item.type === 'kubernetes'}
                <KubeIcon size="30px" solid/>
              {:else if item.type === 'podman'}
                <PodmanIcon class="bg-white rounded-full p-0.5" style="color: black" size="30px"/>
              {/if}
            {/if}
          </div>
        </div>
        {#if item.status}
          <div
            class="absolute flex left-[-4px] bottom-[-2px] bg-[var(--pd-global-nav-bg)] rounded-full">
            <div
              class:bg-red-600={item.status === 'error'}
              class:bg-green-400={item.status === 'running'}
              class:bg-gray-500={item.status === 'stopped'}
              class="w-[8px] h-[8px] rounded-full m-0.5"
            />
          </div>
        {/if}
      </button>
      <span class="text-center">{item.title}</span>
    </div>
  {/each}
</nav>
