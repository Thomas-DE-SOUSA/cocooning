import { Fraunces, Inter } from 'next/font/google';

// Downloaded at build time and served by the PWA: the phone never calls Google (platform decision 0017).
const fraunces = Fraunces({
    subsets: ['latin'],
    axes: ['SOFT', 'opsz'],
    variable: '--font-fraunces',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const FONT_VARIABLES = `${fraunces.variable} ${inter.variable}`;
