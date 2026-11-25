import {
    INSTANT_PHOTO_CACHE_CONTROL,
    loadInstantPhotoFile,
} from '@/modules/messaging';

type Context = {
    readonly params: Promise<{ readonly instantPhotoId: string }>;
};

// Read for the signed-in partner on every request (decision 0036).
export const dynamic = 'force-dynamic';

// The bytes of a photo of the feed (core-frontend.md rule 12), never stored by the browser nor the service worker.
export async function GET(_request: Request, { params }: Context) {
    const file = await loadInstantPhotoFile((await params).instantPhotoId);
    if (!file.found) {
        return new Response(null, {
            status: file.status,
            headers: { 'Cache-Control': INSTANT_PHOTO_CACHE_CONTROL },
        });
    }
    return new Response(file.bytes, {
        headers: {
            'Content-Type': file.contentType,
            'Cache-Control': INSTANT_PHOTO_CACHE_CONTROL,
        },
    });
}
