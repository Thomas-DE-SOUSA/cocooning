import { SharedKernelExceptionCodeEnum } from '../exceptions/shared-kernel-exception-code.enum';
import { parseEnum } from './parse-enum';

const NoteVisibilityEnum = { PRIVATE: 'PRIVATE', SHARED: 'SHARED' } as const;

describe('Feature: parse a raw enum value', () => {
    describe('Scenario: a known value', () => {
        it('returns the enum value', () => {
            expect(
                parseEnum('SHARED', NoteVisibilityEnum, 'NoteVisibility'),
            ).toBe(NoteVisibilityEnum.SHARED);
        });
    });

    describe('Scenario: an unknown value', () => {
        it('fails loudly with the enum label', () => {
            expect(() =>
                parseEnum('PUBLIC', NoteVisibilityEnum, 'NoteVisibility'),
            ).toThrow(
                expect.objectContaining({
                    code: SharedKernelExceptionCodeEnum.ENUM_VALUE_INVALID,
                    context: { label: 'NoteVisibility' },
                }),
            );
        });
    });
});
