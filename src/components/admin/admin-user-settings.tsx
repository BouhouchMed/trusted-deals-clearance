"use client";

import { FormEvent, useState } from "react";
import type { SecondaryAdminSettings } from "@/lib/admin-users-store";

type Props = {
  initialSettings: SecondaryAdminSettings;
};

export function AdminUserSettings({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    const response = await fetch("/api/admin/auth/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, password: password.trim() || undefined })
    });
    const body = (await response.json().catch(() => null)) as { error?: string; settings?: SecondaryAdminSettings } | null;
    setSaving(false);

    if (!response.ok || !body?.settings) {
      setStatus(body?.error || "Could not save second admin.");
      return;
    }

    setSettings(body.settings);
    setPassword("");
    setStatus("Second admin settings saved.");
  }

  return (
    <form className="settings-grid admin-user-settings" onSubmit={submit}>
      <label>
        Second admin name
        <input value={settings.displayName} onChange={(event) => setSettings((current) => ({ ...current, displayName: event.target.value }))} />
      </label>
      <label>
        Username
        <input value={settings.username} onChange={(event) => setSettings((current) => ({ ...current, username: event.target.value }))} />
      </label>
      <label>
        New password
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={settings.hasPassword ? "Leave blank to keep current password" : "Set password before enabling"}
          type="password"
        />
      </label>
      <label>
        <input
          checked={settings.enabled}
          onChange={(event) => setSettings((current) => ({ ...current, enabled: event.target.checked }))}
          type="checkbox"
        />
        Enable second admin
      </label>
      <div className="admin-settings-actions">
        <button className="button" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Admin Access"}
        </button>
        {status ? <span>{status}</span> : null}
      </div>
    </form>
  );
}
