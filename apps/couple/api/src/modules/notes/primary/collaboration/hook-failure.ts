import { isBaseException } from '@cocooning/shared-kernel/exceptions';
import type { Logger } from '@cocooning/shared-kernel/ports';

// Hocuspocus prints any failed hook whose error has a message, stack and all: the API logs its own, by identifiers
// only (core.md rule 33), then fails the hook with an empty error, which Hocuspocus answers without printing.
export async function reportingFailure<T>(
    logger: Logger,
    hook: string,
    noteId: string,
    work: () => Promise<T>,
): Promise<T> {
    try {
        return await work();
    } catch (error) {
        if (isBaseException(error)) {
            logger.warn('Note collaboration refused', {
                hook,
                noteId,
                code: error.code,
            });
        } else {
            logger.error('Note collaboration failed', { hook, noteId, error });
        }
        throw new Error('', { cause: error });
    }
}
