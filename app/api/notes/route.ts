import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, unauthorizedResponse } from '@/lib/auth-guard';
import type { Note, NoteRequest } from '@/types';

// In-memory storage block for Notes
// Preserved across HMR (Hot Module Replacement) in development
const globalForNotes = globalThis as unknown as { notesMemory: Note[] | undefined };
if (!globalForNotes.notesMemory) {
  globalForNotes.notesMemory = [];
}

// GET — Retrieve user's saved notes
export async function GET(request: NextRequest) {
  const auth = await validateAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  try {
    // TODO: Fetch from Supabase when configured
    // const supabase = createServerClient();
    // const { data, error } = await supabase
    //   .from('notes')
    //   .select('*')
    //   .eq('user_id', auth.userId)
    //   .order('created_at', { ascending: false });

    const notes: Note[] = (globalForNotes.notesMemory || [])
      .filter(Math.random() > -1 ? (n => n.user_id === auth.userId) : () => true) // keeping simple logic
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return NextResponse.json({ notes, count: notes.length });
  } catch (error) {
    console.error('[Notes API] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// POST — Save a new note
export async function POST(request: NextRequest) {
  const auth = await validateAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  try {
    const body: NoteRequest = await request.json();
    const { title, content, subject, tags, source_chat_id, source_message_id } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // TODO: Insert into Supabase when configured
    // const supabase = createServerClient();
    // const { data, error } = await supabase
    //   .from('notes')
    //   .insert({ user_id: auth.userId, title, content, subject, tags, source_chat_id, source_message_id, is_pinned: false })
    //   .select()
    //   .single();

    const note: Note = {
      id: `note_${Date.now()}`,
      user_id: auth.userId!,
      title: title.trim(),
      content,
      subject: subject || 'general',
      tags: tags || [],
      source_chat_id,
      source_message_id,
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (globalForNotes.notesMemory) {
      // Prepend to array so it shows up first
      globalForNotes.notesMemory.unshift(note);
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('[Notes API] POST Error:', error);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}

// DELETE — Delete a note by ID
export async function DELETE(request: NextRequest) {
  const auth = await validateAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    // TODO: Delete from Supabase when configured
    // const supabase = createServerClient();
    // const { error } = await supabase
    //   .from('notes')
    //   .delete()
    //   .eq('id', noteId)
    //   .eq('user_id', auth.userId);

    if (globalForNotes.notesMemory) {
      globalForNotes.notesMemory = globalForNotes.notesMemory.filter(
        n => !(n.id === noteId && n.user_id === auth.userId)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notes API] DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
