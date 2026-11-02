<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { groupByCause, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { mergedInto } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const merged = $derived(mergedInto(reports as Report[], ticket));
  const days = $derived(merged.map((r) => r.receivedAt.slice(0, 10)).sort());
  const causes = $derived(groupByCause(merged, tenantOf).length);
</script>

<p>
  <strong>{merged.length}</strong> reports from <strong>{new Set(merged.map((r) => r.tenant)).size}</strong> tenants,
  received {days[0]} to {days[days.length - 1]}, merged into #{ticket}. By tenant and channel they have
  <strong>{causes}</strong>
  {causes === 1 ? 'cause' : 'causes'}.
</p>
