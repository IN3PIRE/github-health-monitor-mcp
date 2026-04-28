import test from 'node:test';
import assert from 'node:assert/strict';
import { daysBetween } from '../dist/utils.js';
import { deriveHealthFindings } from '../dist/health-calculations.js';

const config = {
  staleBranchDays: 30,
  oldPRDays: 14,
  unresponsiveIssueDays: 7
};
const now = '2026-04-28T00:00:00.000Z';

test('daysBetween floors full days', () => {
  assert.equal(daysBetween('2026-04-27T00:00:01.000Z', now), 0);
  assert.equal(daysBetween('2026-04-26T00:00:00.000Z', now), 2);
});

test('deriveHealthFindings filters stale branches and old pull requests by threshold', () => {
  const findings = deriveHealthFindings({
    branchCommits: [
      { name: 'main', lastCommit: '2026-04-20T00:00:00.000Z' },
      { name: 'feature-old', lastCommit: '2026-03-01T00:00:00.000Z' }
    ],
    pullRequests: [
      { number: 1, title: 'recent', created_at: '2026-04-20T00:00:00.000Z', user: { login: 'alice' } },
      { number: 2, title: 'old', created_at: '2026-04-01T00:00:00.000Z', user: { login: 'bob' } }
    ],
    issues: [],
    config,
    now
  });

  assert.deepEqual(findings.staleBranches, [
    { name: 'feature-old', lastCommit: '2026-03-01T00:00:00.000Z', daysStale: 58 }
  ]);
  assert.deepEqual(findings.oldPRs, [
    { number: 2, title: 'old', daysOpen: 27, author: 'bob' }
  ]);
});

test('deriveHealthFindings maps unresponsive issues and optional assignees', () => {
  const findings = deriveHealthFindings({
    branchCommits: [],
    pullRequests: [],
    issues: [
      { number: 3, title: 'recent issue', updated_at: '2026-04-26T00:00:00.000Z', assignee: null },
      { number: 4, title: 'stale issue', updated_at: '2026-04-01T00:00:00.000Z', assignee: { login: 'carol' } }
    ],
    config,
    now
  });

  assert.deepEqual(findings.unresponsiveIssues, [
    { number: 4, title: 'stale issue', daysSinceUpdate: 27, assignee: 'carol' }
  ]);
});
