import React, { useEffect, useRef } from 'react';

interface FloatingButtonProps {
  rect: DOMRect;
  onClick: () => void;
}

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
      fill="white"
      stroke="white"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
    <path
      d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z"
      fill="white"
      opacity="0.7"
    />
    <path
      d="M5 16L5.5 17.5L7 18L5.5 18.5L5 20L4.5 18.5L3 18L4.5 17.5L5 16Z"
      fill="white"
      opacity="0.5"
    />
  </svg>
);

export const FloatingButton: React.FC<FloatingButtonProps> = ({ rect, onClick }) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  // Calculate smart position (8px above selection, avoid viewport edges)
  const BUTTON_SIZE = 36;
  const MARGIN = 8;

  let top = rect.top + window.scrollY - BUTTON_SIZE - MARGIN;
  let left = rect.left + window.scrollX + rect.width / 2 - BUTTON_SIZE / 2;

  // Clamp to viewport
  const vpWidth = window.innerWidth;

  if (top - window.scrollY < MARGIN) {
    // Show below if too close to top
    top = rect.bottom + window.scrollY + MARGIN;
  }
  if (left < MARGIN) left = MARGIN;
  if (left + BUTTON_SIZE > vpWidth - MARGIN) left = vpWidth - BUTTON_SIZE - MARGIN;

  // Prevent going beyond page bottom
  const maxTop = document.documentElement.scrollHeight - BUTTON_SIZE - MARGIN;
  if (top > maxTop) top = maxTop;

  // Focus the button for keyboard accessibility
  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  return (
    <button
      ref={btnRef}
      id="ai-rewrite-floating-btn"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        width: `${BUTTON_SIZE}px`,
        height: `${BUTTON_SIZE}px`,
        zIndex: 2147483647,
        borderRadius: '50%',
        background: '#7C6EF8',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(124, 110, 248, 0.4)',
        animation: 'aiRewriteFadeIn 150ms ease forwards',
        transition: 'transform 150ms ease',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
      title="AI Rewrite"
      aria-label="Rewrite with AI"
    >
      <SparkleIcon />
      <style>{`
        @keyframes aiRewriteFadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </button>
  );
};
