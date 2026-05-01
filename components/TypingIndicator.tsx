'use client';

import React from 'react';

interface TypingIndicatorProps {
  visible: boolean;
}

export default function TypingIndicator({ visible }: TypingIndicatorProps) {
  if (!visible) return null;
  return (
    <div className="d-flex justify-content-start">
      <div className="chat-bubble assistant">
        <div className="typing-indicator">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
