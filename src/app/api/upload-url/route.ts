import { generateUploadUrl } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    let contentType = 'application/octet-stream';
    try {
      const body = await request.json();
      if (body?.contentType) contentType = String(body.contentType);
    } catch {}

    const { uploadUrl } = await generateUploadUrl({ contentType, access: 'private' });
    return Response.json({ uploadUrl });
  } catch (e: any) {
    const msg = e?.message || 'Failed to generate upload URL';
    return new Response(msg, { status: 500 });
  }
}


