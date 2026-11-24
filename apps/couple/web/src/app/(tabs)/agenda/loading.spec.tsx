import { render } from '@testing-library/react';
import AgendaLoading from './loading';

describe('Feature: the agenda while it loads', () => {
    it('shows skeletons in the shape of the header, the month and the day, hidden from screen readers', () => {
        const { container } = render(<AgendaLoading />);

        const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
        expect(skeletons).toHaveLength(6);
        for (const skeleton of skeletons) {
            expect(skeleton.getAttribute('aria-hidden')).toBe('true');
        }
    });
});
