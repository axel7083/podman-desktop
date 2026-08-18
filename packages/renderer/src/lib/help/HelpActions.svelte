<script lang="ts">
import { client } from '/@/client';
import HelpActionsItems from './HelpActionsItems.svelte';

const items = $derived(await client.helpMenu.getItems());
</script>

<HelpActionsItems items={items}/>
