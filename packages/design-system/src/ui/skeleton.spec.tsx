import { render } from '@testing-library/react';
import { Skeleton } from './skeleton';

describe('Feature: a loading placeholder', () => {
    it('is hidden from screen readers and keeps its size classes', () => {
        const { container } = render(<Skeleton className="h-9 w-40" />);

        const skeleton = container.querySelector('[data-slot="skeleton"]');
        expect(skeleton?.getAttribute('aria-hidden')).toBe('true');
        expect(skeleton?.className).toContain('h-9 w-40');
    });
});
