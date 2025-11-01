// Import the module loosely to avoid build-time type errors if the API surface changes
import * as VercelBlob from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    let contentType = 'application/octet-stream';
    try {
      const body = await request.json();
      if (body?.contentType) contentType = String(body.contentType);
    } catch {}

    const generateUploadURL: any = (VercelBlob as any).generateUploadURL || (VercelBlob as any).generateUploadUrl;
    if (typeof generateUploadURL !== 'function') {
      return new Response('Blob upload URL generation is unavailable on this deployment.', { status: 501 });
    }
    const result = await generateUploadURL({ contentType, access: 'private' });
    const uploadUrl = (result && (result.uploadUrl || result.uploadURL)) as string | undefined;
    if (!uploadUrl) {
      return new Response('Failed to obtain upload URL.', { status: 500 });
    }
    return Response.json({ uploadUrl });
  } catch (e: any) {
    const msg = e?.message || 'Failed to generate upload URL';
    return new Response(msg, { status: 500 });
  }
}


