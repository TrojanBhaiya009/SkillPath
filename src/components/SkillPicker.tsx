"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";

export function SkillPicker({
  value,
  onChange,
  disabled,
  role,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
  disabled?: boolean;
  role?: string;
}) {
  const [skills, setSkills] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = role ? `/api/skills?role=${encodeURIComponent(role)}` : "/api/skills";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setSkills(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [role]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const valueLower = useMemo(() => new Set(value.map(v => v.toLowerCase())), [value]);

  const filteredSkills = useMemo(() => 
    skills.filter(
      (s) => s.toLowerCase().includes(filter.toLowerCase()) && !valueLower.has(s.toLowerCase())
    ), 
    [skills, filter, valueLower]
  );

  const handleAdd = useCallback(
    (skill: string) => {
      onChange([...value, skill]);
      setFilter("");
      setOpen(false);
      inputRef.current?.focus();
    },
    [value, onChange]
  );

  const handleRemove = useCallback(
    (skill: string) => {
      onChange(value.filter((s) => s.toLowerCase() !== skill.toLowerCase()));
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && filter.trim() && !valueLower.has(filter.trim().toLowerCase())) {
        e.preventDefault();
        handleAdd(filter.trim());
      } else if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    [filter, valueLower, handleAdd]
  );

  if (loading) {
    return (
      <div className="w-full">
        <label className="block text-sm text-muted mb-2 font-body-medium">Known Skills</label>
        <div className="input-field text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <label htmlFor="skill-input" className="block text-sm text-muted mb-2 font-body-medium">Known Skills</label>

      <div className="input-field flex flex-wrap items-center gap-2 min-h-[48px] px-3 py-2 focus-within:ring-2 focus-within:ring-signal focus-within:ring-offset-3 focus-within:ring-offset-ink">
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((skill) => (
              <span
                key={skill.toLowerCase()}
                className="inline-flex items-center gap-1.5 bg-signal/10 text-signal px-3 py-1 pill text-sm font-body-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemove(skill)}
                  disabled={disabled}
                  className="hover:text-on-signal hover:bg-signal transition-colors rounded-full p-0.5 focus-ring"
                  aria-label={`Remove ${skill}`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative flex-1 min-w-0">
          <input
            ref={inputRef}
            id="skill-input"
            type="text"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type to add a skill..."
            className="w-full bg-transparent border-none outline-none text-text placeholder-muted text-sm"
            aria-autocomplete="list"
            aria-controls="skill-list"
          />
          {open && filteredSkills.length > 0 && (
            <div
              ref={listRef}
              id="skill-list"
              role="listbox"
              className="absolute top-full left-0 right-0 mt-1 bg-panel border border-line rounded-[6px] overflow-hidden z-10 max-h-[300px] overflow-y-auto"
            >
              {filteredSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => handleAdd(skill)}
                  className="w-full px-4 py-2 text-left text-sm text-text hover:bg-line focus-ring"
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {value.length === 0 && filter.length === 0 && (
        <p className="text-xs text-muted mt-1">Start typing to add skills you already know</p>
      )}
    </div>
  );
}