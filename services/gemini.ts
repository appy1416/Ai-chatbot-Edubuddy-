// ─── Gemini API Service (Server-side only) ───

import { Subject, SupportedLanguage, EducationLevel, ChatAction } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Check if the Gemini API is properly configured.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY) && GEMINI_API_KEY !== 'your_gemini_api_key';
}

// ─── System Prompt Builder ───
function buildSystemPrompt(
  subject: Subject,
  language: SupportedLanguage,
  educationLevel: EducationLevel = 'degree'
): string {
  const levelDescriptions: Record<EducationLevel, string> = {
    primary: 'a primary school student (ages 6-10). Use very simple language, short sentences, and fun examples.',
    secondary: 'a secondary school student (ages 11-15). Use clear language with relatable examples.',
    intermediate: 'an intermediate student (ages 16-18). Use moderately detailed explanations.',
    degree: 'a degree/undergraduate student. Provide thorough academic explanations.',
    btech: 'a B.Tech engineering student. Include technical depth and practical examples.',
    bba: 'a BBA student. Focus on business concepts with real-world applications.',
    mba: 'an MBA student. Provide advanced business analysis and strategic thinking.',
    other: 'a general learner. Adapt explanations to be clear and accessible.',
  };

  const languageInstructions: Record<SupportedLanguage, string> = {
    english: 'Respond in English.',
    telugu: 'Respond in Telugu (తెలుగు). Use Telugu script.',
    hindi: 'Respond in Hindi (हिन्दी). Use Devanagari script.',
  };

  const subjectName = subject !== 'general' ? subject.replace('_', ' ') : 'any academic subject';

  return `You are an educational AI assistant built to help students with academic learning. 
  
  CRITICAL RULES:
  1. ONLY answer education-related questions.
  2. Answer ONLY questions related to the following specific subject: ${subjectName}.
  3. If the user asks a non-education question (entertainment, personal, celebrity, general chat, jokes, etc.), you MUST politely refuse.
  4. If the question does NOT match ${subjectName}, you MUST respond EXACTLY with:
     "This question does not match the selected subject. Please ask a question related to ${subjectName}."
  5. If the question is NOT educational at all, respond with:
     "This chatbot is designed only for educational purposes. Please ask a subject-related academic question."

  RESPONSE STYLE (MANDATORY):
  - Give simple, clear explanations.
  - Provide short, well-structured notes.
  - Use bullet points or numbered lists for clarity.
  - Keep answers student-friendly and concise.
  - Avoid complex unnecessary explanations.
  - Provide a brief summary at the end if applicable.

  Your current student is ${levelDescriptions[educationLevel]}
  ${languageInstructions[language]}`;
}

// ─── Fallback Response Generator (no API key) ───
function generateFallbackResponse(
  message: string,
  subject: Subject,
  language: SupportedLanguage
): string {
  const subjectLabel = subject !== 'general' ? subject.replace('_', ' ') : 'academic';

  if (language === 'telugu') {
    return `## 🎓 EduBot ప్రతిస్పందన

**మీ ప్రశ్న:** "${message}"

> ⚠️ **Gemini API కీ ఇంకా కాన్ఫిగర్ చేయబడలేదు.**
>
> పూర్తి AI సామర్థ్యాలను ఎనేబుల్ చేయడానికి, దయచేసి \`.env.local\` ఫైల్‌లో మీ \`GEMINI_API_KEY\` ని జోడించండి.

**ఈలోగా, ఇక్కడ ${subjectLabel} కోసం కొన్ని అధ్యయన చిట్కాలు:**
1. 📖 భావనను చిన్న భాగాలుగా విభజించండి
2. 🔄 సక్రియ రీకాల్‌ని ఉపయోగించి చదవడానికి ప్రయత్నించండి
3. ✍️ కీ పాయింట్లను మీ స్వంత మాటల్లో రాయండి`;
  }

  if (language === 'hindi') {
    return `## 🎓 EduBot प्रतिक्रिया

**आपका प्रश्न:** "${message}"

> ⚠️ **Gemini API कुंजी अभी कॉन्फ़िगर नहीं की गई है.**
>
> पूर्ण AI क्षमताओं को सक्षम करने के लिए, कृपया अपनी \`.env.local\` फ़ाइल में अपनी \`GEMINI_API_KEY\` जोड़ें.

**इसी बीच, ${subjectLabel} के लिए कुछ अध्ययन युक्तियाँ:**
1. 📖 अवधारणा को छोटे भागों में विभाजित करें
2. 🔄 सक्रिय स्मरण का उपयोग करके पढ़ने का प्रयास करें
3. ✍️ मुख्य बिंदुओं को अपने शब्दों में लिखें`;
  }

  return `## 🎓 EduBot Response

**Your question:** "${message}"

> ⚠️ **The Gemini API key is not configured yet.**
>
> To enable full AI-powered answers, please add your \`GEMINI_API_KEY\` to the \`.env.local\` file.
>
> You can get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).

**In the meantime, here are some study tips for ${subjectLabel}:**

1. 📖 **Break it down** — Split the concept into smaller, digestible parts
2. 🔄 **Active recall** — Try explaining it in your own words before looking at notes
3. ✍️ **Write key points** — Summarize what you know in bullet points
4. 🎥 **Visual learning** — Search for "${message}" on YouTube for video explanations
5. 💬 **Once you add your API key**, I'll be able to give you detailed, step-by-step explanations!

---
*To set up: Copy \`.env.local.example\` → \`.env.local\` and add your Gemini API key.*`;
}

// ─── Main Chat Response ───
export async function generateChatResponse(
  message: string,
  subject: Subject,
  language: SupportedLanguage,
  educationLevel?: EducationLevel,
  chatHistory?: { role: string; content: string }[],
  action?: ChatAction,
  originalResponse?: string
): Promise<string> {
  // If no API key, return helpful fallback
  if (!isSupabaseConfigured() && !isGeminiConfigured()) {
    console.warn(`[Gemini] Configuration check failed. API_KEY present: ${Boolean(GEMINI_API_KEY)}, Using Model: ${GEMINI_MODEL}`);
    return generateFallbackResponse(message, subject, language);
  }

  try {
    const systemPrompt = buildSystemPrompt(subject, language, educationLevel);

    const contents = [];

    // System instruction via user/model turn pair
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt }],
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Understood. I\'m EduBot, ready to help with your studies! How can I assist you today?' }],
    });

    // Add chat history (last 10 messages)
    if (chatHistory && chatHistory.length > 0) {
      for (const msg of chatHistory.slice(-10)) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Strict Prompt Engineering: Wrap every user query
    const subjectName = subject !== 'general' ? subject.replace('_', ' ') : 'any academic subject';
    
    let userMessageContext = '';
    
    if (action && originalResponse) {
      // For actions, provide clearer context to avoid AI refusals
      userMessageContext = `[SYSTEM: You are an educational AI assistant. You previously provided an answer to an academic question about ${subjectName}. The user now wants you to PERFORM AN ACTION on that previous answer: ${action.toUpperCase().replace('_', ' ')}.]

Previous Answer to Summarize/Act on: 
"""
${originalResponse}
"""

Instruction: ${message}`;
    } else {
      userMessageContext = `[SYSTEM: You are an educational AI assistant. Answer ONLY academic questions related to the selected subject (${subjectName}). If the question is not educational or not related to the subject, politely refuse.]

User Query: ${message}`;
    }

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessageContext }],
    });

    let response: Response | null = null;
    let retries = 0;
    const maxRetries = 3; // Reduced for faster feedback
    let delayMs = 2000; // 2s initial delay
    let waitSeconds = 0; // To capture API suggested wait time

    // Retry loop for 429 Rate Limit Errors
    while (retries <= maxRetries) {
      // Abort controller for 45s timeout for complex academic queries
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      let fetchError = false;
      try {
        response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.1,
              topP: 0.9,
              maxOutputTokens: 500,
            },
          }),
        });
      } catch (err) {
        console.warn(`[Gemini] Fetch failed (Attempt ${retries + 1}/${maxRetries + 1}):`, err);
        fetchError = true;
      } finally {
        clearTimeout(timeoutId);
      }

      if (response && response.ok && !fetchError) {
        break; // Success
      }

      const isRateLimit = response && response.status === 429;
      if ((fetchError || isRateLimit) && retries < maxRetries) {
        // Try to extract suggested wait time from error message
        if (isRateLimit) {
          try {
            const errorData = await response!.clone().json();
            const msg = errorData?.error?.message || '';
            const match = msg.match(/retry in ([\d.]+)s/);
            if (match) {
              waitSeconds = Math.ceil(parseFloat(match[1]));
              delayMs = (waitSeconds + 1) * 1000; // Wait slightly longer than suggested
            }
          } catch (e) { /* ignore parse error */ }
        }

        console.warn(`[Gemini] Rate limit or Network error (Status: ${response?.status}). Retrying in ${delayMs}ms... (Attempt ${retries + 1}/${maxRetries + 1})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs + Math.random() * 500));
        retries++;
        if (!waitSeconds) delayMs *= 2; // Exponential backoff only if no specific wait time given
      } else {
        break; // Non-recoverable error or out of retries
      }
    }

    if (!response || !response.ok) {
      const errorData = await response?.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || (response ? `HTTP ${response.status}` : 'Fetch failed (Network error or timeout)');
      console.error(`[Gemini] API error: ${errorMessage}`, errorData);

      if (response?.status === 401 || response?.status === 403) {
        return '⚠️ **Invalid API Key.** Please check your `GEMINI_API_KEY` in `.env.local`. You can get a valid key from [Google AI Studio](https://aistudio.google.com/apikey).';
      }
      if (response?.status === 429) {
        return '⏳ **System is currently busy.** The AI usage cap was reached. Please wait a few seconds and try again.';
      }
      throw new Error(`Gemini API: ${errorMessage}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.warn('[Gemini] Empty response from API:', JSON.stringify(data).slice(0, 500));
      return 'I apologize, I could not generate a response for that. Could you try rephrasing your question?';
    }

    return text;
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Gemini] Error:', error);
    return `❌ **Something went wrong** while processing your request.\n\n*(Error details: ${errorMessage})*`;
  }
}

// ─── Generate Study Notes ───
export async function generateNotes(
  topic: string,
  subject: Subject,
  language: SupportedLanguage,
  educationLevel?: EducationLevel
): Promise<string> {
  const prompt = `Generate well-structured, comprehensive study notes on the following topic. Include:
- Key definitions
- Important concepts explained clearly
- Examples where relevant
- Summary points at the end

Topic: ${topic}`;

  return generateChatResponse(prompt, subject, language, educationLevel);
}

// ─── Generate Summary ───
export async function generateSummary(
  content: string,
  language: SupportedLanguage
): Promise<string> {
  const prompt = `Summarize the following content in a clear, concise, student-friendly format. Use bullet points for key takeaways:\n\n${content}`;
  return generateChatResponse(prompt, 'general', language);
}

// ─── Apply Action to Previous Response ───
export async function applyAction(
  originalMessage: string,
  originalResponse: string,
  action: ChatAction,
  subject: Subject,
  language: SupportedLanguage,
  targetLanguage?: SupportedLanguage
): Promise<string> {
  const actionPrompts: Record<ChatAction, string> = {
    explain_simply: `The student asked: "${originalMessage}"\nYour previous answer was: "${originalResponse}"\n\nPlease re-explain this in much simpler language, as if explaining to a younger student. Use very basic words and simple analogies.`,
    explain_detail: `The student asked: "${originalMessage}"\nYour previous answer was: "${originalResponse}"\n\nPlease provide a much more detailed and in-depth explanation. Include more examples, deeper analysis, and cover edge cases.`,
    generate_notes: `Based on this Q&A:\nQuestion: "${originalMessage}"\nAnswer: "${originalResponse}"\n\nGenerate well-structured study notes with key points, definitions, and a summary.`,
    translate: `Translate the following response to ${targetLanguage || language}:\n\n${originalResponse}`,
    youtube_resources: `The student is learning about: "${originalMessage}"\n\nProvide 3 highly relevant YouTube search links. Format them exactly like this:\n- [Watch videos about Subject Area](https://www.youtube.com/results?search_query=subject+area)\nDo not write anything else. Make sure the links are fully functional URLs.`,
    summarize: `Summarize the following in 3-5 concise bullet points:\n\n${originalResponse}`,
    exam_answer: `The student is preparing for an exam based on this question: "${originalMessage}"\nPrevious explanation: "${originalResponse}"\n\nConvert this into a structured, high-scoring exam format answer. Include an introduction, numbered points with clear headings, and a brief conclusion. Keep it professional and concise.`,
  };

  return generateChatResponse(actionPrompts[action], subject, language, undefined, undefined, action, originalResponse);
}
