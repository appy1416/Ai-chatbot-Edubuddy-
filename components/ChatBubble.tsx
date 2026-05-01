'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message, ChatAction } from '@/types';
import {
  HiOutlineLightBulb,
  HiOutlineDocumentText,
  HiOutlineLanguage,
  HiOutlineBookmark,
  HiOutlineShare,
  HiOutlinePlayCircle,
  HiOutlineMagnifyingGlassPlus,
  HiOutlineAcademicCap,
  HiOutlineBars3BottomLeft,
} from 'react-icons/hi2';

interface ChatBubbleProps {
  message: Message;
  onAction?: (action: ChatAction) => void;
}

const actions: { action: ChatAction; icon: React.ReactNode; label: string }[] = [
  { action: 'explain_simply', icon: <HiOutlineLightBulb size={14} />, label: 'Explain Simply' },
  { action: 'explain_detail', icon: <HiOutlineMagnifyingGlassPlus size={14} />, label: 'More Detail' },
  { action: 'generate_notes', icon: <HiOutlineDocumentText size={14} />, label: 'Generate Notes' },
  { action: 'exam_answer', icon: <HiOutlineAcademicCap size={14} />, label: 'Exam Answer' },
  { action: 'summarize', icon: <HiOutlineBars3BottomLeft size={14} />, label: 'Summarize' },
  { action: 'translate', icon: <HiOutlineLanguage size={14} />, label: 'Translate' },
  { action: 'youtube_resources', icon: <HiOutlinePlayCircle size={14} />, label: 'YouTube Resources' },
];

export default function ChatBubble({ message, onAction }: ChatBubbleProps) {
  return (
    <div className={`d-flex ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
      <div className={`chat-bubble ${message.role}`}>
        {message.role === 'assistant' ? (
          <div className="markdown-content">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="mb-0">{message.content}</p>
        )}

        {message.role === 'assistant' && onAction && (
          <div className="response-actions-container">
            <div className="d-flex flex-column flex-md-row gap-4">
              <div className="action-group flex-fill">
                <span className="action-group-label mb-2 d-block">Learning Tools</span>
                <div className="d-flex flex-wrap gap-2">
                  {actions.filter(a => ['explain_simply', 'explain_detail', 'generate_notes', 'exam_answer', 'summarize'].includes(a.action)).map((a) => (
                    <button key={a.action} className="response-action-btn" onClick={() => onAction(a.action)} title={a.label}>
                      {a.icon} <span>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="action-group flex-fill">
                <span className="action-group-label mb-2 d-block">Extra Resources</span>
                <div className="d-flex flex-wrap gap-2">
                  {actions.filter(a => ['translate', 'youtube_resources'].includes(a.action)).map((a) => (
                    <button key={a.action} className="response-action-btn secondary" onClick={() => onAction(a.action)} title={a.label}>
                      {a.icon} <span>{a.label}</span>
                    </button>
                  ))}
                  <button className="response-action-btn secondary" title="Save Answer">
                    <HiOutlineBookmark size={14} /> <span>Save</span>
                  </button>
                  <button className="response-action-btn secondary" title="Share Answer">
                    <HiOutlineShare size={14} /> <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
