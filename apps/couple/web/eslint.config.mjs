import { boundariesConfig } from '@cocooning/eslint-config/boundaries';
import { nextConfig } from '@cocooning/eslint-config/next';

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...nextConfig,
    ...boundariesConfig,
    { ignores: ['.next/**', 'next-env.d.ts'] },
];
