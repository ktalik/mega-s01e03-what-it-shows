<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, dayFirst, type Report } from '#lib/kb/causes';
  import { tenantHandles, tenantOf } from '#lib/kb/locales';
  import { mergedInto, sharedSubjects, splitTicket, type Problem } from '#lib/kb/problems';

  // links: problem → URL of the ticket filed for it.
  let { ticket, links = {} }: { ticket: number; links?: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const tenants = tenantHandles().map((tenant) => tenantOf({ tenant }));
  const dayFirstTenants = tenants.filter((t) => t && dayFirst(t.locale)).length;
  const problemOf = (r: Report): Problem =>
    notes.oneDayMove.includes(r.id) ? 'shift' : (causeOf(r, tenantOf(r)) ?? 'unplaced');
  const shared = $derived(sharedSubjects(mergedInto(reports as Report[], ticket), problemOf));
  const ticketNo = (url: string) => '#' + url.split('/').pop();
</script>

<p class="sum">
  <strong>{split.reports}</strong> reports merged into #{ticket} ·
  <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'} ·
  <strong>{dayFirstTenants}</strong> of {tenants.length} tenants write the day first
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.ids.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if links[g.problem]}<a href={links[g.problem]}>{ticketNo(links[g.problem] ?? '')}</a>{:else}none yet{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each Object.entries(split.filedUnder) as [cause, n] (cause)}
  <p class="note"><code>shift</code> reports are also counted under <code>{cause}</code> ({n}), where the desk files them by tenant.</p>
{/each}

<p class="note">
  Subjects shared by more than one problem ({shared.length}): {shared.map((s) => `"${s}"`).join(', ')}.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
