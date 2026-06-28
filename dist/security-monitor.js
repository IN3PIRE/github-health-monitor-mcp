import { GitHub____get_security_alerts____mcp } from './mcp-github-wrapper.js';
import { daysBetween } from './utils.js';
export async function collectSecurityAlerts(owner, repo, config) {
    const now = new Date().toISOString();
    try {
        const alerts = await GitHub____get_security_alerts____mcp({ owner, repo });
        return alerts.map(alert => ({
            package: alert.package,
            severity: alert.severity,
            daysOpen: daysBetween(alert.createdAt, now)
        }));
    }
    catch (error) {
        console.warn('Security monitoring disabled:', error);
        return [];
    }
}
//# sourceMappingURL=security-monitor.js.map