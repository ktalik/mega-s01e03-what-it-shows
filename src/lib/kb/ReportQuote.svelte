<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';

  // A report's own words, read from the export by id.
  let { id }: { id: string } = $props();

  const r = $derived(uniqueById(reports as Report[]).find((x) => x.id === id));
</script>

{#if r}
  <blockquote>{r.body} <cite>{r.id}, {r.tenant}, {r.channel}</cite></blockquote>
{:else}
  <blockquote class="missing">no report {id} in the export</blockquote>
{/if}

<style>
  blockquote { margin: 0.5rem 0; padding-left: 1rem; border-left: 3px solid var(--line); }
  cite { display: block; color: var(--muted); font: 0.8rem var(--mono); font-style: normal; }
  .missing { color: var(--warn); }
</style>
