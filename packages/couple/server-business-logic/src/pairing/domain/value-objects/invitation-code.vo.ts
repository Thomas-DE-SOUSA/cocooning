import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import type { SecureRandomGenerator } from '@cocooning/shared-kernel/ports';
import { PairingException } from '../exceptions/pairing.exception';

export const INVITATION_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const INVITATION_CODE_LENGTH = 8;

const HEX_CHARS_PER_BYTE = 2;
const HEX_RADIX = 16;
const MILLISECONDS_PER_HOUR = 3_600_000;
const INVITATION_CODE_PATTERN = new RegExp(
    `^[${INVITATION_CODE_ALPHABET}]{${INVITATION_CODE_LENGTH}}$`,
);

type InvitationCodeProps = {
    readonly value: string;
    readonly expiresAt: Date;
};

export type InvitationCodeSnapshot = {
    readonly value: string;
    readonly expiresAt: string;
};

const toSign = (hexByte: string): string =>
    INVITATION_CODE_ALPHABET.charAt(
        parseInt(hexByte, HEX_RADIX) % INVITATION_CODE_ALPHABET.length,
    );

const hexBytesOf = (hex: string): ReadonlyArray<string> =>
    Array.from({ length: hex.length / HEX_CHARS_PER_BYTE }, (_, index) =>
        hex.slice(index * HEX_CHARS_PER_BYTE, (index + 1) * HEX_CHARS_PER_BYTE),
    );

export class InvitationCode extends ValueObject<InvitationCodeProps> {
    private constructor(props: InvitationCodeProps) {
        super(props);
        Object.freeze(this);
    }

    // 256 is a multiple of the 32 signs: `byte % 32` draws every sign with the same odds (R3).
    static generate(
        secureRandomGenerator: SecureRandomGenerator,
        issuedAt: Date,
        lifetimeInHours: number,
    ): InvitationCode {
        const hex = secureRandomGenerator.generateHex(INVITATION_CODE_LENGTH);
        return new InvitationCode({
            value: hexBytesOf(hex).map(toSign).join(''),
            expiresAt: new Date(
                issuedAt.getTime() + lifetimeInHours * MILLISECONDS_PER_HOUR,
            ),
        });
    }

    static from(snapshot: InvitationCodeSnapshot): InvitationCode {
        return new InvitationCode({
            value: snapshot.value,
            expiresAt: new Date(snapshot.expiresAt),
        });
    }

    static normalize(rawCode: string): string {
        const normalized = rawCode.replace(/\s+/g, '').toUpperCase();
        if (!INVITATION_CODE_PATTERN.test(normalized)) {
            throw new PairingException({
                code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
                message: 'Invalid invitation code',
            });
        }
        return normalized;
    }

    isValidAt(now: Date): boolean {
        return now.getTime() < this.props.expiresAt.getTime();
    }

    matches(normalizedCode: string): boolean {
        return this.props.value === normalizedCode;
    }

    get value(): string {
        return this.props.value;
    }

    get expiresAt(): Date {
        return new Date(this.props.expiresAt.getTime());
    }

    toSnapshot(): InvitationCodeSnapshot {
        return {
            value: this.props.value,
            expiresAt: this.props.expiresAt.toISOString(),
        };
    }
}
