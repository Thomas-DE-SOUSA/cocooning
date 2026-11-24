import { MessageFeedItemTypeEnum } from './message-feed-item-type.enum';

describe('Feature: the kinds of item of the message feed', () => {
    describe('Scenario: listing the kinds', () => {
        it('has a flash message and an instant photo, each value equal to its key', () => {
            expect(MessageFeedItemTypeEnum).toEqual({
                FLASH_MESSAGE: 'FLASH_MESSAGE',
                INSTANT_PHOTO: 'INSTANT_PHOTO',
            });
        });
    });
});
