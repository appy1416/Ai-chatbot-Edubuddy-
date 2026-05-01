'use client';

import React, { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { FiSend, FiMic, FiMicOff, FiImage, FiPaperclip } from 'react-icons/fi';

interface ChatInputProps {
  onSend: (message: string) => void;
  onImageUpload?: (file: File) => void;
  onDocUpload?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

// We use standard MediaRecorder instead of Web Speech API
// to avoid the notorious "network" errors on Chrome/Windows.

export default function ChatInput({ onSend, onImageUpload, onDocUpload, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  // ─── Custom Audio Recording (MediaRecorder + Custom STT) ───
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstart = () => setIsRecording(true);

      recorder.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);

        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Cleanup all tracks to turn off the hardware mic light
        stream.getTracks().forEach(track => track.stop());

        // Send to our /api/transcribe endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const formData = new FormData();
          formData.append('audio', new File([audioBlob], 'recording.webm', { type: mimeType }));

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            signal: controller.signal,
            body: formData,
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Transcription failed (${res.status}): ${errorText}`);
          }
          const data = await res.json();
          
          if (data.text) {
            setValue((prev) => {
              const base = prev.trim() ? prev + ' ' : '';
              return base + data.text;
            });
            textareaRef.current?.focus();
          }
        } catch (err: any) {
          clearTimeout(timeoutId);
          const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
          const errorMessage = isTimeout 
            ? 'Transcription timed out after 10 seconds.' 
            : (err?.message || 'Unknown error');
          console.error('[Transcribe Error]', err);
          alert(`Failed to transcribe audio: ${errorMessage}`);
        } finally {
          setIsTranscribing(false);
          mediaRecorderRef.current = null;
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
    } catch (err) {
      console.error('[Mic Error]', err);
      alert('Microphone access denied or unavailable. Please check your browser permissions.');
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="chat-input-area border-top bg-white p-3 shadow-sm sticky-bottom" style={{ zIndex: 10 }}>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="d-none"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onImageUpload) onImageUpload(file);
          e.target.value = '';
        }}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
        className="d-none"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onDocUpload) onDocUpload(file);
          e.target.value = '';
        }}
      />

      <div className="chat-input-wrapper d-flex align-items-end rounded-4 shadow-sm" style={{ border: '1px solid var(--neutral-200)', background: 'var(--neutral-50)', padding: '0.4rem' }}>
        <div className="d-flex align-items-center gap-1 me-2 pb-1">
          <button
            className="chat-action-btn secondary"
            onClick={() => docInputRef.current?.click()}
            title="Add PDF / Doc"
          >
            <FiPaperclip size={18} />
          </button>
          <button
            className="chat-action-btn secondary"
            onClick={() => imageInputRef.current?.click()}
            title="Upload Image"
          >
            <FiImage size={18} />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={
            isRecording
              ? '🎤 Recording...'
              : isTranscribing
              ? '⏳ Transcribing...'
              : placeholder || 'Ask your question...'
          }
          rows={1}
          disabled={disabled || isTranscribing}
          style={{ paddingLeft: '0.25rem' }}
        />

        <div className="d-flex align-items-center gap-1 ms-2 pb-1">
          <button
            className={`chat-action-btn ${isRecording ? 'send' : 'secondary'}`}
            onClick={toggleVoice}
            title={isRecording ? 'Stop' : 'Voice'}
            disabled={disabled || isTranscribing}
            style={isRecording ? { animation: 'pulse 1.5s infinite', background: 'var(--error)' } : undefined}
          >
            {isRecording ? <FiMicOff size={18} /> : <FiMic size={18} />}
          </button>
          <button
            className="chat-action-btn send"
            onClick={handleSend}
            disabled={disabled || !value.trim() || isTranscribing}
            title="Send"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>

      {isRecording && (
        <div className="text-center mt-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--error)' }}>
          <span className="typing-indicator d-inline-flex" style={{ verticalAlign: 'middle' }}>
            <span></span><span></span><span></span>
          </span>
          {' '}Recording... click the mic again when you are finished speaking.
        </div>
      )}
      {isTranscribing && (
        <div className="text-center mt-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--brand-primary)' }}>
          <span className="typing-indicator brand-typing d-inline-flex" style={{ verticalAlign: 'middle' }}>
            <span></span><span></span><span></span>
          </span>
          {' '}Transcribing your audio using AI...
        </div>
      )}
    </div>
  );
}
