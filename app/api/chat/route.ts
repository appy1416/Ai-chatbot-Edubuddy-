import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, applyAction } from '@/services/gemini';
import { validateAuth, unauthorizedResponse } from '@/lib/auth-guard';
import { SUBJECTS } from '@/types';
import type { ChatRequest, ChatResponse, Subject, SupportedLanguage, EducationLevel, ChatAction } from '@/types';
import { isEducationQuery, isSubjectMatch } from '@/lib/validation';
export async function POST(request: NextRequest) {
  // Auth check
  const auth = await validateAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  try {
    const body: ChatRequest = await request.json();
    const {
      message,
      subject = '' as Subject, // Use empty string to catch unselected state
      language = 'english' as SupportedLanguage,
      education_level,
      chat_history,
      action,
      original_response,
    } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ error: 'Please select a subject before asking a question.' }, { status: 400 });
    }

    // Step 1: Check if question is education-related
    if (!isEducationQuery(message)) {
      return NextResponse.json({
        message: "This chatbot is designed only for educational purposes. Please ask a subject-related academic question.",
        chat_id: `reject_${Date.now()}`,
        message_id: `msg_reject_${Date.now()}`
      });
    }

    // Step 2: Check if question matches selected subject
    if (!isSubjectMatch(message, subject)) {
      const subjectLabel = SUBJECTS.find(s => s.value === subject)?.label || subject;
      return NextResponse.json({
        message: `This question does not match the selected subject. Please ask a question related to ${subjectLabel}.`,
        chat_id: `reject_${Date.now()}`,
        message_id: `msg_reject_${Date.now()}`
      });
    }

    const startTime = Date.now();
    let response: string;

    // Use common logic for both direct and action-based chat
    if (action && original_response) {
      response = await applyAction(
        message,
        original_response,
        action as ChatAction,
        subject,
        language
      );
    } else {
      response = await generateChatResponse(
        message,
        subject,
        language,
        (education_level || 'degree') as EducationLevel,
        chat_history
      );
    }

    const result: ChatResponse = {
      message: response,
      chat_id: `chat_${Date.now()}`,
      message_id: `msg_${Date.now()}`,
      tokens_used: Math.ceil(response.length / 4),
    };

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Chat API] ${Date.now() - startTime}ms | subject=${subject} | lang=${language}`);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request. Please try again.' },
      { status: 500 }
    );
  }
}
