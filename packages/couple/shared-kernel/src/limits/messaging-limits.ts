// Shared by the domain, the contract and the message forms (contracts.md rule 11, decision 0050).
export const FLASH_MESSAGE_TEXT_MAX_LENGTH = 140;
// R3: 10 Mo, counted in binary megabytes as the phones display them.
export const INSTANT_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
// R11: the address of a phone's push service; the longest known services stay far below.
export const PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH = 2048;
// R11: the base64url keys of a subscription (p256dh is 87 signs, auth 22).
export const PUSH_SUBSCRIPTION_KEY_MAX_LENGTH = 128;
