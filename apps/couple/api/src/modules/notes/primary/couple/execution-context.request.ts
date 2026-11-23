import { MissingExecutionContextException } from '@cocooning/couple-shared-kernel/exceptions';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { Request } from 'express';

const EXECUTION_CONTEXT = Symbol('EXECUTION_CONTEXT');

type RequestWithCouple = Request & {
    [EXECUTION_CONTEXT]?: ExecutionContext;
};

export function attachExecutionContext(
    request: Request,
    context: ExecutionContext,
): void {
    (request as RequestWithCouple)[EXECUTION_CONTEXT] = context;
}

// A route without NoteCoupleGuard has no couple: reading one there is a programming error, answered 500.
export function readExecutionContext(request: Request): ExecutionContext {
    const context = (request as RequestWithCouple)[EXECUTION_CONTEXT];
    if (context === undefined) {
        throw new MissingExecutionContextException(['coupleId', 'userId']);
    }
    return context;
}
