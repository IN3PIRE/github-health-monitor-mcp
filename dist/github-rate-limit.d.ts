export declare class GitHubRateLimitError extends Error {
    retryAfterSeconds?: number;
    resetAt?: string;
    constructor(retryAfterSeconds?: number, resetAt?: string);
}
export declare function toGitHubRateLimitError(error: unknown, now?: number): GitHubRateLimitError | undefined;
export declare function formatGitHubApiError(error: unknown): string;
export declare function runGitHubRequest<T>(request: () => Promise<T>, options?: {
    maxRetries?: number;
    maxRetryDelayMs?: number;
    baseDelayMs?: number;
    sleep?: (delayMs: number) => Promise<void>;
}): Promise<T>;
//# sourceMappingURL=github-rate-limit.d.ts.map