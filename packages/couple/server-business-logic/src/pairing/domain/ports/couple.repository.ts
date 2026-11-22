import type { Couple } from '../models/couple.aggregate';

// The only lookups of the repository without a coupleId (decision 0029):
// a partner without a couple has none yet. Each one rests on a unique index.
export abstract class CoupleRepository {
    abstract save(couple: Couple): Promise<void>;
    abstract findByPartner(userId: string): Promise<Couple | null>;
    abstract findByInvitationCode(code: string): Promise<Couple | null>;
}
