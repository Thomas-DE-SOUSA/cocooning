import { join } from 'node:path';

export const resolveFromCwd = (file: string): string =>
    join(process.cwd(), file);
