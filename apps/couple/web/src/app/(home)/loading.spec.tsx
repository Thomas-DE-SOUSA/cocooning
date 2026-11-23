import { render } from '@testing-library/react';
import HomeLoading from './loading';

describe('Feature: the home page while it loads', () => {
    it('shows skeletons in the shape of the list, hidden from screen readers', () => {
        const { container } = render(<HomeLoading />);

        const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
        expect(skeletons).toHaveLength(5);
        for (const skeleton of skeletons) {
            expect(skeleton.getAttribute('aria-hidden')).toBe('true');
        }
    });
});
