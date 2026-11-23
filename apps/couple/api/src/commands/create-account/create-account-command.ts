import { NestFactory } from '@nestjs/core';
import { CreateAccountUseCase } from '@cocooning/couple-server-business-logic/authentication';
import type { CommandTerminal } from './command-terminal';
import { CreateAccountCommandModule } from './create-account-command.module';
import {
    type CreateAccountExitCode,
    CreateAccountExitCodeEnum,
} from './create-account-exit-code';
import { readPassword } from './read-password';
import { reportCreateAccountFailure } from './report-create-account-failure';

const USAGE = 'Usage: create-account <email address>\n';

async function createAccount(
    emailAddress: string,
    terminal: CommandTerminal,
): Promise<CreateAccountExitCode> {
    const app = await NestFactory.createApplicationContext(
        CreateAccountCommandModule,
        { logger: false },
    );
    try {
        const password = await readPassword(terminal);
        if (password === null) return CreateAccountExitCodeEnum.USAGE;
        const account = await app
            .get(CreateAccountUseCase)
            .execute({ emailAddress, password });
        terminal.output.write(
            `Account created: ${account.emailAddress}, userId ${account.userId}\n`,
        );
        return CreateAccountExitCodeEnum.SUCCESS;
    } finally {
        await app.close();
    }
}

// The password is read on the terminal, never taken as an argument; neither it nor its hash is ever printed (core.md rules 30 and 33).
export async function runCreateAccountCommand(
    args: readonly string[],
    terminal: CommandTerminal,
): Promise<CreateAccountExitCode> {
    const [emailAddress] = args;
    if (args.length !== 1 || emailAddress === undefined) {
        terminal.errorOutput.write(USAGE);
        return CreateAccountExitCodeEnum.USAGE;
    }
    try {
        return await createAccount(emailAddress, terminal);
    } catch (error) {
        return reportCreateAccountFailure(error, terminal.errorOutput);
    }
}
