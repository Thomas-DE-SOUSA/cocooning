import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';

// An empty body is no value; a body that is not JSON fails without detail, the caller decides what it means.
export function parseJson(text: string): Result<unknown, null> {
    if (text.length === 0) return ok(null);
    try {
        return ok(JSON.parse(text) as unknown);
    } catch {
        return fail(null);
    }
}
