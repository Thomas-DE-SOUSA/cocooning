export const PersistenceExceptionCodeEnum = {
    PERSISTENCE_NOT_INITIALIZED: 'PERSISTENCE_NOT_INITIALIZED',
    PERSISTENCE_LOCK_BUSY: 'PERSISTENCE_LOCK_BUSY',
    PERSISTENCE_LOCK_OUTSIDE_TRANSACTION:
        'PERSISTENCE_LOCK_OUTSIDE_TRANSACTION',
} as const;

export type PersistenceExceptionCode =
    (typeof PersistenceExceptionCodeEnum)[keyof typeof PersistenceExceptionCodeEnum];
