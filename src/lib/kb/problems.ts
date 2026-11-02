// The problems in a ticket, counted the way the desk counts (causes.ts: by tenant and channel),
// plus the reports the desk read as a one-day move (desk-notes.json). Those are a different bug,
// so they get a row of their own, but they stay counted under the cause they are filed by.
import { groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift' | 'unplaced';

export type ProblemGroup = { problem: Problem; ids: string[]; tenants: number; firstSeen: string; lastSeen: string };

function summary(problem: Problem, rs: Report[]): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    ids: rs.map((r) => r.id),
    tenants: new Set(rs.map((r) => r.tenant)).size,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function mergedInto(all: Report[], ticket: number): Report[] {
  return uniqueById(all).filter((r) => r.mergedInto === ticket);
}

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { reports: number; groups: ProblemGroup[]; filedUnder: Partial<Record<Problem, number>> } {
  const merged = mergedInto(all, ticket);
  const groups = groupByCause(merged, tenantOf).map((g) => summary(g.cause, g.reports));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  // Where the desk files the one-day moves: cause → count.
  const filedUnder: Partial<Record<Problem, number>> = {};
  for (const g of groups) {
    const n = g.ids.filter((id) => oneDayMove.includes(id)).length;
    if (n) filedUnder[g.problem] = n;
  }
  if (moved.length) groups.push(summary('shift', moved));
  return { reports: merged.length, groups, filedUnder };
}

// Subject lines that turn up in more than one problem: why a subject match merged them.
export function sharedSubjects(merged: Report[], problemOf: (r: Report) => Problem): string[] {
  const seen = new Map<string, Set<Problem>>();
  for (const r of merged) seen.set(r.subject, (seen.get(r.subject) ?? new Set()).add(problemOf(r)));
  return [...seen.entries()].filter(([, ps]) => ps.size > 1).map(([s]) => s).sort();
}
