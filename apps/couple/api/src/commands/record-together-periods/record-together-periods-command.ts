import type { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
    AccountRepository,
    EmailAddress,
} from '@cocooning/couple-server-business-logic/authentication';
import {
    type RecordTogetherPeriodsCommand,
    RecordTogetherPeriodsUseCase,
} from '@cocooning/couple-server-business-logic/pairing';
import type { CommandTerminal } from '../command-terminal';
import { parseTogetherPeriods } from './parse-together-periods';
import { RecordTogetherPeriodsCommandModule } from './record-together-periods-command.module';
import {
    type RecordTogetherPeriodsExitCode,
    RecordTogetherPeriodsExitCodeEnum,
} from './record-together-periods-exit-code';
import { reportRecordTogetherPeriodsFailure } from './report-record-together-periods-failure';

const USAGE =
    'Usage: record-together-periods <email address> <YYYY-MM-DD..YYYY-MM-DD | YYYY-MM-DD..>...\n';

async function recordFor(
    app: INestApplicationContext,
    emailAddress: string,
    command: RecordTogetherPeriodsCommand,
    terminal: CommandTerminal,
): Promise<RecordTogetherPeriodsExitCode> {
    const account = await app
        .get(AccountRepository)
        .findByEmailAddress(EmailAddress.normalize(emailAddress));
    if (account === null) {
        terminal.errorOutput.write(
            'Unknown account: no account has this email address\n',
        );
        return RecordTogetherPeriodsExitCodeEnum.UNKNOWN_ACCOUNT;
    }
    const couple = await app
        .get(RecordTogetherPeriodsUseCase)
        .execute({ userId: account.id.getValue() }, command);
    terminal.output.write(
        `Together periods recorded: ${couple.togetherPeriods.length} periods\n`,
    );
    return RecordTogetherPeriodsExitCodeEnum.SUCCESS;
}

async function recordTogetherPeriods(
    emailAddress: string,
    command: RecordTogetherPeriodsCommand,
    terminal: CommandTerminal,
): Promise<RecordTogetherPeriodsExitCode> {
    const app = await NestFactory.createApplicationContext(
        RecordTogetherPeriodsCommandModule,
        { logger: false },
    );
    try {
        return await recordFor(app, emailAddress, command, terminal);
    } finally {
        await app.close();
    }
}

// The days are personal: never printed back, on success as on a refusal (core.md rule 33).
export async function runRecordTogetherPeriodsCommand(
    args: readonly string[],
    terminal: CommandTerminal,
): Promise<RecordTogetherPeriodsExitCode> {
    const [emailAddress, ...rawPeriods] = args;
    const periods = parseTogetherPeriods(rawPeriods);
    if (
        emailAddress === undefined ||
        rawPeriods.length === 0 ||
        periods === null
    ) {
        terminal.errorOutput.write(USAGE);
        return RecordTogetherPeriodsExitCodeEnum.USAGE;
    }
    try {
        return await recordTogetherPeriods(emailAddress, { periods }, terminal);
    } catch (error) {
        return reportRecordTogetherPeriodsFailure(error, terminal.errorOutput);
    }
}
