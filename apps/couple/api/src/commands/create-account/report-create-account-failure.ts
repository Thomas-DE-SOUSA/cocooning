import type { Writable } from 'node:stream';
import { AuthenticationException } from '@cocooning/couple-server-business-logic/authentication';
import { z } from 'zod';
import {
    type CreateAccountExitCode,
    CreateAccountExitCodeEnum,
} from './create-account-exit-code';

// Only the class name of an unexpected error: a database error message may quote the hash being written.
export function reportCreateAccountFailure(
    error: unknown,
    errorOutput: Writable,
): CreateAccountExitCode {
    if (error instanceof AuthenticationException) {
        errorOutput.write(`Refused: ${error.code} (${error.message})\n`);
        return CreateAccountExitCodeEnum.REFUSED;
    }
    if (error instanceof z.ZodError) {
        errorOutput.write(`Invalid environment:\n${z.prettifyError(error)}\n`);
        return CreateAccountExitCodeEnum.FAILURE;
    }
    const name = error instanceof Error ? error.name : typeof error;
    errorOutput.write(`Unexpected failure: ${name}\n`);
    return CreateAccountExitCodeEnum.FAILURE;
}
