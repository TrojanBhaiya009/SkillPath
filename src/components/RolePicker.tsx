"use client";

import { useEffect, useState } from "react";

export function RolePicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (role: string) => void;
  disabled?: boolean;
}) {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/roles")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        console.log("Roles loaded:", data);
        setRoles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load roles:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <label className="block text-sm text-muted mb-2 font-body-medium">Target Role</label>
        <select disabled className="w-full input-field">
          <option>Loading...</option>
        </select>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <label className="block text-sm text-muted mb-2 font-body-medium">Target Role</label>
        <select disabled className="w-full input-field">
          <option value="">Failed to load roles</option>
        </select>
        <p className="text-xs text-muted mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label htmlFor="role-select" className="block text-sm text-muted mb-2 font-body-medium">Target Role</label>
      <select
        id="role-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full input-field focus-ring"
      >
        <option value="">Select a role</option>
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      {roles.length === 0 && !error && (
        <p className="text-xs text-muted mt-1">No roles found in database</p>
      )}
    </div>
  );
}