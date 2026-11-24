import type { CalendarEventResponse } from '@cocooning/couple-contract/agenda';
import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import {
    type AuthorColor,
    AuthorColorEnum,
} from '../view-models/agenda-screen.view-model';

// The partner who created the couple is the one who joined it first: the earliest joinedAt.
export function presentCoupleCreatorId(
    partners: CoupleResponse['partners'],
): string | null {
    const [creator] = [...partners].sort(
        (left, right) => Date.parse(left.joinedAt) - Date.parse(right.joinedAt),
    );
    return creator?.userId ?? null;
}

export const presentAuthorColor = (
    event: CalendarEventResponse,
    creatorId: string | null,
): AuthorColor =>
    event.ownerId === creatorId
        ? AuthorColorEnum.TERRACOTTA
        : AuthorColorEnum.SAGE;
