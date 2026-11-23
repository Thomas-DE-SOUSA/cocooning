import { randomUUID } from 'node:crypto';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

const nextConfig: NextConfig = {
    transpilePackages: ['@cocooning/design-system'],
    agentRules: false,
};

function withServiceWorker(config: NextConfig): NextConfig {
    const withSerwist = withSerwistInit({
        swSrc: 'src/app/sw.ts',
        swDest: 'public/sw.js',
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
