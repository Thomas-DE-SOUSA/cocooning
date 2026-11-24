import type { Writable } from 'node:stream';
import { PairingException } from '@cocooning/couple-server-business-logic/pairing';
import { z } from 'zod';
import {
    type RecordTogetherPeriodsExitCode,
    RecordTogetherPeriodsExitCodeEnum,
} from './record-together-periods-exit-code';

// Only the class name of an unexpected error: a database error message may quote the days being written (core.md rule 33).
export function reportRecordTogetherPeriodsFailure(
    error: unknown,
    errorOutput: Writable,
): RecordTogetherPeriodsExitCode {
    if (error instanceof PairingException) {
        errorOutput.write(`Refused: ${error.code} (${error.message})\n`);
        return RecordTogetherPeriodsExitCodeEnum.REFUSED;
    }
    if (error instanceof z.ZodError) {
        errorOutput.write(`Invalid environment:\n${z.prettifyError(error)}\n`);
        return RecordTogetherPeriodsExitCodeEnum.FAILURE;
    }
    const name = error instanceof Error ? error.name : typeof error;
    errorOutput.write(`Unexpected failure: ${name}\n`);
    return RecordTogetherPeriodsExitCodeEnum.FAILURE;
}
