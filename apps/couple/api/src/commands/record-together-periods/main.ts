import { UuidV7GeneratorProvider } from '@cocooning/server-infrastructure/identifier';
import { Uuid } from '@cocooning/shared-kernel/domain';
import { runRecordTogetherPeriodsCommand } from './record-together-periods-command';

Uuid.configure(new UuidV7GeneratorProvider());

void runRecordTogetherPeriodsCommand(process.argv.slice(2), {
    input: process.stdin,
    output: process.stdout,
    errorOutput: process.stderr,
}).then((exitCode) => {
    process.exitCode = exitCode;
});
