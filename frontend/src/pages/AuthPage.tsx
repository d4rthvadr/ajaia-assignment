import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await api.signup(email, password);
      } else {
        await api.login(email, password);
      }

      navigate("/documents");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Draftroom</p>
        <h1>
          {mode === "login" ? "Welcome back" : "Make room for good ideas"}
        </h1>
        <p className="lede">
          A quiet place to write, shape, and share documents.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}
          <button
            className="button button-primary button-wide"
            type="submit"
            disabled={busy}
          >
            {mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>
        <button
          className="text-button"
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Have an account? Log in"}
        </button>
      </section>
    </main>
  );
}
