import { isBaseException } from '@cocooning/shared-kernel/exceptions';
import { MissingExecutionContextException } from './missing-execution-context.exception';

describe('Feature: missing execution context', () => {
    describe('Scenario: a use case runs without its couple and user', () => {
        it('names every missing field in its code, message and context', () => {
            const exception = new MissingExecutionContextException([
                'coupleId',
                'userId',
            ]);
            expect(isBaseException(exception)).toBe(true);
            expect(exception).toMatchObject({
                name: 'MissingExecutionContextException',
                code: 'EXECUTION_CONTEXT_MISSING',
                message: 'Missing execution context: coupleId, userId',
                context: { missing: 'coupleId, userId' },
                missing: ['coupleId', 'userId'],
            });
        });
    });

    describe('Scenario: the caller reuses its array', () => {
        it('keeps its own frozen copy of the missing fields', () => {
            const missing: ('coupleId' | 'userId')[] = ['userId'];
            const exception = new MissingExecutionContextException(missing);
            missing.push('coupleId');
            expect(exception.missing).toEqual(['userId']);
            expect(Object.isFrozen(exception.missing)).toBe(true);
        });
    });
});
