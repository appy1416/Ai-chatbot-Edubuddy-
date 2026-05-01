// ─── Database Schema Types ───
// These map directly to Supabase table columns.

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  education_level: EducationLevel;
  preferred_language: SupportedLanguage;
  bio?: string;
  institution?: string;
  created_at: string;
  updated_at: string;
}

export type EducationLevel =
  | 'primary'
  | 'secondary'
  | 'intermediate'
  | 'degree'
  | 'btech'
  | 'bba'
  | 'mba'
  | 'other';

export type SupportedLanguage = 'english' | 'telugu' | 'hindi';

export type Subject =
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'english'
  | 'telugu'
  | 'hindi'
  | 'computer_science'
  | 'programming'
  | 'general';

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  subject: Subject;
  language: SupportedLanguage;
  message_count: number;
  last_message_at: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used?: number;
  model?: string;
  attachments?: Attachment[];
  metadata?: MessageMetadata;
  created_at: string;
}

export interface MessageMetadata {
  action?: ChatAction;
  subject?: Subject;
  language?: SupportedLanguage;
  education_level?: EducationLevel;
  processing_time_ms?: number;
}

export interface Attachment {
  id: string;
  message_id: string;
  type: 'image' | 'document';
  url: string;
  name: string;
  mime_type: string;
  size: number;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  content_html?: string;
  subject: Subject;
  tags?: string[];
  source_chat_id?: string;
  source_message_id?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  message_id: string;
  chat_id: string;
  title: string;
  content: string;
  subject: Subject;
  created_at: string;
}

export interface Upload {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  file_url: string;
  bucket: string;
  storage_path: string;
  status: UploadStatus;
  extracted_text?: string;
  created_at: string;
  updated_at: string;
}

export type UploadStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface DocumentChunk {
  id: string;
  upload_id: string;
  user_id: string;
  content: string;
  chunk_index: number;
  embedding?: number[];
  created_at: string;
}

export interface SharedLink {
  id: string;
  user_id: string;
  resource_type: 'message' | 'note' | 'chat';
  resource_id: string;
  slug: string;
  is_active: boolean;
  view_count: number;
  expires_at?: string;
  created_at: string;
}

// ─── API Request / Response Contracts ───

export interface ChatRequest {
  message: string;
  subject: Subject;
  language: SupportedLanguage;
  chat_id?: string;
  education_level?: EducationLevel;
  action?: ChatAction;
  original_response?: string;
  chat_history?: ChatHistoryEntry[];
  attachments?: { name: string; type: string; url: string }[];
}

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatAction =
  | 'explain_simply'
  | 'explain_detail'
  | 'generate_notes'
  | 'translate'
  | 'youtube_resources'
  | 'summarize'
  | 'exam_answer';

export interface ChatResponse {
  message: string;
  chat_id: string;
  message_id: string;
  tokens_used?: number;
  youtube_links?: YouTubeResource[];
}

export interface YouTubeResource {
  title: string;
  url: string;
  thumbnail: string;
  channel: string;
  duration?: string;
}

export interface NoteRequest {
  title: string;
  content: string;
  subject: Subject;
  tags?: string[];
  source_chat_id?: string;
  source_message_id?: string;
}

export interface UploadRequest {
  file: File;
  user_id: string;
}

export interface ResourceSearchRequest {
  query: string;
  subject?: Subject;
  language?: SupportedLanguage;
  max_results?: number;
}

// ─── Supabase Database Type Map ───
// Use with supabase.from<TableName>() for type safety.

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Profile> };
      chats: { Row: Chat; Insert: Omit<Chat, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Chat> };
      messages: { Row: Message; Insert: Omit<Message, 'id' | 'created_at'>; Update: Partial<Message> };
      notes: { Row: Note; Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Note> };
      bookmarks: { Row: Bookmark; Insert: Omit<Bookmark, 'id' | 'created_at'>; Update: Partial<Bookmark> };
      uploads: { Row: Upload; Insert: Omit<Upload, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Upload> };
      document_chunks: { Row: DocumentChunk; Insert: Omit<DocumentChunk, 'id' | 'created_at'>; Update: Partial<DocumentChunk> };
      shared_links: { Row: SharedLink; Insert: Omit<SharedLink, 'id' | 'created_at'>; Update: Partial<SharedLink> };
    };
  };
}

// ─── UI / Component Utility Types ───

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: string;
}

export const EDUCATION_LEVELS: SelectOption<EducationLevel>[] = [
  { value: 'primary', label: 'Primary School' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'intermediate', label: 'Intermediate (11th–12th)' },
  { value: 'degree', label: 'Degree / Undergraduate' },
  { value: 'btech', label: 'B.Tech' },
  { value: 'bba', label: 'BBA' },
  { value: 'mba', label: 'MBA' },
  { value: 'other', label: 'Other' },
];

export const SUBJECTS: SelectOption<Subject | ''>[] = [
  { value: '', label: 'Select Subject' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'english', label: 'English' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'general', label: 'General Education' },
];

export const LANGUAGES: SelectOption<SupportedLanguage>[] = [
  { value: 'english', label: 'English' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'hindi', label: 'Hindi' },
];
