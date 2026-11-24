import { PassThrough } from 'node:stream';
import { CapturedOutput, type CommandRun } from './captured-output';
import { runCreateAccountCommand } from '../../src/commands/create-account/create-account-command';

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
