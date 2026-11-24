import { PassThrough } from 'node:stream';
import { runRecordTogetherPeriodsCommand } from '../../src/commands/record-together-periods/record-together-periods-command';
import { CapturedOutput, type CommandRun } from './captured-output';

export const FIRST_PERIOD = '2020-01-10..2021-03-04';
export const OPEN_PERIOD = '2022-05-01..';

export const emailOf = (userId: string): string => `${userId}@cocooning.test`;

// The command reads nothing on its input: every value is an argument.
export async function runRecordTogetherPeriods(
    args: readonly string[],
): Promise<CommandRun> {
    const input = new PassThrough();
    input.end();
    const output = new CapturedOutput();
    const errorOutput = new CapturedOutput();
    const exitCode = await runRecordTogetherPeriodsCommand(args, {
        input,
        output,
        errorOutput,
    });
    return { exitCode, output: output.text, errorOutput: errorOutput.text };
}
