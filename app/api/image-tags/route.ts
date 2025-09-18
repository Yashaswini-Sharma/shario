import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No image uploaded' }, { status: 400 });
    }

    // Forward image to Python backend
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:5000/predict';
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const fetchRes = await fetch(pythonApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: imageBuffer,
    });
    if (!fetchRes.ok) {
      return NextResponse.json({ success: false, error: 'Python API error' }, { status: 500 });
    }
    const tags = await fetchRes.json();
    return NextResponse.json({ success: true, tags });
  } catch (e) {
    return NextResponse.json({ success: false, error: e?.toString() });
  }
}
