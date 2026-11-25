import type { INestApplication } from '@nestjs/common';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    createTestFolders,
    truncateAllTables,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    type Folder,
    FolderName,
    FolderRepository,
} from '@cocooning/couple-server-business-logic/notes';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import {
    BARS,
    COUPLE_ID,
    ITALIENS,
    NOW,
    OF_ANOTHER_COUPLE,
    OTHER_COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    PRIVATE_OF_A,
    RESTAURANTS,
    SEEDED_FOLDERS,
    SORTIES,
    STRANGER,
} from './folder-repository-test-data';

describe('Feature: the Prisma adapter of FolderRepository', () => {
    let app: INestApplication;
    const repository = () => app.get(FolderRepository);
    const prisma = () => app.get(PrismaService);

    beforeAll(async () => {
        app = await createTestApp({ controllers: [], overrides: [] });
    });
    afterAll(() => closeTestApp(app));
    beforeEach(async () => {
        await truncateAllTables(prisma());
        await createTestFolders(prisma(), SEEDED_FOLDERS);
    });

    const visible = async (
        userId: string,
        folderId: string,
    ): Promise<Folder> => {
        const folder = await repository().findVisibleById(
            COUPLE_ID,
            userId,
            folderId,
        );
        if (folder === null) throw new Error(`Folder ${folderId} not visible`);
        return folder;
    };

    describe('Scenario: R14, visibility and couple isolation in the query', () => {
        it('never gives the other partner’s private folder nor another couple’s', async () => {
            const repo = repository();
            await expect(
                repo.findVisibleById(
                    COUPLE_ID,
                    PARTNER_B,
                    PRIVATE_OF_A.folderId,
                ),
            ).resolves.toBeNull();
            await expect(
                repo.findVisibleById(
                    COUPLE_ID,
                    PARTNER_A,
                    OF_ANOTHER_COUPLE.folderId,
                ),
            ).resolves.toBeNull();
            await expect(
                repo.findVisibleById(
                    OTHER_COUPLE_ID,
                    STRANGER,
                    SORTIES.folderId,
                ),
            ).resolves.toBeNull();
        });

        it('lists the children of a folder by name, and the root without the deleted folder', async () => {
            const children = await repository().findVisibleChildren(
                COUPLE_ID,
                PARTNER_B,
                'SHARED',
                SORTIES.folderId,
            );
            expect(children.map(({ name }) => name.value)).toEqual([
                'Bars',
                'Restaurants',
            ]);
            const root = await repository().findVisibleChildren(
                COUPLE_ID,
                PARTNER_B,
                'SHARED',
                null,
            );
            expect(root.map(({ name }) => name.value)).toEqual(['Sorties']);
        });
    });

    describe('Scenario: the way from the root and the counts', () => {
        it('reads the path root first in one query, empty for the root', async () => {
            await expect(
                repository().findPath(COUPLE_ID, ITALIENS.folderId),
            ).resolves.toEqual([
                { folderId: SORTIES.folderId, name: 'Sorties' },
                { folderId: RESTAURANTS.folderId, name: 'Restaurants' },
                { folderId: ITALIENS.folderId, name: 'Italiens' },
            ]);
            await expect(
                repository().findPath(COUPLE_ID, null),
            ).resolves.toEqual([]);
            await expect(
                repository().findPath(OTHER_COUPLE_ID, ITALIENS.folderId),
            ).resolves.toEqual([]);
        });

        it('counts the children by folder and the folders by space', async () => {
            const sorties = await visible(PARTNER_A, SORTIES.folderId);
            const bars = await visible(PARTNER_A, BARS.folderId);
            const counts = await repository().countVisibleChildren(
                COUPLE_ID,
                PARTNER_A,
                [sorties, bars],
            );
            expect([...counts]).toEqual([[SORTIES.folderId, 2]]);
            await expect(
                repository().countVisibleBySpace(COUPLE_ID, PARTNER_B),
            ).resolves.toEqual({ SHARED: 4, PRIVATE: 0 });
        });
    });

    describe('Scenario: R16, the content of a deleted folder moves up', () => {
        it('moves the sub-folders up and raises their version', async () => {
            const restaurants = await visible(PARTNER_A, RESTAURANTS.folderId);
            restaurants.delete(PARTNER_A, NOW);
            await repository().save(restaurants);
            await repository().moveContentUp(restaurants);
            const italiens = await visible(PARTNER_A, ITALIENS.folderId);
            expect(italiens.toSnapshot()).toMatchObject({
                parentFolderId: SORTIES.folderId,
                version: 2,
            });
        });
    });

    describe('Scenario: two writes of the same folder', () => {
        it('refuses a stale version with FOLDER_VERSION_CONFLICT', async () => {
            const first = await visible(PARTNER_A, SORTIES.folderId);
            const second = await visible(PARTNER_B, SORTIES.folderId);
            first.rename(PARTNER_A, FolderName.create('Un'), NOW);
            second.rename(PARTNER_B, FolderName.create('Deux'), NOW);
            await repository().save(first);
            await expect(repository().save(second)).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_VERSION_CONFLICT,
            });
        });

        it('refuses a stale save of a folder deleted in between with FOLDER_VERSION_CONFLICT', async () => {
            const deleting = await visible(PARTNER_A, BARS.folderId);
            const renaming = await visible(PARTNER_B, BARS.folderId);
            deleting.delete(PARTNER_A, NOW);
            renaming.rename(PARTNER_B, FolderName.create('Pubs'), NOW);
            await repository().save(deleting);
            await expect(repository().save(renaming)).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_VERSION_CONFLICT,
            });
        });
    });

    describe('Scenario: a corrupted row', () => {
        it('answers FOLDER_DATA_CORRUPTED for an unknown space', async () => {
            await prisma().includingDeleted.folder.update({
                where: { id: BARS.folderId },
                data: { space: 'BOTH' },
            });
            await expect(
                repository().findVisibleById(
                    COUPLE_ID,
                    PARTNER_A,
                    BARS.folderId,
                ),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_DATA_CORRUPTED,
            });
        });
    });
});
