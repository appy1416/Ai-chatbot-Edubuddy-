import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, unauthorizedResponse } from '@/lib/auth-guard';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function POST(request: NextRequest) {
  // Auth check
  const auth = await validateAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      console.error('[Transcribe API] No audio file found in form data');
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key') {
      return NextResponse.json({ text: "API Key required for custom transcription. Returning fallback text." });
    }

    console.log(`[Transcribe API] Received file: ${audioFile.name}, size: ${audioFile.size}, type: ${audioFile.type}`);

    // Convert audio file to Base64 (using more robust bytes extraction)
    let buffer: Buffer;
    try {
      const bytes = await audioFile.arrayBuffer();
      buffer = Buffer.from(bytes);
    } catch (e) {
      console.log('[Transcribe API] arrayBuffer failed, trying stream...');
      const chunks = [];
      const reader = (audioFile as unknown as { stream: () => { getReader: () => { read: () => Promise<{ done: boolean; value: Uint8Array }> } } }).stream().getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      buffer = Buffer.concat(chunks);
    }
    const base64Audio = buffer.toString('base64');
    console.log(`[Transcribe API] Base64 conversion successful. Length: ${base64Audio.length}`);
    
    // Sanitize MIME type (remove codecs like ;codecs=opus)
    let mimeType = audioFile.type || 'audio/webm';
    console.log(`[Transcribe API] Original MIME: ${mimeType}`);
    if (mimeType.includes(';')) {
      mimeType = mimeType.split(';')[0].trim();
    }
    console.log(`[Transcribe API] Sanitized MIME: ${mimeType}`);

    // Call Gemini to transcribe
    console.log(`[Transcribe API] Calling Gemini: ${GEMINI_API_URL}`);
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Please transcribe the following audio speech to text accurately. Output only the transcribed text without any extra conversational filler.' },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Audio
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2, // Low temp for accurate transcription
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const rawError = JSON.stringify(errorData);
      console.error(`[Transcribe API] Gemini error (${response.status}):`, rawError);
      throw new Error(`Gemini API Error ${response.status}: ${errorData.error?.message || rawError || 'No details provided.'}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ text: text?.trim() || '' });
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Transcribe API] Error:', error);
    return NextResponse.json(
      { error: `Failed to transcribe audio: ${errorMessage}` },
      { status: 500 }
    );
  }
}
