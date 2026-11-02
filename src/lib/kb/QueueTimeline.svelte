<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';

  let { ticket }: { ticket: number } = $props();

  const WEEK = 7 * 86_400_000;
  const DAY = 86_400_000;
  const day = (iso: string) => Date.parse(iso.slice(0, 10));

  // Received vs merged, per week (Monday to Sunday, the desk's weeks), from the first report to
  // the last merge in the export.
  const weeks = $derived.by(() => {
    const mine = uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket);
    const days = mine.flatMap((r) => [day(r.receivedAt), ...(r.mergedAt ? [day(r.mergedAt)] : [])]);
    const first = Math.min(...days);
    const start = first - ((new Date(first).getUTCDay() + 6) % 7) * DAY;
    const count = Math.floor((Math.max(...days) - start) / WEEK) + 1;
    const rows = Array.from({ length: count }, (_, i) => ({ at: start + i * WEEK, received: 0, merged: 0 }));
    const weekOf = (iso: string) => rows[Math.floor((day(iso) - start) / WEEK)];
    for (const r of mine) {
      const rIn = weekOf(r.receivedAt);
      if (rIn) rIn.received++;
      const rMerged = r.mergedAt ? weekOf(r.mergedAt) : undefined;
      if (rMerged) rMerged.merged++;
    }
    return rows;
  });
  const max = $derived(Math.max(...weeks.flatMap((w) => [w.received, w.merged])));
  const label = (ms: number) => new Date(ms).toISOString().slice(5, 10);
  const h = (n: number) => (n / max) * 100;
</script>

<figure>
  <svg viewBox="0 0 {weeks.length * 24} 140" role="img" aria-label="reports received and merged into #{ticket}, per week">
    {#each weeks as w, i (w.at)}
      <rect class="in" x={i * 24 + 2} y={110 - h(w.received)} width="9" height={h(w.received)} />
      <rect class="merged" x={i * 24 + 12} y={110 - h(w.merged)} width="9" height={h(w.merged)} />
      {#if i % 4 === 0}<text x={i * 24 + 12} y="128">{label(w.at)}</text>{/if}
    {/each}
  </svg>
  <figcaption><span class="key in"></span> received · <span class="key merged"></span> merged into #{ticket} · per week</figcaption>
</figure>

<style>
  svg { width: 100%; max-width: 640px; }
  .in { fill: var(--warn); }
  .merged { fill: var(--accent); }
  text { font: 8px var(--mono); fill: var(--muted); text-anchor: middle; }
  figcaption { color: var(--muted); font-size: 0.85rem; }
  .key { display: inline-block; width: 0.7em; height: 0.7em; border-radius: 2px; }
  .key.in { background: var(--warn); }
  .key.merged { background: var(--accent); }
</style>
