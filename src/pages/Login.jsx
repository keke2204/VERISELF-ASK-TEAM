import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { login } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const destination = location.state?.from || "/dashboard";

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await login(username.trim(), password);
      localStorage.setItem("veriself_access_token", result.access_token);
      localStorage.setItem("veriself_identity_id", String(result.user_id));
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-brand" to="/" aria-label="Return to VeriSelf home">
          <span className="auth-brand__mark"><ShieldCheck size={20} /></span>
          <span>veriself<span>.</span></span>
        </Link>
        <p className="page-kicker">Private workspace</p>
        <h1>Sign in to continue</h1>
        <p className="auth-copy">Use the account configured for this VeriSelf workspace. Your access token stays in this browser.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button button-primary" disabled={busy} type="submit">
            <LockKeyhole size={15} /> {busy ? "Signing in…" : "Sign in"} <ArrowRight size={15} />
          </button>
        </form>
        <Link className="auth-back" to="/">Return to landing page</Link>
      </section>
    </main>
  );
}
