import { UuidV7GeneratorProvider } from '@cocooning/server-infrastructure/identifier';
import { Uuid } from '@cocooning/shared-kernel/domain';
import { runCreateAccountCommand } from './create-account-command';

Uuid.configure(new UuidV7GeneratorProvider());

void runCreateAccountCommand(process.argv.slice(2), {
    input: process.stdin,
    output: process.stdout,
    errorOutput: process.stderr,
}).then((exitCode) => {
    process.exitCode = exitCode;
});
