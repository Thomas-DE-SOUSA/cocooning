import { render } from '@testing-library/react';
import NoteSpaceLoading from './loading';

describe('Feature: the screen of a space while it loads', () => {
    it('shows skeletons in the shape of the screen, hidden from screen readers', () => {
        const { container } = render(<NoteSpaceLoading />);

        const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
        expect(skeletons).toHaveLength(5);
        for (const skeleton of skeletons) {
            expect(skeleton.getAttribute('aria-hidden')).toBe('true');
        }
    });
});
