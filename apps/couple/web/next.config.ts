import { randomUUID } from 'node:crypto';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

// R3: a photo of 10 MB (INSTANT_PHOTO_MAX_BYTES) plus the multipart envelope of its server action. Next refuses an action
// body over 1 MB by default, and the proxy (src/proxy.ts) cuts a request body at 10 MB: both limits are raised. The
// value never differs between environments, hence a constant rather than a variable (core.md rule 8).
const INSTANT_PHOTO_REQUEST_BODY_LIMIT = '11mb';

const nextConfig: NextConfig = {
    transpilePackages: ['@cocooning/design-system'],
    agentRules: false,
    experimental: {
        serverActions: { bodySizeLimit: INSTANT_PHOTO_REQUEST_BODY_LIMIT },
        proxyClientMaxBodySize: INSTANT_PHOTO_REQUEST_BODY_LIMIT,
    },
};

function withServiceWorker(config: NextConfig): NextConfig {
    const withSerwist = withSerwistInit({
        swSrc: 'src/app/sw.ts',
        swDest: 'public/sw.js',
        // The screens read again on return to the foreground and on « Actualiser » (decision 0036): no reload that empties a form.
        reloadOnOnline: false,
        additionalPrecacheEntries: [
            { url: WebRouterEnum.OFFLINE, revision: randomUUID() },
        ],
    });
    return withSerwist(config);
}

// The Serwist plugin is webpack only: it wraps the production build alone, so
// `next dev` keeps Turbopack and runs without a service worker.
export default function config(phase: string): NextConfig {
    return phase === PHASE_PRODUCTION_BUILD
        ? withServiceWorker(nextConfig)
        : nextConfig;
}
