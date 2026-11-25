import type { INestApplication } from '@nestjs/common';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    createTestFolders,
    type TestFolder,
    truncateAllTables,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    createSmartFolderSettings,
    FolderRepository,
} from '@cocooning/couple-server-business-logic/notes';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import {
    COUPLE_ID,
    NOW,
    OTHER_COUPLE_ID,
    PARTNER_A,
    SORTIES,
} from './folder-repository-test-data';

const smart = (suffix: string, overrides: Partial<TestFolder>): TestFolder => ({
    ...SORTIES,
    folderId: `01936b2e-7c4a-7000-8000-0000000002${suffix}`,
    kind: 'SMART',
    ...overrides,
});

// Sorties (classic) > Restaurants (smart, holds the template) > Lyon (smart, inherits).
const RESTAURANTS = smart('01', {
    name: 'Restaurants',
    parentFolderId: SORTIES.folderId,
    subject: 'Les restaurants',
    cardTemplate: ['Adresse', 'Prix'],
});
const LYON = smart('02', {
    name: 'Lyon',
    parentFolderId: RESTAURANTS.folderId,
});

describe('Feature: the Prisma adapter of FolderRepository on smart folders (R17, R18)', () => {
    let app: INestApplication;
    const repository = () => app.get(FolderRepository);
    const prisma = () => app.get(PrismaService);

    beforeAll(async () => {
        app = await createTestApp({ controllers: [], overrides: [] });
    });
    afterAll(() => closeTestApp(app));
    beforeEach(async () => {
        await truncateAllTables(prisma());
        await createTestFolders(prisma(), [SORTIES, RESTAURANTS, LYON]);
    });

    describe('Scenario: R18, the lineage of a folder', () => {
        it('reads the folders root first, with their kind and settings', async () => {
            const lineage = await repository().findLineage(
                COUPLE_ID,
                LYON.folderId,
            );
            expect(lineage.map((folder) => folder.toSnapshot())).toEqual([
                expect.objectContaining({
                    name: 'Sorties',
                    kind: 'CLASSIC',
                    subject: null,
                }),
                expect.objectContaining({
                    name: 'Restaurants',
                    kind: 'SMART',
                    subject: 'Les restaurants',
                    cardTemplate: ['Adresse', 'Prix'],
                }),
                expect.objectContaining({
                    name: 'Lyon',
                    kind: 'SMART',
                    cardTemplate: null,
                }),
            ]);
        });

        it('is empty for a space root and for another couple', async () => {
            await expect(
                repository().findLineage(COUPLE_ID, null),
            ).resolves.toEqual([]);
            await expect(
                repository().findLineage(OTHER_COUPLE_ID, LYON.folderId),
            ).resolves.toEqual([]);
        });
    });

    describe('Scenario: R17, the template is edited', () => {
        it('stores the new subject and fields', async () => {
            const [, restaurants] = await repository().findLineage(
                COUPLE_ID,
                RESTAURANTS.folderId,
            );
            if (restaurants === undefined) throw new Error('Not found');
            restaurants.editTemplate(
                PARTNER_A,
                createSmartFolderSettings('Nos restaurants', ['Horaires']),
                NOW,
            );
            await repository().save(restaurants);
            const stored = await prisma().includingDeleted.folder.findFirst({
                where: { id: RESTAURANTS.folderId },
            });
            expect(stored).toMatchObject({
                subject: 'Nos restaurants',
                cardTemplate: ['Horaires'],
                version: 2,
            });
        });
    });

    describe('Scenario: a corrupted row', () => {
        it.each([
            ['an unknown kind', { kind: 'MAGIC' }],
            [
                'a template that is not a list of names',
                { cardTemplate: { a: 1 } },
            ],
        ])('answers FOLDER_DATA_CORRUPTED for %s', async (_label, data) => {
            await prisma().includingDeleted.folder.update({
                where: { id: RESTAURANTS.folderId },
                data,
            });
            await expect(
                repository().findLineage(COUPLE_ID, RESTAURANTS.folderId),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_DATA_CORRUPTED,
            });
        });
    });
});
