import { PassThrough, Writable } from 'node:stream';
import { runCreateAccountCommand } from '../../src/commands/create-account/create-account-command';

export type CommandRun = {
    readonly exitCode: number;
    readonly output: string;
    readonly errorOutput: string;
};

class CapturedOutput extends Writable {
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

// Each typed line ends with a carriage return, as the Enter key sends it on a terminal.
export async function runCreateAccount(
    args: readonly string[],
    typedLines: readonly string[],
): Promise<CommandRun> {
    const input = new PassThrough();
    input.end(typedLines.map((line) => `${line}\r`).join(''));
    const output = new CapturedOutput();
    const errorOutput = new CapturedOutput();
    const exitCode = await runCreateAccountCommand(args, {
        input,
        output,
        errorOutput,
    });
    return { exitCode, output: output.text, errorOutput: errorOutput.text };
}

export const refused = (code: string, message: string): string =>
    `Refused: ${code} (${message})\n`;
