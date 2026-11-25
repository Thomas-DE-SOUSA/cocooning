// R3: the photo taken by the phone camera, as the web app reads it from its File; the API checks its bytes again.
export type InstantPhotoUpload = {
    readonly bytes: Uint8Array<ArrayBuffer>;
    readonly contentType: string;
    readonly fileName: string;
};
