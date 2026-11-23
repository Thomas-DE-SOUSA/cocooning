import type { TestNote } from '@cocooning/couple-e2e-shared/fixtures';

export const NOW = new Date('2026-11-23T10:00:00.000Z');
export const COUPLE_ID = '01936b2e-7c4a-7000-8000-0000000000f1';
export const OTHER_COUPLE_ID = '01936b2e-7c4a-7000-8000-0000000000f2';
export const PARTNER_A = '01936b2e-7c4a-7000-8000-00000000000a';
export const PARTNER_B = '01936b2e-7c4a-7000-8000-00000000000b';
export const STRANGER = '01936b2e-7c4a-7000-8000-0000000000ee';

const at = (minutes: number): Date =>
    new Date(NOW.getTime() + minutes * 60_000);

const aNote = (suffix: string, overrides: Partial<TestNote>): TestNote => ({
    noteId: `01936b2e-7c4a-7000-8000-0000000000${suffix}`,
    coupleId: COUPLE_ID,
    ownerId: PARTNER_A,
    title: 'Courses',
    visibility: 'SHARED',
    updatedAt: NOW,
    deletedAt: null,
    ...overrides,
});

// Rows written as stored, so the adapter is read before it ever wrote; each changed one minute after the previous.
export const SHARED_OF_A = aNote('a1', { title: 'Courses', updatedAt: at(1) });
export const PRIVATE_OF_A = aNote('a2', {
    title: 'Idées cadeaux',
    visibility: 'PRIVATE',
    updatedAt: at(2),
});
export const SHARED_OF_B = aNote('b1', {
    ownerId: PARTNER_B,
    title: 'Vacances',
    updatedAt: at(3),
});
export const DELETED_OF_A = aNote('a3', {
    title: 'Ancienne liste',
    updatedAt: at(4),
    deletedAt: at(4),
});
export const OF_ANOTHER_COUPLE = aNote('c1', {
    coupleId: OTHER_COUPLE_ID,
    ownerId: STRANGER,
    title: 'Autre couple',
    updatedAt: at(5),
});
export const SEEDED_NOTES = [
    SHARED_OF_A,
    PRIVATE_OF_A,
    SHARED_OF_B,
    DELETED_OF_A,
    OF_ANOTHER_COUPLE,
];
