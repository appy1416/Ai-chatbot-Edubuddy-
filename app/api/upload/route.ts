import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, unauthorizedResponse } from '@/lib/auth-guard';
import type { Upload } from '@/types';

// POST — Handle file upload
export async function POST(request: NextRequest) {
  const auth = await validateAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 10 MB.' }, { status: 400 });
    }

    // Validate file type
    const ALLOWED_TYPES = [
      'image/png', 'image/jpeg', 'image/webp', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // TODO: Upload to Supabase Storage when configured
    // const supabase = createServerClient();
    // const storagePath = `${auth.userId}/${Date.now()}_${file.name}`;
    // const { data: storageData, error: storageError } = await supabase.storage
    //   .from('uploads')
    //   .upload(storagePath, file);
    // if (storageError) throw storageError;
    // const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(storagePath);

    const isImage = file.type.startsWith('image/');
    const upload: Upload = {
      id: `upload_${Date.now()}`,
      user_id: auth.userId!,
      file_name: file.name,
      file_type: isImage ? 'image' : 'document',
      mime_type: file.type,
      file_size: file.size,
      file_url: `/api/uploads/${file.name}`,
      bucket: 'uploads',
      storage_path: `${auth.userId}/${Date.now()}_${file.name}`,
      status: 'ready',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Extract basic text content for the MVP chatbot
    let extractedText = "";
    if (file.type === 'text/plain' || file.type === 'text/markdown' || file.type === 'text/csv' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      extractedText = await file.text();
    } else {
      extractedText = `[The user uploaded a file named "${file.name}". Explain that currently, you can only fully read .txt, .md, or .csv files, and ask them to copy-paste the contents if it is a PDF or Word document.]`;
    }

    // TODO: Insert metadata into Supabase
    // const { error: dbError } = await supabase.from('uploads').insert(upload);

    return NextResponse.json({ upload, extractedText }, { status: 201 });
  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// GET — List user's uploads
export async function GET(request: NextRequest) {
  const auth = await validateAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  try {
    // TODO: Fetch from Supabase
    // const supabase = createServerClient();
    // const { data, error } = await supabase
    //   .from('uploads')
    //   .select('*')
    //   .eq('user_id', auth.userId)
    //   .order('created_at', { ascending: false });

    const uploads: Upload[] = [];
    return NextResponse.json({ uploads, count: uploads.length });
  } catch (error) {
    console.error('[Upload API] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
  }
}
