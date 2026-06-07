type HeaderMap = Record<string, string | number | undefined>;

interface GitHubApiErrorLike {
  status?: number;
  message?: string;
  response?: {
    headers?: HeaderMap;
  };
}

export class GitHubRateLimitError extends Error {
  retryAfterSeconds?: number;
  resetAt?: string;

  constructor(retryAfterSeconds?: number, resetAt?: string) {
    const retryText =
      retryAfterSeconds !== undefined
        ? ` Retry after about ${retryAfterSeconds} seconds.`
        : '';
    const resetText = resetAt ? ` GitHub reset time: ${resetAt}.` : '';

    super(
      `GitHub API rate limit exceeded.${retryText}${resetText} Set GITHUB_TOKEN for a higher request limit.`
    );
    this.name = 'GitHubRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
    this.resetAt = resetAt;
  }
}

function getHeader(headers: HeaderMap | undefined, name: string): string | undefined {
  if (!headers) return undefined;

  const entry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === name.toLowerCase()
  );
  if (!entry || entry[1] === undefined) return undefined;

  return String(entry[1]);
}

function getRetryAfterSeconds(headers: HeaderMap | undefined, now = Date.now()): {
  retryAfterSeconds?: number;
  resetAt?: string;
} {
  const retryAfter = Number(getHeader(headers, 'retry-after'));
  if (Number.isFinite(retryAfter) && retryAfter >= 0) {
    return { retryAfterSeconds: Math.ceil(retryAfter) };
  }

  const resetEpoch = Number(getHeader(headers, 'x-ratelimit-reset'));
  if (Number.isFinite(resetEpoch) && resetEpoch > 0) {
    const resetAt = new Date(resetEpoch * 1000).toISOString();
    const retryAfterSeconds = Math.max(0, Math.ceil((resetEpoch * 1000 - now) / 1000));
    return { retryAfterSeconds, resetAt };
  }

  return {};
}

export function toGitHubRateLimitError(
  error: unknown,
  now = Date.now()
): GitHubRateLimitError | undefined {
  const apiError = error as GitHubApiErrorLike;
  const message = apiError.message?.toLowerCase() ?? '';
  const remaining = getHeader(apiError.response?.headers, 'x-ratelimit-remaining');
  const isRateLimited =
    apiError.status === 429 ||
    (apiError.status === 403 && remaining === '0') ||
    message.includes('rate limit') ||
    message.includes('secondary rate limit');

  if (!isRateLimited) return undefined;

  const retryInfo = getRetryAfterSeconds(apiError.response?.headers, now);
  return new GitHubRateLimitError(retryInfo.retryAfterSeconds, retryInfo.resetAt);
}

export function formatGitHubApiError(error: unknown): string {
  const rateLimitError = toGitHubRateLimitError(error);
  if (rateLimitError) return rateLimitError.message;

  return error instanceof Error ? error.message : String(error);
}

export async function runGitHubRequest<T>(
  request: () => Promise<T>,
  options: {
    maxRetries?: number;
    maxRetryDelayMs?: number;
    baseDelayMs?: number;
    sleep?: (delayMs: number) => Promise<void>;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 2;
  const maxRetryDelayMs = options.maxRetryDelayMs ?? 5000;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const sleep = options.sleep ?? ((delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs)));

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      const rateLimitError = toGitHubRateLimitError(error);
      if (!rateLimitError) throw error;

      const exponentialDelayMs = baseDelayMs * 2 ** attempt;
      const retryAfterMs =
        rateLimitError.retryAfterSeconds !== undefined
          ? rateLimitError.retryAfterSeconds * 1000
          : exponentialDelayMs;
      const delayMs = Math.min(retryAfterMs, exponentialDelayMs);

      if (attempt >= maxRetries || delayMs > maxRetryDelayMs) {
        throw rateLimitError;
      }

      await sleep(delayMs);
    }
  }
}
