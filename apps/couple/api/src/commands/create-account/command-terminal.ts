import type { Readable, Writable } from 'node:stream';

export type CommandTerminal = {
    readonly input: Readable;
    readonly output: Writable;
    readonly errorOutput: Writable;
};
