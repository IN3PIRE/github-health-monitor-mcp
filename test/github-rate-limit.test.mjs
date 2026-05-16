import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GitHubRateLimitError,
  formatGitHubApiError,
  runGitHubRequest,
  toGitHubRateLimitError
} from '../dist/github-rate-limit.js';

test('toGitHubRateLimitError uses reset headers for retry context', () => {
  const error = {
    status: 403,
    message: 'API rate limit exceeded',
    response: {
      headers: {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': '1800000005'
      }
    }
  };

  const rateLimitError = toGitHubRateLimitError(error, 1800000000000);

  assert.ok(rateLimitError instanceof GitHubRateLimitError);
  assert.equal(rateLimitError.retryAfterSeconds, 5);
  assert.equal(rateLimitError.resetAt, '2027-01-15T08:00:05.000Z');
  assert.match(rateLimitError.message, /Set GITHUB_TOKEN/);
});

test('formatGitHubApiError preserves non-rate-limit errors', () => {
  assert.equal(formatGitHubApiError(new Error('Repository not found')), 'Repository not found');
});

test('runGitHubRequest retries short rate-limit responses with backoff', async () => {
  let attempts = 0;
  const delays = [];

  const result = await runGitHubRequest(
    async () => {
      attempts += 1;
      if (attempts < 3) {
        throw {
          status: 429,
          message: 'secondary rate limit',
          response: { headers: { 'retry-after': '1' } }
        };
      }
      return 'ok';
    },
    {
      baseDelayMs: 25,
      sleep: async (delayMs) => {
        delays.push(delayMs);
      }
    }
  );

  assert.equal(result, 'ok');
  assert.equal(attempts, 3);
  assert.deepEqual(delays, [25, 50]);
});
