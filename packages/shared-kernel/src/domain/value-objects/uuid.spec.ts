import { SharedKernelExceptionCodeEnum } from '../../exceptions/shared-kernel-exception-code.enum';
import { FakeUuidV7GeneratorProvider } from '../../testing/fake-uuid-v7-generator.provider';
import { EventId } from './event-id.vo';

const VALID_UUID = '0190a6f5-1234-7abc-8def-0123456789ab';

describe('Feature: identity value objects', () => {
    afterEach(() => EventId.resetForTests());

    describe('Scenario: no generator is configured', () => {
        it('refuses to generate an identifier', () => {
            expect(() => EventId.generate()).toThrow(
                expect.objectContaining({
                    code: SharedKernelExceptionCodeEnum.UUID_GENERATOR_NOT_CONFIGURED,
                }),
            );
        });
    });

    describe('Scenario: a fake generator is configured', () => {
        beforeEach(() => EventId.configure(new FakeUuidV7GeneratorProvider()));

        it('generates a deterministic sequence', () => {
            expect(EventId.generate().getValue()).toBe(
                '00000000-0000-7000-8000-000000000001',
            );
            expect(EventId.generate().getValue()).toBe(
                '00000000-0000-7000-8000-000000000002',
            );
        });

        it('restarts the sequence after a reset', () => {
            EventId.generate();
            EventId.resetForTests();
            EventId.configure(new FakeUuidV7GeneratorProvider());
            expect(EventId.generate().getValue()).toBe(
                '00000000-0000-7000-8000-000000000001',
            );
        });

        it('refuses a second configuration', () => {
            expect(() =>
                EventId.configure(new FakeUuidV7GeneratorProvider()),
            ).toThrow(
                expect.objectContaining({
                    code: SharedKernelExceptionCodeEnum.UUID_GENERATOR_ALREADY_CONFIGURED,
                }),
            );
        });

        it('reports itself configured on the Uuid base', () => {
            expect(EventId.isConfigured()).toBe(true);
        });

        it('rehydrates a valid identifier', () => {
            expect(EventId.from(VALID_UUID).getValue()).toBe(VALID_UUID);
        });

        it('rejects a malformed identifier', () => {
            expect(() => EventId.from('not-a-uuid')).toThrow(
                expect.objectContaining({
                    code: SharedKernelExceptionCodeEnum.UUID_INVALID,
                }),
            );
        });

        it('compares identifiers by value and is null-safe', () => {
            expect(
                EventId.from(VALID_UUID).equals(EventId.from(VALID_UUID)),
            ).toBe(true);
            expect(EventId.from(VALID_UUID).equals(EventId.generate())).toBe(
                false,
            );
            expect(EventId.from(VALID_UUID).equals(null)).toBe(false);
        });
    });
});
