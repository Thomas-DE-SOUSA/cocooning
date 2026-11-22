import { SharedKernelExceptionCodeEnum } from '../../exceptions/shared-kernel-exception-code.enum';
import { EntityMetadata } from './entity-metadata.vo';

const CREATED_AT = new Date('2026-11-22T10:00:00.000Z');
const LATER = new Date('2026-11-22T11:00:00.000Z');

describe('Feature: entity lifecycle metadata', () => {
    describe('Scenario: creation', () => {
        it('starts updated at creation time and not deleted', () => {
            expect(EntityMetadata.create(CREATED_AT).toSnapshot()).toEqual({
                createdAt: '2026-11-22T10:00:00.000Z',
                updatedAt: '2026-11-22T10:00:00.000Z',
                deletedAt: null,
            });
        });
    });

    describe('Scenario: update and deletion', () => {
        it('records an update in a new instance', () => {
            const metadata = EntityMetadata.create(CREATED_AT);
            const updated = metadata.recordUpdate(LATER);
            expect(updated.updatedAt).toEqual(LATER);
            expect(metadata.updatedAt).toEqual(CREATED_AT);
        });

        it('records a deletion as the last update', () => {
            const deleted =
                EntityMetadata.create(CREATED_AT).recordDeletion(LATER);
            expect(deleted.isDeleted()).toBe(true);
            expect(deleted.toSnapshot()).toEqual({
                createdAt: '2026-11-22T10:00:00.000Z',
                updatedAt: '2026-11-22T11:00:00.000Z',
                deletedAt: '2026-11-22T11:00:00.000Z',
            });
        });

        it('returns defensive copies of its dates', () => {
            const metadata = EntityMetadata.create(CREATED_AT);
            metadata.createdAt.setTime(0);
            expect(metadata.createdAt).toEqual(CREATED_AT);
        });
    });

    describe('Scenario: rehydration', () => {
        it('round-trips through its snapshot', () => {
            const snapshot = EntityMetadata.create(CREATED_AT)
                .recordDeletion(LATER)
                .toSnapshot();
            expect(EntityMetadata.fromSnapshot(snapshot).toSnapshot()).toEqual(
                snapshot,
            );
        });

        it('fails loudly on a corrupted date', () => {
            expect(() =>
                EntityMetadata.fromSnapshot({
                    createdAt: 'garbage',
                    updatedAt: 'garbage',
                    deletedAt: null,
                }),
            ).toThrow(
                expect.objectContaining({
                    code: SharedKernelExceptionCodeEnum.METADATA_DATA_CORRUPTED,
                }),
            );
        });
    });
});
