import { render } from '@testing-library/react';
import PairingLoading from './loading';

describe('Feature: the pairing page while it loads', () => {
    it('shows skeletons in the shape of the screen, hidden from screen readers', () => {
        const { container } = render(<PairingLoading />);

        const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
        expect(skeletons).toHaveLength(4);
        for (const skeleton of skeletons) {
            expect(skeleton.getAttribute('aria-hidden')).toBe('true');
        }
    });
});
