'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import ChatBubble from '@/components/ChatBubble';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';
import { SUBJECTS, LANGUAGES } from '@/types';
import type { Message, Subject, SupportedLanguage, ChatAction } from '@/types';
import { FiMenu } from 'react-icons/fi';
import {
  HiOutlineSparkles,
  HiOutlinePlusCircle,
} from 'react-icons/hi2';

const languageOptions = LANGUAGES.map(l => ({ ...l, label: `${l.value === 'english' ? '🇬🇧' : '🇮🇳'} ${l.label}` }));

const starterQuestions = [
  'Explain photosynthesis in simple terms',
  'How do I write a binary search algorithm?',
  'Summarize the French Revolution',
  'Give me study notes for Newton\'s laws',
];

export default function ChatPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [subject, setSubject] = useState<Subject | ''>('');
  const [language, setLanguage] = useState<SupportedLanguage>('english');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatId, setChatId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat ID and Load History
  useEffect(() => {
    let currentId = new URLSearchParams(window.location.search).get('id');
    if (currentId) {
      try {
        const history = JSON.parse(localStorage.getItem('chatHistory_v1') || '[]');
        const existingChat = history.find((c: { id: string }) => c.id === currentId);
        if (existingChat) {
          setMessages(existingChat.messages);
        }
      } catch (e) {
        console.error('Failed to load chat', e);
      }
    } else {
      currentId = crypto.randomUUID();
    }
    setChatId(currentId as string);
  }, []);

  // Save to LocalStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0 && chatId) {
      try {
        const history = JSON.parse(localStorage.getItem('chatHistory_v1') || '[]');
        const existingIdx = history.findIndex((c: { id: string }) => c.id === chatId);
        const titleMsg = messages.find(m => m.role === 'user')?.content || 'New Chat';
        const title = titleMsg.slice(0, 30) + (titleMsg.length > 30 ? '...' : '');
        
        const chatObj = { id: chatId, title, date: new Date().toISOString(), messages };
        
        if (existingIdx >= 0) {
          history[existingIdx] = chatObj;
        } else {
          history.unshift(chatObj);
        }
        localStorage.setItem('chatHistory_v1', JSON.stringify(history));
        window.dispatchEvent(new Event('chatHistoryUpdated'));
      } catch (e) {
        console.error('Failed to save chat', e);
      }
    }
  }, [messages, chatId]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (content: string) => {
    if (!subject) {
      const warningMsg: Message = {
        id: crypto.randomUUID(),
        chat_id: 'current',
        role: 'assistant',
        content: '⚠️ Please select a subject from the dropdown above before asking a question.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, warningMsg]);
      return;
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      chat_id: 'current',
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3-minute timeout for AI processing

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: content,
          subject,
          language,
          education_level: profile?.education_level || 'degree',
          chat_history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        chat_id: 'current',
        role: 'assistant',
        content: data.message || 'Sorry, I could not process that. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      clearTimeout(timeoutId);
      const isTimeout = e.name === 'AbortError' || e.message?.includes('aborted');
      const errorMsg = isTimeout 
        ? '⏳ The request timed out. The AI may be busy — please try again in a moment.'
        : '❌ Sorry, something went wrong. Please check your connection and try again.';
      
      const errMsg: Message = {
        id: crypto.randomUUID(),
        chat_id: 'current',
        role: 'assistant',
        content: errorMsg,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = async (action: ChatAction) => {
    if (messages.length < 2) return;
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastUser || !lastAssistant) return;

    setIsTyping(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3-minute timeout for actions

    try {
      // Special case: Save generated notes directly to notebooks
      let apiEndpoint = '/api/chat';
      let payload: any = {
        message: lastUser.content,
        subject,
        language,
        action,
        original_response: lastAssistant.content,
      };

      if (action === 'generate_notes') {
        apiEndpoint = '/api/notes';
        payload = {
          title: `Notes: ${lastUser.content.slice(0, 30)}...`,
          content: lastAssistant.content,
          subject: subject || 'general',
          source_chat_id: chatId,
        };
      }

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      
      const responseText = data.message || (action === 'generate_notes' ? `✅ **Notes saved to your Notebook!**\n\nI have structured the previous answer into study notes for you. [View your Notebook](/notes)` : 'Could not process that action.');

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        chat_id: 'current',
        role: 'assistant',
        content: responseText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.error('Action failed', e);
      const isTimeout = e.name === 'AbortError' || e.message?.includes('aborted');
      const errorMsg = isTimeout 
        ? '⏳ The action timed out. Please try again in a moment.'
        : '❌ Could not process that action. Please check your connection.';
      
      const errMsg: Message = {
        id: crypto.randomUUID(),
        chat_id: 'current',
        role: 'assistant',
        content: errorMsg,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!subject) {
      alert("Please select a subject first!");
      return;
    }

    setIsTyping(true);
    const uploadingId = crypto.randomUUID();
    
    const userMsg: Message = {
      id: crypto.randomUUID(),
      chat_id: 'current',
      role: 'user',
      content: `📁 Uploaded file: ${file.name}`,
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMsg, {
      id: uploadingId,
      chat_id: 'current',
      role: 'assistant',
      content: `⏳ Processing ${file.name}...`,
      created_at: new Date().toISOString(),
    }]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3-minute timeout for file processing

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        signal: controller.signal,
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const extractedText = data.extractedText || `[File uploaded: ${file.name}]`;

      const userPrompt = `I have uploaded a document. Here are its contents:\n\n${extractedText.substring(0, 3000)}\n\nPlease summarize this document or explain its key points based on the subject ${subject}.`;

      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: userPrompt,
          subject,
          language,
          education_level: profile?.education_level || 'degree',
          chat_history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      clearTimeout(timeoutId);

      const chatData = await chatRes.json();
      
      setMessages((prev) => {
        const arr = [...prev];
        const last = arr.find(m => m.id === uploadingId);
        if (last) last.content = chatData.message || 'Sorry, I could not process that file.';
        return arr;
      });
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.error('Upload Error:', e);
      setMessages((prev) => {
        const arr = [...prev];
        const last = arr.find(m => m.id === uploadingId);
        if (last) {
          const isTimeout = e.name === 'AbortError' || e.message?.includes('aborted');
          last.content = isTimeout 
            ? `⏳ Processing timed out after 15 seconds. The file may be too large.`
            : `❌ Failed to process ${file.name}.`;
        }
        return arr;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    router.push('/chat'); // Clear URL query param if any
    setMessages([]);
    setChatId(crypto.randomUUID());
  };

  if (loading || !user) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="chat-page-root" style={{ 
      height: 'calc(100vh - 120px)', /* Adjusted for LayoutWrapper padding and navbar */
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      <div 
        className="chat-header-container d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between p-3 glass-panel rounded-4 mb-3 border shadow-sm" 
        style={{ gap: '1rem' }}
      >
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--neutral-400)', textTransform: 'uppercase' }}>Subject:</span>
            <select 
              className="form-select form-select-sm border-0 bg-transparent shadow-none p-0" 
              style={{ width: 'auto', fontWeight: 800, fontSize: '0.85rem', color: 'var(--brand-600)' }} 
              value={subject} 
              onChange={(e) => setSubject(e.target.value as Subject)}
            >
              {SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--neutral-400)', textTransform: 'uppercase' }}>Lang:</span>
            <select 
              className="form-select form-select-sm border-0 bg-transparent shadow-none p-0" 
              style={{ width: 'auto', fontWeight: 800, fontSize: '0.85rem', color: 'var(--neutral-700)' }} 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            >
              {languageOptions.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn btn-premium-primary d-flex align-items-center gap-2" onClick={handleNewChat}>
          <HiOutlinePlusCircle size={18} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="chat-container card-premium shadow-lg flex-grow-1 overflow-hidden" style={{ height: '0' }}>
          {/* Messages Area */}
          <div className="chat-messages flex-grow-1">
            {messages.length === 0 ? (
              <div className="empty-state" style={{ minHeight: '100%' }}>
                <div className="icon-circle shadow-brand">
                  <HiOutlineSparkles />
                </div>
                <h2 className="fw-900 mb-2">What would you like to learn?</h2>
                <p className="mb-4 text-muted">Ask any academic question and get clear, student-friendly explanations.</p>
                <div className="d-flex flex-wrap justify-content-center gap-2" style={{ maxWidth: '600px' }}>
                  {starterQuestions.map((q) => (
                    <button
                      key={q}
                      className="btn btn-premium-secondary py-2 px-3"
                      style={{ fontSize: '0.82rem' }}
                      onClick={() => sendMessage(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    onAction={msg.role === 'assistant' ? handleAction : undefined}
                  />
                ))}
                <TypingIndicator visible={isTyping} />
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="chat-input-wrapper-outer p-3 border-top" style={{ background: 'var(--neutral-50)' }}>
            {!subject && (
              <div className="alert alert-warning py-2 mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                <span className="fw-bold">Notice:</span> Please select a subject above to start chatting.
              </div>
            )}
            <ChatInput
              onSend={sendMessage}
              disabled={isTyping || !subject}
              placeholder={!subject ? "Select a subject first..." : "Ask your educational question..."}
              onImageUpload={handleFileUpload}
              onDocUpload={handleFileUpload}
            />
          </div>
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
        }
        .chat-messages {
          overflow-y: auto;
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
