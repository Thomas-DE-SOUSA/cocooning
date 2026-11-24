import { render } from '@testing-library/react';
import MessagesLoading from './loading';

describe('Feature: the messages while they load', () => {
    it('shows skeletons in the shape of the title and the feed, hidden from screen readers', () => {
        const { container } = render(<MessagesLoading />);

        const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
        expect(skeletons).toHaveLength(5);
        for (const skeleton of skeletons) {
            expect(skeleton.getAttribute('aria-hidden')).toBe('true');
        }
    });
});
