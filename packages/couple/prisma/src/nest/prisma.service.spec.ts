import { PersistenceExceptionCodeEnum } from '../errors/persistence-exception-code.enum';
import { PrismaService } from './prisma.service';

describe('Feature: the Prisma service lifecycle', () => {
    describe('Scenario: used before the module is initialized', () => {
        it('fails loudly instead of building a client at import time', () => {
            const service = new PrismaService(
                'postgresql://unused@localhost/unused',
            );
            expect(() => service.client).toThrow(
                expect.objectContaining({
                    code: PersistenceExceptionCodeEnum.PERSISTENCE_NOT_INITIALIZED,
                }),
            );
        });
    });

    describe('Scenario: outside any transaction', () => {
        it('is not in a transaction', () => {
            expect(
                new PrismaService('postgresql://unused@localhost/unused')
                    .isInTransaction,
            ).toBe(false);
        });
    });
});
