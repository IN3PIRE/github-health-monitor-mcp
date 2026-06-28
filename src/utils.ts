import { RepoHealth, HealthConfig, DEFAULT_CONFIG } from './types.js';

function parsePositiveInt(value: string | undefined, fallback: number, label: string): number {
  if (value === undefined) return fallback;
  const trimmed = value.trim();
  if (trimmed === '') return fallback;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new RangeError(
      `${label} must be a positive integer, got "${trimmed}"`
    );
  }
  return parsed;
}

export function getConfig(): HealthConfig {
  return {
    staleBranchDays: parsePositiveInt(
      process.env.STALE_BRANCH_DAYS,
      DEFAULT_CONFIG.staleBranchDays,
      'STALE_BRANCH_DAYS'
    ),
    oldPRDays: parsePositiveInt(
      process.env.OLD_PR_DAYS,
      DEFAULT_CONFIG.oldPRDays,
      'OLD_PR_DAYS'
    ),
    unresponsiveIssueDays: parsePositiveInt(
      process.env.UNRESPONSIVE_ISSUE_DAYS,
      DEFAULT_CONFIG.unresponsiveIssueDays,
      'UNRESPONSIVE_ISSUE_DAYS'
    )
  };
}

export function getDaysAgoDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function formatHealthSummary(health: RepoHealth): string {
  return `Health check complete:
- Stale branches: ${health.staleBranches.length}
- Old PRs: ${health.oldPRs.length}
- Unresponsive issues: ${health.unresponsiveIssues.length}
- Security alerts: ${health.securityAlerts.length}`;
}