import { Writable } from 'node:stream';

export type CommandRun = {
    readonly exitCode: number;
    readonly output: string;
    readonly errorOutput: string;
};

export class CapturedOutput extends Writable {
    private readonly chunks: string[] = [];

    get text(): string {
        return this.chunks.join('');
    }

    override _write(
        chunk: Buffer | string,
        _encoding: BufferEncoding,
        done: () => void,
    ): void {
        this.chunks.push(chunk.toString());
        done();
    }
}

export const refused = (code: string, message: string): string =>
    `Refused: ${code} (${message})\n`;
