import { cn } from './cn';

describe('Feature: merge Tailwind classes', () => {
    it('lets the last conflicting class win', () => {
        expect(cn('px-4 text-sm', 'px-2')).toBe('text-sm px-2');
    });

    it('drops falsy values', () => {
        expect(cn('h-10', null, false, 'w-full')).toBe('h-10 w-full');
    });
});
