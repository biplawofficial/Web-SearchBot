import { useState, useRef, useEffect } from "react";
import "./App.css";

import Header from "./components/Header";
import EmptyState from "./components/EmptyState";
import ChatMessage from "./components/ChatMessage";
import TypingIndicator from "./components/TypingIndicator";
import ChatInput from "./components/ChatInput";

export default function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendQuery = async () => {
    if (!query.trim() || loading) return;

    const userMessage = query.trim();
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8007/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage }),
      });

      const data = await res.json();
      const answer = data.response || "No response received.";

      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred while connecting to the agent." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <Header />

      <main className="chat-area">
        {messages.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <div className="messages-list">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      <ChatInput
        query={query}
        setQuery={setQuery}
        onSend={sendQuery}
        disabled={loading}
      />
    </div>
  );
}