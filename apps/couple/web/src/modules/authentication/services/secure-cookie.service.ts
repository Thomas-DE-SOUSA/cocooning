const PRODUCTION = 'production';

// Decision 0034: Secure in production behind tailscale serve (HTTPS); development runs on http://localhost.
export function isSecureCookie(nodeEnv: string): boolean {
    return nodeEnv === PRODUCTION;
}
