import { z } from 'zod';
import { parseZodIssues, ROOT_PATH } from './zod-issue.parser';

const issuesOf = (schema: z.ZodType, value: unknown) => {
    const result = schema.safeParse(value);
    if (result.success) throw new Error('Expected a validation failure');
    return parseZodIssues(result.error);
};

describe('Feature: flatten Zod issues', () => {
    describe('Scenario: a nested field fails', () => {
        it('joins the path with dots', () => {
            const schema = z.object({ place: z.object({ city: z.string() }) });
            expect(issuesOf(schema, { place: { city: 3 } })).toEqual([
                {
                    path: 'place.city',
                    code: 'invalid_type',
                    message: expect.any(String),
                },
            ]);
        });
    });

    describe('Scenario: the root value fails', () => {
        it('names the root path', () => {
            expect(issuesOf(z.string(), 3)).toEqual([
                {
                    path: ROOT_PATH,
                    code: 'invalid_type',
                    message: expect.any(String),
                },
            ]);
        });
    });
});
