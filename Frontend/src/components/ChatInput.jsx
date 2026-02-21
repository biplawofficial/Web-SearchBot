import { useRef, useEffect } from "react";

export default function ChatInput({ query, setQuery, onSend, disabled }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !disabled) {
      onSend();
    }
  };

  return (
    <footer className="input-bar">
      <div className="input-bar-inner">
        <input
          ref={inputRef}
          className="chat-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the AI agent... (e.g. latest AI news)"
          disabled={disabled}
          autoFocus
        />
        <button
          className="send-btn"
          onClick={onSend}
          disabled={disabled || !query.trim()}
          title="Send Query"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
