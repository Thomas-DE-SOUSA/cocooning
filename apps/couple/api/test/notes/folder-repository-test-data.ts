import type { TestFolder } from '@cocooning/couple-e2e-shared/fixtures';

export const NOW = new Date('2026-11-25T10:00:00.000Z');
export const COUPLE_ID = '01936b2e-7c4a-7000-8000-0000000000f1';
export const OTHER_COUPLE_ID = '01936b2e-7c4a-7000-8000-0000000000f2';
export const PARTNER_A = '01936b2e-7c4a-7000-8000-00000000000a';
export const PARTNER_B = '01936b2e-7c4a-7000-8000-00000000000b';
export const STRANGER = '01936b2e-7c4a-7000-8000-0000000000ee';

const aFolder = (
    suffix: string,
    overrides: Partial<TestFolder>,
): TestFolder => ({
    folderId: `01936b2e-7c4a-7000-8000-0000000001${suffix}`,
    coupleId: COUPLE_ID,
    ownerId: PARTNER_A,
    space: 'SHARED',
    kind: 'CLASSIC',
    parentFolderId: null,
    name: 'Sorties',
    subject: null,
    cardTemplate: null,
    updatedAt: NOW,
    deletedAt: null,
    ...overrides,
});

// Rows written as stored, parents first: Sorties > Restaurants > Italiens, a private folder, a deleted one, another couple's.
export const SORTIES = aFolder('01', { name: 'Sorties' });
export const RESTAURANTS = aFolder('02', {
    name: 'Restaurants',
    ownerId: PARTNER_B,
    parentFolderId: SORTIES.folderId,
});
export const ITALIENS = aFolder('03', {
    name: 'Italiens',
    parentFolderId: RESTAURANTS.folderId,
});
export const BARS = aFolder('04', {
    name: 'Bars',
    parentFolderId: SORTIES.folderId,
});
export const PRIVATE_OF_A = aFolder('05', {
    name: 'Cadeaux',
    space: 'PRIVATE',
});
export const DELETED = aFolder('06', { name: 'Ancien', deletedAt: NOW });
export const OF_ANOTHER_COUPLE = aFolder('07', {
    coupleId: OTHER_COUPLE_ID,
    ownerId: STRANGER,
    name: 'Autre couple',
});
export const SEEDED_FOLDERS = [
    SORTIES,
    RESTAURANTS,
    ITALIENS,
    BARS,
    PRIVATE_OF_A,
    DELETED,
    OF_ANOTHER_COUPLE,
];
