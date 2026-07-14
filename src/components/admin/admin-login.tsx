"use client";

import { LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

type Props = {
  captchaQuestion: string;
  captchaToken: string;
};

export function AdminLogin({ captchaQuestion, captchaToken }: Props) {
  const [password, setPassword] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, captchaAnswer, captchaToken })
    });

    setLoading(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "Could not unlock admin panel.");
      return;
    }

    window.location.reload();
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-icon">
          <ShieldCheck size={28} />
        </div>
        <div>
          <p className="eyebrow">Protected Area</p>
          <h1>Admin Login</h1>
          <p>Enter the admin password and captcha to manage the website.</p>
        </div>

        <label>
          Password
          <span className="admin-login-input">
            <LockKeyhole size={18} />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
          </span>
        </label>

        <label>
          Captcha: {captchaQuestion}
          <input value={captchaAnswer} onChange={(event) => setCaptchaAnswer(event.target.value)} inputMode="numeric" required />
        </label>

        {error ? <p className="admin-login-error">{error}</p> : null}

        <button className="button" type="submit" disabled={loading}>
          {loading ? "Checking..." : "Unlock Dashboard"}
        </button>
      </form>
    </main>
  );
}
