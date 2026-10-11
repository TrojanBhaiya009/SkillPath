"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/schema";

export function MemoryControls() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleForget = async () => {
    setSaving(true);
    try {
      await fetch("/api/memory", { method: "DELETE" });
      setProfile({ role: null, known: [] });
    } catch (error) {
      console.error("Failed to clear memory:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <span className="text-xs text-muted font-body-medium">Memory: loading…</span>;
  }

  if (!profile) {
    return <span className="text-xs text-muted font-body-medium">Memory off</span>;
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {profile.role && (
        <span className="px-2 py-1 bg-signal/10 text-signal pill font-body-medium">
          {profile.role}
        </span>
      )}
      {profile.known.length > 0 && (
        <span className="px-2 py-1 bg-line/50 text-muted pill font-body-medium">
          {profile.known.length} skills
        </span>
      )}
      <button
        onClick={handleForget}
        disabled={saving}
        className="btn-secondary px-3 py-1.5 text-xs whitespace-nowrap"
      >
        {saving ? "…" : "Forget me"}
      </button>
    </div>
  );
}