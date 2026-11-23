// Fixture: deterministic business code that the rules accept.
import { createHash } from 'node:crypto';

export const digest = (value: string): string =>
    createHash('sha256').update(value).digest('hex');
