"use client";

import { useState, useCallback } from "react";
import { SourceBadge } from "./SourceBadge";

const SUGGESTED_QUESTIONS = [
  "What courses teach deep learning?",
  "Which roles fit my skills?",
  "What are the prerequisites for machine learning?",
];

export function AskPanel({ role, known }: { role?: string; known?: string[] }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [source, setSource] = useState<"live" | "recorded">("live");
  const [loading, setLoading] = useState(false);

  const handleAsk = useCallback(async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, role, known }),
      });
      const data = await res.json();
      setAnswer(data.answer);
      setSource(data.source);
    } catch {
      setAnswer("The agent did not respond. Showing a recorded answer.");
      setSource("recorded");
    } finally {
      setLoading(false);
    }
  }, [question, role, known]);

  const handleSuggestion = (q: string) => {
    setQuestion(q);
    handleAsk();
  };

  return (
    <div className="panel p-6 space-y-4">
      <h2 className="font-display-bold text-lg text-text">Ask the agent</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask about roles, skills, prerequisites, or courses..."
          className="flex-1 input-field focus-ring"
          maxLength={500}
          disabled={loading}
        />
        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="btn-primary px-6 py-3 text-base whitespace-nowrap"
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => handleSuggestion(q)}
            disabled={loading}
            className="px-3 py-1.5 bg-ink border border-line pill text-sm text-muted hover:text-text hover:border-signal transition-colors disabled:opacity-50 focus-ring"
          >
            {q}
          </button>
        ))}
      </div>

      {answer && (
        <div className="pt-4 border-t border-line space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-body-medium text-text">Answer</h3>
            <SourceBadge source={source} />
          </div>
          <p className="text-text whitespace-pre-wrap leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}