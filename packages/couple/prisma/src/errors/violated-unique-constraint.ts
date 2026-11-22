import { driverAdapterCauseOf } from './driver-adapter-cause';

const UNIQUE_VIOLATION_KIND = 'UniqueConstraintViolation';

// The single place that reads a unique violation: adapters map the returned constraint name to their own domain exception.
export function violatedUniqueConstraint(error: unknown): string | null {
    const cause = driverAdapterCauseOf(error);
    if (cause === null || cause.kind !== UNIQUE_VIOLATION_KIND) return null;
    return cause.constraintName;
}
