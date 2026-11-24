import { render } from '@testing-library/react';
import CoupleOverviewLoading from './loading';

describe('Feature: the page of our couple while it loads', () => {
    it('shows skeletons in the shape of the page, hidden from screen readers', () => {
        const { container } = render(<CoupleOverviewLoading />);

        const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
        expect(skeletons).toHaveLength(2);
        for (const skeleton of skeletons) {
            expect(skeleton.getAttribute('aria-hidden')).toBe('true');
        }
    });
});
